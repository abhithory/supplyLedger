import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";



describe("SupplyLedger", function () {
    async function SupplyLedgerFixture() {
        // Contracts are deployed using the first signer/account by default
        const [registrar, farm, localCollector, factory, retailStore, logistics] = await ethers.getSigners();

        const supplyLedger = await ethers.getContractFactory("SupplyLedger");
        const SupplyLedger = await supplyLedger.deploy(registrar.address);

        return { SupplyLedger, registrar, farm, factory, localCollector, retailStore, logistics };
    }

    async function deployFarm(SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        expect((await SupplyLedger.farmStatus(farm.address)).status).to.equal(false);
        await SupplyLedger.registerFarm("FARM001", farm.address);
        expect((await SupplyLedger.farmStatus(farm.address)).status).to.equal(true);
    }

    async function deployLC(SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        expect((await SupplyLedger.lCStatus(localCollector.address)).status).to.equal(false);
        await SupplyLedger.registerLC("Collector001", localCollector.address);
        expect((await SupplyLedger.lCStatus(localCollector.address)).status).to.equal(true);
    }

    async function deployFactory(SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        expect((await SupplyLedger.factoryStatus(factory.address)).status).to.equal(false);
        await SupplyLedger.registerFactory("Factory001", factory.address);
        expect((await SupplyLedger.factoryStatus(factory.address)).status).to.equal(true);
    }

    async function deployRS(SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        expect((await SupplyLedger.rSStatus(retailStore.address)).status).to.equal(false);
        await SupplyLedger.registerRS("Retail001", retailStore.address);
        expect((await SupplyLedger.rSStatus(retailStore.address)).status).to.equal(true);
    }

    async function deployLogistics(SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        expect((await SupplyLedger.logisticStatus(logistics.address)).status).to.equal(false);
        await SupplyLedger.registerLogistics("Logistics001", logistics.address);
        expect((await SupplyLedger.logisticStatus(logistics.address)).status).to.equal(true);
    }

    describe("Deployment + Registrartion", function () {
        // return
        it("Should set the right registrar", async function () {
            const { SupplyLedger, registrar } = await loadFixture(SupplyLedgerFixture);
            //   expect(await lock.unlockTime()).to.equal(unlockTime);
        });

        it("Should deploy Farm and set right address", async function () {
            const { SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });

        it("Should deploy Local collectory and set right address", async function () {
            const { SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });

        it("Should deploy factory and set right address", async function () {
            const { SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFactory(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });

        it("Should deploy Retail Store and set right address", async function () {
            const { SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployRS(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });

        it("Should deploy Logistics and set right address", async function () {
            const { SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployLogistics(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });
    });

    const potatobatchQuality = {
        "size": 0,
        "shape": 1,
        "color": 1,
        "externalQuality": 1,
        "internalQuality": 1,
        "weight": 0,
    }
    const oqsFarm = 98;
    const oqsDispatchFarm = 97;
    const oqsReachLC = 95;
    const oqsDispatchLC = 94;
    const oqsReachRS = 92;
    const oqsSold = 90;

    const weightFarm = 500;
    const weightDispatchFarm = 495;
    const weightReachLC = 480;
    const weightDispatchLC = 460;
    const weightReachRS = 445;





    let farmEntity: any, lcEntity: any, rsEntity: any;
    let _potatoBatchRelationId: number;
    let _farmToLcLogisticsId: number;


    async function addPotatoBatchInFarm(SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        farmEntity = await SupplyLedger.farmStatus(farm.address);
        expect(farmEntity.status).to.equal(true);
        _potatoBatchRelationId = await SupplyLedger.potatoBatchRelationId();
        await SupplyLedger.connect(farm).addPotatoBatchAtFarm(potatobatchQuality, oqsFarm, weightFarm);

        const FarmContract = await ethers.getContractFactory("Farm");
        const farmContract = FarmContract.attach(farmEntity.contractAddr);

        const _farmData = await farmContract.farmPotatoBatchDetailOf(_potatoBatchRelationId);
        // console.log('====================================');
        // console.log(_farmData);
        // console.log('====================================');
    }

    async function dispactchPotatoBatchToLC(SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        lcEntity = await SupplyLedger.lCStatus(localCollector.address);
        await SupplyLedger.connect(farm).dispatchPotatoBatchToLC(_potatoBatchRelationId, localCollector.address, oqsDispatchFarm, weightDispatchFarm, logistics.address);
        const FarmContract = await ethers.getContractFactory("Farm");
        const farmContract = FarmContract.attach(farmEntity.contractAddr);

        const _farmData = await farmContract.farmPotatoBatchDetailOf(_potatoBatchRelationId);
        _farmToLcLogisticsId = Number(_farmData.logisticId);
        // console.log('====================================');
        console.log(_farmToLcLogisticsId);
        // console.log('====================================');
    }

    describe("Working with Farm Contract", function () {

        it("Should add food item in farm", async function () {
            const { SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });
        it("Should dispatch to local collector from farm", async function () {
            const { SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLogistics(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);


            await deployLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispactchPotatoBatchToLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });
    });



    async function collectAtLC(SupplyLedger: any, farm: any, localCollector: any) {
        await SupplyLedger.connect(localCollector).potatoBatchStoredAtLC(_potatoBatchRelationId, oqsReachLC, weightReachLC);

        const LocalCollector = await ethers.getContractFactory("LocalCollector");
        const _localCollector = LocalCollector.attach(lcEntity.contractAddr);
        const _lcData = await _localCollector.itemDetailFromLocalCollector(_potatoBatchRelationId);
        // console.log(_lcData);`
    }


    async function dispatchAtLC(SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        rsEntity = await SupplyLedger.rSStatus(retailStore.address);

        await SupplyLedger.connect(localCollector).dispachedToRetailStore(_potatoBatchRelationId, retailStore.address, oqsDispatchLC, weightDispatchLC);
        const itemData = await SupplyLedger.foodItems(_potatoBatchRelationId);
        expect(itemData.retailStore).to.equal(retailStore.address);

        const LocalCollector = await ethers.getContractFactory("LocalCollector");
        const _localCollector = LocalCollector.attach(lcEntity.contractAddr);
        const _lcData = await _localCollector.itemDetailFromLocalCollector(_potatoBatchRelationId);
        expect(_lcData.dispatchedTo).to.equal(retailStore.address);
    }

    describe("Working with Local Collector", function () {
        return
        it("Should collect food by local collector", async function () {
            const { SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispactchPotatoBatchToLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);

            await collectAtLC(SupplyLedger, farm, localCollector);
        });
        it("Should dispatch to retail store", async function () {
            const { SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispactchPotatoBatchToLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await collectAtLC(SupplyLedger, farm, localCollector);

            await deployRS(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchAtLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });
    });




    async function collectAtRS(SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        await SupplyLedger.registerRS("RS001", retailStore.address);
        rsEntity = await SupplyLedger.rSStatus(retailStore.address);
        await SupplyLedger.connect(retailStore).reachedToRetailStore(_potatoBatchRelationId, oqsReachRS, weightReachRS);

        const RetailStore = await ethers.getContractFactory("RetailStore");
        const _RetailStore = RetailStore.attach(rsEntity.contractAddr);
        const _rsData = await _RetailStore.itemDetailFromRetailStore(_potatoBatchRelationId);
        // console.log(_rsData);

        // expect(_lcData.dispatchedTo).to.equal(retailStore.address);
    }

    async function soldAtRs(SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        await SupplyLedger.connect(retailStore).itemPurchased(_potatoBatchRelationId, oqsSold);

        const RetailStore = await ethers.getContractFactory("RetailStore");
        const _RetailStore = RetailStore.attach(rsEntity.contractAddr);
        const _rsData = await _RetailStore.itemDetailFromRetailStore(_potatoBatchRelationId);
        // console.log(_rsData);

        // expect(_lcData.dispatchedTo).to.equal(retailStore.address);
    }


    describe("Working with Retail Store", function () {
        return
        it("Should collect food at retail store", async function () {
            const { SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispactchPotatoBatchToLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await collectAtLC(SupplyLedger, farm, localCollector);
            await deployRS(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchAtLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);

            await collectAtRS(SupplyLedger, farm, localCollector, retailStore)
        });

        it("Should store detail of sold item", async function () {
            const { SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispactchPotatoBatchToLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await collectAtLC(SupplyLedger, farm, localCollector);
            await deployRS(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchAtLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await collectAtRS(SupplyLedger, farm, localCollector, retailStore)

            await soldAtRs(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });
    });






    async function getDetailsOfProduct(SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {

        const batchQualityHelp = {
            size: ["Small", "Medium", "Large"],
            shape: ["Regular", "Irregular"],
            color: ["Light yellow", "Golden", "Russet", "Red-skinned", "White-skinned"],
            externalQuality: ["No external defects", "Minor external defects", "Major external defects"],
            internalQuality: ["No internal defects", "Minor internal defects", "Major internal defects"],
            weight: ["Light", "Medium", "Heavy"]
        }
        const itemDetails = {
            id: 0,
            name: "",
            batchQuality: {
                size: "0",
                shape: "0",
                color: "0",
                externalQuality: "0",
                internalQuality: "0",
                weight: "0"
            },
            farmPicking: {
                oqs: 0,
                weight: 0,
                timestamp: "0"
            },
            farmDispatch: {
                oqs: 0,
                weight: 0,
                timestamp: "0"
            },
            lcPicking: {
                oqs: 0,
                weight: 0,
                timestamp: "0"
            },
            lsDispatch: {
                oqs: 0,
                weight: 0,
                timestamp: "0"
            },
            rsPicking: {
                oqs: 0,
                weight: 0,
                timestamp: "0"
            },
            itemSold: {
                oqs: 0,
                timestamp: "0"
            }
        };

        function formatDate(sec: number): string {
            return (new Date(Number(sec * 1000))).toLocaleString('en-US', {
                // dateStyle: 'full',
                // timeStyle: 'full',
                hour12: true,
            })
        }

        const foodItem = await SupplyLedger.foodItems(_potatoBatchRelationId);

        const FarmContract = await ethers.getContractFactory("Farm");
        const farmContract = FarmContract.attach(farmEntity.contractAddr);
        const dataFromFarm = await farmContract.itemDetailFromFarm(_potatoBatchRelationId);


        const LocalCollector = await ethers.getContractFactory("LocalCollector");
        const _localCollector = LocalCollector.attach(lcEntity.contractAddr);
        const dataFromLc = await _localCollector.itemDetailFromLocalCollector(_potatoBatchRelationId);

        const RetailStore = await ethers.getContractFactory("RetailStore");
        const _RetailStore = RetailStore.attach(rsEntity.contractAddr);
        const dataFromRs = await _RetailStore.itemDetailFromRetailStore(_potatoBatchRelationId);

        itemDetails.id = Number(foodItem.id);
        itemDetails.name = foodItem.name;

        itemDetails.batchQuality = {
            size: batchQualityHelp.size[dataFromFarm.batchQuality.size],
            shape: batchQualityHelp.shape[dataFromFarm.batchQuality.shape],
            color: batchQualityHelp.color[dataFromFarm.batchQuality.color],
            externalQuality: batchQualityHelp.externalQuality[dataFromFarm.batchQuality.externalQuality],
            internalQuality: batchQualityHelp.internalQuality[dataFromFarm.batchQuality.internalQuality],
            weight: batchQualityHelp.weight[dataFromFarm.batchQuality.weight]
        };
        itemDetails.farmPicking = { oqs: Number(dataFromFarm.oqsFarm), weight: Number(dataFromFarm.batchWeight), timestamp: formatDate(Number(dataFromFarm.collectedAt)) };
        itemDetails.farmDispatch = { oqs: Number(dataFromFarm.oqsFarm), weight: Number(dataFromFarm.weightDispatch), timestamp: formatDate(Number(dataFromFarm.collectedAt)) };
        itemDetails.lcPicking = { oqs: Number(dataFromLc.oqsReach), weight: Number(dataFromLc.weightReach), timestamp: formatDate(Number(dataFromLc.reachedAt)) };
        itemDetails.lsDispatch = { oqs: Number(dataFromLc.oqsDispatch), weight: Number(dataFromLc.weightDispatch), timestamp: formatDate(Number(dataFromLc.dispatchedAt)) };
        itemDetails.rsPicking = { oqs: Number(dataFromRs.oqsReach), weight: Number(dataFromRs.weightReach), timestamp: formatDate(Number(dataFromRs.reachedAt)) };
        itemDetails.itemSold = { oqs: Number(dataFromRs.oqsSold), timestamp: formatDate(Number(dataFromRs.soldAt)) };

        console.log(itemDetails);

    }
    describe("Customer getting details", function () {
        return
        it("Should get all details of product", async function () {
            const { SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispactchPotatoBatchToLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await collectAtLC(SupplyLedger, farm, localCollector);
            await deployRS(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchAtLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await collectAtRS(SupplyLedger, farm, localCollector, retailStore)
            await soldAtRs(SupplyLedger, farm, localCollector, factory, retailStore, logistics);

            await getDetailsOfProduct(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });
    });



});
