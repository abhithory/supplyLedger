const addressObj = {
    supplyLedgerRegistrar: '0x30F98Dc1FBc276215A80379757eC307663E580Dc',
    supplyLedger: '0x1dCA6F33F989c6625bb3d9F2494Ff2b058F799Dc',
    farm: '0x851F357626d2D1A1bfE42DF6B45c6eeA9396F051',
    lc: '0xaDE0b9D288f042031Df7e9704ba2BE6df053AeA8',
    factory: '0x4f48b5d4B344f4AFe5422A434C7d9FE90B32eB9F',
    rs: '0xac386136a13b4A4c89a456299a5F98732A97bD84',
    logistics: '0x7Ed97F231E5bc65518107Fb4AFef048Faa7bc89B'
  }

class SupplyLedgerRegistrarContract {
    constructor(_admin) {
        this.admin = _admin;
        this.contract = null;
        this.contract_address = null;
    }
    async deploy(_supplyLedgerAddress) {
        const supplyLedgerRegistrar = await ethers.getContractFactory("SupplyLedgerRegistrar");
        this.contract = await supplyLedgerRegistrar.deploy(_supplyLedgerAddress);
        this.contract_address = (this.contract).address
        return (this.contract).address;
    }

    async connectContract(_Addr) {
        const supplyLedgerRegistrar = await ethers.getContractFactory("SupplyLedgerRegistrar");
        this.contract = supplyLedgerRegistrar.attach(_Addr);
        this.contract_address = _Addr
        return true
    }

    async registerEntity(entityType, _Addr, maxCapacity, maxChipsCapacity) {
        const tx = await this.contract.registerEntity(entityType, _Addr, maxCapacity, maxChipsCapacity);
        await tx.wait()
        return await this.contract.entityDetails(entityType, _Addr);
    }


}
class SupplyLedgerContract {
    constructor(_admin) {
        this.admin = _admin;
        this.contract = null;
        this.contract_address = null;
    }
    async deploy() {
        const supplyLedger = await ethers.getContractFactory("SupplyLedger");
        this.contract = await supplyLedger.deploy(this.admin);
        this.contract_address = (this.contract).address
        return (this.contract).address;
    }

    async connectContract(_Addr) {
        const supplyLedger = await ethers.getContractFactory("SupplyLedger");
        this.contract = supplyLedger.attach(_Addr);
        this.contract_address = _Addr
        return true
    }

    // async getPotatoBatchRelationId() {
    //     return Number(await this.contract.potatoBatchRelationId());
    // }

    // async getChipsPacketBatchRelationId() {
    //     return Number(await this.contract.chipsPacketBatchRelationId());
    // }

    // async getChipsPacketId() {
    //     return Number(await this.contract.chipsPacketId());
    // }

    async updateSupplyLedgerRegistar(adminSigner, _supplyLedgerRegistrarAddr) {
        const tx = await this.contract.connect(adminSigner).updateSupplyLedgerRegistar(_supplyLedgerRegistrarAddr);
        await tx.wait();
        return true;
    }

    async addPotatoBatchAtFarm(farmSigner, potatobatchQuality, oqsFarm, weightFarm) {
        const tx = await this.contract.connect(farmSigner).addPotatoBatchAtFarm(potatobatchQuality, oqsFarm, weightFarm);
        const txData = await tx.wait();
        // console.log(txData);
        return Number(txData.events[0].args.CreatedPotatoBatchId);

    }

    async dispatchPotatoBatchToLC(farmSigner, _potatoBatchRelationId, lcAddr, oqsDispatchFarm, weightDispatchFarm, logisticsAddr) {
        const tx = await this.contract.connect(farmSigner).dispatchPotatoBatchToLC(_potatoBatchRelationId, lcAddr, oqsDispatchFarm, weightDispatchFarm, logisticsAddr);
        await tx.wait();

        return true;
    }

    async updateShipmentStatusInLogistics(logisticsId, logisticsSigner, status) {
        const tx = await this.contract.connect(logisticsSigner).updateShipmentStatusInLogistics(logisticsId, status);
        await tx.wait();
        return true
    }


    async potatoBatchStoredAtLC(lcSigner, potatoBatchRelationId, oqsReachLC, weightReachLC) {
        const tx = await this.contract.connect(lcSigner).potatoBatchStoredAtLC(potatoBatchRelationId, oqsReachLC, weightReachLC);
        await tx.wait();
        return true;
    }


    async dispatchPotatoBatchToFactory(lcSigner, _potatoBatchRelationId, factoryAddr, oqsDispatchLC, weightDispatchLC, logisticsAddr) {
        const tx = await this.contract.connect(lcSigner).dispatchPotatoBatchToFactory(_potatoBatchRelationId, factoryAddr, oqsDispatchLC, weightDispatchLC, logisticsAddr);
        await tx.wait();

        return true;
    }


    async potatoBatchStoredAtFactory(factorySigner, potatoBatchRelationId, oqsReachFactory, weightReachFactory) {
        const tx = await this.contract.connect(factorySigner).potatoBatchStoredAtFactory(potatoBatchRelationId, oqsReachFactory, weightReachFactory);
        await tx.wait();

        return true;
    }

    async chipsPreparedAtFactory(factorySigner, chipsBatchDetails) {
        const tx = await this.contract.connect(factorySigner).chipsPreparedAtFactory(chipsBatchDetails);
        const txData = await tx.wait();

        return Number(txData.events[0].args.PreparedChipsPacketBatchId)

    }

    async chipsPacketBatchDispatchedToRS(factorySigner, chipsPacketBatchRelationId, rsAddr, oqs, weightDispatchFactory, logisticsAddr) {
        const tx = await this.contract.connect(factorySigner).chipsPacketBatchDispatchedToRS(chipsPacketBatchRelationId, rsAddr, oqs, weightDispatchFactory, logisticsAddr);
        await tx.wait();
        return true;
    }

    async chipsPacketStoredAtRs(rsSigner, chipsPacketBatchRelationId, oqs, weightReachRs) {
        const tx = await this.contract.connect(rsSigner).chipsPacketStoredAtRs(chipsPacketBatchRelationId, oqs, weightReachRs);
        await tx.wait();
        return true;
    }

    async chipsPacketSold(rsSigner, chipsPacketBatchRelationId, size) {
        const tx = await this.contract.connect(rsSigner).chipsPacketSold(chipsPacketBatchRelationId, size);
        const txData = await tx.wait();
        return Number(txData.events[0].args.SoldChipsPacketId);
    }

}

class FarmContract {
    constructor(_addr) {
        this.contract_address = _addr;
        this.contract = null;
    }

    async connectContract() {
        const farmContract = await ethers.getContractFactory("Farm");
        this.contract = farmContract.attach(this.contract_address);
    }

    async farmPotatoBatchDetailOf(_potatoBatchRelationId) {
        return await this.contract.farmPotatoBatchDetailOf(_potatoBatchRelationId);
    }
}

class LocalCollectorContract {
    constructor(_addr) {
        this.contract_address = _addr;
        this.contract = null;
    }

    async connectContract() {
        const LocalCollector = await ethers.getContractFactory("LocalCollector");
        this.contract = LocalCollector.attach(this.contract_address);
    }

    async DispatchedBatchDetails(_potatoBatchRelationId) {
        return await this.contract.DispatchedBatchDetails(_potatoBatchRelationId);
    }
}


class FactoryContract {
    constructor(_addr) {
        this.contract_address = _addr;
        this.contract = null;
    }

    async connectContract() {
        const Factory = await ethers.getContractFactory("Factory");
        this.contract = Factory.attach(this.contract_address);
    }

    async DispatchedChipsPacketBatchDetails(_potatoBatchRelationId) {
        return await this.contract.DispatchedChipsPacketBatchDetails(_potatoBatchRelationId);
    }
}

class LogisticsContract {
    constructor(_addr) {
        this.contract_address = _addr;
        this.contract = null;
    }

    async connectContract() {
        const Logistics = await ethers.getContractFactory("Logistics");
        this.contract = Logistics.attach(this.contract_address);
    }

    async shipmentOf(_shipmentId) {
        return await this.contract.shipmentOf(_shipmentId);
    }
}

module.exports = { addressObj, SupplyLedgerRegistrarContract, SupplyLedgerContract, FarmContract, LocalCollectorContract, FactoryContract, LogisticsContract }