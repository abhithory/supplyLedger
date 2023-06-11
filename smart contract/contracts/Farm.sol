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
    struct FarmPotatoBatchDetail {
        // oqs - overalll quailty score => 0-100
        BatchQuality harvestBatchQuality;
        uint256 oqsHarvest; // oqs when farmer collect potatos batch from farm
        uint256 batchWeight; // in kg
        uint256 collectedAt; // time when potatos are collected
        uint256 logisticId;
        uint256 weightDispatch; // weight at the time of potatos batch dispatched To Local Collector
        uint256 oqsDispatch; // oqs at the time of potatos batch dispatched To Local Collector
        address logisticContractAddr;
    }

    mapping(uint256 => FarmPotatoBatchDetail) public farmPotatoBatchDetailOf;

    constructor(
        address _owner,
        uint256 _maxCapacity
    ) BaseEntityContract(_owner, msg.sender,_maxCapacity) {}

    function potatoBatchCollectedAtFarm(
        uint256 _id,
        BatchQuality memory _qq,
        uint256 _ww,
        uint256 _oqs
    ) public onlyRegistrar {
        farmPotatoBatchDetailOf[_id].harvestBatchQuality = _qq;
        farmPotatoBatchDetailOf[_id].batchWeight = _ww;
        farmPotatoBatchDetailOf[_id].oqsHarvest = _oqs;
        farmPotatoBatchDetailOf[_id].collectedAt = block.timestamp;
    }

    function potatoBatchDispatchedFromFarm(
        uint256 _potatoBatchRelationId,
        uint256 _logisticId,
        address _logisticContractAddr,
        uint256 _oqs,
        uint256 _ww
    ) public onlyRegistrar {
        farmPotatoBatchDetailOf[_potatoBatchRelationId]
            .logisticId = _logisticId;
        farmPotatoBatchDetailOf[_potatoBatchRelationId]
            .logisticContractAddr = _logisticContractAddr;
        farmPotatoBatchDetailOf[_potatoBatchRelationId].weightDispatch = _ww;
        farmPotatoBatchDetailOf[_potatoBatchRelationId].oqsDispatch = _oqs;
    }
}
