// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";


contract RetailStore {
    string public id;
    string public name;
    string public location;
    address public owner;
    address public registrar;


    struct ItemDetail {
        string qualityReach;
        uint256 reachedAt;
        string qualitySold;
        uint256 soldAt;
    }

    mapping(uint256 => ItemDetail) public itemDetailFromRetailStore;

    constructor(string memory _id, address _owner) {
        id = _id;
        owner = _owner;
        registrar = msg.sender;
    }

        modifier onlyRegistrar() {
        require(msg.sender == registrar, "only registrar can call this function");
        _;
    }

    function foodItemsCollectedAtRS(uint256 _id, string memory _qq) public onlyRegistrar {
        itemDetailFromRetailStore[_id] = ItemDetail(_qq, block.timestamp,"",0);
    }

    function foodItemSold(uint256 _id,string memory _qq) public onlyRegistrar {
        itemDetailFromRetailStore[_id].qualitySold = _qq;
        itemDetailFromRetailStore[_id].soldAt = block.timestamp;
    }
}