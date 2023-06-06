// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// import "hardhat/console.sol";
// console.log("Unlock time is %o and block timestamp is %o", unlockTime, block.timestamp);

import "./Farm.sol";
import "./LocalCollector.sol";
import "./RetailStore.sol";


// TODO: logistic steps add with time
// contract Logistic{

// }

//TODO: quality check at every step

contract SupplyLedger is FarmStructs {
    // -----start => registrar

    // bytes public FarmEntity = abi.encode("FARM");
    // bytes public LocalCollectorEntity = abi.encode("LOCAL-COLLECTOR");
    // bytes public RetailStoreEntity = abi.encode("RETAIL-STORE");

    struct Entity {
        // bytes entityType;
        address contractAddr;
        bool status;
    }
    mapping(address => Entity) public farmStatus;
    mapping(address => Entity) public lCStatus;
    mapping(address => Entity) public rSStatus;

    // -----end => registrar

    struct FoodItem {
        uint256 id;
        string name;
        address farm;
        address localCollector;
        address retailStore;
        // address factory;
        // address distributors;
    }

    struct ItemTrackDetail {
        string checkPoint;
        uint256 time;
        // uint256 reachedTime;
        // uint256 dispachedTime;
    }
    uint256 public foodItemId = 1;
    mapping(uint256 => FoodItem) public foodItems;
    // mapping(uint256 => ItemTrackDetail[]) public getAllTracks;

    // Events
    // event foodItemAdded(address indexed farmAddress,string quality);

    constructor() {}

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

    modifier onlyRS() {
        require(
            rSStatus[msg.sender].status,
            "Only the registered Retail store can call"
        );
        _; // Continue executing the function body
    }

    // Registring entities
    function registerFarm(string memory _id, address _owner) public {
        require(!farmStatus[msg.sender].status,"Farm already registred");
        Farm _farm = new Farm(_id, _owner);
        farmStatus[_owner] = Entity(address(_farm), true);
    }

    function registerLC(string memory _id, address _owner) public {
        require(!lCStatus[msg.sender].status,"Farm already registred");
        LocalCollector _LocalCollector = new LocalCollector(_id, _owner);
        lCStatus[_owner] = Entity(address(_LocalCollector), true);
    }

    function registerRS(string memory _id, address _owner) public {
        require(!rSStatus[msg.sender].status,"Farm already registred");
        RetailStore _RetailStore = new RetailStore(_id, _owner);
        rSStatus[_owner] = Entity(address(_RetailStore), true);
    }

    // collect food item data at farm (date, quality etc..) and store in smart contract
    function addFoodItemsAtFarm(BatchQuality memory _bq, uint256 _oqc) public onlyFarm {
        foodItems[foodItemId] = FoodItem(
            foodItemId,
            "Potato",
            farmStatus[msg.sender].contractAddr,
            address(0),
            address(0)
        );

        Farm _farm = Farm(farmStatus[msg.sender].contractAddr);
        _farm.foodItemsCollectedAtFarm(foodItemId,_bq, _oqc);

        // getAllTracks[foodItemId].push(
        //     ItemTrackDetail("Food items collected at farm", block.timestamp)
        // );
        foodItemId++;
    }

    // food item dispatched from farm to local colloctor
    function dispachedToLocalColloctor(
        uint256 _itemId,
        address _localColloctor,
        uint256 _oqc
    ) public onlyFarm {
        foodItems[_itemId].localCollector = _localColloctor;

        Farm _farm = Farm(farmStatus[msg.sender].contractAddr);
        _farm.foodItemDispactedFromFarm(_itemId, _oqc, msg.sender);
        // getAllTracks[_itemId].push(
        //     ItemTrackDetail(
        //         "Dispactched From Farm to local store",
        //         block.timestamp
        //     )
        // );
    }

    // food item reached at local colloctor
    function reachedToLocalCollector(uint256 _itemId,uint256 _oqs) public onlyLC {
        LocalCollector _localCollector = LocalCollector(
            lCStatus[msg.sender].contractAddr
        );
        _localCollector.foodItemsCollectedAtLC(_itemId, _oqs);
        // getAllTracks[_itemId].push(
        //     ItemTrackDetail("Reached at local collector", block.timestamp)
        // );
    }

    // food item dispatched from local Collortor to retail store
    function dispachedToRetailStore(
        uint256 _itemId,
        address _retailStore,
        uint256 _oqs
    ) public onlyLC {
        foodItems[_itemId].retailStore = _retailStore;

        LocalCollector _localCollector = LocalCollector(
            lCStatus[msg.sender].contractAddr
        );
        _localCollector.foodItemsDispachedToRS(_itemId, _oqs, _retailStore);


        // getAllTracks[_itemId].push(
        //     ItemTrackDetail(
        //         "Dispactched From local store to retail store",
        //         block.timestamp
        //     )
        // );
    }

    // food item reached at retail store
    function reachedToRetailStore(uint256 _itemId,uint256 _oqs) public onlyRS {
        require(foodItems[_itemId].retailStore == msg.sender, "Retail Store is not correct");

        RetailStore _retailStore = RetailStore(
            rSStatus[msg.sender].contractAddr
        );
        _retailStore.foodItemsCollectedAtRS(_itemId, _oqs);

        // getAllTracks[_itemId].push(
        //     ItemTrackDetail("Reached At Retail Store", block.timestamp)
        // );
    }

    // item purcased
    function itemPurchased(uint256 _itemId,uint256 _oqs) public onlyRS {
        require(foodItems[_itemId].retailStore == msg.sender, "Retail Store is not correct");

        RetailStore _retailStore = RetailStore(
            rSStatus[msg.sender].contractAddr
        );
        _retailStore.foodItemSold(_itemId,_oqs);

        // getAllTracks[_itemId].push(
        //     ItemTrackDetail("Item sold from Retail store", block.timestamp)
        // );
        // foodItems[_itemId].purchasedDate = block.timestamp;
    }

    //
}
