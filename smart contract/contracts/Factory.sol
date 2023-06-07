// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// import "hardhat/console.sol";

interface FactoryInterface {
    enum Flavor {
        Barbecue,
        SourCreamAndOnion,
        Salted
    }

    enum Texture {
        Crispy,
        Crunchy
    }

    enum SpecialFeature {
        GlutenFree,
        LowFat
    }

    enum Ingredient {
        Potatoes,
        VegetableOil,
        Salt,
        NaturalFlavors,
        Spices,
        CheesePowder,
        OnionPowder,
        GarlicPowder
    }

    enum PackageSize {
        Small,
        Medium,
        Large
    }

    enum PackagingMaterial {
        PlasticBags,
        CardboardBoxes
    }

    struct ChipsDetail {
        Flavor flavor;
        Texture texture;
        SpecialFeature[] specialFeatures;
    }

    struct ProcessDetails {
        uint256 cookingTemperature;
        string[] ingredients;
        uint256 moistureContent;
    }

    struct PackagingDetails {
        PackagingMaterial packagingMaterial;
        uint256 packageSize;
    }

    struct ChipsBatch {
        ChipsDetail chipsDetail;
        ProcessDetails processDetails;
        PackagingDetails packagingDetails;
        uint256 totalPackets;
        uint256 totalWeight;
        uint256 productionDate;
        uint256 expireDate;
    }
}

contract Factory is FactoryInterface {
    string public id;
    string public name;
    string public location;
    address public owner;
    address public registrar;

    struct PotatoBatchShipment {
        uint256 weightReach;
        uint256 oqsReach;
        uint256 reachedAt;
    }


    struct ChipsBatchShipment {
        uint256 weightDispatch;
        uint256 dispatchedAt;
        address dispatchedTo;
    }

    mapping(uint256 => PotatoBatchShipment) public potatoBatchShipmentFromFactory;
    mapping(uint256 => ChipsBatchShipment) public chipsShipmentDetails;

    mapping(uint256 => ChipsBatch) public chipsBatchOf;


    constructor(string memory _id, address _owner) {
        id = _id;
        owner = _owner;
        registrar = msg.sender;
    }

    modifier onlyRegistrar() {
        require(msg.sender == registrar, "");
        _;
    }

    function potatoBatchCollectedAtFactory(
        uint256 _id,
        uint256 _oqs,
        uint256 _ww
    ) public onlyRegistrar {
        potatoBatchShipmentFromFactory[_id] = PotatoBatchShipment(
            _ww,
            _oqs,
            block.timestamp
        );
    }

    function chipsPrepared(uint256 chipsBatchId,ChipsBatch memory _details) public onlyRegistrar {
        chipsBatchOf[chipsBatchId] = _details;
        chipsBatchOf[chipsBatchId].productionDate = block.timestamp;
    }

    function dispactchChipsBatchToRS(uint256 chipsBatchId, address _rs, uint256 _ww) public onlyRegistrar {
        chipsShipmentDetails[chipsBatchId] = ChipsBatchShipment(_ww,block.timestamp,_rs);
    }
}
