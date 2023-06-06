// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";

contract LocalCollector {
    string public id;
    string public name;
    string public location;
    address public owner;
    address public registrar;


    struct ItemDetail {
        string qualityReach;
        uint256 reachedAt;
        string qualityDispatch;
        uint256 dispatchedAt;
        address dispatchedTo;
    }

    mapping(uint256 => ItemDetail) public itemDetailFromLocalCollector;

    constructor(string memory _id, address _owner) {
        id = _id;
        owner = _owner;
        registrar = msg.sender;

    }

        modifier onlyRegistrar() {
        require(msg.sender == registrar, "");
        _;
    }

    function foodItemsCollectedAtLC(uint256 _id, string memory _qq) public {
        itemDetailFromLocalCollector[_id] = ItemDetail(_qq, block.timestamp,"",0,address(0));
    }

    function foodItemsDispachedToRS(uint256 _id, string memory _qq, address _disTo) public {
        itemDetailFromLocalCollector[_id].qualityDispatch = _qq;
        itemDetailFromLocalCollector[_id].dispatchedAt = block.timestamp;
        itemDetailFromLocalCollector[_id].dispatchedTo = _disTo;
    }
}
