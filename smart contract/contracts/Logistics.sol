// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "./BaseEntityContract.sol";

contract CommonEntity {
    function receivedFromLogistic(
        uint256 _logisticId,
        uint256 _weight
    ) public {}
}

interface BaseLogisticsInterface {
    enum ShipmentStatus {
        // NotLoaded,
        Loaded,
        InTransit,
        // Dispatched,
        // Arrived25,
        // Arrived50,
        // Arrived75,
        Arrived
        // UnLoaded
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

// with external apis
// contract Logistics is BaseLogisticsInterface, BaseEntityContract {
//     uint256 public shipmentId;
//     mapping(uint256 => Shipment) public shipmentOf;

//     constructor(address _owner) BaseEntityContract(_owner, msg.sender) {}

//     function createShipment(
//         uint256 _batchId,
//         address _origin,
//         address _destination
//     ) public onlyRegistrar returns (uint256) {
//         shipmentId++;
//         shipmentOf[shipmentId] = Shipment(
//             _batchId,
//             ShipmentStatus.Loaded,
//             _origin,
//             _destination,
//             block.timestamp,
//             0,
//             0,
//             0,
//             0
//         );
//         return shipmentId;
//     }

//     function updateShipmentStatus(
//         uint256 _shipmentId,
//         uint256 _status
//     )
//         public
//         // uint256 _weight
//         onlyRegistrar
//     {
//         require(_shipmentId <= shipmentId, "Invalid shipment ID");
//         // shipmentOf[_shipmentId].status = _status;

//         if (_status == 1) {
//             shipmentOf[_shipmentId].timeAtLoaded = block.timestamp;
//             shipmentOf[_shipmentId].status = ShipmentStatus.InTransit;
//         } else {
//             shipmentOf[_shipmentId].status = ShipmentStatus.Arrived;
//             shipmentOf[_shipmentId].timeAtUnLoaded = block.timestamp;
//             CommonEntity _entity = CommonEntity(
//                 shipmentOf[_shipmentId].destination
//             );
//             _entity.receivedFromLogistic(
//                 shipmentOf[_shipmentId].batchId,
//                 _shipmentId
//             );
//         }
//     }
// }

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract Logistics is
    ChainlinkClient,
    ConfirmedOwner,
    BaseLogisticsInterface,
    BaseEntityContract
{
    using Chainlink for Chainlink.Request;

    uint256 public volume;
    bytes32 private jobId;
    uint256 private fee;

    uint256 public shipmentId;
    mapping(uint256 => Shipment) public shipmentOf;

    // event ShipmentStatusUpdated(uint256 indexed _shipmentId, uint256 status);

    constructor(
        address _owner
    ) BaseEntityContract( _owner, msg.sender) ConfirmedOwner(msg.sender) {
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
        setChainlinkOracle(0x40193c8518BB267228Fc409a613bDbD8eC5a97b3);
        jobId = "53f9755920cd451a8fe46f5087468395";
        fee = 1 * 10 ** 17; // 0,1 * 10**18 (Varies by network and job)
    }

    function createShipment(
        uint256 _batchId,
        address _origin,
        address _destination
    ) public onlyRegistrar returns (uint256) {
        shipmentId++;
        shipmentOf[shipmentId] = Shipment(
            _batchId,
            ShipmentStatus.Loaded,
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
        uint256 _status
    )
        public
        onlyRegistrar
    {
        require(_shipmentId <= shipmentId, "Invalid shipment ID");

        if (_status == 1) {
            shipmentOf[_shipmentId].timeAtLoaded = block.timestamp;
            shipmentOf[_shipmentId].status = ShipmentStatus.InTransit;
        } else {
            requestUpdateStaus(_shipmentId);
        }
    }

    function uintToString(uint number) public pure returns (string memory) {
        if (number == 0) {
            return "0";
        }
        uint length;
        uint temp = number;

        while (temp != 0) {
            length++;
            temp /= 10;
        }

        bytes memory buffer = new bytes(length);

        while (number != 0) {
            length -= 1;
            buffer[length] = bytes1(uint8(48 + (number % 10)));
            number /= 10;
        }

        return string(buffer);
    }

    function requestUpdateStaus(uint256 _shipmentId) public {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfillMultipleParameters.selector
        );

        req.add(
            "urlID",
            string(abi.encodePacked("https://api-supplyledger.onrender.com/api/", uintToString(_shipmentId)))
        );
        req.add("pathID", "ID");
        req.add(
            "urlSTATUS",
            string(abi.encodePacked("https://api-supplyledger.onrender.com/api/", uintToString(_shipmentId)))
        );
        req.add("pathStatus", "STATUS");
        sendChainlinkRequest(req, fee); // MWR API.
    }

    function fulfillMultipleParameters(
        bytes32 requestId,
        uint256 shipmentIdResponse,
        uint256 statusResponse
    ) public recordChainlinkFulfillment(requestId) {
        // emit ShipmentStatusUpdated(shipmentIdResponse, statusResponse);
        updateFinalStatus(shipmentIdResponse, statusResponse);
    }

    function updateFinalStatus(uint256 _shipmentId, uint256 status) internal {
        if (status == 4) {
            shipmentOf[_shipmentId].status = ShipmentStatus.Arrived;
            shipmentOf[_shipmentId].timeAtUnLoaded = block.timestamp;
            CommonEntity _entity = CommonEntity(
                shipmentOf[_shipmentId].destination
            );
            _entity.receivedFromLogistic(
                shipmentOf[_shipmentId].batchId,
                _shipmentId
            );
        }
    }
}
