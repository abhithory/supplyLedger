// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./BaseEntityContract.sol";

contract RetailStore is BaseEntityContract, BaseEntityInterface {
    mapping(uint256 => BatchDetail) public ArrivedChipsPacketBatchDetails;
    mapping(uint256 => ChipsPacketDetail) public soldChipsPacket;

    constructor(
        address _owner,
        uint256 _maxCapacity
    ) BaseEntityContract(_owner, msg.sender,_maxCapacity) {}

    function receivedFromLogistic(
        uint256 _chipsPacketBatchId,
        uint256 _logisticId
    ) public {
        ArrivedChipsPacketBatchDetails[_chipsPacketBatchId].logisticId = _logisticId;
    }

    function chipsBatchStoredAtRS(
        uint256 _batchDetailsId,
        uint256 _weight
    ) public onlyRegistrar {
        ArrivedChipsPacketBatchDetails[_batchDetailsId].weight = _weight;
        ArrivedChipsPacketBatchDetails[_batchDetailsId].time = block.timestamp;
    }


    // TODO: check the chips batch is reached or not. || also check capacity of batch 
    function chipsPacketSold(
        uint256 _chipsPacketId,
        uint256 _chipsPacketBatchId,
        uint256 _weight
    ) public onlyRegistrar {
        soldChipsPacket[_chipsPacketId] = ChipsPacketDetail(
            _chipsPacketBatchId,
            _weight,
            block.timestamp
        );
    }
}
