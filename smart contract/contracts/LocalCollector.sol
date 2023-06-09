// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// import "hardhat/console.sol";

import "./BaseEntityContract.sol";

contract LocalCollector is BaseEntityContract {

    mapping(uint256 => PotatoBatchDetail) public ArrivedBatchDetails;
    mapping(uint256 => PotatoBatchDetail) public DispatchedBatchDetails;


    constructor(string memory _id, address _owner) BaseEntityContract(_id,_owner, msg.sender) {}

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
        uint256 _weight,
        uint256 _oqs
    ) public {
        DispatchedBatchDetails[_batchDetailsId] = PotatoBatchDetail(
            _logisticId,
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
