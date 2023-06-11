// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./SupplyLedgerRegistrar.sol";

contract SupplyLedger is
    FactoryInterface,
    FarmInterface
{
    struct PotatoBatchRelation {
        uint256 id;
        string name;
        address farm;
        address localCollector;
        address factory;
    }
    uint256 public potatoBatchRelationId = 1;
    mapping(uint256 => PotatoBatchRelation) public potatBatchRelationOf;

    struct ChipsPacketBatchRelations {
        uint256 id;
        uint256 potatosRelativeId;
        address retailStore;
    }
    uint256 public chipsPacketBatchRelationId = 1;
    mapping(uint256 => ChipsPacketBatchRelations)
        public chipsPacketBatchRelationsOf;

    uint256 public chipsPacketId;
    mapping(uint256 => uint256) public chipsPacketBatchRelationIdOf;

    SupplyLedgerRegistrar supplyLedgerRegistrar;

    constructor(SupplyLedgerRegistrar _supplyLedgerRegistrar) {
        supplyLedgerRegistrar = _supplyLedgerRegistrar;
    }

    modifier onlyRespectiveEntity(SupplyLedgerRegistrar.EntityType _et) {
        require(
            supplyLedgerRegistrar.getEntityDetails(_et, msg.sender).status,
            "Only the respective Entity can call"
        );
        _;
    }


    function addPotatoBatchAtFarm(
        BatchQuality memory _bq,
        uint256 _oqc,
        uint256 _weight
    ) public onlyRespectiveEntity(SupplyLedgerRegistrar.EntityType.Farm)  {
        potatBatchRelationOf[potatoBatchRelationId] = PotatoBatchRelation(
            potatoBatchRelationId,
            "Potato Batch 001",
            msg.sender,
            address(0),
            address(0)
        );

        Farm _farm = Farm(supplyLedgerRegistrar.getEntityDetails(SupplyLedgerRegistrar.EntityType.Farm, msg.sender).contractAddr);
        _farm.potatoBatchCollectedAtFarm(
            potatoBatchRelationId,
            _bq,
            _weight,
            _oqc
        );

        potatoBatchRelationId++;
    }

    // food item dispatched from farm to local colloctor
    function dispatchPotatoBatchToLC(
        uint256 _potatoBatchRelationId,
        address _localColloctor,
        uint256 _oqc,
        uint256 _weight,
        address _logisticsAddr
    ) public onlyRespectiveEntity(SupplyLedgerRegistrar.EntityType.Farm) {
        potatBatchRelationOf[_potatoBatchRelationId]
            .localCollector = _localColloctor;

        Logistics _logi = Logistics(
            supplyLedgerRegistrar.getEntityDetails(SupplyLedgerRegistrar.EntityType.Logistics,_logisticsAddr).contractAddr
        );

        // uint256 _shipmentId1 = _logi.shipmentId();
        uint256 _shipmentId = _logi.createShipment(
            _potatoBatchRelationId,
            supplyLedgerRegistrar.getEntityDetails(SupplyLedgerRegistrar.EntityType.Farm,msg.sender).contractAddr,
            supplyLedgerRegistrar.getEntityDetails(SupplyLedgerRegistrar.EntityType.LC,_localColloctor).contractAddr
        );
        Farm _farm = Farm(supplyLedgerRegistrar.getEntityDetails(SupplyLedgerRegistrar.EntityType.Farm,msg.sender).contractAddr);
        _farm.potatoBatchDispatchedFromFarm(
            _potatoBatchRelationId,
            _shipmentId,
            supplyLedgerRegistrar.getEntityDetails(SupplyLedgerRegistrar.EntityType.Logistics,_logisticsAddr).contractAddr,
            _oqc,
            _weight
        );
    }

    function updateShipmentStatusInLogistics(
        uint256 _shipmentId,
        uint256 _status
    )
        public
        // uint256 _weight
        onlyRespectiveEntity(SupplyLedgerRegistrar.EntityType.Logistics)
    {
        Logistics _logi = Logistics(supplyLedgerRegistrar.getEntityDetails(SupplyLedgerRegistrar.EntityType.Logistics,msg.sender).contractAddr);
        _logi.updateShipmentStatus(_shipmentId, _status);
        // _logi.requestUpdateStaus(_shipmentId);
    }

    // food item reached at local colloctor
    function potatoBatchStoredAtLC(
        uint256 _potatoBatchRelationId,
        uint256 _oqs,
        uint256 _weight
    ) public onlyRespectiveEntity(SupplyLedgerRegistrar.EntityType.LC) {
        LocalCollector _localCollector = LocalCollector(
            supplyLedgerRegistrar.getEntityDetails(SupplyLedgerRegistrar.EntityType.LC,msg.sender).contractAddr
        );
        _localCollector.potatoBatchStoredAtLC(
            _potatoBatchRelationId,
            _oqs,
            _weight
        );
    }

    // food item dispatched from local Collortor to factory
    function dispatchPotatoBatchToFactory(
        uint256 _potatoBatchRelationId,
        address _factory,
        uint256 _oqs,
        uint256 _weight,
        address _logisticsAddr
    ) public onlyRespectiveEntity(SupplyLedgerRegistrar.EntityType.LC) {
        potatBatchRelationOf[_potatoBatchRelationId].factory = _factory;

        LocalCollector _localCollector = LocalCollector(
            supplyLedgerRegistrar.getEntityDetails(SupplyLedgerRegistrar.EntityType.LC,msg.sender).contractAddr
        );

        Logistics _logi = Logistics(
            supplyLedgerRegistrar.getEntityDetails(SupplyLedgerRegistrar.EntityType.Logistics,_logisticsAddr).contractAddr
        );
        uint256 _shipmentId = _logi.createShipment(
            _potatoBatchRelationId,
            supplyLedgerRegistrar.getEntityDetails(SupplyLedgerRegistrar.EntityType.LC,msg.sender).contractAddr,
            supplyLedgerRegistrar.getEntityDetails(SupplyLedgerRegistrar.EntityType.Factory,_factory).contractAddr
        );
        _localCollector.dispatchPotatoBatchToFactory(
            _potatoBatchRelationId,
            _shipmentId,
            supplyLedgerRegistrar.getEntityDetails(SupplyLedgerRegistrar.EntityType.Logistics,_logisticsAddr).contractAddr,
            _oqs,
            _weight
        );
    }

    function potatoBatchStoredAtFactory(
        uint256 _potatoBatchRelationId,
        uint256 _oqs,
        uint256 _weight
    ) public onlyRespectiveEntity(SupplyLedgerRegistrar.EntityType.Factory) {
        // require(
        //     potatBatchRelationOf[_potatoBatchRelationId].factory == msg.sender,
        //     "Factory is not correct"
        // );

        Factory _Factory = Factory(supplyLedgerRegistrar.getEntityDetails(SupplyLedgerRegistrar.EntityType.Factory,msg.sender).contractAddr);
        _Factory.potatoBatchStoredAtFactory(
            _potatoBatchRelationId,
            _oqs,
            _weight
        );
    }

    function chipsPreparedAtFactory(
        uint256 _potatoBatchRelationId,
        ChipsPacketBatch memory _details
    ) public onlyRespectiveEntity(SupplyLedgerRegistrar.EntityType.Factory) {
        // require(
        //     potatBatchRelationOf[_potatoBatchRelationId].factory == msg.sender,
        //     "Factory is not correct"
        // );

        Factory _Factory = Factory(supplyLedgerRegistrar.getEntityDetails(SupplyLedgerRegistrar.EntityType.Factory,msg.sender).contractAddr);
        _Factory.chipsBatchPrepared(chipsPacketBatchRelationId, _details);

        chipsPacketBatchRelationsOf[chipsPacketBatchRelationId]
            .potatosRelativeId = _potatoBatchRelationId;
        chipsPacketBatchRelationId++;
    }

    function chipsPacketBatchDispatchedToRS(
        uint256 _chipsPacketBatchRelationId,
        address _rs,
        uint256 _ww,
        uint256 _oqc,
        address _logisticsAddr
    ) public onlyRespectiveEntity(SupplyLedgerRegistrar.EntityType.Factory) {
        // require(
        //     potatBatchRelationOf[_chipsPacketBatchRelationId].factory ==
        //         msg.sender,
        //     "Factory is not correct"
        // );

        chipsPacketBatchRelationsOf[_chipsPacketBatchRelationId]
            .retailStore = _rs;

        Logistics _logi = Logistics(
            supplyLedgerRegistrar.getEntityDetails(SupplyLedgerRegistrar.EntityType.Logistics,_logisticsAddr).contractAddr
        );
        uint256 _shipmentId = _logi.createShipment(
            _chipsPacketBatchRelationId,
            supplyLedgerRegistrar.getEntityDetails(SupplyLedgerRegistrar.EntityType.Factory,msg.sender).contractAddr,
            supplyLedgerRegistrar.getEntityDetails(SupplyLedgerRegistrar.EntityType.RS,_rs).contractAddr
        );

        Factory _Factory = Factory(supplyLedgerRegistrar.getEntityDetails(SupplyLedgerRegistrar.EntityType.Factory,msg.sender).contractAddr);

        _Factory.dispactchChipsPacketBatchToRS(
            _chipsPacketBatchRelationId,
            _shipmentId,
            supplyLedgerRegistrar.getEntityDetails(SupplyLedgerRegistrar.EntityType.Logistics,_logisticsAddr).contractAddr,
            _ww,
            _oqc
        );
    }

    // chips batch item reached at retail store
    function chipsPacketStoredAtRs(
        uint256 _batchDetailsId,
        uint256 _weight
    ) public onlyRespectiveEntity(SupplyLedgerRegistrar.EntityType.RS) {
        // require(
        //     chipsPacketBatchRelationsOf[_batchDetailsId].retailStore ==
        //         msg.sender,
        //     "Retail Store is not correct"
        // );

        RetailStore _retailStore = RetailStore(
            supplyLedgerRegistrar.getEntityDetails(SupplyLedgerRegistrar.EntityType.RS,msg.sender).contractAddr
        );

        _retailStore.chipsBatchStoredAtRS(_batchDetailsId, _weight);
    }

    function chipsPacketSold(
        uint256 _chipsPacketBatchRelationId,
        uint256 _packetWeight
    ) public onlyRespectiveEntity(SupplyLedgerRegistrar.EntityType.RS) {
        // require(
        //     chipsPacketBatchRelationsOf[_chipsPacketBatchRelationId]
        //         .retailStore == msg.sender,
        //     "Retail Store is not correct"
        // );

        RetailStore _retailStore = RetailStore(
            supplyLedgerRegistrar.getEntityDetails(SupplyLedgerRegistrar.EntityType.RS,msg.sender).contractAddr
        );

        chipsPacketBatchRelationIdOf[
            chipsPacketId
        ] = _chipsPacketBatchRelationId;
        _retailStore.chipsPacketSold(
            chipsPacketId,
            _chipsPacketBatchRelationId,
            _packetWeight
        );
        chipsPacketId++;
    }
}
