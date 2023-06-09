
const { SupplyLedgerContract, FarmContract, LocalCollectorContract, FactoryContract } = require('./contractModules.js');
const { potatobatchQuality, chipsBatchDetails } = require('./constantData.js');

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

let potatoBatchRelationId,chipsPacketBatchRelationId;

let farmToLcLogisticsId, lcToFactoryLogisticsId, factoryToRsLogisticsId;





async function main() {
    const [registrar, farm, localCollector, factory, retailStore, logistics] = await ethers.getSigners();

    supplyLedgerContract = new SupplyLedgerContract(registrar.address);
    await supplyLedgerContract.deploySupplyLedger();
    console.log("SupplyLedger Contract Deployed");

    potatoBatchRelationId = await supplyLedgerContract.getPotatoBatchRelationId()
    // console.log(potatoBatchRelationId);

    const _farm = await supplyLedgerContract.deployFarm(farm.address);
    farmContract = new FarmContract(_farm.contractAddr);
    await farmContract.connectContract();
    console.log("Farm Contract Deployed");


    await supplyLedgerContract.addPotatoBatchAtFarm(farm, potatobatchQuality, oqsFarm, weightFarm);
    console.log("potato batch added to farm with Id",potatoBatchRelationId);


    // let _dd = await farmContract.farmPotatoBatchDetailOf(potatoBatchRelationId);
    // console.log(_dd);

    const _lc = await supplyLedgerContract.deployLC(localCollector.address);
    lcContract = new LocalCollectorContract(_lc.contractAddr);
    await lcContract.connectContract();

    console.log(`local collector contract deployed`);


    const _logistics = await supplyLedgerContract.deployLogistics(logistics.address);
    console.log(`logistics contract deployed`);

    await supplyLedgerContract.dispatchPotatoBatchToLC(farm, potatoBatchRelationId, localCollector.address, oqsDispatchFarm, weightDispatchFarm, logistics.address);
    
    const dataFarm = await farmContract.farmPotatoBatchDetailOf(potatoBatchRelationId);
    farmToLcLogisticsId = Number(dataFarm.logisticId)
    console.log(`potato batch dispatched to local collector with logistics id: ${farmToLcLogisticsId}`);
    // console.log(farmToLcLogisticsId);
    async function logisticSteps(_logisticId){
        await supplyLedgerContract.updateShipmentStatusInLogistics(farmToLcLogisticsId,logistics,1);
        console.log(`logistic id: ${farmToLcLogisticsId} status updated to: 1`);
        await supplyLedgerContract.updateShipmentStatusInLogistics(farmToLcLogisticsId,logistics,2);
        console.log(`logistic id: ${farmToLcLogisticsId} status updated to: 2`);
        await supplyLedgerContract.updateShipmentStatusInLogistics(farmToLcLogisticsId,logistics,3);
        console.log(`logistic id: ${farmToLcLogisticsId} status updated to: 3`);
        await supplyLedgerContract.updateShipmentStatusInLogistics(farmToLcLogisticsId,logistics,4);
        console.log(`logistic id: ${farmToLcLogisticsId} status updated to: 4`);
    }
    await logisticSteps(farmToLcLogisticsId);

    await supplyLedgerContract.potatoBatchStoredAtLC(localCollector,potatoBatchRelationId,oqsReachLC,weightReachLC)
    console.log(`potato batch stored at local collector`);

    const _factory = await supplyLedgerContract.deployFactory(factory.address);
    factoryContract = new FactoryContract(_factory.contractAddr);
    await factoryContract.connectContract();
    console.log(`factory contract deployed`);

    await supplyLedgerContract.dispatchPotatoBatchToFactory(localCollector,potatoBatchRelationId,factory.address,oqsDispatchLC,weightDispatchLC,logistics.address)
    const dataLc = await lcContract.DispatchedBatchDetails(potatoBatchRelationId);
    lcToFactoryLogisticsId = Number(dataLc.logisticId)
    console.log(`potato batch dispatched to factory with logistics id: ${lcToFactoryLogisticsId}`);
    await logisticSteps(lcToFactoryLogisticsId);

    await supplyLedgerContract.potatoBatchStoredAtFactory(factory,potatoBatchRelationId,oqsDispatchLC,weightDispatchLC)
    console.log(`chips packet batch stored at factory`);

    chipsPacketBatchRelationId = await supplyLedgerContract.getChipsPacketBatchRelationId();
    await supplyLedgerContract.chipsPreparedAtFactory(factory,potatoBatchRelationId,chipsBatchDetails);
    console.log(`chips are prepared at factory with id: `,chipsPacketBatchRelationId);

    const _rs = await supplyLedgerContract.deployRs(retailStore.address);
    console.log(`retail stored is deployed`);

    await supplyLedgerContract.chipsPacketBatchDispatchedToRS(factory,chipsPacketBatchRelationId,retailStore.address,weightDispatchLC,logistics.address);
    console.log("chips batch dispatched");
    const datafactory = await factoryContract.DispatchedBatchDetails(potatoBatchRelationId);
    factoryToRsLogisticsId = Number(datafactory.logisticId)
    console.log(`with logistics id: ${factoryToRsLogisticsId}`);
    await logisticSteps(factoryToRsLogisticsId);


    await supplyLedgerContract.chipsPacketStoredAtRs(retailStore,chipsPacketBatchRelationId,weightDispatchLC);
    console.log(`chips packet stored in reatail store`);
    
    await supplyLedgerContract.chipsPacketSold(retailStore,chipsPacketBatchRelationId,weightDispatchLC);
    console.log(`chips packet sold`);
}

main();