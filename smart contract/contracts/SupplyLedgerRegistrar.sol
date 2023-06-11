// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./Farm.sol";
import "./LocalCollector.sol";
import "./RetailStore.sol";
import "./Factory.sol";
import "./Logistics.sol";

contract SupplyLedgerRegistrar {
    enum EntityType {
        Farm,
        LC,
        Factory,
        RS,
        Logistics
    }
    struct Entity {
        address contractAddr;
        bool status;
    }
    mapping(EntityType => mapping(address => Entity)) public entityDetails;
    address public admin;
    address public supplyLedgerContractAddr;

    constructor(address _sl) {
        admin = msg.sender;
        supplyLedgerContractAddr = _sl;
    }

    modifier onlyAdmin() {
        require(admin == msg.sender, "Only admin can call this function");
        _;
    }

    function registerEntity(
        EntityType _et,
        address _admin,
        uint256 _maxCapacity,
        uint256 _maxChipsPacketBatchCapacity
    ) public onlyAdmin {
        require(
            !entityDetails[_et][msg.sender].status,
            "Entity already registred for this type"
        );
        address _entityAddress;
        if (_et == EntityType.Farm) {
            Farm _farm = new Farm(supplyLedgerContractAddr,_admin, _maxCapacity);
            _entityAddress = address(_farm);
        } else if (_et == EntityType.LC) {
            LocalCollector _LocalCollector = new LocalCollector(
                supplyLedgerContractAddr,
                _admin,
                _maxCapacity
            );
            _entityAddress = address(_LocalCollector);
        } else if (_et == EntityType.Factory) {
            Factory _Factory = new Factory(supplyLedgerContractAddr,_admin, _maxCapacity,_maxChipsPacketBatchCapacity);
            _entityAddress = address(_Factory);
        } else if (_et == EntityType.RS) {
            RetailStore _RetailStore = new RetailStore(supplyLedgerContractAddr,_admin, _maxCapacity);
            _entityAddress = address(_RetailStore);
        } else if (_et == EntityType.Logistics) {
            Logistics _Logistics = new Logistics(supplyLedgerContractAddr,_admin, _maxCapacity);
            _entityAddress = address(_Logistics);
        }
        entityDetails[_et][_admin] = Entity(_entityAddress, true);
    }

    function getEntityDetails(EntityType _et, address _eAddress) public view returns(Entity memory){
        return entityDetails[_et][_eAddress];
    }
}
