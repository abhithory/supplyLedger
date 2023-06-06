import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("SupplyLedger", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function SupplyLedgerFixture() {
        // Contracts are deployed using the first signer/account by default
        const [registrar, farm, localCollector, retailStore] = await ethers.getSigners();

        const supplyLedger = await ethers.getContractFactory("SupplyLedger");
        const SupplyLedger = await supplyLedger.deploy();

        return { SupplyLedger, registrar, farm, localCollector, retailStore };
    }

    describe("Deployment + Registrartion", function () {
        it("Should set the right registrar", async function () {
            const { SupplyLedger, registrar } = await loadFixture(SupplyLedgerFixture);
            //   expect(await lock.unlockTime()).to.equal(unlockTime);
        });

        it("Should registrer right farm", async function () {
            const { SupplyLedger, farm } = await loadFixture(SupplyLedgerFixture);
            expect((await SupplyLedger.farmStatus(farm.address)).status).to.equal(false);
            await SupplyLedger.registerFarm("FARM001", farm.address);
            expect((await SupplyLedger.farmStatus(farm.address)).status).to.equal(true);
        });

        it("Should registrer right local collector", async function () {
            const { SupplyLedger, localCollector } = await loadFixture(SupplyLedgerFixture);
            expect((await SupplyLedger.lCStatus(localCollector.address)).status).to.equal(false);
            await SupplyLedger.registerLC("Collector001", localCollector.address);
            expect((await SupplyLedger.lCStatus(localCollector.address)).status).to.equal(true);
        });

        it("Should registrer right Retail Store", async function () {
            const { SupplyLedger, retailStore } = await loadFixture(SupplyLedgerFixture);
            expect((await SupplyLedger.rSStatus(retailStore.address)).status).to.equal(false);
            await SupplyLedger.registerRS("Retail001", retailStore.address);
            expect((await SupplyLedger.rSStatus(retailStore.address)).status).to.equal(true);
        });
    });

    describe("Working with Farm Contract", function () {
        it("Should add food item in farm", async function () {
            const { SupplyLedger, farm } = await loadFixture(SupplyLedgerFixture);
            await SupplyLedger.registerFarm("FARM001", farm.address);
            const farmEntity = await SupplyLedger.farmStatus(farm.address);
            expect(farmEntity.status).to.equal(true);

            const _id = await SupplyLedger.foodItemId();
            await SupplyLedger.connect(farm).addFoodItemsAtFarm();

            const FarmContract = await ethers.getContractFactory("Farm");
            const farmContract = FarmContract.attach(farmEntity.contractAddr);

            const _farmData = await farmContract.itemDetailFromFarm(_id);
            // console.log('====================================');
            // console.log(_farmData);
            // console.log('====================================');
        });
        it("Should dispatch to local collector from farm", async function () {
            const { SupplyLedger, farm, localCollector } = await loadFixture(SupplyLedgerFixture);
            await SupplyLedger.registerFarm("FARM001", farm.address);
            const farmEntity = await SupplyLedger.farmStatus(farm.address);
            expect(farmEntity.status).to.equal(true);
            const _id = await SupplyLedger.foodItemId();
            await SupplyLedger.connect(farm).addFoodItemsAtFarm();
            const FarmContract = await ethers.getContractFactory("Farm");
            const farmContract = FarmContract.attach(farmEntity.contractAddr);
            const _farmData = await farmContract.itemDetailFromFarm(_id);

            await SupplyLedger.registerLC("LC001",localCollector.address);
            const lcEntity = await SupplyLedger.lCStatus(localCollector.address);
            expect(lcEntity.status).to.equal(true);

            await SupplyLedger.registerLC("LC001",localCollector.address);

            await SupplyLedger.connect(farm).dispachedToLocalColloctor(_id,localCollector.address);
        });
    });

    let _foodId: number;
    let lcEntity: any;

    async function collectAtLC(SupplyLedger:any, farm:any, localCollector:any){
        await SupplyLedger.registerFarm("FARM001", farm.address);
        const farmEntity = await SupplyLedger.farmStatus(farm.address);
        expect(farmEntity.status).to.equal(true);
        _foodId = await SupplyLedger.foodItemId();
        await SupplyLedger.connect(farm).addFoodItemsAtFarm();
        const FarmContract = await ethers.getContractFactory("Farm");
        const farmContract = FarmContract.attach(farmEntity.contractAddr);
        const _farmData = await farmContract.itemDetailFromFarm(_foodId);
        // console.log(_farmData);
        
        await SupplyLedger.registerLC("LC001",localCollector.address);
        lcEntity = await SupplyLedger.lCStatus(localCollector.address);
        expect(lcEntity.status).to.equal(true);
        await SupplyLedger.connect(farm).dispachedToLocalColloctor(_foodId,localCollector.address);
        
        await SupplyLedger.connect(localCollector).reachedToLocalCollector(_foodId);

        const LocalCollector = await ethers.getContractFactory("LocalCollector");
        const _localCollector = LocalCollector.attach(lcEntity.contractAddr);
        const _lcData = await _localCollector.itemDetailFromLocalCollector(_foodId);
        // console.log(_lcData);
    }

    async function dispatchAtLC(SupplyLedger:any, farm:any, localCollector:any,retailStore:any){
        await SupplyLedger.connect(localCollector).dispachedToRetailStore(_foodId, retailStore.address);
        const itemData = await SupplyLedger.foodItems(_foodId);
        expect(itemData.retailStore).to.equal(retailStore.address);

        const LocalCollector = await ethers.getContractFactory("LocalCollector");
        const _localCollector = LocalCollector.attach(lcEntity.contractAddr);
        const _lcData = await _localCollector.itemDetailFromLocalCollector(_foodId);
        expect(_lcData.dispatchedTo).to.equal(retailStore.address);
    }

    describe("Working with Local Collector", function () {
        it("Should collect food by local collector", async function () {
            const { SupplyLedger, farm, localCollector } = await loadFixture(SupplyLedgerFixture);
            await collectAtLC(SupplyLedger, farm, localCollector);
        });
        it("Should dispatch to retail store", async function () {
            const { SupplyLedger, farm, localCollector,retailStore } = await loadFixture(SupplyLedgerFixture);
            await collectAtLC(SupplyLedger, farm, localCollector); 
            await dispatchAtLC(SupplyLedger, farm, localCollector,retailStore);
        });
    });


    let rSEntity: any;


    async function collectAtRS(SupplyLedger:any, farm:any, localCollector:any,retailStore:any){
        await SupplyLedger.registerRS("RS001",retailStore.address);
        rSEntity = await SupplyLedger.rSStatus(retailStore.address);
        await SupplyLedger.connect(retailStore).reachedToRetailStore(_foodId);        
        
        const RetailStore = await ethers.getContractFactory("RetailStore");
        const _RetailStore = RetailStore.attach(rSEntity.contractAddr);
        const _rsData = await _RetailStore.itemDetailFromRetailStore(_foodId);
        // console.log(_rsData);
        
        // expect(_lcData.dispatchedTo).to.equal(retailStore.address);
    }

    async function soldAtRs(SupplyLedger:any, farm:any, localCollector:any,retailStore:any){
        await SupplyLedger.connect(retailStore).itemPurchased(_foodId);        
        
        const RetailStore = await ethers.getContractFactory("RetailStore");
        const _RetailStore = RetailStore.attach(rSEntity.contractAddr);
        const _rsData = await _RetailStore.itemDetailFromRetailStore(_foodId);
        // console.log(_rsData);
        
        // expect(_lcData.dispatchedTo).to.equal(retailStore.address);
    }


    describe("Working with Retail Store", function () {
        it("Should collect food at retail store", async function () {
            const { SupplyLedger, farm, localCollector,retailStore } = await loadFixture(SupplyLedgerFixture);
            await collectAtLC(SupplyLedger, farm, localCollector); 
            await dispatchAtLC(SupplyLedger, farm, localCollector,retailStore);

            await collectAtRS(SupplyLedger, farm, localCollector,retailStore)
        });

        it("Should store detail of sold item", async function () {
            const { SupplyLedger, farm, localCollector,retailStore } = await loadFixture(SupplyLedgerFixture);
            await collectAtLC(SupplyLedger, farm, localCollector); 
            await dispatchAtLC(SupplyLedger, farm, localCollector,retailStore);
            await collectAtRS(SupplyLedger, farm, localCollector,retailStore)

            await soldAtRs(SupplyLedger, farm, localCollector,retailStore);
        });
    });

    

});
