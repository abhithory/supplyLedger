// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./BaseEntityContract.sol";
import "./Factory.sol";

contract RetailStore is
    BaseEntityContract,
    BaseEntityInterface,
    FactoryInterface
{
    struct ChipsPacketDetail {
        uint256 batchId;
        PackageSize size;
        uint256 time;
    }

    mapping(uint256 => BatchDetail) public ArrivedChipsPacketBatchDetails;
    mapping(uint256 => ChipsPacketDetail) public soldChipsPacket;

    constructor(
        address _owner,
        uint256 _maxCapacity
    ) BaseEntityContract(_owner, msg.sender, _maxCapacity) {}

    function chipsBatchStoredAtRS(
        uint256 _batchDetailsId,
        uint256 _weight
    ) public onlyRegistrar isMaxCapacityNotExceeded(_weight) {
        ArrivedChipsPacketBatchDetails[_batchDetailsId].weight = _weight;
        ArrivedChipsPacketBatchDetails[_batchDetailsId].time = block.timestamp;
    }

    // TODO: check the chips batch is reached or not. || also check capacity of batch
    function chipsPacketSold(
        uint256 _chipsPacketId,
        uint256 _chipsPacketBatchId,
        PackageSize size
    ) public onlyRegistrar {
        uint256 weightToDispatch;
        if (size == PackageSize.Gram100) {
            weightToDispatch = 100;
        } else if (size == PackageSize.Gram200) {
            weightToDispatch = 200;
        } else if (size == PackageSize.Gram500) {
            weightToDispatch = 500;
        } else {
            require(false, "Wrong chips packet size");
        }
        require(
            currentAllocation >= weightToDispatch,
            "Insufficient capacity of chips packet."
        );
        currentAllocation -= weightToDispatch;

        soldChipsPacket[_chipsPacketId] = ChipsPacketDetail(
            _chipsPacketBatchId,
            size,
            block.timestamp
        );
    }

    function receivedFromLogistic(
        uint256 _chipsPacketBatchId,
        uint256 _logisticId
    ) public {
        ArrivedChipsPacketBatchDetails[_chipsPacketBatchId]
            .logisticId = _logisticId;
    }
}
