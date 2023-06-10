
const { addressObj, SupplyLedgerContract, FarmContract, LocalCollectorContract, FactoryContract, LogisticsContract } = require('./contractModules.js');
const { potatobatchQuality, chipsBatchDetails, weight, oqs } = require('../src/constantData.js');


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



let supplyLedgerContract, farmContract, lcContract, factoryContract, rsContract, logisticsContract;
let potatoBatchRelationId, chipsPacketBatchRelationId;
let farmToLcLogisticsId, lcToFactoryLogisticsId, factoryToRsLogisticsId;



const waitForSecs = ms => new Promise(res => setTimeout(res, ms));
async function main() {
    const [registrar, farm, localCollector, factory, retailStore, logistics] = await ethers.getSigners();

    supplyLedgerContract = new SupplyLedgerContract(registrar.address);
    await supplyLedgerContract.connectContract(addressObj.supplyLedger);
    console.log("SupplyLedger Contract connected");

    farmContract = new FarmContract(addressObj.farm);
    await farmContract.connectContract();
    console.log("Farm Contract connected");

    lcContract = new LocalCollectorContract(addressObj.lc);
    await lcContract.connectContract();
    console.log(`local collector contract connected`);

    logisticsContract = new LogisticsContract(addressObj.logistics);
    await logisticsContract.connectContract();
    console.log(`logistics contract connected`);

    factoryContract = new FactoryContract(addressObj.factory);
    await factoryContract.connectContract();
    console.log(`factory contract connected`);

    rsContract = addressObj.rs;
    console.log(`retail stored is connected`);


    potatoBatchRelationId = await supplyLedgerContract.getPotatoBatchRelationId()
    await supplyLedgerContract.addPotatoBatchAtFarm(farm, potatobatchQuality, oqsFarm, weightFarm);
    console.log("potato batch added to farm with Id", potatoBatchRelationId);

    await supplyLedgerContract.dispatchPotatoBatchToLC(farm, potatoBatchRelationId, localCollector.address, oqsDispatchFarm, weightDispatchFarm, logistics.address);

    const dataFarm = await farmContract.farmPotatoBatchDetailOf(potatoBatchRelationId);
    farmToLcLogisticsId = Number(dataFarm.logisticId)
    console.log(`potato batch dispatched to local collector with logistics id: ${farmToLcLogisticsId}`);
    // console.log(farmToLcLogisticsId);
    async function logisticSteps(_logisticId) {
        await supplyLedgerContract.updateShipmentStatusInLogistics(_logisticId, logistics, 1);
        console.log(`logistic id: ${_logisticId} status updated to: 1`);
        await supplyLedgerContract.updateShipmentStatusInLogistics(_logisticId, logistics, 2);
        console.log(`logistic id: ${_logisticId} status updated to: 2`);
        // await supplyLedgerContract.updateShipmentStatusInLogistics(_logisticId, logistics, 3);
        // console.log(`logistic id: ${_logisticId} status updated to: 3`);
        // await supplyLedgerContract.updateShipmentStatusInLogistics(_logisticId, logistics, 4);
        // console.log(`logistic id: ${_logisticId} status updated to: 4`);

        await waitForSecs(10000)
        const _shipmentData = await logisticsContract.shipmentOf(_logisticId);
        console.log(_shipmentData);
    }
    await logisticSteps(farmToLcLogisticsId);

    await supplyLedgerContract.potatoBatchStoredAtLC(localCollector, potatoBatchRelationId, oqsReachLC, weightReachLC)
    console.log(`potato batch stored at local collector`);



    await supplyLedgerContract.dispatchPotatoBatchToFactory(localCollector, potatoBatchRelationId, factory.address, oqsDispatchLC, weightDispatchLC, logistics.address)
    const dataLc = await lcContract.DispatchedBatchDetails(potatoBatchRelationId);
    lcToFactoryLogisticsId = Number(dataLc.logisticId)
    console.log(`potato batch dispatched to factory with logistics id: ${lcToFactoryLogisticsId}`);
    await logisticSteps(lcToFactoryLogisticsId);

    await supplyLedgerContract.potatoBatchStoredAtFactory(factory, potatoBatchRelationId, oqsDispatchLC, weightDispatchLC)
    console.log(`chips packet batch stored at factory`);

    chipsPacketBatchRelationId = await supplyLedgerContract.getChipsPacketBatchRelationId();
    await supplyLedgerContract.chipsPreparedAtFactory(factory, potatoBatchRelationId, chipsBatchDetails);
    console.log(`chips are prepared at factory with id: `, chipsPacketBatchRelationId);

    await supplyLedgerContract.chipsPacketBatchDispatchedToRS(factory, chipsPacketBatchRelationId, retailStore.address, weightDispatchLC, logistics.address);
    console.log("chips batch dispatched");
    const datafactory = await factoryContract.DispatchedBatchDetails(potatoBatchRelationId);
    factoryToRsLogisticsId = Number(datafactory.logisticId)
    console.log(`with logistics id: ${factoryToRsLogisticsId}`);
    await logisticSteps(factoryToRsLogisticsId);

    await supplyLedgerContract.chipsPacketStoredAtRs(retailStore, chipsPacketBatchRelationId, weightDispatchLC);
    console.log(`chips packet stored in reatail store`);

    const chipsPacketId = await supplyLedgerContract.getChipsPacketId()
    await supplyLedgerContract.chipsPacketSold(retailStore, chipsPacketBatchRelationId, weightDispatchLC);
    console.log(`chips packet sold of id: ${chipsPacketId}`);
}

main();