// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// import "hardhat/console.sol";
// console.log("Unlock time is %o and block timestamp is %o", unlockTime, block.timestamp);

contract Farm {
    string public id;
    string public name;
    string public location;
    address public owner;

    struct FarmItem {
        uint256 collectedAt;
        string quality;
        // uint256 dispatchedAt;
        // address dispatchedTo;
    }

    mapping(uint256 => FarmItem) public itemDetailFromFarm;

    constructor(string memory _id, address _owner) {
        id = _id;
        owner = _owner;
    }

    function foodItemsCollectedAtFarm(uint256 _id, string memory _qq) public {
        itemDetailFromFarm[_id] = FarmItem(block.timestamp, _qq);
    }
}

contract LocalCollector {
    string public id;
    string public name;
    string public location;
    address public owner;


    struct ItemDetail {
        string quality;
        uint256 reachedAt;
        // uint256 dispatchedAt;
        // address dispatchedTo;
    }

    mapping(uint256 => ItemDetail) public itemDetailFromLocalCollector;

    constructor(string memory _id, address _owner) {
        id = _id;
        owner = _owner;
    }


    function foodItemsCollectedAtLC(uint256 _id, string memory _qq) public {
        itemDetailFromLocalCollector[_id] = ItemDetail(_qq, block.timestamp);
    }
}

contract RetailStore {
    string public id;
    string public name;
    string public location;
    address public owner;

    struct ItemDetail {
        string quality;
        uint256 reachedAt;
        uint256 soldAt;
    }

    mapping(uint256 => ItemDetail) public itemDetailFromRetailStore;

    constructor(string memory _id, address _owner) {
        id = _id;
        owner = _owner;
    }

    function foodItemsCollectedAtRS(uint256 _id, string memory _qq) public {
        itemDetailFromRetailStore[_id] = ItemDetail(_qq, block.timestamp, 0);
    }

    function foodItemSold(uint256 _id) public {
        itemDetailFromRetailStore[_id].soldAt = 0;
    }
}

// TODO: logistic steps add with time
// contract Logistic{

// }

//TODO: quality check at every step

contract SupplyLeger {
    // -----start => registrar
    struct Entity{
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
        // uint256 purchasedDate;
        // address factory;
        // address distributors;
    }

    struct ItemTrackDetail {
        string checkPoint;
        uint256 time;
        // uint256 reachedTime;
        // uint256 dispachedTime;
    }
    uint256 foodItemId;
    mapping(uint256 => FoodItem) public foodItems;
    mapping(uint256 => ItemTrackDetail[]) public getAllTracks;

    constructor() {}

    // Registring entities

    function registerFarm(string memory _id, address _owner) public {
        Farm _farm = new Farm(_id, _owner);
        farmStatus[_owner] = Entity(
            address(_farm),
            true
        );
    }

    function registerLocalCollector(string memory _id, address _owner) public {
        LocalCollector _lc = new LocalCollector(_id, _owner);
        lCStatus[_owner] = Entity(
            address(_lc),
            true
        );
    }

    function registerRetailStore(string memory _id, address _owner) public {
        RetailStore _rs = new RetailStore(_id, _owner);
        rSStatus[_owner] = Entity(
            address(_rs),
            true
        );
    }

    // collect food item data at farm (date, quality etc..) and store in smart contract
    function addFoodItemsAtFarm(address _farmAddr) public {
        foodItems[foodItemId] = FoodItem(
            foodItemId,
            "Potato",
            _farmAddr,
            address(0),
            address(0)
        );

        Farm _farm = Farm(_farmAddr);
        _farm.foodItemsCollectedAtFarm(foodItemId, "99/100");

        getAllTracks[foodItemId].push(
            ItemTrackDetail("Food items collected at farm", block.timestamp)
        );
        foodItemId++;
    }

    // food item dispatched from farm to local colloctor
    function dispachedToLocalColloctor(
        uint256 _itemId,
        address _localColloctor
    ) public {
        foodItems[_itemId].localCollector = _localColloctor;
        getAllTracks[_itemId].push(
            ItemTrackDetail(
                "Dispactched From Farm to local store",
                block.timestamp
            )
        );
        foodItemId++;
    }

    // food item reached at local colloctor
    function reachedToLocalCollector(uint256 _itemId) public {
        LocalCollector _localCollector = LocalCollector(
            foodItems[_itemId].localCollector
        );
        _localCollector.foodItemsCollectedAtLC(_itemId, "95/100");
        getAllTracks[_itemId].push(
            ItemTrackDetail("Reached at local collector", block.timestamp)
        );
    }

    // food item dispatched from local Collortor to retail store
    function dispachedToRetailStore(
        uint256 _itemId,
        address _retailStore
    ) public {
        getAllTracks[_itemId].push(
            ItemTrackDetail(
                "Dispactched From local store to retail store",
                block.timestamp
            )
        );
        foodItems[_itemId].retailStore = _retailStore;
    }

    // food item reached at retail store
    function reachedToRetailStore(uint256 _itemId) public {
        getAllTracks[_itemId].push(
            ItemTrackDetail("Reached At Retail Store", block.timestamp)
        );

        RetailStore _retailStore = RetailStore(foodItems[_itemId].retailStore);

        _retailStore.foodItemsCollectedAtRS(_itemId, "92/100");
    }

    // item purcased
    function itemPurchased(uint256 _itemId) public {
        RetailStore _retailStore = RetailStore(foodItems[_itemId].retailStore);
        _retailStore.foodItemSold(_itemId);
        getAllTracks[_itemId].push(
            ItemTrackDetail("Item sold from Retail store", block.timestamp)
        );
        // foodItems[_itemId].purchasedDate = block.timestamp;
    }

    //
}
