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

        return
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
    const soldPacketWeight = 1;


    const weightDispatchFactory = 420;


    const weightReachRS = 445;


    const chipsBatchDetails = {
        chipsDetail: {
            flavor: 1,
            texture: 0
        },
        processDetails: {
            cookingTemperature: 90,
            ingredients: [0, 1, 2]
        },
        packagingDetails: {
            packagingMaterial: 0,
            packageSize: 1
        },
        totalPackets: 20,
        totalWeight: 2,
        productionDate: 0,
        shelfLife: 6
    }




    let farmEntity: any, lcEntity: any, factoryEntity: any, rsEntity: any, logisticsEntity: any;
    let _potatoBatchRelationId: number, _chipsPacketBatchRelationId: number, _chipsPacketId: number;
    let _farmToLcLogisticsId: number, _LcToFactoryLogisticsId: number, _factoryToRsLogisticsId: number;


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
        logisticsEntity = await SupplyLedger.logisticStatus(logistics.address);
        await SupplyLedger.connect(farm).dispatchPotatoBatchToLC(_potatoBatchRelationId, localCollector.address, oqsDispatchFarm, weightDispatchFarm, logistics.address);
        const FarmContract = await ethers.getContractFactory("Farm");
        const farmContract = FarmContract.attach(farmEntity.contractAddr);

        const _farmData = await farmContract.farmPotatoBatchDetailOf(_potatoBatchRelationId);
        _farmToLcLogisticsId = Number(_farmData.logisticId);
        // console.log('====================================');
        // console.log(_farmToLcLogisticsId);
        // console.log('====================================');
    }

    describe("Working with Farm Contract", function () {
        return
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



    async function updateLogisticsStates(logisticsId: number, SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        const logisticsContract = await ethers.getContractFactory("Logistics");
        const _logisticsContract = logisticsContract.attach(logisticsEntity.contractAddr);
        let _shipment = await _logisticsContract.shipmentOf(logisticsId);
        // console.log(_shipment);
        await SupplyLedger.connect(logistics).updateShipmentStatusInLogistics(logisticsId, 1);
        _shipment = await _logisticsContract.shipmentOf(logisticsId);
        // console.log(_shipment);
        await SupplyLedger.connect(logistics).updateShipmentStatusInLogistics(logisticsId, 2);
        _shipment = await _logisticsContract.shipmentOf(logisticsId);
        // console.log(_shipment);
        await SupplyLedger.connect(logistics).updateShipmentStatusInLogistics(logisticsId, 3);
        _shipment = await _logisticsContract.shipmentOf(logisticsId);
        // console.log(_shipment);

        await SupplyLedger.connect(logistics).updateShipmentStatusInLogistics(logisticsId, 4);
        _shipment = await _logisticsContract.shipmentOf(logisticsId);
        // console.log(_shipment);
    }

    async function checkArrivedBatchDetailsInLC(logisticsId: number, SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        const localCollectorContract = await ethers.getContractFactory("LocalCollector");
        const _localCollectorContract = localCollectorContract.attach(lcEntity.contractAddr);
        let _arrivedBatchDetails = await _localCollectorContract.ArrivedBatchDetails(_potatoBatchRelationId);
        // console.log(_arrivedBatchDetails.logisticId);
    }


    async function storePotatoBatchAtLC(SupplyLedger: any, farm: any, localCollector: any) {

        const LocalCollector = await ethers.getContractFactory("LocalCollector");
        const _localCollector = LocalCollector.attach(lcEntity.contractAddr);
        let _lcData = await _localCollector.ArrivedBatchDetails(_potatoBatchRelationId);
        // console.log(_lcData);
        await SupplyLedger.connect(localCollector).potatoBatchStoredAtLC(_potatoBatchRelationId, oqsReachLC, weightReachLC);
        _lcData = await _localCollector.ArrivedBatchDetails(_potatoBatchRelationId);
        // console.log(_lcData);
    }


    async function dispatchPotatoBatchToFactoryFromLC(SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        factoryEntity = await SupplyLedger.factoryStatus(factory.address);

        await SupplyLedger.connect(localCollector).dispatchPotatoBatchToFactory(_potatoBatchRelationId, factory.address, oqsDispatchLC, weightDispatchLC, logistics.address);
        const itemData = await SupplyLedger.potatBatchRelationOf(_potatoBatchRelationId);
        expect(itemData.factory).to.equal(factory.address);

        const LocalCollector = await ethers.getContractFactory("LocalCollector");
        const _localCollector = LocalCollector.attach(lcEntity.contractAddr);

        const _lcData = await _localCollector.DispatchedBatchDetails(_potatoBatchRelationId);
        _LcToFactoryLogisticsId = Number(_lcData.logisticId);
        // console.log(_LcToFactoryLogisticsId);

    }

    describe("Working with Local Collector", function () {

        return

        it("Should update Logistics Details in Local collector", async function () {
            const { SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLogistics(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispactchPotatoBatchToLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);

            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await updateLogisticsStates(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
        });

        it("Should should store potatoBatch at local collector", async function () {
            const { SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLogistics(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispactchPotatoBatchToLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await updateLogisticsStates(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)

            await storePotatoBatchAtLC(SupplyLedger, farm, localCollector);
        });

        it("Should dispatch to Factory", async function () {
            const { SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLogistics(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispactchPotatoBatchToLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await updateLogisticsStates(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await storePotatoBatchAtLC(SupplyLedger, farm, localCollector);

            await deployFactory(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchPotatoBatchToFactoryFromLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });
    });


    async function checkArrivedBatchDetailsInFactory(logisticsId: number, SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        const factoryContract = await ethers.getContractFactory("Factory");
        const _factoryContract = factoryContract.attach(factoryEntity.contractAddr);
        let _arrivedBatchDetails = await _factoryContract.ArrivedBatchDetails(_potatoBatchRelationId);
        // console.log(logisticsId);
        // console.log(_arrivedBatchDetails);
    }

    async function storePotatoBatchAtFactory(SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {

        const factoryContract = await ethers.getContractFactory("Factory");
        const _factoryContract = factoryContract.attach(factoryEntity.contractAddr);
        let _factoryData = await _factoryContract.ArrivedBatchDetails(_potatoBatchRelationId);
        // console.log(_factoryData);
        await SupplyLedger.connect(factory).potatoBatchStoredAtFactory(_potatoBatchRelationId, oqsReachLC, weightReachLC);
        _factoryData = await _factoryContract.ArrivedBatchDetails(_potatoBatchRelationId);
        // console.log(_factoryData);
    }


    async function prepareChipsAtFactory(SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {

        _chipsPacketBatchRelationId = await SupplyLedger.chipsPacketBatchRelationId();
        await SupplyLedger.connect(factory).chipsPreparedAtFactory(_potatoBatchRelationId, chipsBatchDetails);

        const factoryContract = await ethers.getContractFactory("Factory");
        const _factoryContract = factoryContract.attach(factoryEntity.contractAddr);
        let _chipsData = await _factoryContract.chipsBatchOf(_chipsPacketBatchRelationId);
        // console.log(_chipsData);
    }

    async function dispatchChipsBatchToRSFromFactory(SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        rsEntity = await SupplyLedger.rSStatus(retailStore.address);

        await SupplyLedger.connect(factory).chipsPacketBatchDispatchedToRS(_chipsPacketBatchRelationId, retailStore.address, weightDispatchFactory, logistics.address);
        const itemData = await SupplyLedger.chipsPacketBatchRelationsOf(_chipsPacketBatchRelationId);
        expect(itemData.retailStore).to.equal(retailStore.address);


        const factoryContract = await ethers.getContractFactory("Factory");
        const _factoryContract = factoryContract.attach(factoryEntity.contractAddr);

        const _factoryData = await _factoryContract.DispatchedBatchDetails(_chipsPacketBatchRelationId);
        _factoryToRsLogisticsId = Number(_factoryData.logisticId);

        // console.log(_factoryToRsLogisticsId);

    }



    describe("Working with Factory", function () {

        return

        it("Should update Logistics Details in Factory contarct", async function () {
            const { SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLogistics(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispactchPotatoBatchToLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await updateLogisticsStates(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await storePotatoBatchAtLC(SupplyLedger, farm, localCollector);
            await deployFactory(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchPotatoBatchToFactoryFromLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);


            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await updateLogisticsStates(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });


        it("Should should store potatoBatch at Factory", async function () {
            const { SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLogistics(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispactchPotatoBatchToLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await updateLogisticsStates(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await storePotatoBatchAtLC(SupplyLedger, farm, localCollector);
            await deployFactory(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchPotatoBatchToFactoryFromLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await updateLogisticsStates(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);


            await storePotatoBatchAtFactory(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });

        it("Should should prepare chips at Factory", async function () {
            const { SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLogistics(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispactchPotatoBatchToLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await updateLogisticsStates(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await storePotatoBatchAtLC(SupplyLedger, farm, localCollector);
            await deployFactory(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchPotatoBatchToFactoryFromLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await updateLogisticsStates(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await storePotatoBatchAtFactory(SupplyLedger, farm, localCollector, factory, retailStore, logistics);


            await prepareChipsAtFactory(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });

        it("Should dispatch to Chips to Retail Store", async function () {
            const { SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLogistics(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispactchPotatoBatchToLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await updateLogisticsStates(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await storePotatoBatchAtLC(SupplyLedger, farm, localCollector);
            await deployFactory(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchPotatoBatchToFactoryFromLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await updateLogisticsStates(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await storePotatoBatchAtFactory(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await prepareChipsAtFactory(SupplyLedger, farm, localCollector, factory, retailStore, logistics);

            await deployRS(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchChipsBatchToRSFromFactory(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });
    });




    async function checkArrivedBatchDetailsInRS(logisticsId: number, SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        const rsContract = await ethers.getContractFactory("RetailStore");
        const _rsContract = rsContract.attach(rsEntity.contractAddr);
        let _arrivedBatchDetails = await _rsContract.ArrivedBatchDetails(_chipsPacketBatchRelationId);
        // console.log(logisticsId);
        // console.log(_arrivedBatchDetails);
    }


    async function chipsPacketStoredAtRs(SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        await SupplyLedger.connect(retailStore).chipsPacketStoredAtRs(_chipsPacketBatchRelationId, weightDispatchFactory);

        const RetailStore = await ethers.getContractFactory("RetailStore");
        const _RetailStore = RetailStore.attach(rsEntity.contractAddr);
        const _rsData = await _RetailStore.ArrivedBatchDetails(_chipsPacketBatchRelationId);
        // console.log(_rsData);

        // expect(_lcData.dispatchedTo).to.equal(retailStore.address);
    }

    async function chipsPacketSold(SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {

        _chipsPacketId = await SupplyLedger.chipsPacketId();
        await SupplyLedger.connect(retailStore).chipsPacketSold(_chipsPacketBatchRelationId, soldPacketWeight);

        const RetailStore = await ethers.getContractFactory("RetailStore");
        const _RetailStore = RetailStore.attach(rsEntity.contractAddr);
        const _rsData = await _RetailStore.soldChipsPacket(_chipsPacketId);
        // console.log(_rsData);
    }


    describe("Working with Retail Store", function () {
        return

        it("Should update Logistics Details in Retail Store contarct", async function () {
            const { SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLogistics(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispactchPotatoBatchToLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await updateLogisticsStates(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await storePotatoBatchAtLC(SupplyLedger, farm, localCollector);
            await deployFactory(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchPotatoBatchToFactoryFromLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await updateLogisticsStates(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await storePotatoBatchAtFactory(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await prepareChipsAtFactory(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployRS(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchChipsBatchToRSFromFactory(SupplyLedger, farm, localCollector, factory, retailStore, logistics);


            await checkArrivedBatchDetailsInRS(_factoryToRsLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await updateLogisticsStates(_factoryToRsLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInRS(_factoryToRsLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });


        it("Should store chips packet batch at retail store", async function () {
            const { SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLogistics(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispactchPotatoBatchToLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await updateLogisticsStates(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await storePotatoBatchAtLC(SupplyLedger, farm, localCollector);
            await deployFactory(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchPotatoBatchToFactoryFromLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await updateLogisticsStates(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await storePotatoBatchAtFactory(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await prepareChipsAtFactory(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployRS(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchChipsBatchToRSFromFactory(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await updateLogisticsStates(_factoryToRsLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInRS(_factoryToRsLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);

            await chipsPacketStoredAtRs(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });

        it("Should store detail of sold item in retail store", async function () {
            const { SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLogistics(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispactchPotatoBatchToLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await updateLogisticsStates(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await storePotatoBatchAtLC(SupplyLedger, farm, localCollector);
            await deployFactory(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchPotatoBatchToFactoryFromLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await updateLogisticsStates(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await storePotatoBatchAtFactory(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await prepareChipsAtFactory(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployRS(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchChipsBatchToRSFromFactory(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await updateLogisticsStates(_factoryToRsLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInRS(_factoryToRsLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await chipsPacketStoredAtRs(SupplyLedger, farm, localCollector, factory, retailStore, logistics);


            await chipsPacketSold(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });
    });





    async function getDetailsOfProduct0(chipsPacketId: number, SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        const _fullData = await SupplyLedger.getChipsPacketDetailFromFactory(chipsPacketId);
        // const _fullData = await SupplyLedger.getSupplyDetailOfChipsPacket(chipsPacketId);

        console.log(_fullData);
        
    }
        async function getDetailsOfProduct(chipsPacketId: number, SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        const chipsBatchRelationId = Number(await SupplyLedger.chipsPacketBatchRelationIdOf(chipsPacketId));
        // console.log(chipsBatchRelationId);

        const chipsPacketBatchRelationDetails = await SupplyLedger.chipsPacketBatchRelationsOf(chipsBatchRelationId);
        // console.log(chipsPacketBatchRelationDetails);
        const potatoBatchRelationId = Number(chipsPacketBatchRelationDetails.potatosRelativeId);
        const potatoBatchRelationDetails = await SupplyLedger.potatBatchRelationOf(potatoBatchRelationId)


        const _farmStatus = await SupplyLedger.farmStatus(potatoBatchRelationDetails.farm);        
        const FarmContract = await ethers.getContractFactory("Farm");
        const _farmContract = FarmContract.attach(_farmStatus.contractAddr);
        
        const lcStatus = await SupplyLedger.lCStatus(potatoBatchRelationDetails.localCollector);
        const localCollectorContract = await ethers.getContractFactory("LocalCollector");
        const _localCollectorContract = localCollectorContract.attach(lcStatus.contractAddr);

        const factoryStatus = await SupplyLedger.factoryStatus(potatoBatchRelationDetails.factory);
        const factoryContract = await ethers.getContractFactory("Factory");
        const _factoryContract = factoryContract.attach(factoryStatus.contractAddr);

        const rsStatus = await SupplyLedger.rSStatus(chipsPacketBatchRelationDetails.retailStore);
        const RetailStoreContract = await ethers.getContractFactory("RetailStore");
        const _RetailStoreContract = RetailStoreContract.attach(rsStatus.contractAddr);


        const chipsPacketSoldDetails = await _RetailStoreContract.soldChipsPacket(chipsPacketId);
        const chipsBatchArrivedAtRsDetails = await _RetailStoreContract.ArrivedBatchDetails(chipsBatchRelationId);
        // console.log(chipsPacketSoldDetails);
        // console.log(chipsBatchArrivedAtRsDetails);
        
        const chipsManufacturingDetails = await _factoryContract.chipsBatchOf(chipsBatchRelationId);
        const chipsBatchDispatchedFromFactoryDetails = await _factoryContract.DispatchedBatchDetails(chipsBatchRelationId);
        const potatoBatchArrivedAtFactoryDetails = await _factoryContract.ArrivedBatchDetails(potatoBatchRelationId);
        // console.log(chipsManufacturingDetails);
        // console.log(chipsBatchDispatchedFromFactoryDetails);
        // console.log(potatoBatchArrivedAtFactoryDetails);


        const arrivedBatchAtLcDetails = await _localCollectorContract.ArrivedBatchDetails(potatoBatchRelationId);
        const dispatchedBatchAtLcDetails = await _localCollectorContract.DispatchedBatchDetails(potatoBatchRelationId);
        // console.log(arrivedBatchAtLcDetails);
        // console.log(dispatchedBatchAtLcDetails);


        const potatoDetailsAtFarm = await _farmContract.farmPotatoBatchDetailOf(potatoBatchRelationId);   
        // console.log(potatoDetailsAtFarm);
        

        const farmToLcLogisticContractAddr = potatoDetailsAtFarm.logisticContractAddr;
        const farmToLcLogisticId = Number(potatoDetailsAtFarm.logisticId);     
        const lcToFactoryLogisticContractAddr = dispatchedBatchAtLcDetails.logisticContractAddr;
        const lcToFactoryLogisticId = Number(dispatchedBatchAtLcDetails.logisticId);     
        const factoryToRsLogisticContractAddr = chipsBatchDispatchedFromFactoryDetails.logisticContractAddr;
        const factoryToRsLogisticId = Number(chipsBatchDispatchedFromFactoryDetails.logisticId); 
        
        // console.log(farmToLcLogisticId,lcToFactoryLogisticId,factoryToRsLogisticId);
        // console.log(farmToLcLogisticContractAddr,lcToFactoryLogisticContractAddr,factoryToRsLogisticContractAddr);
        
        
        const logisticsContract = await ethers.getContractFactory("Logistics");
        const farmToLcLogisticContract = logisticsContract.attach(farmToLcLogisticContractAddr);
        const lcToFactoryLogisticContract = logisticsContract.attach(lcToFactoryLogisticContractAddr);
        const factoryToRsLogisticContract = logisticsContract.attach(factoryToRsLogisticContractAddr);

        const farmToLcLogisticDetails = await farmToLcLogisticContract.shipmentOf(farmToLcLogisticId);
        const lcToFactoryLogisticDetails = await lcToFactoryLogisticContract.shipmentOf(lcToFactoryLogisticId);
        const factoryToRsLogisticDetails = await factoryToRsLogisticContract.shipmentOf(factoryToRsLogisticId);


        console.log(farmToLcLogisticDetails);
        console.log(lcToFactoryLogisticDetails);
        console.log(factoryToRsLogisticDetails);
        

    }

    async function getDetailsOfProduct2(SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {

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
        it("Should get all details of product", async function () {
            const { SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLogistics(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispactchPotatoBatchToLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await updateLogisticsStates(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await storePotatoBatchAtLC(SupplyLedger, farm, localCollector);
            await deployFactory(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchPotatoBatchToFactoryFromLC(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await updateLogisticsStates(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await storePotatoBatchAtFactory(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await prepareChipsAtFactory(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployRS(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchChipsBatchToRSFromFactory(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await updateLogisticsStates(_factoryToRsLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInRS(_factoryToRsLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await chipsPacketStoredAtRs(SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await chipsPacketSold(SupplyLedger, farm, localCollector, factory, retailStore, logistics);

            await getDetailsOfProduct(_chipsPacketId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });
    });



});
