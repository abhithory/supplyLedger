const addressObj = {
    supplyLedgerRegistrar: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    supplyLedger: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    farm: '0xCafac3dD18aC6c6e92c921884f9E4176737C052c',
    lc: '0x9f1ac54BEF0DD2f6f3462EA0fa94fC62300d3a8e',
    factory: '0x93b6BDa6a0813D808d75aA42e900664Ceb868bcF',
    rs: '0xA22D78bc37cE77FeE1c44F0C2C0d2524318570c3',
    logistics: '0xbf9fBFf01664500A33080Da5d437028b07DFcC55'
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

    async registerEntity(entityType,_Addr,maxCapacity,maxChipsCapacity) {
        const tx = await this.contract.registerEntity(entityType,_Addr,maxCapacity,maxChipsCapacity);
        await tx.wait()
        return await this.contract.entityDetails(entityType,_Addr);
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

    async getPotatoBatchRelationId() {
        return Number(await this.contract.potatoBatchRelationId());
    }

    async getChipsPacketBatchRelationId() {
        return Number(await this.contract.chipsPacketBatchRelationId());
    }

    async getChipsPacketId() {
        return Number(await this.contract.chipsPacketId());
    }

    async updateSupplyLedgerRegistar(adminSigner, _supplyLedgerRegistrarAddr) {
        const tx = await this.contract.connect(adminSigner).updateSupplyLedgerRegistar(_supplyLedgerRegistrarAddr);
        await tx.wait();
        return true;
    }

    async addPotatoBatchAtFarm(farmSigner, potatobatchQuality, oqsFarm, weightFarm) {
        const tx = await this.contract.connect(farmSigner).addPotatoBatchAtFarm(potatobatchQuality, oqsFarm, weightFarm);
        await tx.wait();
        return true;
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

    async chipsPreparedAtFactory(factorySigner, potatoBatchRelationId, chipsBatchDetails) {
        const tx = await this.contract.connect(factorySigner).chipsPreparedAtFactory(potatoBatchRelationId, chipsBatchDetails);
        await tx.wait();

        return true;
    }

    async chipsPacketBatchDispatchedToRS(factorySigner, chipsPacketBatchRelationId, rsAddr, weightDispatchFactory, logisticsAddr) {
        const tx = await this.contract.connect(factorySigner).chipsPacketBatchDispatchedToRS(chipsPacketBatchRelationId, rsAddr, weightDispatchFactory, logisticsAddr);
        await tx.wait();
        return true;
    }

    async chipsPacketStoredAtRs(rsSigner, chipsPacketBatchRelationId, weightReachRs) {
        const tx = await this.contract.connect(rsSigner).chipsPacketStoredAtRs(chipsPacketBatchRelationId, weightReachRs);
        await tx.wait();
        return true;
    }

    async chipsPacketSold(rsSigner, chipsPacketBatchRelationId, soldPacketWeight) {
        const tx = await this.contract.connect(rsSigner).chipsPacketSold(chipsPacketBatchRelationId, soldPacketWeight);
        await tx.wait();
        return true;
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

    async DispatchedBatchDetails(_potatoBatchRelationId) {
        return await this.contract.DispatchedBatchDetails(_potatoBatchRelationId);
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

module.exports = { addressObj,SupplyLedgerRegistrarContract, SupplyLedgerContract, FarmContract, LocalCollectorContract, FactoryContract, LogisticsContract }