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
    mapping(uint256 => uint256) public chipsWeightSoldFromBatchId;

    constructor(
                address _sl,
        address _owner,
        uint256 _maxCapacity
    ) BaseEntityContract(_owner, _sl, _maxCapacity) {}

    function chipsBatchStoredAtRS(
        uint256 _batchDetailsId,
        uint256 _weight,
        uint256 _oqs
    ) public onlyRegistrar isMaxCapacityNotExceeded(_weight) {
        require(
            ArrivedChipsPacketBatchDetails[_batchDetailsId].weight == 0,
            "Already stored chips packet batch with this id"
        );

        ArrivedChipsPacketBatchDetails[_batchDetailsId].oqs = _oqs;
        ArrivedChipsPacketBatchDetails[_batchDetailsId].weight = _weight;
        ArrivedChipsPacketBatchDetails[_batchDetailsId].time = block.timestamp;
    }

    function chipsPacketSold(
        uint256 _chipsPacketId,
        uint256 _chipsPacketBatchId,
        PackageSize size
    ) public onlyRegistrar {
        require(
            ArrivedChipsPacketBatchDetails[_chipsPacketBatchId].weight >= 0,
            "chips Packet Batch not Arrived here"
        );
        uint256 weightToSell;
        if (size == PackageSize.Gram100) {
            weightToSell = 100;
        } else if (size == PackageSize.Gram200) {
            weightToSell = 200;
        } else if (size == PackageSize.Gram500) {
            weightToSell = 500;
        } else {
            require(false, "Wrong chips packet size");
        }
        require(
            ArrivedChipsPacketBatchDetails[_chipsPacketBatchId].weight >= chipsWeightSoldFromBatchId[_chipsPacketBatchId] + weightToSell,
            "Insufficient capacity of chips packet from this chips packet batch."
        );

        require(
            currentAllocation >= weightToSell,
            "Insufficient capacity of chips packet."
        );
        currentAllocation -= weightToSell;

        soldChipsPacket[_chipsPacketId] = ChipsPacketDetail(
            _chipsPacketBatchId,
            size,
            block.timestamp
        );
        chipsWeightSoldFromBatchId[_chipsPacketBatchId] += weightToSell;
    }

    function receivedFromLogistic(
        uint256 _chipsPacketBatchId,
        uint256 _logisticId
    ) public {
        ArrivedChipsPacketBatchDetails[_chipsPacketBatchId]
            .logisticId = _logisticId;
    }
}
