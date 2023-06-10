const potatobatchQuality = {
    "size": 0,
    "shape": 1,
    "color": 1,
    "externalQuality": 1,
    "internalQuality": 1,
    "weight": 0,
}

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



const capacities = {
    farm: 500, // potato
    lc:1500, // potato
    factory:3000, // potato
    retailStore:250 //chips
}

// all in kg except chipsPacket
const weight = {
    harvestAtFarm1:98,
    harvestAtFarm2:98,
    harvestAtFarm3:98,
    harvestAtFarm4:98,
    atDispatchFarm1:97,
    atDispatchFarm2:97,
    atDispatchFarm3:97,
    atDispatchFarm4:97,
    reachLc1:490,
    reachLc2:490,
    dispactchLc2:1460,
    dispactchLc2:1460,
    reachFactory:1450,
    dispactchChipsFactory:500, 
    reachChipsRs1:250,
    reachChipsRs2:250,
    soldChipsPacketType1:100, //(grams)   
    soldChipsPacketType2:200 //(grams)   
}

// out of 100
const oqs = {
    harvestAtFarm1:98,
    harvestAtFarm2:98,
    harvestAtFarm3:98,
    harvestAtFarm4:98,
    atDispatchFarm1:97,
    atDispatchFarm2:97,
    atDispatchFarm3:97,
    atDispatchFarm4:97,
    reachLc1:95,
    reachLc2:95,
    dispactchLc2:94,
    dispactchLc2:94,
    reachFactory:92,
    // dispactchChipsFactory:97, // chips overall quality 
    // reachChipsRs1:95,
    // reachChipsRs2:95,
    // soldChipsPacketType1:94, //(grams)   
    // soldChipsPacketType2:94 //(grams)   
}


module.exports = {potatobatchQuality,chipsBatchDetails, weight, oqs}