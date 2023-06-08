// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// import "hardhat/console.sol";

contract RetailStore {
    string public id;
    string public name;
    string public location;
    address public owner;
    address public registrar;

    struct ChipsBatchShipment {
        uint256 weightReach; // in kg
        uint256 reachedAt;
        uint256 soldAt;
    }

    mapping(uint256 => ChipsBatchShipment) public itemDetailFromRetailStore;

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

    function chipsBatchCollectedAtRS(
        uint256 _id,
        // uint256 _oqs,
        uint256 _ww
    ) public onlyRegistrar {
        itemDetailFromRetailStore[_id] = ChipsBatchShipment(
            _ww,
            block.timestamp,
            0
        );
    }

    function chipsPacketSoldFromBatch(uint256 _id) public onlyRegistrar {
        itemDetailFromRetailStore[_id].soldAt = block.timestamp;
    }
}
