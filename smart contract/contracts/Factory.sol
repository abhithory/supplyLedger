// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "./BaseEntityContract.sol";

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
        Gram100,
        Gram200,
        Gram500
    }

    enum PackagingMaterial {
        PlasticBags,
        CardboardBoxes
    }
    struct ChipsDetail {
        Flavor flavor;
        Texture texture;
    }

    struct ProcessDetails {
        uint256 cookingTemperature; // *C
        Ingredient[] ingredients;
    }

    struct PackagingDetails {
        PackagingMaterial packagingMaterial;
        PackageSize packageSize;
    }

    struct ChipsPacketBatch {
        uint256 potatoBatchId;
        ChipsDetail chipsDetail;
        ProcessDetails processDetails;
        PackagingDetails packagingDetails;
        uint256 totalPackets;
        uint256 totalWeight; // kg * 1000
        uint256 productionDate;
        uint256 shelfLife; // mounths
    }
}

contract Factory is BaseEntityContract, FactoryInterface, BaseEntityInterface {
    mapping(uint256 => ChipsPacketBatch) public chipsPacketBatchOf;
    mapping(uint256 => BatchDetail) public ArrivedBatchDetails;
    mapping(uint256 => BatchDetail) public DispatchedChipsPacketBatchDetails;

    mapping(uint256 => bool) public areChipsPreparedFromPotatoBatchOf;

    uint256 public maxChipsPacketBatchCapacity; // kg * 1000
    uint256 public currentChipsPacketBatchAllocation; // kg * 1000

    constructor(
                address _sl,
        address _owner,
        uint256 _maxPotatoBatchCapacity,
        uint256 _maxChipsPacketBatchCapacity
    ) BaseEntityContract(_owner, _sl, _maxPotatoBatchCapacity) {
        maxChipsPacketBatchCapacity = _maxChipsPacketBatchCapacity;
    }

    function potatoBatchStoredAtFactory(
        uint256 _potatoBatchId,
        uint256 _weight,
        uint256 _oqs
    ) public onlyRegistrar isMaxCapacityNotExceeded(_weight) {
        require(
            ArrivedBatchDetails[_potatoBatchId].weight == 0,
            "Potato batch already stored"
        );
        ArrivedBatchDetails[_potatoBatchId].weight = _weight;
        ArrivedBatchDetails[_potatoBatchId].oqs = _oqs;
        ArrivedBatchDetails[_potatoBatchId].time = block.timestamp;
    }

    // TODO: check the pottao batch is already prepared or not/ is this factory has this potao batch??
    function chipsBatchPrepared(
        uint256 chipsPacketBatchId,
        ChipsPacketBatch memory _details
    )
        public
        onlyRegistrar
        isMinCapacityAvailable(
            ArrivedBatchDetails[_details.potatoBatchId].weight
        )
    {
        require(
            ArrivedBatchDetails[_details.potatoBatchId].weight >= 0,
            "There is no potato batch related to this potato batch id in factory"
        );
        require(
            !areChipsPreparedFromPotatoBatchOf[_details.potatoBatchId],
            "Potato batch is already used for preparing chips in factory"
        );
        require(
            maxChipsPacketBatchCapacity >=
                currentChipsPacketBatchAllocation + _details.totalWeight,
            "Max storage capacity of chips packet batch exceeded"
        );
        currentChipsPacketBatchAllocation += _details.totalWeight;
        chipsPacketBatchOf[chipsPacketBatchId] = _details;
        chipsPacketBatchOf[chipsPacketBatchId].productionDate = block.timestamp;
    }

    function dispactchChipsPacketBatchToRS(
        uint256 _chipsPacketBatchId,
        uint256 _logisticId,
        address _logisticContractAddr,
        uint256 _weight,
        uint256 _oqc
    ) public onlyRegistrar {
        require(
            currentChipsPacketBatchAllocation >= _weight,
            "Insufficient capacity of chips packet batch."
        );
        require(
            DispatchedChipsPacketBatchDetails[_chipsPacketBatchId].weight == 0,
            "chips packet batch is already Dispatched"
        );
        currentChipsPacketBatchAllocation -= _weight;
        DispatchedChipsPacketBatchDetails[_chipsPacketBatchId] = BatchDetail(
            _logisticId,
            _logisticContractAddr,
            _weight,
            _oqc,
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
