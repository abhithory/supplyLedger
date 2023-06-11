// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./BaseEntityContract.sol";

contract LocalCollector is BaseEntityContract, BaseEntityInterface {
    mapping(uint256 => BatchDetail) public ArrivedBatchDetails; // potatoBatchId => details
    mapping(uint256 => BatchDetail) public DispatchedBatchDetails; // potatobatchesLC => details

    constructor(
        address _sl,
        address _owner,
        uint256 _maxPotatoBatchCapacity
    ) BaseEntityContract(_owner, _sl, _maxPotatoBatchCapacity) {}

    function potatoBatchStoredAtLC(
        uint256 _potatoBatchId,
        uint256 _weight,
        uint256 _oqs
    ) public isMaxCapacityNotExceeded(_weight) {
        require(
            ArrivedBatchDetails[_potatoBatchId].weight == 0,
            "Potato batch already stored"
        );

        ArrivedBatchDetails[_potatoBatchId].weight = _weight;
        ArrivedBatchDetails[_potatoBatchId].oqs = _oqs;
        ArrivedBatchDetails[_potatoBatchId].time = block.timestamp;
    }

    function dispatchPotatoBatchToFactory(
        uint256 _potatoBatchId,
        uint256 _logisticId,
        address _logisticContractAddr,
        uint256 _weight,
        uint256 _oqs
    ) public isMinCapacityAvailable(_weight) {
        require(
            DispatchedBatchDetails[_potatoBatchId].weight == 0,
            "Potato batch already Dispatched"
        );

        DispatchedBatchDetails[_potatoBatchId] = BatchDetail(
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
