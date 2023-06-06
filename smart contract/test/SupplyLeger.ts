import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("SupplyLeger", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function supplyLegerFixture() {
        // Contracts are deployed using the first signer/account by default
        const [registrar, farm, localCollector, retailStore] = await ethers.getSigners();

        const SupplyLeger = await ethers.getContractFactory("SupplyLeger");
        const supplyLeger = await SupplyLeger.deploy();

        return { supplyLeger, registrar, farm, localCollector, retailStore };
    }

    describe("Deployment + Registrartion", function () {
        it("Should set the right registrar", async function () {
            const { supplyLeger, registrar } = await loadFixture(supplyLegerFixture);
            //   expect(await lock.unlockTime()).to.equal(unlockTime);
        });

        it("Should registrer right farm", async function () {
            const { supplyLeger, farm } = await loadFixture(supplyLegerFixture);
            expect((await supplyLeger.farmStatus(farm.address)).status).to.equal(false);
            await supplyLeger.registerFarm("FARM001", farm.address);
            expect((await supplyLeger.farmStatus(farm.address)).status).to.equal(true);
        });

        it("Should registrer right local collector", async function () {
            const { supplyLeger, localCollector } = await loadFixture(supplyLegerFixture);
            expect((await supplyLeger.lCStatus(localCollector.address)).status).to.equal(false);
            await supplyLeger.registerLC("Collector001", localCollector.address);
            expect((await supplyLeger.lCStatus(localCollector.address)).status).to.equal(true);
        });

        it("Should registrer right Retail Store", async function () {
            const { supplyLeger, retailStore } = await loadFixture(supplyLegerFixture);
            expect((await supplyLeger.rSStatus(retailStore.address)).status).to.equal(false);
            await supplyLeger.registerRS("Retail001", retailStore.address);
            expect((await supplyLeger.rSStatus(retailStore.address)).status).to.equal(true);
        });
    });

    describe("Working with Farm Contract", function () {
        it("Should add food item in farm", async function () {
            const { supplyLeger, farm } = await loadFixture(supplyLegerFixture);
            await supplyLeger.registerFarm("FARM001", farm.address);
            const farmEntity = await supplyLeger.farmStatus(farm.address);
            expect(farmEntity.status).to.equal(true);

            const _id = await supplyLeger.foodItemId();
            await supplyLeger.connect(farm).addFoodItemsAtFarm();

            const FarmContract = await ethers.getContractFactory("Farm");
            const farmContract = FarmContract.attach(farmEntity.contractAddr);

            const _farmData = await farmContract.itemDetailFromFarm(_id);
            // console.log('====================================');
            // console.log(_farmData);
            // console.log('====================================');
        });
        it("Should dispatch to local collector from farm", async function () {
            const { supplyLeger, farm, localCollector } = await loadFixture(supplyLegerFixture);
            await supplyLeger.registerFarm("FARM001", farm.address);
            const farmEntity = await supplyLeger.farmStatus(farm.address);
            expect(farmEntity.status).to.equal(true);
            const _id = await supplyLeger.foodItemId();
            await supplyLeger.connect(farm).addFoodItemsAtFarm();
            const FarmContract = await ethers.getContractFactory("Farm");
            const farmContract = FarmContract.attach(farmEntity.contractAddr);
            const _farmData = await farmContract.itemDetailFromFarm(_id);

            await supplyLeger.registerLC("LC001",localCollector.address);
            const lcEntity = await supplyLeger.lCStatus(localCollector.address);
            expect(lcEntity.status).to.equal(true);

            await supplyLeger.registerLC("LC001",localCollector.address);

            await supplyLeger.connect(farm).dispachedToLocalColloctor(_id,localCollector.address);
        });
    });

    let _foodId: number;
    let lcEntity: any;

    async function collectAtLC(supplyLeger:any, farm:any, localCollector:any){
        await supplyLeger.registerFarm("FARM001", farm.address);
        const farmEntity = await supplyLeger.farmStatus(farm.address);
        expect(farmEntity.status).to.equal(true);
        _foodId = await supplyLeger.foodItemId();
        await supplyLeger.connect(farm).addFoodItemsAtFarm();
        const FarmContract = await ethers.getContractFactory("Farm");
        const farmContract = FarmContract.attach(farmEntity.contractAddr);
        const _farmData = await farmContract.itemDetailFromFarm(_foodId);
        // console.log(_farmData);
        
        await supplyLeger.registerLC("LC001",localCollector.address);
        lcEntity = await supplyLeger.lCStatus(localCollector.address);
        expect(lcEntity.status).to.equal(true);
        await supplyLeger.connect(farm).dispachedToLocalColloctor(_foodId,localCollector.address);
        
        await supplyLeger.connect(localCollector).reachedToLocalCollector(_foodId);

        const LocalCollector = await ethers.getContractFactory("LocalCollector");
        const _localCollector = LocalCollector.attach(lcEntity.contractAddr);
        const _lcData = await _localCollector.itemDetailFromLocalCollector(_foodId);
        // console.log(_lcData);
    }

    async function dispatchAtLC(supplyLeger:any, farm:any, localCollector:any,retailStore:any){
        await supplyLeger.connect(localCollector).dispachedToRetailStore(_foodId, retailStore.address);
        const itemData = await supplyLeger.foodItems(_foodId);
        expect(itemData.retailStore).to.equal(retailStore.address);

        const LocalCollector = await ethers.getContractFactory("LocalCollector");
        const _localCollector = LocalCollector.attach(lcEntity.contractAddr);
        const _lcData = await _localCollector.itemDetailFromLocalCollector(_foodId);
        expect(_lcData.dispatchedTo).to.equal(retailStore.address);
    }

    describe("Working with Local Collector", function () {
        it("Should collect food by local collector", async function () {
            const { supplyLeger, farm, localCollector } = await loadFixture(supplyLegerFixture);
            await collectAtLC(supplyLeger, farm, localCollector);
        });
        it("Should dispatch to retail store", async function () {
            const { supplyLeger, farm, localCollector,retailStore } = await loadFixture(supplyLegerFixture);
            await collectAtLC(supplyLeger, farm, localCollector); 
            await dispatchAtLC(supplyLeger, farm, localCollector,retailStore);
        });
    });


    let rSEntity: any;


    async function collectAtRS(supplyLeger:any, farm:any, localCollector:any,retailStore:any){
        await supplyLeger.registerRS("RS001",retailStore.address);
        rSEntity = await supplyLeger.rSStatus(retailStore.address);
        await supplyLeger.connect(retailStore).reachedToRetailStore(_foodId);        
        
        const RetailStore = await ethers.getContractFactory("RetailStore");
        const _RetailStore = RetailStore.attach(rSEntity.contractAddr);
        const _rsData = await _RetailStore.itemDetailFromRetailStore(_foodId);
        // console.log(_rsData);
        
        // expect(_lcData.dispatchedTo).to.equal(retailStore.address);
    }

    async function soldAtRs(supplyLeger:any, farm:any, localCollector:any,retailStore:any){
        await supplyLeger.connect(retailStore).itemPurchased(_foodId);        
        
        const RetailStore = await ethers.getContractFactory("RetailStore");
        const _RetailStore = RetailStore.attach(rSEntity.contractAddr);
        const _rsData = await _RetailStore.itemDetailFromRetailStore(_foodId);
        // console.log(_rsData);
        
        // expect(_lcData.dispatchedTo).to.equal(retailStore.address);
    }


    describe("Working with Retail Store", function () {
        it("Should collect food at retail store", async function () {
            const { supplyLeger, farm, localCollector,retailStore } = await loadFixture(supplyLegerFixture);
            await collectAtLC(supplyLeger, farm, localCollector); 
            await dispatchAtLC(supplyLeger, farm, localCollector,retailStore);

            await collectAtRS(supplyLeger, farm, localCollector,retailStore)
        });

        it("Should store detail of sold item", async function () {
            const { supplyLeger, farm, localCollector,retailStore } = await loadFixture(supplyLegerFixture);
            await collectAtLC(supplyLeger, farm, localCollector); 
            await dispatchAtLC(supplyLeger, farm, localCollector,retailStore);
            await collectAtRS(supplyLeger, farm, localCollector,retailStore)

            await soldAtRs(supplyLeger, farm, localCollector,retailStore);
        });
    });

    

});
