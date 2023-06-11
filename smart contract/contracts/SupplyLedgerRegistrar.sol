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

    constructor(address _ad) {
        admin = _ad;
    }

    modifier onlyAdmin() {
        require(admin == msg.sender, "Only admin can call this function");
        _; // Continue executing the function body
    }

    function registerEntity(
        EntityType _et,
        address _owner,
        uint256 _maxCapacity
    ) public onlyAdmin {
        require(
            !entityDetails[_et][msg.sender].status,
            "Entity already registred for this type"
        );
        address _entityAddress;
        if (_et == EntityType.Farm) {
            Farm _farm = new Farm(_owner, _maxCapacity);
            _entityAddress = address(_farm);
        } else if (_et == EntityType.LC) {
            LocalCollector _LocalCollector = new LocalCollector(
                _owner,
                _maxCapacity
            );
            _entityAddress = address(_LocalCollector);
        } else if (_et == EntityType.Factory) {
            Factory _Factory = new Factory(_owner, _maxCapacity);
            _entityAddress = address(_Factory);
        } else if (_et == EntityType.RS) {
            RetailStore _RetailStore = new RetailStore(_owner, _maxCapacity);
            _entityAddress = address(_RetailStore);
        } else if (_et == EntityType.Logistics) {
            Logistics _Logistics = new Logistics(_owner, _maxCapacity);
            _entityAddress = address(_Logistics);
        }
        entityDetails[_et][_owner] = Entity(_entityAddress, true);
    }

    function getEntityDetails(EntityType _et, address _eAddress) public view returns(Entity memory){
        return entityDetails[_et][_eAddress];
    }
}
