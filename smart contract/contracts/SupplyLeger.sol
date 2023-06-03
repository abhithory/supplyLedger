// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// import "hardhat/console.sol";
// console.log("Unlock time is %o and block timestamp is %o", unlockTime, block.timestamp);

contract Farm {
    string public id;
    string public name;
    string public location;

    struct FarmItem {
        uint256 collectedAt;
        uint256 dispatchedAt;
        address dispatchedTo;
        string quality;
    }

    mapping(uint256 => FarmItem) public itemDetailFromFarm;

    constructor(string memory _id) {
        id = _id;
    }
}

contract LocalCollector {
    string public id;
    string public name;
    string public location;

    struct ItemDetail {
        uint256 reachedAt;
        uint256 dispatchedAt;
        address dispatchedTo;
        string quality;
    }

    mapping(uint256 => ItemDetail) public itemDetailFromLocalCollector;

    constructor(string memory _id) {
        id = _id;
    }
}

contract RetailStore {
    string public id;
    string public name;
    string public location;

    struct ItemDetail {
        uint256 reachedAt;
        uint256 soldAt;
        string quality;
    }

    mapping(uint256 => ItemDetail) public itemDetailFromRetailStore;

    constructor(string memory _id) {
        id = _id;
    }
}

contract SupplyLeger {
    struct FoodItem {
        uint256 id;
        string name;
        address farm;
        address localCollector;
        address retailStore;
        uint256 purchasedDate;
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

    // food item dispatched from farm to local colloctor
    function dispachedToLocalColloctor(
        address _farm,
        address _localColloctor
    ) public {
        foodItems[foodItemId] = FoodItem(
            foodItemId,
            "Potato",
            _farm,
            _localColloctor,
            address(0),
            0
        );

        getAllTracks[foodItemId].push(
            ItemTrackDetail(
                "Dispactched From Farm to local store",
                block.timestamp
            )
        );
        foodItemId++;
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

    // item purcased
    function itemPurchased(uint256 _itemId) public {
        getAllTracks[_itemId].push(
            ItemTrackDetail("Item sold from Retail store", block.timestamp)
        );
        foodItems[_itemId].purchasedDate = block.timestamp;
    }

    // update
    // function
}
