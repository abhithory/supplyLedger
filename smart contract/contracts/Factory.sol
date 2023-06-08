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

    mapping(uint256 => ChipsBatch) public chipsBatchOf;

    struct PotatoBatchDetail {
        uint256 logisticId;
        uint256 weight;
        uint256 oqs;
        uint256 time;
    }

    struct ChipsBatchDetail {
        uint256 logisticId;
        uint256 weight;
        uint256 time;
    }

    mapping(uint256 => PotatoBatchDetail) public ArrivedBatchDetails;
    mapping(uint256 => ChipsBatchDetail) public DispatchedBatchDetails;

    constructor(string memory _id, address _owner) {
        id = _id;
        owner = _owner;
        registrar = msg.sender;
    }

    modifier onlyRegistrar() {
        require(msg.sender == registrar, "");
        _;
    }

    function potatoBatchStoredAtFactory(
        uint256 _batchDetailsId,
        uint256 _weight,
        uint256 _oqs
    ) public onlyRegistrar {
        ArrivedBatchDetails[_batchDetailsId].weight = _weight;
        ArrivedBatchDetails[_batchDetailsId].oqs = _oqs;
        ArrivedBatchDetails[_batchDetailsId].time = block.timestamp;
    }

    function chipsPrepared(
        uint256 chipsBatchId,
        ChipsBatch memory _details
    ) public onlyRegistrar {
        chipsBatchOf[chipsBatchId] = _details;
        chipsBatchOf[chipsBatchId].productionDate = block.timestamp;
    }

    function dispactchChipsBatchToRS(
        uint256 _chipsPacketBatchId,
        uint256 _logisticId,
        uint256 _weight
    ) public onlyRegistrar {
        DispatchedBatchDetails[_chipsPacketBatchId] = ChipsBatchDetail(
            _logisticId,
            _weight,
            block.timestamp
        );
    }

    function receivedFromLogistic(
        uint256 _batchId,
        uint256 _logisticId
    ) public {
        ArrivedBatchDetails[_batchId].logisticId = _logisticId;
    }
}
