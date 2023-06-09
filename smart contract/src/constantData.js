const potatobatchQuality = {
    "size": 0,
    "shape": 1,
    "color": 1,
    "externalQuality": 0,
    "internalQuality": 0,
    "weight": 0,
}



//  weight - kg * 1000
const maxCapacity = {
    farm: 5000000, // potato
    lc:150000000, // potato
    factory:30000000, // potato
    factoryChips:20000000, // chips
    rs:15000000, //chips
    logistics: 30000000,
}

// all in kg except chipsPacket
const weight = {
    harvestAtFarm1:1000000,
    harvestAtFarm2:1000000,
    harvestAtFarm3:1000000,
    harvestAtFarm4:1000000,
    atDispatchFarm1:980000,
    atDispatchFarm2:980000,
    atDispatchFarm3:980000,
    atDispatchFarm4:980000,
    reachLc1:970000,
    reachLc2:970000,
    dispactchLc1:950000,
    dispactchLc2:950000,
    reachFactory:940000,
    dispactchChipsFactory:700000, 
    reachChipsRs1:500000,
    reachChipsRs2:500000,
    soldChipsPacketType1:200, //(grams)   
    soldChipsPacketType2:100, //(grams)   
    soldChipsPacketType3:500 //(grams)   
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
    dispactchLc1:94,
    dispactchLc2:94,
    reachFactory:92,
    dispactchChipsFactory:97, // chips overall quality 
    reachChipsRs1:95,
    reachChipsRs2:95,
    soldChipsPacketType1:94, //(grams)   
    soldChipsPacketType2:94, //(grams)   
    soldChipsPacketType3:94 //(grams)   
}

const chipsBatchDetails = {
    potatoBatchId:0,
    chipsDetail: {
        flavor: 2,
        texture: 0
    },
    processDetails: {
        cookingTemperature: 90,
        ingredients: [0, 1, 2, 4]
    },
    packagingDetails: {
        packagingMaterial: 0,
        packageSize: 0
    },
    totalPackets: 2000,
    totalWeight: weight.dispactchChipsFactory,
    productionDate: 0,
    shelfLife: 6
}

module.exports = {potatobatchQuality,chipsBatchDetails, weight, oqs, maxCapacity}