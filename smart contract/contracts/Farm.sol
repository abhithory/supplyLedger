// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";

contract Farm {
    string public id;
    string public name;
    string public location;
    address public owner;
    address public registrar;

    struct FarmItem {
        string qualityCollect;
        uint256 collectedAt;
        string qualityDispatch;
        uint256 dispatchedAt;
        address dispatchedTo;
    }

    mapping(uint256 => FarmItem) public itemDetailFromFarm;

    constructor(string memory _id, address _owner) {
        id = _id;
        owner = _owner;
        registrar = msg.sender;
    }

    modifier onlyRegistrar() {
        require(msg.sender == registrar, "");
        _;
    }

    function foodItemsCollectedAtFarm(
        uint256 _id,
        string memory _qq
    ) public onlyRegistrar {
        itemDetailFromFarm[_id] = FarmItem(_qq,block.timestamp, "",0, address(0));
    }

    function foodItemDispactedFromFarm(
        uint256 _id,
        string memory _qq,
        address _dispatedTo
    ) public onlyRegistrar {
        itemDetailFromFarm[_id].qualityDispatch = _qq;
        itemDetailFromFarm[_id].dispatchedAt = block.timestamp;
        itemDetailFromFarm[_id].dispatchedTo = _dispatedTo;
    }
}
