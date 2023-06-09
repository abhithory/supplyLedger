// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// import "hardhat/console.sol";

interface FarmStructs{
 
     enum Size {
        Small,
        Medium,
        Large
    }
    enum Shape {
        Regular,
        Irregular
    }
    enum Color {
        LightYellow,
        Golden,
        Russet,
        RedSkinned,
        WhiteSkinned
    }
    enum ExternalQuality {
        NoDefects,
        MinorDefects,
        MajorDefects
    }
    enum InternalQuality {
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
        Color color;
        ExternalQuality externalQuality;
        InternalQuality internalQuality;
        Weight weight;
    }   
}
contract Farm is FarmStructs {
    string public id;
    string public name;
    string public location;
    address public owner;
    address public registrar;

    // one batch which containes many potatos
    struct FarmPotatoBatchDetail {
        uint256 logisticId;
        BatchQuality batchQuality;
        uint256 batchWeight; // in kg
        // oqs - overalll quailty score => 0-100
        uint256 oqsFarm;   // oqs when farmer collect potatos batch from farm 
        uint256 collectedAt;  // time when potatos are collected
        uint256 weightDispatch;  // weight at the time of potatos batch dispatched To Local Collector
        uint256 oqsDispatch;  // oqs at the time of potatos batch dispatched To Local Collector
    }

    mapping(uint256 => FarmPotatoBatchDetail) public farmPotatoBatchDetailOf; 

    constructor(string memory _id, address _owner) {
        id = _id;
        owner = _owner;
        registrar = msg.sender;
    }

    modifier onlyRegistrar() {
        require(msg.sender == registrar, "");
        _;
    }

    function potatoBatchCollectedAtFarm(
        uint256 _id,
        BatchQuality memory _qq,
        uint256 _ww,
        uint256 _oqs
    ) public onlyRegistrar {
        farmPotatoBatchDetailOf[_id].batchQuality = _qq;
        farmPotatoBatchDetailOf[_id].batchWeight = _ww;
        farmPotatoBatchDetailOf[_id].oqsFarm = _oqs;
        farmPotatoBatchDetailOf[_id].collectedAt = block.timestamp;
    }

    function potatoBatchDispatchedFromFarm(
        uint256 _potatoBatchRelationId,
        uint256 _logisticId,
        uint256 _oqs,
        uint256 _ww
    ) public onlyRegistrar {
        farmPotatoBatchDetailOf[_potatoBatchRelationId].logisticId = _logisticId;
        farmPotatoBatchDetailOf[_potatoBatchRelationId].weightDispatch = _ww;
        farmPotatoBatchDetailOf[_potatoBatchRelationId].oqsDispatch = _oqs;
        // farmPotatoBatchDetailOf[_id].dispatchedAt = block.timestamp;
        // farmPotatoBatchDetailOf[_id].dispatchedTo = _dispatedTo;
    }
}
