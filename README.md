# SupplyLedger

SupplyLedger is a Secure, Transparent, and Reliable Supply Chain Management System for tracking the journey of potato chips from harvest to the end consumer. It leverages blockchain technology and real-time logistics tracking to provide users with detailed information about the chips' origins, processing, and distribution.

## Features

- **Transparent Tracking**: Customers can track the entire supply chain journey of their chips packet, from the farm to the retail store.
- **Immutable Records**: All supply chain data is stored on the blockchain, ensuring transparency and tamper-proof records.
- **Real-time Logistics**: Integrated with Chainlink to provide real-time tracking of shipment status using external APIs.
- **Webd Interface**: A web-based interface that allows users to easily access and view supply chain details.
- **Double Spending Prevention**: Implemented required conditions to prevent double spending and ensure the integrity of transactions.
- **Maximum Capacity Control**: Added maximum capacity limits for all entities involved in the supply chain to prevent them from storing more than their capacity allows.

## Technologies Used

- Solidity: Smart contract development language for Ethereum blockchain.
- Hardhat: Ethereum development environment for compiling, testing, and deploying smart contracts.
- ReactJS: JavaScript library for building user interfaces.
- Tailwind CSS: Utility-first CSS framework for styling the frontend.
- Chainlink: Decentralized oracle network for accessing real-world data.

## Installation and Testing

### - Running Smart Contracts Simulation
To run the SupplyLedger project locally, follow these steps:

- Clone the repository: `git clone https://github.com/abhithory/supplyLedger.git`
- Go to smart contract directory: `cd '.\supplyLedger\smart contract\`
- Install dependencies: `cd '.\supplyLedger\smart contract\`
- make env file and store privatekeys of your wallect: `PRIVATE_KEY1= 
PRIVATE_KEY2= 
PRIVATE_KEY3= 
PRIVATE_KEY4= 
PRIVATE_KEY5= 
PRIVATE_KEY6= 
`
#### For Testing locally
- use ganache for local blockchain. and `put its accounts private key in hardhat config files`
- go to logistics smart contract and change the "updateShipmentStatus" function: `update this this`


   function updateShipmentStatus(
        uint256 _shipmentId,
        uint256 _status
    ) public onlyRegistrar {
        require(_shipmentId <= shipmentId, "Invalid shipment ID");

        if (_status == 1) {
            shipmentOf[_shipmentId].timeAtDispatched = block.timestamp;
            shipmentOf[_shipmentId].status = ShipmentStatus.InTransit;
            CommonEntity _entity = CommonEntity(
                shipmentOf[_shipmentId].destination
            );
            _entity.receivedFromLogistic(
                shipmentOf[_shipmentId].batchId,
                _shipmentId
            );
        } else if (_status == 2) {
            // ===================== for api testing with chainlink. comment this while local testing
            // requestUpdateStaus(_shipmentId);

            // ===================== for local testing. comment this while while testing on api calls with chainlink

            shipmentOf[_shipmentId].status = ShipmentStatus(2);
            shipmentOf[_shipmentId].timeAtArrived = block.timestamp;
        } else {
            require(false, "status is wrong");
        }
    }


- then for testing all smartcontracts: `npx hardhat test`
- now for running simulation first run deploy contract script: `npx hardhat run .\scripts\DeployContracts.js --network ganache`
- also you can run on diffrent networks: `npx hardhat run .\scripts\DeployContracts.js --network ganache`
- after that copy the address of contracts and paste them in `scripts/contractModules.js --network ganache`

![Codeimage](media/contractdeployed.png)
-
![Codeimage](media/contractmoduleaddress.png)

- Now after pasting contract address run simulate script: `npx hardhat run .\scripts\Simulation.js --network ganache`

- after runnning scipt you will see the entire supply chain steps and finally you will get a `chipspacketid`
- now you can use that `chipspacketid` to track all details of that chips packet
- you can use `TrackDetailsOfChipsPacket.js` scipt or frontend for tracking





This project is licensed under the [MIT License](link-to-license-file).
