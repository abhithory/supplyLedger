// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


contract CommonEntity{
    function receivedFromLogistic(uint256 _logisticId, uint256 _weight) public{}
}

// Realtime checking with external apis of status of shipment
contract Logistics {
    string public id;
    string public name;
    string public location;
    address public owner;
    address public registrar;

    enum ShipmentStatus {
        NotLoaded,
        Loaded,
        InTransit,
        // Dispatched,
        // Arrived25,
        // Arrived50,
        // Arrived75,
        Arrived,
        UnLoaded
    }
    // struct Document {
    //     uint256 documentId;
    //     string documentType;
    //     string documentName;
    //     string documentHash;
    // }
    struct Shipment {
        uint256 shipmentId;
        ShipmentStatus status;
        address origin;
        address destination;
        uint256 timeAtStart;
        uint256 timeAtLoaded;
        uint256 timeAtDispatched;
        uint256 timeAtArrived;
        uint256 timeAtUnLoaded;
        //  Document[] docs;
    }
    mapping(uint256 => Shipment) public shipments;
    uint256 public shipmentId;

    constructor(string memory _id, address _owner) {
        id = _id;
        owner = _owner;
        registrar = msg.sender;
    }

    modifier onlyRegistrar() {
        require(
            msg.sender == registrar,
            "only registrar can call this function"
        );
        _;
    }

    function createShipment(
        address _origin,
        address _destination
    ) public onlyRegistrar returns (uint256) {
        shipmentId++;
        shipments[shipmentId] = Shipment(
            shipmentId,
            ShipmentStatus.NotLoaded,
            _origin,
            _destination,
            block.timestamp,
            0,
            0,
            0,
            0
        );
        return shipmentId;
    }

    function updateShipmentStatus(
        uint256 _shipmentId,
        ShipmentStatus _status,
        uint256 _weight
    ) public onlyRegistrar {
        require(_shipmentId <= shipmentId, "Invalid shipment ID");
        shipments[_shipmentId].status = _status;

        if (_status == ShipmentStatus.Loaded) {
            shipments[_shipmentId].timeAtLoaded = block.timestamp;
        } else if (_status == ShipmentStatus.InTransit) {
            shipments[_shipmentId].timeAtDispatched = block.timestamp;
        } else if (_status == ShipmentStatus.Arrived) {
            shipments[_shipmentId].timeAtArrived = block.timestamp;
        } else if (_status == ShipmentStatus.UnLoaded) {
            require(_weight >= 0, "wight of products should be greater than zero");
            shipments[_shipmentId].timeAtUnLoaded = block.timestamp;

            CommonEntity _entity = CommonEntity(shipments[_shipmentId].destination);
            _entity.receivedFromLogistic(_shipmentId,_weight);
        }
    }

    // function uploadDocument(uint256 _shipmentId, string memory _documentType, string memory _documentName, string memory _documentHash) public {
    //     require(_shipmentId < nextShipmentId, "Invalid shipment ID");
    //     uint256 documentId = nextDocumentId++;
    //     shipmentDocuments[_shipmentId].push(Document(documentId, _documentType, _documentName, _documentHash));
    // }
}
