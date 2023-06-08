// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
// console.log("Unlock time is %o and block timestamp is %o", unlockTime, block.timestamp);

import "./Farm.sol";
import "./LocalCollector.sol";
import "./RetailStore.sol";
import "./Factory.sol";
import "./Logistics.sol";

contract RegistrarSupplyLedger{
      struct Entity {
        address contractAddr;
        bool status;
    }
    mapping(address => Entity) public farmStatus;
    mapping(address => Entity) public lCStatus;
    mapping(address => Entity) public rSStatus;
    mapping(address => Entity) public factoryStatus;
    mapping(address => Entity) public logisticStatus;


    address public admin;


    constructor(address _ad){
        admin = _ad;
    }

        
    modifier onlyAdmin() {
        require(
            admin == msg.sender,
            "Only admin can call this function"
        );
        _; // Continue executing the function body
    }

    
    modifier onlyFarm() {
        require(
            farmStatus[msg.sender].status,
            "Only the registered farm can call"
        );
        _; // Continue executing the function body
    }

    modifier onlyLC() {
        require(
            lCStatus[msg.sender].status,
            "Only the registered local collector can call"
        );
        _; // Continue executing the function body
    }

    modifier onlyFactory() {
        require(
            factoryStatus[msg.sender].status,
            "Only the registered Retail store can call"
        );
        _; // Continue executing the function body
    }

    modifier onlyRS() {
        require(
            rSStatus[msg.sender].status,
            "Only the registered Retail store can call"
        );
        _; // Continue executing the function body
    }

    modifier onlyLogistic() {
        require(
            logisticStatus[msg.sender].status,
            "Only the registered Retail store can call"
        );
        _; // Continue executing the function body
    }

    
    // Registring entities
    function registerFarm(string memory _id, address _owner) public {
        require(!farmStatus[msg.sender].status, "Farm already registred");
        Farm _farm = new Farm(_id, _owner);
        farmStatus[_owner] = Entity(address(_farm), true);
    }

    function registerLC(string memory _id, address _owner) public {
        require(!lCStatus[msg.sender].status, "Farm already registred");
        LocalCollector _LocalCollector = new LocalCollector(_id, _owner);
        lCStatus[_owner] = Entity(address(_LocalCollector), true);
    }

    function registerRS(string memory _id, address _owner) public {
        require(!rSStatus[msg.sender].status, "Farm already registred");
        RetailStore _RetailStore = new RetailStore(_id, _owner);
        rSStatus[_owner] = Entity(address(_RetailStore), true);
    }

    function registerFactory(string memory _id, address _owner) public {
        require(!factoryStatus[msg.sender].status, "Factory already registred");
        Factory _Factory = new Factory(_id, _owner);
        factoryStatus[_owner] = Entity(address(_Factory), true);
    }

    
    function registerLogistics(string memory _id, address _owner) public {
        require(!logisticStatus[msg.sender].status, "Logistics already registred");
        Logistics _Logistics = new Logistics(_id, _owner);
        logisticStatus[_owner] = Entity(address(_Logistics), true);
    }
}

contract SupplyLedger is RegistrarSupplyLedger, FarmStructs, FactoryInterface {

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
    uint256 public chipsPacketBatchId = 1;
    mapping(uint256 => ChipsPacketBatchRelations)
        public chipsPacketBatchRelationsOf;

    // Events
    // event foodItemAdded(address indexed farmAddress,string quality);

    constructor(address admin) RegistrarSupplyLedger(admin) {}

    // collect food item data at farm (date, quality etc..) and store in smart contract
    function addPotatoBatchAtFarm(
        BatchQuality memory _bq,
        uint256 _oqc,
        uint256 _weight
    ) public onlyFarm {
        potatBatchRelationOf[potatoBatchRelationId] = PotatoBatchRelation(
            potatoBatchRelationId,
            "Potato Batch 001",
            farmStatus[msg.sender].contractAddr,
            address(0),
            address(0)
        );

        Farm _farm = Farm(farmStatus[msg.sender].contractAddr);
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
    ) public onlyFarm {
        potatBatchRelationOf[_potatoBatchRelationId].localCollector = _localColloctor;
        
        Logistics _logi = Logistics(_logisticsAddr);
        uint256 _shipmentId = _logi.createShipment(farmStatus[msg.sender].contractAddr,farmStatus[_localColloctor].contractAddr);

        console.log("dispatchPotatoBatchToLC", _shipmentId);

        Farm _farm = Farm(farmStatus[msg.sender].contractAddr);
        _farm.potatoBatchDispatchedFromFarm(_potatoBatchRelationId,_shipmentId, _oqc, _weight);
    }

    // food item reached at local colloctor
    function potatoBatchReachedAtLC(
        uint256 _itemId,
        uint256 _oqs,
        uint256 _weight
    ) public onlyLC {
        LocalCollector _localCollector = LocalCollector(
            lCStatus[msg.sender].contractAddr
        );
        _localCollector.potatoBatchStoredAtLC(_itemId, _oqs, _weight);
    }

    // food item dispatched from local Collortor to factory
    function potatoBatchDispatchedToFactory(
        uint256 _itemId,
        address _factory,
        uint256 _oqs,
        uint256 _weight
    ) public onlyLC {
        potatBatchRelationOf[_itemId].factory = _factory;

        LocalCollector _localCollector = LocalCollector(
            lCStatus[msg.sender].contractAddr
        );
        _localCollector.potatoBatchDispatchedToFactory(
            _itemId,
            _oqs,
            _weight,
            _factory
        );
    }

    function potatoBatchReachedAtFactory(
        uint256 _itemId,
        uint256 _oqs,
        uint256 _weight
    ) public onlyFactory {
        require(
            potatBatchRelationOf[_itemId].factory == msg.sender,
            "Factory is not correct"
        );

        Factory _Factory = Factory(factoryStatus[msg.sender].contractAddr);
        _Factory.potatoBatchCollectedAtFactory(_itemId, _oqs, _weight);
    }

    function chipsPreparedAtFactory(
        uint256 _itemId,
        ChipsBatch memory _details
    ) public onlyFactory {
        require(
            potatBatchRelationOf[_itemId].factory == msg.sender,
            "Factory is not correct"
        );

        Factory _Factory = Factory(factoryStatus[msg.sender].contractAddr);
        _Factory.chipsPrepared(chipsPacketBatchId, _details);
        chipsPacketBatchId++;
    }

    function chipsPacketBatchDispatchedToRS(
        uint256 _itemId,
        address _rs,
        uint256 _ww
    ) public onlyFactory {
        require(
            potatBatchRelationOf[_itemId].factory == msg.sender,
            "Factory is not correct"
        );

        chipsPacketBatchRelationsOf[chipsPacketBatchId]
            .potatosRelativeId = _itemId;
        chipsPacketBatchRelationsOf[chipsPacketBatchId].retailStore = _rs;
        Factory _Factory = Factory(factoryStatus[msg.sender].contractAddr);
        _Factory.dispactchChipsBatchToRS(chipsPacketBatchId, _rs, _ww);

        chipsPacketBatchId++;
    }

    // chips batch item reached at retail store
    function reachedToRetailStore(
        uint256 _chipsPacketBatchId,
        uint256 _ww
    ) public onlyRS {
        require(
            chipsPacketBatchRelationsOf[_chipsPacketBatchId].retailStore ==
                msg.sender,
            "Retail Store is not correct"
        );

        RetailStore _retailStore = RetailStore(
            rSStatus[msg.sender].contractAddr
        );
        _retailStore.chipsBatchCollectedAtRS(_chipsPacketBatchId, _ww);
    }

    function itemPurchased(uint256 _chipsPacketBatchId) public onlyRS {
        require(
            chipsPacketBatchRelationsOf[_chipsPacketBatchId].retailStore ==
                msg.sender,
            "Retail Store is not correct"
        );

        RetailStore _retailStore = RetailStore(
            rSStatus[msg.sender].contractAddr
        );
        _retailStore.chipsPacketSoldFromBatch(_chipsPacketBatchId);
    }

    //
}
