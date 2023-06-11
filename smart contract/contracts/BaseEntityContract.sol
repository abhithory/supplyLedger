// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface BaseEntityInterface {
    struct BatchDetail {
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
}

contract BaseEntityContract {
    address public admin;
    address public registrar;
    // string public name;
    uint256 public maxCapacity; //kg
    uint256 public currentAllocation; //kg

    modifier isMaxCapacityNotExceeded(uint256 quantityToAdd) {
        require(
            currentAllocation + quantityToAdd <= maxCapacity,
            "Max capacity exceeded."
        );
        _;
    }
    modifier isMinCapacityAvailable(uint256 quantityToDispatch) {
        require(
            currentAllocation >= quantityToDispatch,
            "Insufficient capacity."
        );
        _;
    }

    modifier onlyRegistrar() {
        require(msg.sender == registrar, "");
        _;
    }

    constructor(address _admin, address _registrar, uint256 _maxCapacity) {
        admin = _admin;
        registrar = _registrar;
        maxCapacity = _maxCapacity;
    }
}
