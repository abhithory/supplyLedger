
const { SupplyLedgerContract, FarmContract, LocalCollectorContract, FactoryContract, LogisticsContract } = require('./contractModules.js');



let supplyLedgerContract, farmContract, lcContract, factoryContract, rsContract, logisticsContract;


async function deployContracts() {
    const [registrar, farm, localCollector, factory, retailStore, logistics] = await ethers.getSigners();

    supplyLedgerContract = new SupplyLedgerContract(registrar.address);
    const _supplyLedger = await supplyLedgerContract.deploySupplyLedger();
    console.log("SupplyLedger Contract Deployed");

    const _farm = await supplyLedgerContract.deployFarm(farm.address);
    console.log("farm contract deployed");
    const _lc = await supplyLedgerContract.deployLC(localCollector.address);
    console.log("lc contract deployed");
    const _logistics = await supplyLedgerContract.deployLogistics(logistics.address);
    console.log("logistics contract deployed");
    await fundLinkToLogistics(_logistics.contractAddr,registrar)
    const _factory = await supplyLedgerContract.deployFactory(factory.address);
    console.log("factory contract deployed");
    const _rs = await supplyLedgerContract.deployRs(retailStore.address);

    const addressObj = {
        "supplyLedger":_supplyLedger,
        "farm":_farm.contractAddr,
        "lc":_lc.contractAddr,
        "factory":_factory.contractAddr,
        "rs":_rs.contractAddr,
        "logistics":_logistics.contractAddr
    }

    console.log(addressObj);
}

async function fundLinkToLogistics(losgisticAddr,registrar) {    
      const contractABI = [
        {
          constant: false,
          inputs: [
            {
              name: "_to",
              type: "address",
            },
            {
              name: "_value",
              type: "uint256",
            },
          ],
          name: "transfer",
          outputs: [
            {
              name: "",
              type: "bool",
            },
          ],
          payable: false,
          stateMutability: "nonpayable",
          type: "function",
        },
      ];
      const contract = new ethers.Contract("0x326C977E6efc84E512bB9C30f76E30c160eD06FB", contractABI, registrar);
    
      const amount = ethers.utils.parseUnits("1", "18");
    
      const tx = await contract.transfer(losgisticAddr, amount);
      await tx.wait();
    
      console.log("1 link Transfered to logistics!");
  }

deployContracts();