
const { SupplyLedgerContract, FarmContract, LocalCollectorContract, FactoryContract, LogisticsContract } = require('./contractModules.js');



let supplyLedgerContract, farmContract, lcContract, factoryContract, rsContract, logisticsContract;


async function deployContracts() {
    const [registrar, farm, localCollector, factory, retailStore, logistics] = await ethers.getSigners();

    supplyLedgerContract = new SupplyLedgerContract(registrar.address);
    const _supplyLedger = await supplyLedgerContract.deploySupplyLedger();
    console.log("SupplyLedger Contract Deployed");

    const _farm = await supplyLedgerContract.deployFarm(farm.address);
    const _lc = await supplyLedgerContract.deployLC(localCollector.address);
    const _logistics = await supplyLedgerContract.deployLogistics(logistics.address);
    const _factory = await supplyLedgerContract.deployFactory(factory.address);
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

deployContracts();