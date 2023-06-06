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


    struct FarmItem {
        BatchQuality harvestQuality;
        // oqs - overalll quailty score
        uint256 oqsPicking; // 0-100
        uint256 collectedAt;
        uint256 oqsDispatch;
        uint256 dispatchedAt;
        address dispatchedTo;
    }

    mapping(uint256 => FarmItem) public itemDetailFromFarm;

    constructor(string memory _id, address _owner) {
        id = _id;
        owner = _owner;
        registrar = msg.sender;
    }

    modifier onlyRegistrar() {
        require(msg.sender == registrar, "");
        _;
    }

    function foodItemsCollectedAtFarm(
        uint256 _id,
        BatchQuality memory _qq,
        uint256 _oqs
    ) public onlyRegistrar {
        itemDetailFromFarm[_id].harvestQuality = _qq;
        itemDetailFromFarm[_id].oqsPicking = _oqs;
        itemDetailFromFarm[_id].collectedAt = block.timestamp;
    }

    function foodItemDispactedFromFarm(
        uint256 _id,
        uint256 _oqs,
        address _dispatedTo
    ) public onlyRegistrar {
        itemDetailFromFarm[_id].oqsDispatch = _oqs;
        itemDetailFromFarm[_id].dispatchedAt = block.timestamp;
        itemDetailFromFarm[_id].dispatchedTo = _dispatedTo;
    }
}
