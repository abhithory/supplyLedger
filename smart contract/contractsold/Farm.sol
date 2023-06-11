// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./BaseEntityContract.sol";

interface FarmInterface {
    enum Size {
        Small,
        Medium,
        Large
    }
    enum Shape {
        Regular,
        Irregular
    }

    enum ExternalQuality {
        NoDefects,
        MinorDefects,
        MajorDefects
    }

    enum Weight {
        Light,
        Medium,
        Heavy
    }

    struct BatchQuality {
        Size size;
        Shape shape;
        ExternalQuality externalQuality;
        Weight weight;
    }
}

contract Farm is BaseEntityContract, FarmInterface {
    // oqs - overalll quailty score => 0-100
    struct FarmPotatoBatchDetail {
        BatchQuality harvestBatchQuality;
        uint256 oqsHarvest; // oqs when farmer collect potatos batch from farm
        uint256 harvestBatchWeight; // in kg
        uint256 collectedAt; // time when potatos are collected
        uint256 logisticId;
        uint256 weightDispatch; // weight at the time of potatos batch dispatched To Local Collector
        uint256 oqsDispatch; // oqs at the time of potatos batch dispatched To Local Collector
        address logisticContractAddr;
    }

    mapping(uint256 => FarmPotatoBatchDetail) public farmPotatoBatchDetailOf;

    constructor(
        address _owner,
        uint256 _maxPotatoBatchCapacity
    ) BaseEntityContract(_owner, msg.sender, _maxPotatoBatchCapacity) {}

    function potatoBatchCollectedAtFarm(
        uint256 _potatoBatchDetails,
        BatchQuality memory _qq,
        uint256 _weight,
        uint256 _oqs
    ) public onlyRegistrar isMaxCapacityNotExceeded(_weight) {
        farmPotatoBatchDetailOf[_potatoBatchDetails].harvestBatchQuality = _qq;
        farmPotatoBatchDetailOf[_potatoBatchDetails]
            .harvestBatchWeight = _weight;
        farmPotatoBatchDetailOf[_potatoBatchDetails].oqsHarvest = _oqs;
        farmPotatoBatchDetailOf[_potatoBatchDetails].collectedAt = block
            .timestamp;
    }

    function potatoBatchDispatchedFromFarm(
        uint256 _potatoBatchRelationId,
        uint256 _logisticId,
        address _logisticContractAddr,
        uint256 _oqs,
        uint256 _weight
    ) public onlyRegistrar isMinCapacityAvailable(_weight) {
        farmPotatoBatchDetailOf[_potatoBatchRelationId]
            .logisticId = _logisticId;
        farmPotatoBatchDetailOf[_potatoBatchRelationId]
            .logisticContractAddr = _logisticContractAddr;
        farmPotatoBatchDetailOf[_potatoBatchRelationId]
            .weightDispatch = _weight;
        farmPotatoBatchDetailOf[_potatoBatchRelationId].oqsDispatch = _oqs;
    }
}