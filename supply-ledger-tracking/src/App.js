import { useEffect, useState } from 'react';
import logo from './logo.png';
import ChipsPacketDetails from './components/ChipsPacketDetails';

import SupplyLedgerRegistararJson from './abis/SupplyLedgerRegistrar.json';
import SupplyLedgerJson from './abis/SupplyLedger.json';
import RetailStoreJson from './abis/RetailStore.json';
import LocalCollectorJson from './abis/LocalCollector.json';
import FarmJson from './abis/Farm.json';
import FactoryJson from './abis/Factory.json';

import { ethers } from 'ethers';



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


function App() {

  const [chipsPacketId, setChipsPacketId] = useState(null);
  const [chipsPacketEntireDetails, setChipsPacketEntireDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [processCount, setProcessCount] = useState(0);

  const addressObj = {
    supplyLedgerRegistrar: '0x77aa3baA9A1f9b788e104242f270AF402015E4F3',
    supplyLedger: '0xe9b8B66e198D0aD1F7E6884565a72CbE12F48907',
    farm: '0xc7d81c10f733c64E2cd8Dda00A425D340BAee7CC',
    lc: '0xD1299a71862d0f0961C8d503Df76DD5BFCf97Cb9',
    factory: '0xe058D39a398fB1f09c74970C8E0DE3647fbCFF1b',
    rs: '0xA0012F86170CaE227E5Da3f6a43920BE6FC5B3dc',
    logistics: '0x3b7556A6963167dDFFa83c38842e4D257d52b490'
  }

  const EntityType = {
    Farm: 0,
    LC: 1,
    Factory: 2,
    RS: 3,
    Logistics: 4,
}

function formatDate(sec){
  return (new Date(Number(sec * 1000))).toLocaleString('en-US', {
      // dateStyle: 'full',
      // timeStyle: 'full',
      hour12: true,
  })
}

  async function loadChipsPacketDetails() {
    if (chipsPacketId < 1) return
    setLoadingDetails(true);
    const provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.maticvigil.com");

    const supplyLedgerRegistrarContract = new ethers.Contract(addressObj.supplyLedgerRegistrar, SupplyLedgerRegistararJson.abi, provider);

    const supplyLedgerContract = new ethers.Contract(addressObj.supplyLedger, SupplyLedgerJson.abi, provider);
    setProcessCount(10)
    
    const chipsBatchRelationId = Number(await supplyLedgerContract.chipsPacketBatchIdOf(chipsPacketId));
    const chipsPacketBatchRelationDetails = await supplyLedgerContract.chipsPacketBatchRelationsOf(chipsBatchRelationId);
    const potatoBatchRelationId = Number(chipsPacketBatchRelationDetails.potatosRelativeId);
    const potatoBatchRelationDetails = await supplyLedgerContract.potatBatchRelationOf(potatoBatchRelationId);
    setProcessCount(25)


    const _farmStatus = await supplyLedgerRegistrarContract.entityDetails(EntityType.Farm, potatoBatchRelationDetails.farm);
    const _farmContract = new ethers.Contract(_farmStatus.contractAddr, FarmJson.abi, provider);

    const _lcStatus = await supplyLedgerRegistrarContract.entityDetails(EntityType.LC, potatoBatchRelationDetails.localCollector)
    const _localCollectorContract = new ethers.Contract(_lcStatus.contractAddr, LocalCollectorJson.abi, provider);

    const _factoryStatus = await supplyLedgerRegistrarContract.entityDetails(EntityType.Factory, potatoBatchRelationDetails.factory);
    const _factoryContract = new ethers.Contract(_factoryStatus.contractAddr, FactoryJson.abi, provider);

    const _rsStatus = await supplyLedgerRegistrarContract.entityDetails(EntityType.RS, chipsPacketBatchRelationDetails.retailStore);
    const _RetailStoreContract = new ethers.Contract(_rsStatus.contractAddr, RetailStoreJson.abi, provider);

    setProcessCount(35)

    
    const chipsPacketSoldDetails = await _RetailStoreContract.soldChipsPacket(chipsPacketId);
    const chipsBatchArrivedAtRsDetails = await _RetailStoreContract.ArrivedChipsPacketBatchDetails(chipsBatchRelationId);

    const chipsManufacturingDetails = await _factoryContract.chipsPacketBatchOf(chipsBatchRelationId);
    const chipsBatchDispatchedFromFactoryDetails = await _factoryContract.DispatchedChipsPacketBatchDetails(chipsBatchRelationId);
    const potatoBatchArrivedAtFactoryDetails = await _factoryContract.ArrivedBatchDetails(potatoBatchRelationId);

    setProcessCount(65)


    const arrivedBatchAtLcDetails = await _localCollectorContract.ArrivedBatchDetails(potatoBatchRelationId);
    const dispatchedBatchAtLcDetails = await _localCollectorContract.DispatchedBatchDetails(potatoBatchRelationId);

    const potatoDetailsAtFarm = await _farmContract.farmPotatoBatchDetailOf(potatoBatchRelationId);

    setProcessCount(85)

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

    setProcessCount(90)


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


        chipsPacketRelatedAllDetails.factoryPicking = { oqs: Number(potatoBatchArrivedAtFactoryDetails.oqs), weight: Number(potatoBatchArrivedAtFactoryDetails.weight), timestamp: formatDate(Number(potatoBatchArrivedAtFactoryDetails.time)) };
        chipsPacketRelatedAllDetails.factoryDispatch = { oqs: Number(chipsBatchDispatchedFromFactoryDetails.oqs), weight: Number(chipsBatchDispatchedFromFactoryDetails.weight), timestamp: formatDate(Number(chipsBatchDispatchedFromFactoryDetails.time)) };


        chipsPacketRelatedAllDetails.rsPicking = { oqs: Number(chipsBatchArrivedAtRsDetails.oqs), weight: Number(chipsBatchArrivedAtRsDetails.weight), timestamp: formatDate(Number(chipsBatchArrivedAtRsDetails.time)) };
        chipsPacketRelatedAllDetails.itemSold = { size: batchQualityHelp.size[Number(chipsPacketSoldDetails.size)], timestamp: formatDate(Number(chipsPacketSoldDetails.time)) };

        console.log(chipsPacketRelatedAllDetails);


        setLoadingDetails(false);

    setChipsPacketEntireDetails(chipsPacketRelatedAllDetails);
  }

  return (
    <div className="bg-primary  text-secounday bg-full">
      <header className="">
        <div className="flex items-center justify-around">
          <img src={logo} alt="SupplyLedger Logo" className="h-30" />
          <div>
            <h1 className="font-bold text-3xl ">SupplyLedger</h1>
            <p className="text-sm text-white">Secure, Transparent, and Reliable</p>
          </div>
        </div>
      </header>

      {chipsPacketEntireDetails ?
        <div className='text-center'>
          <button
            className="px-4 py-2 rounded bg-primary text-white font-bold hover:bg-yellow-600 focus:outline-none border border-solid border-yellow-600"
            onClick={() => setChipsPacketEntireDetails(null)}
          >
            Search for new ChipsPacket
          </button>
          <h2 className="text-3xl font-bold text-white mt-4 text-center mb-8">
            Explore the <span className="text-secounday">Supply Chain Journey</span> of Your Chips Packet
          </h2>

          <ChipsPacketDetails chipsPacketEntireDetails={chipsPacketEntireDetails} />

        </div>
        :
        <div>
          <h2 className="text-3xl font-bold text-white mt-4 text-center">
            Explore the <span className="text-secounday">Supply Chain Journey</span> of Your Chips Packet
          </h2>
          <div className="mt-8 w-3/4 mx-auto">
            <div className="flex">
              <input
                type="number"
                placeholder="Enter Chip Packet ID"
                onChange={(e) => setChipsPacketId(e.target.value)}
                className="text-blue-800 text-xl w-full p-4 mr-2 rounded-l-md focus:outline-none"
              />
              <button
                className="px-6 py-4 rounded-r-md bg-yellow-600 text-white font-bold hover:bg-yellow-500 focus:outline-none"
                onClick={loadChipsPacketDetails}
              >
                Search
              </button>
            </div>
            <p className="text-white text-center">Enter the unique Chip Packet ID to retrieve detailed supply chain information</p>
          </div>

          <div className="min-h-[50vh] mt-2">
            <div className="flex min-h-[50vh] justify-center items-center">
              {loadingDetails ?
                <div className='text-center'>
                  <div role="status">
                    <svg aria-hidden="true" class="inline w-24 h-24 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-secounday" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                    </svg>
                    <span class="sr-only">Loading...</span>
                  </div>
                  <h1 className='text-white text-center text-2xl mt-8'>
                    <span className='text-secounday'>{processCount}%</span> processed. please wait...</h1>

                </div>
                :
                <p className="text-white text-center max-w-6xl">Welcome to SupplyLedger, the ultimate supply chain management system. With our secure, transparent, and reliable platform, you can trace the journey of your chip packets from farm to retail store. Gain valuable insights into the origin, quality, and handling of each chip packet, ensuring trust and accountability in your supply chain.</p>
              }
            </div>
          </div>
        </div>

      }

    </div>
  );
}

export default App;
