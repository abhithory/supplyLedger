// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// import "hardhat/console.sol";

import "./BaseEntityContract.sol";

interface BaseFactoryInterface {
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

    enum PackagingSize {
        Garm100,
        Gram200,
        Gram500
    }

    struct ChipsDetail {
        Flavor flavor;
        Texture texture;
        // SpecialFeature[] specialFeatures;
    }

    struct ProcessDetails {
        uint256 cookingTemperature; // *C
        Ingredient[] ingredients;
        // uint256 moistureContent;
    }

    struct PackagingDetails {
        PackagingMaterial packagingMaterial;
        PackagingSize packageSize;
    }

    struct ChipsBatch {
        ChipsDetail chipsDetail;
        ProcessDetails processDetails;
        PackagingDetails packagingDetails;
        uint256 totalPackets;
        uint256 totalWeight; // kg
        uint256 productionDate;
        uint256 shelfLife; // mounths
    }
}

contract Factory is BaseEntityContract, BaseFactoryInterface {
    mapping(uint256 => ChipsBatch) public chipsBatchOf;
    mapping(uint256 => PotatoBatchDetail) public ArrivedBatchDetails;
    mapping(uint256 => ChipsBatchDetail) public DispatchedBatchDetails;

    constructor(
        string memory _id,
        address _owner
    ) BaseEntityContract(_id, _owner, msg.sender) {}

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
        uint256 _chipsPacketBatchRelationId,
        uint256 _logisticId,
        address _logisticContractAddr,
        uint256 _weight
    ) public onlyRegistrar {
        DispatchedBatchDetails[_chipsPacketBatchRelationId] = ChipsBatchDetail(
            _logisticId,
            _logisticContractAddr,
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

    function getChipsBatchFactoryProccessingDetails(
        uint256 batchId
    ) public view returns (ChipsBatch memory) {
        return chipsBatchOf[batchId];
    }

    function getPotatoBatchArrivedDetail(
        uint256 potatoBatchId
    ) public view returns (PotatoBatchDetail memory) {
        return ArrivedBatchDetails[potatoBatchId];
    }

    function getChipsBatchDispatchDetail(
        uint256 chipsBatchId
    ) public view returns (ChipsBatchDetail memory) {
        return DispatchedBatchDetails[chipsBatchId];
    }
}
