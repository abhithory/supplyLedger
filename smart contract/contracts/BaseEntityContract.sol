// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface BaseEntityInterface {
    // ======================== farm
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

    struct FarmPotatoBatchDetail {
        uint256 logisticId;
        address logisticContractAddr;
        BatchQuality batchQuality;
        uint256 batchWeight; // in kg
        // oqs - overalll quailty score => 0-100
        uint256 oqsFarm; // oqs when farmer collect potatos batch from farm
        uint256 collectedAt; // time when potatos are collected
        uint256 weightDispatch; // weight at the time of potatos batch dispatched To Local Collector
        uint256 oqsDispatch; // oqs at the time of potatos batch dispatched To Local Collector
    }

    // =====================end farm

    struct PotatoBatchDetail {
        uint256 logisticId;
        address logisticContractAddr;
        uint256 weight;
        uint256 oqs;
        uint256 time;
    }

    struct ChipsBatchDetail {
        uint256 logisticId;
        address logisticContractAddr;
        uint256 weight;
        uint256 time;
    }

    struct ChipsPacketDetail {
        uint256 batchId;
        uint256 weight;
        uint256 time;
    }
}

contract BaseEntityContract is BaseEntityInterface {
    address public admin;
    address public registrar;


    modifier onlyRegistrar() {
        require(msg.sender == registrar, "");
        _;
    }

    constructor(address _admin, address _registrar) {
        admin = _admin;
        registrar = _registrar;
    }
}
