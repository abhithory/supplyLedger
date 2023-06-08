// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// import "hardhat/console.sol";

contract RetailStore {
    string public id;
    string public name;
    string public location;
    address public owner;
    address public registrar;

    struct ChipsBatchDetail {
        uint256 logisticId;
        uint256 weight;
        uint256 time;
    }

    struct ChipsPacketDetail {
        uint256 batchId;
        uint256 weight;
        uint256 time;
    }

    mapping(uint256 => ChipsBatchDetail) public ArrivedBatchDetails;
    mapping(uint256 => ChipsPacketDetail) public soldChipsPacket;

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

    function receivedFromLogistic(
        uint256 _batchId,
        uint256 _logisticId
    ) public {
        ArrivedBatchDetails[_batchId].logisticId = _logisticId;
    }

    function chipsBatchStoredAtRS(
        uint256 _batchDetailsId,
        uint256 _weight
    ) public onlyRegistrar {
        ArrivedBatchDetails[_batchDetailsId].weight = _weight;
        ArrivedBatchDetails[_batchDetailsId].time = block.timestamp;
    }

    function chipsPacketSold(
        uint256 _chipsPacketId,
        uint256 _batchId,
        uint256 _weight
    ) public onlyRegistrar {
        soldChipsPacket[_chipsPacketId] = ChipsPacketDetail(_batchId,_weight,block.timestamp);
    }
}
