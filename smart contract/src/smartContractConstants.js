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


module.exports = {EntityType,PackageSize,batchQualityHelp,chipsManufacturingDetailsHelp}