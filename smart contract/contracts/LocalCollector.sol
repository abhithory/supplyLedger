// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./BaseEntityContract.sol";

contract LocalCollector is BaseEntityContract , BaseEntityInterface{


    mapping(uint256 => BatchDetail) public ArrivedBatchDetails; // potatoBatchId => details
    mapping(uint256 => BatchDetail) public DispatchedBatchDetails; // potatobatchesLC => details

    constructor(
        address _owner,
        uint256 _maxCapacity
    ) BaseEntityContract(_owner, msg.sender, _maxCapacity) {}

    function potatoBatchStoredAtLC(
        uint256 _batchDetailsId,
        uint256 _weight,
        uint256 _oqs
    ) public {
        ArrivedBatchDetails[_batchDetailsId].weight = _weight;
        ArrivedBatchDetails[_batchDetailsId].oqs = _oqs;
        ArrivedBatchDetails[_batchDetailsId].time = block.timestamp;
    }

    function dispatchPotatoBatchToFactory(
        uint256 _batchDetailsId,
        uint256 _logisticId,
        address _logisticContractAddr,
        uint256 _weight,
        uint256 _oqs
    ) public {
        DispatchedBatchDetails[_batchDetailsId] = BatchDetail(
            _logisticId,
            _logisticContractAddr,
            _weight,
            _oqs,
            block.timestamp
        );
    }

    function receivedFromLogistic(
        uint256 _batchId,
        uint256 _logisticId
    ) public {
        ArrivedBatchDetails[_batchId].logisticId = _logisticId;
    }
}
