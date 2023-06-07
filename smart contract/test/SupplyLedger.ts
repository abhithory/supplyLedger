import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";



describe("SupplyLedger", function () {
    async function SupplyLedgerFixture() {
        // Contracts are deployed using the first signer/account by default
        const [registrar, farm, localCollector, retailStore] = await ethers.getSigners();

        const supplyLedger = await ethers.getContractFactory("SupplyLedger");
        const SupplyLedger = await supplyLedger.deploy();

        return { SupplyLedger, registrar, farm, localCollector, retailStore };
    }

    async function deployFarm(SupplyLedger: any, farm: any, localCollector: any, retailStore: any){
        expect((await SupplyLedger.farmStatus(farm.address)).status).to.equal(false);
        await SupplyLedger.registerFarm("FARM001", farm.address);
        expect((await SupplyLedger.farmStatus(farm.address)).status).to.equal(true);
    }
    
    async function deployLC(SupplyLedger: any, farm: any, localCollector: any, retailStore: any){
        expect((await SupplyLedger.lCStatus(localCollector.address)).status).to.equal(false);
        await SupplyLedger.registerLC("Collector001", localCollector.address);
        expect((await SupplyLedger.lCStatus(localCollector.address)).status).to.equal(true);
    }


    async function deployRS(SupplyLedger: any, farm: any, localCollector: any, retailStore: any){
        expect((await SupplyLedger.rSStatus(retailStore.address)).status).to.equal(false);
        await SupplyLedger.registerRS("Retail001", retailStore.address);
        expect((await SupplyLedger.rSStatus(retailStore.address)).status).to.equal(true);
    }

    describe("Deployment + Registrartion", function () {
        it("Should set the right registrar", async function () {
            const { SupplyLedger, registrar } = await loadFixture(SupplyLedgerFixture);
            //   expect(await lock.unlockTime()).to.equal(unlockTime);
        });

        it("Should registrer right farm", async function () {
            const { SupplyLedger, farm, localCollector, retailStore } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(SupplyLedger, farm, localCollector, retailStore);
        });

        it("Should registrer right local collector", async function () {
            const { SupplyLedger, farm, localCollector, retailStore } = await loadFixture(SupplyLedgerFixture);
            await deployLC(SupplyLedger, farm, localCollector, retailStore);
        });

        it("Should registrer right Retail Store", async function () {
            const { SupplyLedger, farm, localCollector, retailStore } = await loadFixture(SupplyLedgerFixture);
            await deployRS(SupplyLedger, farm, localCollector, retailStore);
        });
    });

    const potatoHarvestDetails = {
        "size": 0,
        "shape": 1,
        "color": 1,
        "externalQuality": 1,
        "internalQuality": 1,
        "weight": 0,
    }
    const oqcHarvest = 98;
    const oqcDispatchLC = 97;
    let oqsReachingLC = 95;
    let oqsDispatchLC = 94;
    let oqsReachingRS = 92;
    let oqsSold = 90;


    let farmEntity:any,lcEntity:any,rsEntity:any, _foodId:number;


    async function addFoodItem(SupplyLedger: any, farm: any, localCollector: any, retailStore: any){
        farmEntity = await SupplyLedger.farmStatus(farm.address);
        expect(farmEntity.status).to.equal(true);
        _foodId = await SupplyLedger.foodItemId();
        await SupplyLedger.connect(farm).addFoodItemsAtFarm(potatoHarvestDetails,oqcHarvest);

        const FarmContract = await ethers.getContractFactory("Farm");
        const farmContract = FarmContract.attach(farmEntity.contractAddr);

        const _farmData = await farmContract.itemDetailFromFarm(_foodId);
        // console.log('====================================');
        // console.log(_farmData);
        // console.log('====================================');
    }

    async function dispactchItemToLC(SupplyLedger: any, farm: any, localCollector: any, retailStore: any){
        lcEntity = await SupplyLedger.lCStatus(localCollector.address);
        await SupplyLedger.connect(farm).dispachedToLocalColloctor(_foodId, localCollector.address,oqcDispatchLC);

        const FarmContract = await ethers.getContractFactory("Farm");
        const farmContract = FarmContract.attach(farmEntity.contractAddr);

        const _farmData = await farmContract.itemDetailFromFarm(_foodId);
        // console.log('====================================');
        // console.log(_farmData);
        // console.log('====================================');
    }

    describe("Working with Farm Contract", function () {
        it("Should add food item in farm", async function () {
            const { SupplyLedger, farm, localCollector, retailStore } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(SupplyLedger, farm, localCollector, retailStore);
            await addFoodItem(SupplyLedger, farm, localCollector, retailStore);
        });
        it("Should dispatch to local collector from farm", async function () {
            const { SupplyLedger, farm, localCollector, retailStore } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(SupplyLedger, farm, localCollector, retailStore);
            await addFoodItem(SupplyLedger, farm, localCollector, retailStore);


            await deployLC(SupplyLedger, farm, localCollector, retailStore);
            await dispactchItemToLC(SupplyLedger, farm, localCollector, retailStore);
        });
    });



    async function collectAtLC(SupplyLedger: any, farm: any, localCollector: any) {
        await SupplyLedger.connect(localCollector).reachedToLocalCollector(_foodId,oqsReachingLC);

        const LocalCollector = await ethers.getContractFactory("LocalCollector");
        const _localCollector = LocalCollector.attach(lcEntity.contractAddr);
        const _lcData = await _localCollector.itemDetailFromLocalCollector(_foodId);
        // console.log(_lcData);
    }


    async function dispatchAtLC(SupplyLedger: any, farm: any, localCollector: any, retailStore: any) {
        rsEntity = await SupplyLedger.rSStatus(retailStore.address);

        await SupplyLedger.connect(localCollector).dispachedToRetailStore(_foodId, retailStore.address,oqsDispatchLC);
        const itemData = await SupplyLedger.foodItems(_foodId);
        expect(itemData.retailStore).to.equal(retailStore.address);

        const LocalCollector = await ethers.getContractFactory("LocalCollector");
        const _localCollector = LocalCollector.attach(lcEntity.contractAddr);
        const _lcData = await _localCollector.itemDetailFromLocalCollector(_foodId);
        expect(_lcData.dispatchedTo).to.equal(retailStore.address);
    }

    describe("Working with Local Collector", function () {
        it("Should collect food by local collector", async function () {
            const { SupplyLedger, farm, localCollector, retailStore } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(SupplyLedger, farm, localCollector, retailStore);
            await addFoodItem(SupplyLedger, farm, localCollector, retailStore);
            await deployLC(SupplyLedger, farm, localCollector, retailStore);
            await dispactchItemToLC(SupplyLedger, farm, localCollector, retailStore);

            await collectAtLC(SupplyLedger, farm, localCollector);
        });
        it("Should dispatch to retail store", async function () {
            const { SupplyLedger, farm, localCollector, retailStore } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(SupplyLedger, farm, localCollector, retailStore);
            await addFoodItem(SupplyLedger, farm, localCollector, retailStore);
            await deployLC(SupplyLedger, farm, localCollector, retailStore);
            await dispactchItemToLC(SupplyLedger, farm, localCollector, retailStore);
            await collectAtLC(SupplyLedger, farm, localCollector);

            await deployRS(SupplyLedger, farm, localCollector, retailStore);
            await dispatchAtLC(SupplyLedger, farm, localCollector, retailStore);
        });
    });




    async function collectAtRS(SupplyLedger: any, farm: any, localCollector: any, retailStore: any) {
        await SupplyLedger.registerRS("RS001", retailStore.address);
        rsEntity = await SupplyLedger.rSStatus(retailStore.address);
        await SupplyLedger.connect(retailStore).reachedToRetailStore(_foodId,oqsReachingRS);

        const RetailStore = await ethers.getContractFactory("RetailStore");
        const _RetailStore = RetailStore.attach(rsEntity.contractAddr);
        const _rsData = await _RetailStore.itemDetailFromRetailStore(_foodId);
        // console.log(_rsData);

        // expect(_lcData.dispatchedTo).to.equal(retailStore.address);
    }

    async function soldAtRs(SupplyLedger: any, farm: any, localCollector: any, retailStore: any) {
        await SupplyLedger.connect(retailStore).itemPurchased(_foodId,oqsSold);

        const RetailStore = await ethers.getContractFactory("RetailStore");
        const _RetailStore = RetailStore.attach(rsEntity.contractAddr);
        const _rsData = await _RetailStore.itemDetailFromRetailStore(_foodId);
        // console.log(_rsData);

        // expect(_lcData.dispatchedTo).to.equal(retailStore.address);
    }


    describe("Working with Retail Store", function () {
        it("Should collect food at retail store", async function () {
            const { SupplyLedger, farm, localCollector, retailStore } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(SupplyLedger, farm, localCollector, retailStore);
            await addFoodItem(SupplyLedger, farm, localCollector, retailStore);
            await deployLC(SupplyLedger, farm, localCollector, retailStore);
            await dispactchItemToLC(SupplyLedger, farm, localCollector, retailStore);
            await collectAtLC(SupplyLedger, farm, localCollector);
            await deployRS(SupplyLedger, farm, localCollector, retailStore);
            await dispatchAtLC(SupplyLedger, farm, localCollector, retailStore);

            await collectAtRS(SupplyLedger, farm, localCollector, retailStore)
        });

        it("Should store detail of sold item", async function () {
            const { SupplyLedger, farm, localCollector, retailStore } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(SupplyLedger, farm, localCollector, retailStore);
            await addFoodItem(SupplyLedger, farm, localCollector, retailStore);
            await deployLC(SupplyLedger, farm, localCollector, retailStore);
            await dispactchItemToLC(SupplyLedger, farm, localCollector, retailStore);
            await collectAtLC(SupplyLedger, farm, localCollector);
            await deployRS(SupplyLedger, farm, localCollector, retailStore);
            await dispatchAtLC(SupplyLedger, farm, localCollector, retailStore);
            await collectAtRS(SupplyLedger, farm, localCollector, retailStore)

            await soldAtRs(SupplyLedger, farm, localCollector, retailStore);
        });
    });



});
