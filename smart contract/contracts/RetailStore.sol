// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";

import "./BaseEntityContract.sol";

contract RetailStore is BaseEntityContract {
    mapping(uint256 => ChipsBatchDetail) public ArrivedBatchDetails;
    mapping(uint256 => ChipsPacketDetail) public soldChipsPacket;

    constructor(
        string memory _id,
        address _owner
    ) BaseEntityContract(_id, _owner, msg.sender) {}

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
        soldChipsPacket[_chipsPacketId] = ChipsPacketDetail(
            _batchId,
            _weight,
            block.timestamp
        );
    }

    function getSoldChips(
        uint256 _chipsPacketid
    ) public view returns (ChipsPacketDetail memory) {
        return soldChipsPacket[_chipsPacketid];
    }

    function getArrivedChipsBatch(
        uint256 _chipsPacketBatchid
    ) public view returns (ChipsBatchDetail memory) {
        return ArrivedBatchDetails[_chipsPacketBatchid];
    }
}
