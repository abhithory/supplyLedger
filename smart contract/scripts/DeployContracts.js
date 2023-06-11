
const { SupplyLedgerRegistrarContract, SupplyLedgerContract, FarmContract, LocalCollectorContract, FactoryContract, LogisticsContract } = require('./contractModules.js');


const { potatobatchQuality, chipsBatchDetails, maxCapacity, weight, oqs } = require('../src/constantData.js');
const { EntityType, PackageSize, batchQualityHelp, chipsManufacturingDetailsHelp } = require('../src/smartContractConstants.js');

let supplyLedgerRegistrarContract, supplyLedgerContract, farmContract, lcContract, factoryContract, rsContract, logisticsContract;


async function deployContracts() {
  const [admin, farm, localCollector, factory, retailStore, logistics] = await ethers.getSigners();
  supplyLedgerContract = new SupplyLedgerContract(admin.address);
  const _supplyLedger = await supplyLedgerContract.deploy();
  console.log("SupplyLedger Contract Deployed");


  supplyLedgerRegistrarContract = new SupplyLedgerRegistrarContract(admin.address);
  const _supplyLedgerRegistrar = await supplyLedgerRegistrarContract.deploy(_supplyLedger);
  console.log("SupplyLedgerRegistrarContract Contract Deployed");

  await supplyLedgerContract.updateSupplyLedgerRegistar(admin,_supplyLedgerRegistrar);
  console.log("SupplyLedgerRegistrarContract Connect to registrar");

  const _farm = await supplyLedgerRegistrarContract.registerEntity(EntityType.Farm, farm.address, maxCapacity.farm, 0);
  console.log("farm contract registered");
  const _lc = await supplyLedgerRegistrarContract.registerEntity(EntityType.LC, localCollector.address, maxCapacity.lc, 0);
  console.log("lc contract registered");
  const _logistics = await supplyLedgerRegistrarContract.registerEntity(EntityType.Logistics, logistics.address, maxCapacity.logistics, 0);
  console.log("logistics contract registered");
  await fundLinkToLogistics(_logistics.contractAddr,admin)
  const _factory = await supplyLedgerRegistrarContract.registerEntity(EntityType.Factory, factory.address, maxCapacity.factory, maxCapacity.factoryChips);
  console.log("factory contract registered");
  const _rs = await supplyLedgerRegistrarContract.registerEntity(EntityType.RS, retailStore.address, maxCapacity.rs, 0);
  console.log("rs contract registered");

  const addressObj = {
    "supplyLedgerRegistrar": _supplyLedgerRegistrar,
    "supplyLedger": _supplyLedger,
    "farm": _farm.contractAddr,
    "lc": _lc.contractAddr,
    "factory": _factory.contractAddr,
    "rs": _rs.contractAddr,
    "logistics": _logistics.contractAddr
  }

  console.log(addressObj);
}

async function fundLinkToLogistics(losgisticAddr, admin) {
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
  const contract = new ethers.Contract("0x326C977E6efc84E512bB9C30f76E30c160eD06FB", contractABI, admin);

  const amount = ethers.utils.parseUnits("1", "18");

  const tx = await contract.transfer(losgisticAddr, amount);
  await tx.wait();

  console.log("1 link Transfered to logistics!");
}

deployContracts();