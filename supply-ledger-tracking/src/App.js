import { useEffect, useState } from 'react';
import logo from './logo.png';
import ChipsPacketDetails from './components/ChipsPacketDetails';

const dummySupplyChainDetails = {
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


function App() {

  const [chipsPacketId, setChipsPacketId] = useState(null);
  const [chipsPacketEntireDetails, setChipsPacketEntireDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [processCount, setProcessCount] = useState(0);


  async function loadChipsPacketDetails() {
    if (chipsPacketId < 1) return
    setChipsPacketEntireDetails(dummySupplyChainDetails);
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
