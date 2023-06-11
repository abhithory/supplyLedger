const addressObj = {
    supplyLedgerRegistrar: '0x425A28702225040ABb58C631459b8d9ef33c6a98',
    supplyLedger: '0x196e48BeB3743af6Baf3886c3D8B7979c0d27a5E',
    farm: '0x5c450d7772dF69ED2b791bEdEc6601e5192809f6',
    lc: '0x2B3320Db27c20339f46b4ecD55d09Af804674799',
    factory: '0xb646Da6f53421De0e3bb48A38cE3Ed6482BC18F5',
    rs: '0x3eA100F703aC8A157096D5577496d59f5a894950',
    logistics: '0xb1D0E909a8d54532909f2D265a2C9541C6774eB7'
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

    async chipsPacketBatchIdOf(chipsPacketId) {
        return Number(await this.contract.potatoBatchRelationId(chipsPacketId));
    }

    async chipsPacketBatchRelationsOf(potatosRelativeId) {
        return Number(await this.contract.chipsPacketBatchRelationId(potatosRelativeId));
    }

    async getChipsPacketId(potatoBatchRelationId) {
        return Number(await this.contract.potatBatchRelationOf(potatoBatchRelationId));
    }

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


class RetailStoreContract {
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

module.exports = { addressObj, SupplyLedgerRegistrarContract, SupplyLedgerContract, FarmContract, LocalCollectorContract, FactoryContract,RetailStoreContract, LogisticsContract }