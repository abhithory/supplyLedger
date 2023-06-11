import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

const { potatobatchQuality, chipsBatchDetails, maxCapacity, weight, oqs } = require('../src/constantData.js');
const { EntityType, PackageSize, batchQualityHelp, chipsManufacturingDetailsHelp } = require('../src/smartContractConstants.js');



describe("SupplyLedger", function () {

    let farmEntity: any, lcEntity: any, factoryEntity: any, rsEntity: any, logisticsEntity: any;
    let _potatoBatchRelationId: number, _chipsPacketBatchRelationId: number, _chipsPacketId: number;
    let _farmToLcLogisticsId: number, _LcToFactoryLogisticsId: number, _factoryToRsLogisticsId: number;

    async function SupplyLedgerFixture() {
        // Contracts are deployed using the first signer/account by default
        const [admin, farm, localCollector, factory, retailStore, logistics] = await ethers.getSigners();
        const supplyLedger = await ethers.getContractFactory("SupplyLedger");
        const SupplyLedger = await supplyLedger.deploy(admin.address);

        const SupplyLedgerRegistrar = await ethers.getContractFactory("SupplyLedgerRegistrar");
        const supplyLedgerRegistrar = await SupplyLedgerRegistrar.deploy(SupplyLedger.address);

        const tx = await SupplyLedger.updateSupplyLedgerRegistar(supplyLedgerRegistrar.address);
        await tx.wait();

        return { supplyLedgerRegistrar, SupplyLedger, admin, farm, factory, localCollector, retailStore, logistics };
    }

    async function deployFarm(supplyLedgerRegistrar: any, SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        expect((await supplyLedgerRegistrar.entityDetails(EntityType.Farm, farm.address)).status).to.equal(false);
        await supplyLedgerRegistrar.registerEntity(EntityType.Farm, farm.address, maxCapacity.farm, 0);
        expect((await supplyLedgerRegistrar.entityDetails(EntityType.Farm, farm.address)).status).to.equal(true);
    }

    async function deployLC(supplyLedgerRegistrar: any, SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        expect((await supplyLedgerRegistrar.entityDetails(EntityType.LC, localCollector.address)).status).to.equal(false);
        await supplyLedgerRegistrar.registerEntity(EntityType.LC, localCollector.address, maxCapacity.lc, 0);
        expect((await supplyLedgerRegistrar.entityDetails(EntityType.LC, localCollector.address)).status).to.equal(true);
    }

    async function deployFactory(supplyLedgerRegistrar: any, SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        expect((await supplyLedgerRegistrar.entityDetails(EntityType.Factory, factory.address)).status).to.equal(false);
        await supplyLedgerRegistrar.registerEntity(EntityType.Factory, factory.address, maxCapacity.factory, maxCapacity.factoryChips);
        expect((await supplyLedgerRegistrar.entityDetails(EntityType.Factory, factory.address)).status).to.equal(true);
    }

    async function deployRS(supplyLedgerRegistrar: any, SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        expect((await supplyLedgerRegistrar.entityDetails(EntityType.RS, retailStore.address)).status).to.equal(false);
        await supplyLedgerRegistrar.registerEntity(EntityType.RS, retailStore.address, maxCapacity.rs, 0);
        expect((await supplyLedgerRegistrar.entityDetails(EntityType.RS, retailStore.address)).status).to.equal(true);
    }

    async function deployLogistics(supplyLedgerRegistrar: any, SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        expect((await supplyLedgerRegistrar.entityDetails(EntityType.Logistics, logistics.address)).status).to.equal(false);
        await supplyLedgerRegistrar.registerEntity(EntityType.Logistics, logistics.address, maxCapacity.logistics, 0);
        expect((await supplyLedgerRegistrar.entityDetails(EntityType.Logistics, logistics.address)).status).to.equal(true);
    }

    describe("Deployment + Registrartion", function () {
        // return;
        it("Should set the right admin", async function () {
            const { supplyLedgerRegistrar, SupplyLedger, admin } = await loadFixture(SupplyLedgerFixture);
            expect(await supplyLedgerRegistrar.admin()).to.equal(admin.address);
        });

        it("Should deploy Farm and set right address", async function () {
            const { supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });

        it("Should deploy Local collectory and set right address", async function () {
            const { supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });

        it("Should deploy factory and set right address", async function () {
            const { supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFactory(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });

        it("Should deploy Retail Store and set right address", async function () {
            const { supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployRS(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });

        it("Should deploy Logistics and set right address", async function () {
            const { supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployLogistics(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });
    });



    async function addPotatoBatchInFarm(supplyLedgerRegistrar: any, SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        farmEntity = await supplyLedgerRegistrar.entityDetails(EntityType.Farm, farm.address);

        const tx = await SupplyLedger.connect(farm).addPotatoBatchAtFarm(potatobatchQuality, oqs.harvestAtFarm1, weight.harvestAtFarm1);
        const txLog = await tx.wait();
        _potatoBatchRelationId = Number(txLog.events[0].args.CreatedPotatoBatchId);

        const FarmContract = await ethers.getContractFactory("Farm");
        const farmContract = FarmContract.attach(farmEntity.contractAddr);

        const _farmData = await farmContract.farmPotatoBatchDetailOf(_potatoBatchRelationId);
        // console.log('====================================');
        // console.log(_farmData);
        // console.log('====================================');
    }

    async function dispactchPotatoBatchToLC(supplyLedgerRegistrar: any, SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        lcEntity = await supplyLedgerRegistrar.entityDetails(EntityType.LC, localCollector.address);
        logisticsEntity = await supplyLedgerRegistrar.entityDetails(EntityType.Logistics, logistics.address);

        await SupplyLedger.connect(farm).dispatchPotatoBatchToLC(_potatoBatchRelationId, localCollector.address, oqs.atDispatchFarm1, weight.atDispatchFarm1, logistics.address);

        const FarmContract = await ethers.getContractFactory("Farm");
        const farmContract = FarmContract.attach(farmEntity.contractAddr);

        const _farmData = await farmContract.farmPotatoBatchDetailOf(_potatoBatchRelationId);
        _farmToLcLogisticsId = Number(_farmData.logisticId);

        // console.log('====================================');
        // console.log(_farmData);
        // console.log('====================================');
    }

    describe("Working with Farm Contract", function () {
        // return;
        it("Should add food item in farm", async function () {
            const { supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });
        it("Should dispatch to local collector from farm", async function () {
            const { supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);

            await deployLogistics(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispactchPotatoBatchToLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });
    });




    async function checkArrivedBatchDetailsInLC(logisticsId: number, SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        const localCollectorContract = await ethers.getContractFactory("LocalCollector");
        const _localCollectorContract = localCollectorContract.attach(lcEntity.contractAddr);
        let _arrivedBatchDetails = await _localCollectorContract.ArrivedBatchDetails(_potatoBatchRelationId);
        // console.log(_arrivedBatchDetails.logisticId);
    }

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
    }


    async function storePotatoBatchAtLC(SupplyLedger: any, farm: any, localCollector: any) {

        const LocalCollector = await ethers.getContractFactory("LocalCollector");
        const _localCollector = LocalCollector.attach(lcEntity.contractAddr);
        let _lcData = await _localCollector.ArrivedBatchDetails(_potatoBatchRelationId);
        // console.log(_lcData);
        await SupplyLedger.connect(localCollector).potatoBatchStoredAtLC(_potatoBatchRelationId, oqs.reachLc1, weight.reachLc1);
        _lcData = await _localCollector.ArrivedBatchDetails(_potatoBatchRelationId);
        // console.log(_lcData);
    }


    async function dispatchPotatoBatchToFactoryFromLC(supplyLedgerRegistrar: any, SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        factoryEntity = await supplyLedgerRegistrar.entityDetails(EntityType.Factory, factory.address);


        await SupplyLedger.connect(localCollector).dispatchPotatoBatchToFactory(_potatoBatchRelationId, factory.address, oqs.dispactchLc1, oqs.dispactchLc1, logistics.address);
        const itemData = await SupplyLedger.potatBatchRelationOf(_potatoBatchRelationId);
        expect(itemData.factory).to.equal(factory.address);

        const LocalCollector = await ethers.getContractFactory("LocalCollector");
        const _localCollector = LocalCollector.attach(lcEntity.contractAddr);

        const _lcData = await _localCollector.DispatchedBatchDetails(_potatoBatchRelationId);
        _LcToFactoryLogisticsId = Number(_lcData.logisticId);
        // console.log(_lcData);
        // console.log(_LcToFactoryLogisticsId);

    }

    describe("Working with Local Collector", function () {
        // return;
        it("Should update Logistics Details in Local collector", async function () {
            const { supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLogistics(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispactchPotatoBatchToLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);

            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await updateLogisticsStates(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
        });

        it("Should should store potatoBatch at local collector", async function () {
            const { supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLogistics(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispactchPotatoBatchToLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await updateLogisticsStates(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)

            await storePotatoBatchAtLC(SupplyLedger, farm, localCollector);
        });

        it("Should dispatch to Factory", async function () {
            const { supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLogistics(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispactchPotatoBatchToLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await updateLogisticsStates(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await storePotatoBatchAtLC(SupplyLedger, farm, localCollector);

            await deployFactory(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchPotatoBatchToFactoryFromLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });
    });


    async function checkArrivedBatchDetailsInFactory(logisticsId: number, SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        const factoryContract = await ethers.getContractFactory("Factory");
        const _factoryContract = factoryContract.attach(factoryEntity.contractAddr);
        let _arrivedBatchDetails = await _factoryContract.ArrivedBatchDetails(_potatoBatchRelationId);
        // console.log(logisticsId);
        // console.log(_arrivedBatchDetails);
    }

    async function storePotatoBatchAtFactory(supplyLedgerRegistrar: any, SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {

        const factoryContract = await ethers.getContractFactory("Factory");
        const _factoryContract = factoryContract.attach(factoryEntity.contractAddr);
        let _factoryData = await _factoryContract.ArrivedBatchDetails(_potatoBatchRelationId);
        // console.log(_factoryData);
        await SupplyLedger.connect(factory).potatoBatchStoredAtFactory(_potatoBatchRelationId, oqs.reachFactory, weight.reachFactory);
        _factoryData = await _factoryContract.ArrivedBatchDetails(_potatoBatchRelationId);
        // console.log(_factoryData);
    }


    async function prepareChipsAtFactory(supplyLedgerRegistrar: any, SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        chipsBatchDetails.potatoBatchId = _potatoBatchRelationId
        const tx = await SupplyLedger.connect(factory).chipsPreparedAtFactory(chipsBatchDetails);
        const txData = await tx.wait();
        _chipsPacketBatchRelationId = Number(txData.events[0].args.PreparedChipsPacketBatchId)

        const factoryContract = await ethers.getContractFactory("Factory");
        const _factoryContract = factoryContract.attach(factoryEntity.contractAddr);
        let _chipsData = await _factoryContract.chipsPacketBatchOf(_chipsPacketBatchRelationId);
        // console.log(_chipsData);
    }

    async function dispatchChipsBatchToRSFromFactory(supplyLedgerRegistrar: any, SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        rsEntity = await supplyLedgerRegistrar.entityDetails(EntityType.RS, retailStore.address);


        await SupplyLedger.connect(factory).chipsPacketBatchDispatchedToRS(_chipsPacketBatchRelationId, retailStore.address, oqs.dispactchChipsFactory, weight.dispactchChipsFactory, logistics.address);
        const itemData = await SupplyLedger.chipsPacketBatchRelationsOf(_chipsPacketBatchRelationId);
        expect(itemData.retailStore).to.equal(retailStore.address);


        const factoryContract = await ethers.getContractFactory("Factory");
        const _factoryContract = factoryContract.attach(factoryEntity.contractAddr);

        const _factoryData = await _factoryContract.DispatchedChipsPacketBatchDetails(_chipsPacketBatchRelationId);
        _factoryToRsLogisticsId = Number(_factoryData.logisticId);

        // console.log(_factoryData);

    }



    describe("Working with Factory", function () {
        // return;
        it("Should update Logistics Details in Factory contarct", async function () {
            const { supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLogistics(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispactchPotatoBatchToLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await updateLogisticsStates(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await storePotatoBatchAtLC(SupplyLedger, farm, localCollector);
            await deployFactory(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchPotatoBatchToFactoryFromLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);


            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await updateLogisticsStates(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });


        it("Should should store potatoBatch at Factory", async function () {
            const { supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLogistics(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispactchPotatoBatchToLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await updateLogisticsStates(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await storePotatoBatchAtLC(SupplyLedger, farm, localCollector);
            await deployFactory(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchPotatoBatchToFactoryFromLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await updateLogisticsStates(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);

            await storePotatoBatchAtFactory(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });

        it("Should should prepare chips at Factory", async function () {
            const { supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLogistics(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispactchPotatoBatchToLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await updateLogisticsStates(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await storePotatoBatchAtLC(SupplyLedger, farm, localCollector);
            await deployFactory(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchPotatoBatchToFactoryFromLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await updateLogisticsStates(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await storePotatoBatchAtFactory(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);

            await prepareChipsAtFactory(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });

        it("Should dispatch to Chips to Retail Store", async function () {
            const { supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLogistics(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispactchPotatoBatchToLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await updateLogisticsStates(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await storePotatoBatchAtLC(SupplyLedger, farm, localCollector);
            await deployFactory(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchPotatoBatchToFactoryFromLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await updateLogisticsStates(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await storePotatoBatchAtFactory(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await prepareChipsAtFactory(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);


            await deployRS(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchChipsBatchToRSFromFactory(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });
    });




    async function checkArrivedBatchDetailsInRS(logisticsId: number, SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        const rsContract = await ethers.getContractFactory("RetailStore");
        const _rsContract = rsContract.attach(rsEntity.contractAddr);
        let _arrivedBatchDetails = await _rsContract.ArrivedChipsPacketBatchDetails(_chipsPacketBatchRelationId);
        // console.log(logisticsId);
        // console.log(_arrivedBatchDetails);
    }


    async function chipsPacketStoredAtRs(supplyLedgerRegistrar: any, SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        await SupplyLedger.connect(retailStore).chipsPacketStoredAtRs(_chipsPacketBatchRelationId, oqs.reachChipsRs1, weight.reachChipsRs1);

        const RetailStore = await ethers.getContractFactory("RetailStore");
        const _RetailStore = RetailStore.attach(rsEntity.contractAddr);
        const _rsData = await _RetailStore.ArrivedChipsPacketBatchDetails(_chipsPacketBatchRelationId);
        // console.log(_rsData);

        // expect(_lcData.dispatchedTo).to.equal(retailStore.address);
    }

    async function chipsPacketSold(supplyLedgerRegistrar: any, SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {

        _chipsPacketId = await SupplyLedger.chipsPacketId();
        const tx = await SupplyLedger.connect(retailStore).chipsPacketSold(_chipsPacketBatchRelationId, PackageSize.Gram200);
        const txData = await tx.wait();
        _chipsPacketId = txData.events[0].args.SoldChipsPacketId;

        const RetailStore = await ethers.getContractFactory("RetailStore");
        const _RetailStore = RetailStore.attach(rsEntity.contractAddr);
        const _rsData = await _RetailStore.soldChipsPacket(_chipsPacketId);
        // console.log(_chipsPacketId);
        // console.log(_rsData);
    }


    describe("Working with Retail Store", function () {
        // return;
        it("Should update Logistics Details in Retail Store contarct", async function () {
            const { supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLogistics(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispactchPotatoBatchToLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await updateLogisticsStates(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await storePotatoBatchAtLC(SupplyLedger, farm, localCollector);
            await deployFactory(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchPotatoBatchToFactoryFromLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await updateLogisticsStates(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await storePotatoBatchAtFactory(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await prepareChipsAtFactory(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployRS(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchChipsBatchToRSFromFactory(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);


            await checkArrivedBatchDetailsInRS(_factoryToRsLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await updateLogisticsStates(_factoryToRsLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInRS(_factoryToRsLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });



        it("Should store chips packet batch at retail store", async function () {
            const { supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLogistics(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispactchPotatoBatchToLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await updateLogisticsStates(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await storePotatoBatchAtLC(SupplyLedger, farm, localCollector);
            await deployFactory(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchPotatoBatchToFactoryFromLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await updateLogisticsStates(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await storePotatoBatchAtFactory(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await prepareChipsAtFactory(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployRS(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchChipsBatchToRSFromFactory(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInRS(_factoryToRsLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await updateLogisticsStates(_factoryToRsLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInRS(_factoryToRsLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);



            await chipsPacketStoredAtRs(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });


        it("Should store detail of sold item in retail store", async function () {
            const { supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLogistics(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispactchPotatoBatchToLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await updateLogisticsStates(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await storePotatoBatchAtLC(SupplyLedger, farm, localCollector);
            await deployFactory(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchPotatoBatchToFactoryFromLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await updateLogisticsStates(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await storePotatoBatchAtFactory(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await prepareChipsAtFactory(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployRS(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchChipsBatchToRSFromFactory(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInRS(_factoryToRsLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await updateLogisticsStates(_factoryToRsLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInRS(_factoryToRsLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await chipsPacketStoredAtRs(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);

            await chipsPacketSold(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });
    });





    async function getDetailsOfProduct(chipsPacketId: number, supplyLedgerRegistrar: any, SupplyLedger: any, farm: any, localCollector: any, factory: any, retailStore: any, logistics: any) {
        const itemDetails = {
            chipsPacketId: 0,
            chipsBatchId: 0,
            potatoBatchId: 0,
            potatoBatchHarvestQuality: {
                size: "0",
                shape: "0",
                color: "0",
                externalQuality: "0",
                internalQuality: "0",
                weight: "0"
            },
            chipsManufacturingDetails: {
                chipsDetail: {
                    flavor: "0",
                    texture: "0"
                },
                processDetails: {
                    cookingTemperature: 0, // *C
                    ingredients: ["0"]
                },
                packagingDetails: {
                    packagingMaterial: "0",
                    packageSize: "0"
                },
                totalPackets: 0,
                totalWeight: 0, // kg * 1000
                productionDate: "0",
                shelfLife: 0
            },
            harvestCollected: {
                oqs: 0,
                weight: 0,
                timestamp: "0"
            },
            harvestDispatchedFromFarmToLC: {
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
            factoryPicking: {
                oqs: 0,
                weight: 0,
                timestamp: "0"
            },
            factoryDispatch: {
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
                size: "0",
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


        const chipsBatchRelationId = Number(await SupplyLedger.chipsPacketBatchIdOf(chipsPacketId));
        // console.log("chips packet batch Id: ",chipsBatchRelationId);

        const chipsPacketBatchRelationDetails = await SupplyLedger.chipsPacketBatchRelationsOf(chipsBatchRelationId);
        // console.log("chipspacketBatch Relation",chipsPacketBatchRelationDetails);
        const potatoBatchRelationId = Number(chipsPacketBatchRelationDetails.potatosRelativeId);
        const potatoBatchRelationDetails = await SupplyLedger.potatBatchRelationOf(potatoBatchRelationId)
        // console.log("potato Batch Relations ",potatoBatchRelationDetails);


        const _farmStatus = await supplyLedgerRegistrar.entityDetails(EntityType.Farm, farm.address);
        const FarmContract = await ethers.getContractFactory("Farm");
        const _farmContract = FarmContract.attach(_farmStatus.contractAddr);

        const _lcStatus = await supplyLedgerRegistrar.entityDetails(EntityType.LC, localCollector.address)
        const localCollectorContract = await ethers.getContractFactory("LocalCollector");
        const _localCollectorContract = localCollectorContract.attach(_lcStatus.contractAddr);

        const _factoryStatus = await supplyLedgerRegistrar.entityDetails(EntityType.Factory, factory.address);
        const factoryContract = await ethers.getContractFactory("Factory");
        const _factoryContract = factoryContract.attach(_factoryStatus.contractAddr);

        const _rsStatus = await supplyLedgerRegistrar.entityDetails(EntityType.RS, retailStore.address)
        const RetailStoreContract = await ethers.getContractFactory("RetailStore");
        const _RetailStoreContract = RetailStoreContract.attach(_rsStatus.contractAddr);

        // await supplyLedgerRegistrar.entityDetails(EntityType.Logistics, logistics.address)


        const chipsPacketSoldDetails = await _RetailStoreContract.soldChipsPacket(chipsPacketId);
        const chipsBatchArrivedAtRsDetails = await _RetailStoreContract.ArrivedChipsPacketBatchDetails(chipsBatchRelationId);
        // console.log(chipsPacketSoldDetails);
        // console.log(chipsBatchArrivedAtRsDetails);

        const chipsManufacturingDetails = await _factoryContract.chipsPacketBatchOf(chipsBatchRelationId);
        const chipsBatchDispatchedFromFactoryDetails = await _factoryContract.DispatchedChipsPacketBatchDetails(chipsBatchRelationId);
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
        // console.log(_farmStatus.contractAddr);
        // console.log(_lcStatus.contractAddr);
        // console.log(_factoryStatus.contractAddr);
        // console.log(_rsStatus.contractAddr);


        const logisticsContract = await ethers.getContractFactory("Logistics");
        const farmToLcLogisticContract = logisticsContract.attach(farmToLcLogisticContractAddr);
        const lcToFactoryLogisticContract = logisticsContract.attach(lcToFactoryLogisticContractAddr);
        const factoryToRsLogisticContract = logisticsContract.attach(factoryToRsLogisticContractAddr);

        const farmToLcLogisticDetails = await farmToLcLogisticContract.shipmentOf(farmToLcLogisticId);
        const lcToFactoryLogisticDetails = await lcToFactoryLogisticContract.shipmentOf(lcToFactoryLogisticId);
        const factoryToRsLogisticDetails = await factoryToRsLogisticContract.shipmentOf(factoryToRsLogisticId);

        // console.log(farmToLcLogisticDetails);
        // console.log(lcToFactoryLogisticDetails);
        // console.log(factoryToRsLogisticDetails);    

        itemDetails.chipsPacketId = chipsPacketId;
        itemDetails.chipsBatchId = chipsBatchRelationId;
        itemDetails.potatoBatchId = potatoBatchRelationId;

        itemDetails.potatoBatchHarvestQuality = {
            size: batchQualityHelp.size[potatoDetailsAtFarm.harvestBatchQuality.size],
            shape: batchQualityHelp.shape[potatoDetailsAtFarm.harvestBatchQuality.shape],
            color: batchQualityHelp.color[potatoDetailsAtFarm.harvestBatchQuality.color],
            externalQuality: batchQualityHelp.externalQuality[potatoDetailsAtFarm.harvestBatchQuality.externalQuality],
            internalQuality: batchQualityHelp.internalQuality[potatoDetailsAtFarm.harvestBatchQuality.internalQuality],
            weight: batchQualityHelp.weight[potatoDetailsAtFarm.harvestBatchQuality.weight]
        };



        itemDetails.harvestCollected = { oqs: Number(potatoDetailsAtFarm.oqsHarvest), weight: Number(potatoDetailsAtFarm.harvestBatchWeight), timestamp: formatDate(Number(potatoDetailsAtFarm.collectedAt)) };
        itemDetails.harvestDispatchedFromFarmToLC = { oqs: Number(potatoDetailsAtFarm.oqsDispatch), weight: Number(potatoDetailsAtFarm.weightDispatch), timestamp: formatDate(Number(potatoDetailsAtFarm.collectedAt)) };

        itemDetails.lcPicking = { oqs: Number(arrivedBatchAtLcDetails.oqs), weight: Number(arrivedBatchAtLcDetails.weight), timestamp: formatDate(Number(arrivedBatchAtLcDetails.time)) };
        itemDetails.lsDispatch = { oqs: Number(dispatchedBatchAtLcDetails.oqs), weight: Number(dispatchedBatchAtLcDetails.weight), timestamp: formatDate(Number(dispatchedBatchAtLcDetails.time)) };

        itemDetails.chipsManufacturingDetails = {
            chipsDetail: {
                flavor: chipsManufacturingDetailsHelp.chipsDetail.flavor[chipsManufacturingDetails.chipsDetail.flavor],
                texture: chipsManufacturingDetailsHelp.chipsDetail.texture[chipsManufacturingDetails.chipsDetail.texture],
            },
            processDetails: {
                cookingTemperature: Number(chipsManufacturingDetails.processDetails.cookingTemperature), // *C
                ingredients: []
            },
            packagingDetails: {
                packagingMaterial: chipsManufacturingDetailsHelp.packagingDetails.packagingMaterial[chipsManufacturingDetails.packagingDetails.packagingMaterial],
                packageSize: chipsManufacturingDetailsHelp.packagingDetails.packageSize[chipsManufacturingDetails.packagingDetails.packageSize]
            },
            totalPackets: Number(chipsManufacturingDetails.totalPackets),
            totalWeight: Number(chipsManufacturingDetails.totalWeight), // kg * 1000
            productionDate: formatDate(Number(chipsManufacturingDetails.productionDate)),
            shelfLife: Number(chipsManufacturingDetails.shelfLife)
        }

        chipsManufacturingDetails.processDetails.ingredients.forEach((item) => {
            // itemDetails.chipsManufacturingDetails.processDetails.ingredients.pop()
            itemDetails.chipsManufacturingDetails.processDetails.ingredients.push(chipsManufacturingDetailsHelp.processDetails.ingredients[item]);
        })



        itemDetails.factoryPicking = { oqs: Number(chipsBatchDispatchedFromFactoryDetails.oqs), weight: Number(chipsBatchDispatchedFromFactoryDetails.weight), timestamp: formatDate(Number(chipsBatchDispatchedFromFactoryDetails.time)) };

        itemDetails.factoryDispatch = { oqs: Number(potatoBatchArrivedAtFactoryDetails.oqs), weight: Number(potatoBatchArrivedAtFactoryDetails.weight), timestamp: formatDate(Number(potatoBatchArrivedAtFactoryDetails.time)) };

        itemDetails.rsPicking = { oqs: Number(chipsBatchArrivedAtRsDetails.oqs), weight: Number(chipsBatchArrivedAtRsDetails.weight), timestamp: formatDate(Number(chipsBatchArrivedAtRsDetails.time)) };
        itemDetails.itemSold = { size: batchQualityHelp.size[Number(chipsPacketSoldDetails.size)], timestamp: formatDate(Number(chipsPacketSoldDetails.time)) };

        console.log(itemDetails);

    }




    describe("Customer getting details", function () {

        it("Should get all details of product", async function () {
            const { supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics } = await loadFixture(SupplyLedgerFixture);
            await deployFarm(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await addPotatoBatchInFarm(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLogistics(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispactchPotatoBatchToLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics)
            await updateLogisticsStates(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInLC(_farmToLcLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await storePotatoBatchAtLC(SupplyLedger, farm, localCollector);
            await deployFactory(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchPotatoBatchToFactoryFromLC(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await updateLogisticsStates(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInFactory(_LcToFactoryLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await storePotatoBatchAtFactory(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await prepareChipsAtFactory(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await deployRS(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await dispatchChipsBatchToRSFromFactory(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInRS(_factoryToRsLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await updateLogisticsStates(_factoryToRsLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await checkArrivedBatchDetailsInRS(_factoryToRsLogisticsId, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await chipsPacketStoredAtRs(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
            await chipsPacketSold(supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);

            await getDetailsOfProduct(_chipsPacketId, supplyLedgerRegistrar, SupplyLedger, farm, localCollector, factory, retailStore, logistics);
        });
    });



});
