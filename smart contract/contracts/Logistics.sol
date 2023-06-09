// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "./BaseEntityContract.sol";


contract CommonEntity{
    function receivedFromLogistic(uint256 _logisticId, uint256 _weight) public{}
}

interface BaseLogisticsInterface{
    
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

        struct Shipment {
        uint256 batchId;
        ShipmentStatus status;
        address origin;
        address destination;
        uint256 timeAtStart;
        uint256 timeAtLoaded;
        uint256 timeAtDispatched;
        uint256 timeAtArrived;
        uint256 timeAtUnLoaded;
    }

        // struct Document {
    //     uint256 documentId;
    //     string documentType;
    //     string documentName;
    //     string documentHash;
    // }

}

// Realtime checking with external apis of status of shipment
contract Logistics is BaseLogisticsInterface, BaseEntityContract {


    uint256 public shipmentId;
    mapping(uint256 => Shipment) public shipmentOf;

    constructor(string memory _id, address _owner) BaseEntityContract(_id,_owner, msg.sender) {}


    function createShipment(
        uint256 _batchId,
        address _origin,
        address _destination
    ) public onlyRegistrar returns (uint256) {
        shipmentId++;
        shipmentOf[shipmentId] = Shipment(
            _batchId,
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
        ShipmentStatus _status
        // uint256 _weight
    ) public onlyRegistrar {
        require(_shipmentId <= shipmentId, "Invalid shipment ID");
        shipmentOf[_shipmentId].status = _status;

        if (_status == ShipmentStatus.Loaded) {
            shipmentOf[_shipmentId].timeAtLoaded = block.timestamp;
        } else if (_status == ShipmentStatus.InTransit) {
            shipmentOf[_shipmentId].timeAtDispatched = block.timestamp;
        } else if (_status == ShipmentStatus.Arrived) {
            shipmentOf[_shipmentId].timeAtArrived = block.timestamp;
        } else if (_status == ShipmentStatus.UnLoaded) {
            // require(_weight > 0, "wight of products should be greater than zero");
            shipmentOf[_shipmentId].timeAtUnLoaded = block.timestamp;

            CommonEntity _entity = CommonEntity(shipmentOf[_shipmentId].destination);
            _entity.receivedFromLogistic(shipmentOf[_shipmentId].batchId,_shipmentId);
        }
    }

    // function uploadDocument(uint256 _shipmentId, string memory _documentType, string memory _documentName, string memory _documentHash) public {
    //     require(_shipmentId < nextShipmentId, "Invalid shipment ID");
    //     uint256 documentId = nextDocumentId++;
    //     shipmentDocuments[_shipmentId].push(Document(documentId, _documentType, _documentName, _documentHash));
    // }
}
