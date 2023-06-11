// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./SupplyLedgerRegistrar.sol";

contract SupplyLedger is FactoryInterface, FarmInterface {
    struct PotatoBatchRelation {
        address farm;
        address localCollector;
        address factory;
    }
    struct ChipsPacketBatchRelations {
        uint256 potatosRelativeId;
        address retailStore;
    }

    uint256 public potatoBatchId = 1;
    uint256 public chipsPacketBatchId = 1;
    uint256 public chipsPacketId = 1;

    mapping(uint256 => PotatoBatchRelation) public potatBatchRelationOf;
    mapping(uint256 => ChipsPacketBatchRelations)
        public chipsPacketBatchRelationsOf;
    mapping(uint256 => uint256) public chipsPacketBatchIdOf;
    SupplyLedgerRegistrar supplyLedgerRegistrar;

    event PotatoBatchAdded(
        address indexed FarmAddress,
        uint256 indexed CreatedPotatoBatchId
    );
    event ChipsPacketSold(
        address indexed RetailStore,
        uint256 indexed SoldChipsPacketId
    );

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

    modifier onlyValidPotatoBatchId(uint256 _id) {
        require(_id > 0 && _id < potatoBatchId, "Not a valid Potato Batch Id");
        _;
    }

    modifier onlyValidChipsPacketBatchId(uint256 _id) {
        require(
            _id > 0 && _id < chipsPacketBatchId,
            "Not a valid Potato Batch Id"
        );
        _;
    }


    function addPotatoBatchAtFarm(
        BatchQuality memory _bq,
        uint256 _oqc,
        uint256 _weight
    ) public onlyRespectiveEntity(SupplyLedgerRegistrar.EntityType.Farm) {
        uint256 _id = potatoBatchId;
        potatBatchRelationOf[_id].farm = msg.sender;
        Farm _farm = Farm(
            supplyLedgerRegistrar
                .getEntityDetails(
                    SupplyLedgerRegistrar.EntityType.Farm,
                    msg.sender
                )
                .contractAddr
        );
        _farm.potatoBatchCollectedAtFarm(_id, _bq, _weight, _oqc);
        emit PotatoBatchAdded(msg.sender, _id);
        potatoBatchId++;
    }

    // food item dispatched from farm to local colloctor
    function dispatchPotatoBatchToLC(
        uint256 _potatoBatchId,
        address _localColloctor,
        uint256 _oqc,
        uint256 _weight,
        address _logisticsAddr
    )
        public
        onlyRespectiveEntity(SupplyLedgerRegistrar.EntityType.Farm)
        onlyValidPotatoBatchId(_potatoBatchId)
    {
        require(msg.sender == potatBatchRelationOf[_potatoBatchId].farm, "Only the Original Farm can call");

        potatBatchRelationOf[_potatoBatchId].localCollector = _localColloctor;

        Logistics _logi = Logistics(
            supplyLedgerRegistrar
                .getEntityDetails(
                    SupplyLedgerRegistrar.EntityType.Logistics,
                    _logisticsAddr
                )
                .contractAddr
        );

        // uint256 _shipmentId1 = _logi.shipmentId();
        uint256 _shipmentId = _logi.createShipment(
            _potatoBatchId,
            supplyLedgerRegistrar
                .getEntityDetails(
                    SupplyLedgerRegistrar.EntityType.Farm,
                    msg.sender
                )
                .contractAddr,
            supplyLedgerRegistrar
                .getEntityDetails(
                    SupplyLedgerRegistrar.EntityType.LC,
                    _localColloctor
                )
                .contractAddr
        );
        Farm _farm = Farm(
            supplyLedgerRegistrar
                .getEntityDetails(
                    SupplyLedgerRegistrar.EntityType.Farm,
                    msg.sender
                )
                .contractAddr
        );
        _farm.potatoBatchDispatchedFromFarm(
            _potatoBatchId,
            _shipmentId,
            supplyLedgerRegistrar
                .getEntityDetails(
                    SupplyLedgerRegistrar.EntityType.Logistics,
                    _logisticsAddr
                )
                .contractAddr,
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
        Logistics _logi = Logistics(
            supplyLedgerRegistrar
                .getEntityDetails(
                    SupplyLedgerRegistrar.EntityType.Logistics,
                    msg.sender
                )
                .contractAddr
        );
        _logi.updateShipmentStatus(_shipmentId, _status);
    }

    // food item reached at local colloctor
    function potatoBatchStoredAtLC(
        uint256 _potatoBatchId,
        uint256 _oqs,
        uint256 _weight
    )
        public
        onlyRespectiveEntity(SupplyLedgerRegistrar.EntityType.LC)
        onlyValidPotatoBatchId(_potatoBatchId)
    {
        require(msg.sender == potatBatchRelationOf[_potatoBatchId].localCollector, "Only the Original Local Collector can call");

        LocalCollector _localCollector = LocalCollector(
            supplyLedgerRegistrar
                .getEntityDetails(
                    SupplyLedgerRegistrar.EntityType.LC,
                    msg.sender
                )
                .contractAddr
        );
        _localCollector.potatoBatchStoredAtLC(_potatoBatchId, _oqs, _weight);
    }

    // food item dispatched from local Collortor to factory
    function dispatchPotatoBatchToFactory(
        uint256 _potatoBatchId,
        address _factory,
        uint256 _oqs,
        uint256 _weight,
        address _logisticsAddr
    )
        public
        onlyRespectiveEntity(SupplyLedgerRegistrar.EntityType.LC)
        onlyValidPotatoBatchId(_potatoBatchId)
    {
        require(msg.sender == potatBatchRelationOf[_potatoBatchId].localCollector, "Only the Original Local Collector can call");

        potatBatchRelationOf[_potatoBatchId].factory = _factory;

        LocalCollector _localCollector = LocalCollector(
            supplyLedgerRegistrar
                .getEntityDetails(
                    SupplyLedgerRegistrar.EntityType.LC,
                    msg.sender
                )
                .contractAddr
        );

        Logistics _logi = Logistics(
            supplyLedgerRegistrar
                .getEntityDetails(
                    SupplyLedgerRegistrar.EntityType.Logistics,
                    _logisticsAddr
                )
                .contractAddr
        );
        uint256 _shipmentId = _logi.createShipment(
            _potatoBatchId,
            supplyLedgerRegistrar
                .getEntityDetails(
                    SupplyLedgerRegistrar.EntityType.LC,
                    msg.sender
                )
                .contractAddr,
            supplyLedgerRegistrar
                .getEntityDetails(
                    SupplyLedgerRegistrar.EntityType.Factory,
                    _factory
                )
                .contractAddr
        );
        _localCollector.dispatchPotatoBatchToFactory(
            _potatoBatchId,
            _shipmentId,
            supplyLedgerRegistrar
                .getEntityDetails(
                    SupplyLedgerRegistrar.EntityType.Logistics,
                    _logisticsAddr
                )
                .contractAddr,
            _oqs,
            _weight
        );
    }

    function potatoBatchStoredAtFactory(
        uint256 _potatoBatchId,
        uint256 _oqs,
        uint256 _weight
    )
        public
        onlyRespectiveEntity(SupplyLedgerRegistrar.EntityType.Factory)
        onlyValidPotatoBatchId(_potatoBatchId)
    {
        require(msg.sender == potatBatchRelationOf[_potatoBatchId].factory, "Only the Original Factory can call");
        Factory _Factory = Factory(
            supplyLedgerRegistrar
                .getEntityDetails(
                    SupplyLedgerRegistrar.EntityType.Factory,
                    msg.sender
                )
                .contractAddr
        );
        _Factory.potatoBatchStoredAtFactory(_potatoBatchId, _oqs, _weight);
    }

    function chipsPreparedAtFactory(
        uint256 _potatoBatchId,
        ChipsPacketBatch memory _details
    ) public onlyRespectiveEntity(SupplyLedgerRegistrar.EntityType.Factory) {
        require(msg.sender == potatBatchRelationOf[_potatoBatchId].factory, "Only the Original Factory can call");


        Factory _Factory = Factory(
            supplyLedgerRegistrar
                .getEntityDetails(
                    SupplyLedgerRegistrar.EntityType.Factory,
                    msg.sender
                )
                .contractAddr
        );
        _Factory.chipsBatchPrepared(chipsPacketBatchId, _details);

        chipsPacketBatchRelationsOf[chipsPacketBatchId]
            .potatosRelativeId = _potatoBatchId;
        chipsPacketBatchId++;
    }

    function chipsPacketBatchDispatchedToRS(
        uint256 _chipsPacketBatchId,
        address _rs,
        uint256 _ww,
        uint256 _oqc,
        address _logisticsAddr
    )
        public
        onlyRespectiveEntity(SupplyLedgerRegistrar.EntityType.Factory)
        onlyValidChipsPacketBatchId(_chipsPacketBatchId)
    {
        require(msg.sender == potatBatchRelationOf[chipsPacketBatchRelationsOf[_chipsPacketBatchId].potatosRelativeId].factory, "Only the Original Factory can call");

        chipsPacketBatchRelationsOf[_chipsPacketBatchId].retailStore = _rs;

        Logistics _logi = Logistics(
            supplyLedgerRegistrar
                .getEntityDetails(
                    SupplyLedgerRegistrar.EntityType.Logistics,
                    _logisticsAddr
                )
                .contractAddr
        );
        uint256 _shipmentId = _logi.createShipment(
            _chipsPacketBatchId,
            supplyLedgerRegistrar
                .getEntityDetails(
                    SupplyLedgerRegistrar.EntityType.Factory,
                    msg.sender
                )
                .contractAddr,
            supplyLedgerRegistrar
                .getEntityDetails(SupplyLedgerRegistrar.EntityType.RS, _rs)
                .contractAddr
        );

        Factory _Factory = Factory(
            supplyLedgerRegistrar
                .getEntityDetails(
                    SupplyLedgerRegistrar.EntityType.Factory,
                    msg.sender
                )
                .contractAddr
        );

        _Factory.dispactchChipsPacketBatchToRS(
            _chipsPacketBatchId,
            _shipmentId,
            supplyLedgerRegistrar
                .getEntityDetails(
                    SupplyLedgerRegistrar.EntityType.Logistics,
                    _logisticsAddr
                )
                .contractAddr,
            _ww,
            _oqc
        );
    }

    function chipsPacketStoredAtRs(
        uint256 _chipsPacketBatchId,
        uint256 _weight
    )
        public
        onlyRespectiveEntity(SupplyLedgerRegistrar.EntityType.RS)
        onlyValidChipsPacketBatchId(_chipsPacketBatchId)
    {
        require(msg.sender == chipsPacketBatchRelationsOf[_chipsPacketBatchId].retailStore, "Only the Original Retail Store can call");

        RetailStore _retailStore = RetailStore(
            supplyLedgerRegistrar
                .getEntityDetails(
                    SupplyLedgerRegistrar.EntityType.RS,
                    msg.sender
                )
                .contractAddr
        );

        _retailStore.chipsBatchStoredAtRS(_chipsPacketBatchId, _weight);
    }

    function chipsPacketSold(
        uint256 _chipsPacketBatchId,
        PackageSize _packetSize
    )
        public
        onlyRespectiveEntity(SupplyLedgerRegistrar.EntityType.RS)
        onlyValidChipsPacketBatchId(_chipsPacketBatchId)
    {
        require(msg.sender == chipsPacketBatchRelationsOf[_chipsPacketBatchId].retailStore, "Only the Original Retail Store can call");
        RetailStore _retailStore = RetailStore(
            supplyLedgerRegistrar
                .getEntityDetails(
                    SupplyLedgerRegistrar.EntityType.RS,
                    msg.sender
                )
                .contractAddr
        );
        uint256 _id = chipsPacketId;
        chipsPacketBatchIdOf[_id] = _chipsPacketBatchId;
        _retailStore.chipsPacketSold(_id, _chipsPacketBatchId, _packetSize);
        emit ChipsPacketSold(msg.sender, _id);
        chipsPacketId++;
    }
}
