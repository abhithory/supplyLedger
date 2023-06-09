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
    }

    async deployFarm(_Addr) {
        await this.contract.registerFarm("FARM001", _Addr);
        return await this.contract.farmStatus(_Addr);
    }

    async deployLC(_Addr) {
        await this.contract.registerLC("LocalCollector001", _Addr);
        return await this.contract.lCStatus(_Addr);
    }

    async deployFactory(_Addr) {
        await this.contract.registerFactory("Factory001", _Addr);
        return await this.contract.factoryStatus(_Addr);
    }

    async deployRs(_Addr) {
        await this.contract.registerRS("Retail001", _Addr);
        return await this.contract.rSStatus(_Addr);
    }

    async deployLogistics(_Addr) {
        await this.contract.registerLogistics("Logistics001", _Addr);
        return await this.contract.logisticStatus(_Addr);
    }

    async getPotatoBatchRelationId() {
        return Number(await this.contract.potatoBatchRelationId());
    }

    async getChipsPacketBatchRelationId() {
        return Number(await this.contract.chipsPacketBatchRelationId());
    }

    async addPotatoBatchAtFarm(farmSigner, potatobatchQuality, oqsFarm, weightFarm) {
        await this.contract.connect(farmSigner).addPotatoBatchAtFarm(potatobatchQuality, oqsFarm, weightFarm);
        return true;
    }

    async dispatchPotatoBatchToLC(farmSigner, _potatoBatchRelationId, lcAddr, oqsDispatchFarm, weightDispatchFarm, logisticsAddr) {
        await this.contract.connect(farmSigner).dispatchPotatoBatchToLC(_potatoBatchRelationId, lcAddr, oqsDispatchFarm, weightDispatchFarm, logisticsAddr);
        return true;
    }

    async updateShipmentStatusInLogistics(logisticsId, logisticsSigner, status) {
        await this.contract.connect(logisticsSigner).updateShipmentStatusInLogistics(logisticsId, status);
    }


    async potatoBatchStoredAtLC(lcSigner, potatoBatchRelationId, oqsReachLC, weightReachLC) {
        await this.contract.connect(lcSigner).potatoBatchStoredAtLC(potatoBatchRelationId, oqsReachLC, weightReachLC);
        return true;
    }


    async dispatchPotatoBatchToFactory(lcSigner, _potatoBatchRelationId, factoryAddr, oqsDispatchLC, weightDispatchLC, logisticsAddr) {
        await this.contract.connect(lcSigner).dispatchPotatoBatchToFactory(_potatoBatchRelationId, factoryAddr, oqsDispatchLC, weightDispatchLC, logisticsAddr);
        return true;
    }


    async potatoBatchStoredAtFactory(factorySigner, potatoBatchRelationId, oqsReachFactory, weightReachFactory) {
        await this.contract.connect(factorySigner).potatoBatchStoredAtFactory(potatoBatchRelationId, oqsReachFactory, weightReachFactory);
        return true;
    }

    async chipsPreparedAtFactory(factorySigner, potatoBatchRelationId, chipsBatchDetails) {
        await this.contract.connect(factorySigner).chipsPreparedAtFactory(potatoBatchRelationId, chipsBatchDetails);
        return true;
    }

    async chipsPacketBatchDispatchedToRS(factorySigner, chipsPacketBatchRelationId, rsAddr, weightDispatchFactory, logisticsAddr) {
        await this.contract.connect(factorySigner).chipsPacketBatchDispatchedToRS(chipsPacketBatchRelationId, rsAddr, weightDispatchFactory, logisticsAddr);
        return true;
    }

    async chipsPacketStoredAtRs(rsSigner, chipsPacketBatchRelationId, weightReachRs) {
        await this.contract.connect(rsSigner).chipsPacketStoredAtRs(chipsPacketBatchRelationId, weightReachRs);
        return true;
    }

    async chipsPacketSold(rsSigner, chipsPacketBatchRelationId, soldPacketWeight) {
        await this.contract.connect(rsSigner).chipsPacketSold(chipsPacketBatchRelationId, soldPacketWeight);
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

module.exports = { SupplyLedgerContract, FarmContract,LocalCollectorContract,FactoryContract }