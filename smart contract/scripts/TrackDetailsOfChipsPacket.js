
const { addressObj, SupplyLedgerRegistrarContract, SupplyLedgerContract, FarmContract, LocalCollectorContract, FactoryContract, RetailStoreContract, LogisticsContract } = require('./contractModules.js');
const { potatobatchQuality, chipsBatchDetails, weight, oqs } = require('../src/constantData.js');
const { PackageSize } = require('../src/smartContractConstants.js');



let supplyLedgerRegistrarContract, supplyLedgerContract, farmContract, lcContract, factoryContract, rsContract, logisticsContract;
let potatoBatchRelationId, chipsPacketBatchRelationId;
let farmToLcLogisticsId, lcToFactoryLogisticsId, factoryToRsLogisticsId;




const chipsPacketId = 1;

async function findDetail() {
    const [admin, farm, localCollector, factory, retailStore, logistics] = await ethers.getSigners();

    supplyLedgerRegistrarContract = new SupplyLedgerRegistrarContract(admin.address);
    await supplyLedgerRegistrarContract.connectContract(addressObj.supplyLedgerRegistrar);
    console.log("SupplyLedger Contract connected");


    supplyLedgerContract = new SupplyLedgerContract(admin.address);
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

    rsContract = new RetailStoreContract(addressObj.rs);
    await rsContract.connectContract();
    console.log(`retail stored is connected`);


    const chipsBatchRelationId = Number(await supplyLedgerContract.contract.chipsPacketBatchIdOf(chipsPacketId));
    
    const chipsPacketBatchRelationDetails = await supplyLedgerContract.contract.chipsPacketBatchRelationsOf(chipsBatchRelationId);

    const potatoBatchRelationId = Number(chipsPacketBatchRelationDetails.potatosRelativeId);
    const potatoBatchRelationDetails = await supplyLedgerContract.contract.potatBatchRelationOf(potatoBatchRelationId)




}

findDetail()