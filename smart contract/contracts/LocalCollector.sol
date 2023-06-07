// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// import "hardhat/console.sol";

contract LocalCollector {
    string public id;
    string public name;
    string public location;
    address public owner;
    address public registrar;


    struct ItemDetail {
        uint256 batchWeight;
        uint256 oqsReach;
        uint256 reachedAt;
        uint256 weightDispatch;
        uint256 oqsDispatch;
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

    function foodItemsCollectedAtLC(uint256 _id, uint256 _oqs,uint256 _ww) public {
        itemDetailFromLocalCollector[_id] = ItemDetail(_ww,_oqs, block.timestamp,0,0,0,address(0));
    }

    function foodItemsDispachedToRS(uint256 _id, uint256 _oqs,uint256 _ww, address _disTo) public {
        itemDetailFromLocalCollector[_id].weightDispatch = _ww;
        itemDetailFromLocalCollector[_id].oqsDispatch = _oqs;
        itemDetailFromLocalCollector[_id].dispatchedAt = block.timestamp;
        itemDetailFromLocalCollector[_id].dispatchedTo = _disTo;
    }
}
