
const { addressObj, SupplyLedgerRegistrarContract, SupplyLedgerContract } = require('./contractModules.js');

const { EntityType, PackageSize,chipsPacketRelatedAllDetails, batchQualityHelp, chipsManufacturingDetailsHelp } = require('../src/smartContractConstants.js');



let supplyLedgerRegistrarContract, supplyLedgerContract;

function formatDate(sec){
    return (new Date(Number(sec * 1000))).toLocaleString('en-US', {
        // dateStyle: 'full',
        // timeStyle: 'full',
        hour12: true,
    })
}


const chipsPacketId = 1;
async function findDetail() {
    const [admin] = await ethers.getSigners();

    supplyLedgerRegistrarContract = new SupplyLedgerRegistrarContract(admin.address);
    await supplyLedgerRegistrarContract.connectContract(addressObj.supplyLedgerRegistrar);
    console.log("supplyLedgerRegistrarContract Contract connected");


    supplyLedgerContract = new SupplyLedgerContract(admin.address);
    await supplyLedgerContract.connectContract(addressObj.supplyLedger);
    console.log("SupplyLedger Contract connected");


    const chipsBatchRelationId = Number(await supplyLedgerContract.contract.chipsPacketBatchIdOf(chipsPacketId));
    const chipsPacketBatchRelationDetails = await supplyLedgerContract.contract.chipsPacketBatchRelationsOf(chipsBatchRelationId);
    const potatoBatchRelationId = Number(chipsPacketBatchRelationDetails.potatosRelativeId);
    const potatoBatchRelationDetails = await supplyLedgerContract.contract.potatBatchRelationOf(potatoBatchRelationId)

    const _farmStatus = await supplyLedgerRegistrarContract.contract.entityDetails(EntityType.Farm, potatoBatchRelationDetails.farm);
    const FarmContract = await ethers.getContractFactory("Farm");
    const _farmContract = FarmContract.attach(_farmStatus.contractAddr);

    const _lcStatus = await supplyLedgerRegistrarContract.contract.entityDetails(EntityType.LC, potatoBatchRelationDetails.localCollector)
    const localCollectorContract = await ethers.getContractFactory("LocalCollector");
    const _localCollectorContract = localCollectorContract.attach(_lcStatus.contractAddr);

    const _factoryStatus = await supplyLedgerRegistrarContract.contract.entityDetails(EntityType.Factory, potatoBatchRelationDetails.factory);
    const factoryContract = await ethers.getContractFactory("Factory");
    const _factoryContract = factoryContract.attach(_factoryStatus.contractAddr);

    const _rsStatus = await supplyLedgerRegistrarContract.contract.entityDetails(EntityType.RS, chipsPacketBatchRelationDetails.retailStore);
    const RetailStoreContract = await ethers.getContractFactory("RetailStore");
    const _RetailStoreContract = RetailStoreContract.attach(_rsStatus.contractAddr);


    const chipsPacketSoldDetails = await _RetailStoreContract.soldChipsPacket(chipsPacketId);
    const chipsBatchArrivedAtRsDetails = await _RetailStoreContract.ArrivedChipsPacketBatchDetails(chipsBatchRelationId);

    const chipsManufacturingDetails = await _factoryContract.chipsPacketBatchOf(chipsBatchRelationId);
    const chipsBatchDispatchedFromFactoryDetails = await _factoryContract.DispatchedChipsPacketBatchDetails(chipsBatchRelationId);
    const potatoBatchArrivedAtFactoryDetails = await _factoryContract.ArrivedBatchDetails(potatoBatchRelationId);

    const arrivedBatchAtLcDetails = await _localCollectorContract.ArrivedBatchDetails(potatoBatchRelationId);
    const dispatchedBatchAtLcDetails = await _localCollectorContract.DispatchedBatchDetails(potatoBatchRelationId);

    const potatoDetailsAtFarm = await _farmContract.farmPotatoBatchDetailOf(potatoBatchRelationId);


    chipsPacketRelatedAllDetails.chipsPacketId = chipsPacketId;
        chipsPacketRelatedAllDetails.chipsBatchId = chipsBatchRelationId;
        chipsPacketRelatedAllDetails.potatoBatchId = potatoBatchRelationId;

        chipsPacketRelatedAllDetails.potatoBatchHarvestQuality = {
            size: batchQualityHelp.size[potatoDetailsAtFarm.harvestBatchQuality.size],
            shape: batchQualityHelp.shape[potatoDetailsAtFarm.harvestBatchQuality.shape],
            color: batchQualityHelp.color[potatoDetailsAtFarm.harvestBatchQuality.color],
            externalQuality: batchQualityHelp.externalQuality[potatoDetailsAtFarm.harvestBatchQuality.externalQuality],
            internalQuality: batchQualityHelp.internalQuality[potatoDetailsAtFarm.harvestBatchQuality.internalQuality],
            weight: batchQualityHelp.weight[potatoDetailsAtFarm.harvestBatchQuality.weight]
        };



        chipsPacketRelatedAllDetails.harvestCollected = { oqs: Number(potatoDetailsAtFarm.oqsHarvest), weight: Number(potatoDetailsAtFarm.harvestBatchWeight), timestamp: formatDate(Number(potatoDetailsAtFarm.collectedAt)) };
        chipsPacketRelatedAllDetails.harvestDispatchedFromFarmToLC = { oqs: Number(potatoDetailsAtFarm.oqsDispatch), weight: Number(potatoDetailsAtFarm.weightDispatch), timestamp: formatDate(Number(potatoDetailsAtFarm.collectedAt)) };

        chipsPacketRelatedAllDetails.lcPicking = { oqs: Number(arrivedBatchAtLcDetails.oqs), weight: Number(arrivedBatchAtLcDetails.weight), timestamp: formatDate(Number(arrivedBatchAtLcDetails.time)) };
        chipsPacketRelatedAllDetails.lsDispatch = { oqs: Number(dispatchedBatchAtLcDetails.oqs), weight: Number(dispatchedBatchAtLcDetails.weight), timestamp: formatDate(Number(dispatchedBatchAtLcDetails.time)) };

        chipsPacketRelatedAllDetails.chipsManufacturingDetails = {
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
            // chipsPacketRelatedAllDetails.chipsManufacturingDetails.processDetails.ingredients.pop()
            chipsPacketRelatedAllDetails.chipsManufacturingDetails.processDetails.ingredients.push(chipsManufacturingDetailsHelp.processDetails.ingredients[item]);
        })


        chipsPacketRelatedAllDetails.factoryPicking = { oqs: Number(chipsBatchDispatchedFromFactoryDetails.oqs), weight: Number(chipsBatchDispatchedFromFactoryDetails.weight), timestamp: formatDate(Number(chipsBatchDispatchedFromFactoryDetails.time)) };

        chipsPacketRelatedAllDetails.factoryDispatch = { oqs: Number(potatoBatchArrivedAtFactoryDetails.oqs), weight: Number(potatoBatchArrivedAtFactoryDetails.weight), timestamp: formatDate(Number(potatoBatchArrivedAtFactoryDetails.time)) };

        chipsPacketRelatedAllDetails.rsPicking = { oqs: Number(chipsBatchArrivedAtRsDetails.oqs), weight: Number(chipsBatchArrivedAtRsDetails.weight), timestamp: formatDate(Number(chipsBatchArrivedAtRsDetails.time)) };
        chipsPacketRelatedAllDetails.itemSold = { size: batchQualityHelp.size[Number(chipsPacketSoldDetails.size)], timestamp: formatDate(Number(chipsPacketSoldDetails.time)) };

        console.log(chipsPacketRelatedAllDetails);

}

findDetail()