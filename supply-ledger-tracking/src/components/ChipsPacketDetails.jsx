import React from 'react'
import potatoImg from './potato.jpg';
import chipsPacketImg from './chipsPacket.jpg';
import factoryImg from './factory.jpg';


const chipsPacketEntireDetails = {
    chipsPacketId: 12345,
    chipsBatchId: 6789,
    potatoBatchId: 101112,
    potatoBatchHarvestQuality: {
        size: "Large",
        shape: "Round",
        color: "Golden",
        externalQuality: "Good",
        internalQuality: "Fresh",
        weight: "200g"
    },
    chipsManufacturingDetails: {
        chipsDetail: {
            flavor: "Cheese",
            texture: "Crispy"
        },
        processDetails: {
            cookingTemperature: 180,
            ingredients: ["Potatoes", "Oil", "Cheese Powder", "Salt"]
        },
        packagingDetails: {
            packagingMaterial: "Plastic",
            packageSize: "100g"
        },
        totalPackets: 10000,
        totalWeight: 20000,
        productionDate: "2023-06-10",
        shelfLife: 365
    },
    harvestCollected: {
        oqs: 50,
        weight: 100,
        timestamp: "2023-06-01 10:00:00"
    },
    harvestDispatchedFromFarmToLC: {
        oqs: 50,
        weight: 100,
        timestamp: "2023-06-02 08:30:00"
    },
    lcPicking: {
        oqs: 50,
        weight: 100,
        timestamp: "2023-06-02 09:30:00"
    },
    lsDispatch: {
        oqs: 50,
        weight: 100,
        timestamp: "2023-06-03 10:30:00"
    },
    factoryPicking: {
        oqs: 50,
        weight: 100,
        timestamp: "2023-06-03 11:30:00"
    },
    factoryDispatch: {
        oqs: 50,
        weight: 100,
        timestamp: "2023-06-04 09:30:00"
    },
    rsPicking: {
        oqs: 50,
        weight: 100,
        timestamp: "2023-06-04 10:30:00"
    },
    itemSold: {
        size: "Large",
        timestamp: "2023-06-05 12:00:00"
    }
};


export default function ChipsPacketDetails() {
    return (
        <div className='w-full'>
            <div className="border border-yellow-600 mx-32 py-8 rounded flex text-center justify-center items-center">
                <div className="w-1/2">
                    <img src={chipsPacketImg}  alt="" srcset="" className="mx-auto" />
                </div>
                <div className="w-1/2">
                    <h3 className="text-white">Chips Packet Details</h3>
                    <h3>Chips Packet Id: {chipsPacketEntireDetails.chipsPacketId} </h3>
                    <h3>Chips Flavor: {chipsPacketEntireDetails.chipsManufacturingDetails.chipsDetail.flavor} </h3>
                    <h3>Chips Texture: {chipsPacketEntireDetails.chipsManufacturingDetails.chipsDetail.texture} </h3>

                    <h3>Production Date: {chipsPacketEntireDetails.chipsManufacturingDetails.productionDate} </h3>
                    <h3>Shelf Life: {chipsPacketEntireDetails.chipsManufacturingDetails.shelfLife} Mounts</h3>

                    <h3>Packageing Material Texture: {chipsPacketEntireDetails.chipsManufacturingDetails.packagingDetails.packagingMaterial} </h3>

                    <h3>Cooking Temperature: {chipsPacketEntireDetails.chipsManufacturingDetails.processDetails.cookingTemperature} *C</h3>

                    <h3>Ingredients : {chipsPacketEntireDetails.chipsManufacturingDetails.processDetails.ingredients.map((item) => {
                        return(
                            <span> {item} </span>
                        )
                    })} </h3>
                </div>
            </div>

            <div className="border border-yellow-600 mx-32 py-8 rounded flex text-center justify-center items-center mt-8">
                <div className="w-1/2">
                    <img src={potatoImg} alt="" srcset="" className="mx-auto" />
                </div>
                <div className="w-1/2">
                    <h3 className="text-white">Harvest Details</h3>
                    <h3>Chips Packet Id: {chipsPacketEntireDetails.potatoBatchId} </h3>
                    <h3>Harvest Potato Size: {chipsPacketEntireDetails.potatoBatchHarvestQuality.size} </h3>
                    <h3>Harvest Potato Shape: {chipsPacketEntireDetails.potatoBatchHarvestQuality.shape} </h3>
                    <h3>Harvest Potato Color: {chipsPacketEntireDetails.potatoBatchHarvestQuality.color} </h3>
                    <h3>Harvest Potato External Quality: {chipsPacketEntireDetails.potatoBatchHarvestQuality.externalQuality} </h3>
                    <h3>Harvest Potato Internal Quality: {chipsPacketEntireDetails.potatoBatchHarvestQuality.internalQuality} </h3>
                   
                </div>
            </div>

            <div className="border border-yellow-600 mx-32 py-8 rounded flex text-center justify-center items-center mt-8">
                <div className="w-1/2">
                    <img src={factoryImg} alt="" srcset="" className="mx-auto" />
                </div>
                <div className="w-1/2">
                    <h3 className="text-white">All Shipment Details</h3>
                    <h3>harvestCollected at: {chipsPacketEntireDetails.harvestCollected.timestamp} </h3>
                    <h3>harvestDispatched From Farm To Local collectory at: {chipsPacketEntireDetails.harvestDispatchedFromFarmToLC.timestamp} </h3>
                    <h3>harvestDispatched From Farm To Local collectory at: {chipsPacketEntireDetails.harvestDispatchedFromFarmToLC.timestamp} </h3>
                    <h3>Potato Batch stored in local collectory at: {chipsPacketEntireDetails.lcPicking.timestamp} </h3>
                    <h3>Potato Batch dispatched from local collectory: {chipsPacketEntireDetails.lsDispatch.timestamp} </h3>
                    <h3>Potao Batch Stored in Factory: {chipsPacketEntireDetails.factoryPicking.timestamp} </h3>
                    <h3>Chips prepared in Factory: {chipsPacketEntireDetails.chipsManufacturingDetails.productionDate} </h3>

                    <h3>Chips packet batch Stored in Retail store: {chipsPacketEntireDetails.rsPicking.timestamp} </h3>

                    <h3>Chips packet sold at : {chipsPacketEntireDetails.itemSold.timestamp} </h3>

                </div>
            </div>

        </div>
    )
}


