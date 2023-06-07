// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// import "hardhat/console.sol";

contract RetailStore {
    string public id;
    string public name;
    string public location;
    address public owner;
    address public registrar;

    struct ItemDetail {
        uint256 weightReach; // in kg
        uint256 oqsReach;
        uint256 reachedAt;
        uint256 oqsSold;
        uint256 soldAt;
    }

    mapping(uint256 => ItemDetail) public itemDetailFromRetailStore;

    constructor(string memory _id, address _owner) {
        id = _id;
        owner = _owner;
        registrar = msg.sender;
    }

    modifier onlyRegistrar() {
        require(
            msg.sender == registrar,
            "only registrar can call this function"
        );
        _;
    }

    function foodItemsCollectedAtRS(
        uint256 _id,
        uint256 _oqs,
        uint256 _ww
    ) public onlyRegistrar {
        itemDetailFromRetailStore[_id] = ItemDetail(
            _ww,
            _oqs,
            block.timestamp,
            0,
            0
        );
    }

    function foodItemSold(uint256 _id, uint256 _oqs) public onlyRegistrar {
        itemDetailFromRetailStore[_id].oqsSold = _oqs;
        itemDetailFromRetailStore[_id].soldAt = block.timestamp;
    }
}
