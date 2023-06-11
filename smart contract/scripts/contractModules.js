const addressObj = {
    supplyLedgerRegistrar: '0x99AF47B26bAFd76FC613c409055F06060e02609b',
    supplyLedger: '0x27F2662297a463C9509b6AF771aF040eA5B081C6',
    farm: '0xd680104c168f1049bF649394Ec25A349375dD41E',
    lc: '0x50EF0B4dCBD2E5391DF3A5570bE2cD64559eE71a',
    factory: '0xd4b616d09565D18Fa044B28b5BdBeB5fBa3cd7F5',
    rs: '0x05D2e77334aeb0930B58897A3A8A01BD2B957883',
    logistics: '0xBF399aC01FC7a9FDA7b67650F8E4791A75e8bE15'
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

        console.log(oqsReachLC);
        console.log(weightReachLC);
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