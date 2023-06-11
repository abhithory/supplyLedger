const EntityType = {
    Farm: 0,
    LC: 1,
    Factory: 2,
    RS: 3,
    Logistics: 4,
}

const  PackageSize =  {
    Gram100:0,
    Gram200:1,
    Gram500:2
}

const batchQualityHelp = {
    size: ["Small", "Medium", "Large"],
    shape: ["Regular", "Irregular"],
    color: ["Light yellow", "Golden", "Russet", "Red-skinned", "White-skinned"],
    externalQuality: ["No external defects", "Minor external defects", "Major external defects"],
    internalQuality: ["No internal defects", "Minor internal defects", "Major internal defects"],
    weight: ["Light", "Medium", "Heavy"]
}
const chipsManufacturingDetailsHelp = {
        chipsDetail: {
            flavor:["Barbecue","SourCreamAndOnion","Salted"],
            texture:["Crispy","Crunchy"]
        },
        processDetails:{
            cookingTemperature:0, // *C
            ingredients:["Potatoes","VegetableOil","Salt","NaturalFlavors","Spices","CheesePowder","OnionPowder","GarlicPowder"]
        },
        packagingDetails:{
            packagingMaterial:["PlasticBags","CardboardBoxes"],
            packageSize:["Gram100","Gram200","Gram500"]
        },
        totalPackets: 0,
        totalWeight: 0, // kg * 1000
        productionDate: "0",
        shelfLife:0
}





const chipsPacketRelatedAllDetails = {
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


module.exports = {EntityType,PackageSize,batchQualityHelp,chipsManufacturingDetailsHelp,chipsPacketRelatedAllDetails}