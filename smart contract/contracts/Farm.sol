// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// import "hardhat/console.sol";
import "./BaseEntityContract.sol";

contract Farm is BaseEntityContract {

    mapping(uint256 => FarmPotatoBatchDetail) public farmPotatoBatchDetailOf;

    constructor(string memory _id, address _owner) BaseEntityContract(_id,_owner, msg.sender)  {}

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
        farmPotatoBatchDetailOf[_potatoBatchRelationId]
            .logisticId = _logisticId;
        farmPotatoBatchDetailOf[_potatoBatchRelationId].weightDispatch = _ww;
        farmPotatoBatchDetailOf[_potatoBatchRelationId].oqsDispatch = _oqs;
    }
}
