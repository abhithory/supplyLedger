class SupplyLedgerContract {
    constructor(_registrar) {
        this.registrarAddr = _registrar;
        this.contract = null;
        this.contract_address = null;
    }
    async deploySupplyLedger() {
        const supplyLedger = await ethers.getContractFactory("SupplyLedger");
        this.contract = await supplyLedger.deploy(this.registrarAddr);
        this.contract_address = (this.contract).address
        return (this.contract).address;
    }

    async connectContract(_Addr) {
        const supplyLedger = await ethers.getContractFactory("SupplyLedger");
        this.contract = supplyLedger.attach(_Addr);
        this.contract_address = _Addr
        return true
    }

    async deployFarm(_Addr) {
        const tx = await this.contract.registerFarm(_Addr);
        await tx.wait()
        return await this.contract.farmStatus(_Addr);
    }

    async deployLC(_Addr) {
        await this.contract.registerLC(_Addr);
        const tx = await this.contract.registerFarm(_Addr);
        await tx.wait()
        return await this.contract.lCStatus(_Addr);
    }

    async deployFactory(_Addr) {
        const tx = await this.contract.registerFactory(_Addr);
        await tx.wait()
        return await this.contract.factoryStatus(_Addr);
    }

    async deployRs(_Addr) {
        const tx = await this.contract.registerRS(_Addr);
        await tx.wait()
        return await this.contract.rSStatus(_Addr);
    }

    async deployLogistics(_Addr) {
        const tx = await this.contract.registerLogistics(_Addr);
        await tx.wait()
        return await this.contract.logisticStatus(_Addr);
    }

    async getPotatoBatchRelationId() {
        return Number(await this.contract.potatoBatchRelationId());
    }

    async getChipsPacketBatchRelationId() {
        return Number(await this.contract.chipsPacketBatchRelationId());
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

module.exports = { SupplyLedgerContract, FarmContract, LocalCollectorContract, FactoryContract, LogisticsContract }