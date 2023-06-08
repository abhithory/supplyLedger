// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// import "hardhat/console.sol";

contract LocalCollector {
    string public id;
    string public name;
    string public location;
    address public owner;
    address public registrar;

    struct BatchDetail {
        uint256 logisticId;
        uint256 weight;
        uint256 oqs;
        uint256 time;
    }

    mapping(uint256 => BatchDetail) public ArrivedBatchDetails; 
    mapping(uint256 => BatchDetail) public DispatchedBatchDetails;

    constructor(string memory _id, address _owner) {
        id = _id;
        owner = _owner;
        registrar = msg.sender;
    }

    modifier onlyRegistrar() {
        require(msg.sender == registrar, "");
        _;
    }

    function potatoBatchStoredAtLC(
        uint256 _batchDetailsId,
        uint256 _logisticId,
        uint256 _weight,
        uint256 _oqs
    ) public {
        require(ArrivedBatchDetails[_batchDetailsId].logisticId == _logisticId,"logistic id doesnot match");    
        ArrivedBatchDetails[_batchDetailsId].weight = _weight;
        ArrivedBatchDetails[_batchDetailsId].oqs = _oqs;
        ArrivedBatchDetails[_batchDetailsId].time = block.timestamp;
    }

    function potatoBatchDispatchedToFactory(
        uint256 _batchDetailsId,
        uint256 _logisticId,
        uint256 _weight,
        uint256 _oqs
    ) public {
        DispatchedBatchDetails[_batchDetailsId] = BatchDetail(
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
