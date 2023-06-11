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
        // uint256 timeAtStart;
        uint256 timeAtLoaded;
        uint256 timeAtDispatched;
        uint256 weightAtArrived;
        uint256 timeAtArrived;
    }

    // struct Document {
    //     uint256 documentId;
    //     string documentType;
    //     string documentName;
    //     string documentHash;
    // }
}

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

    event ShipmentStatusUpdated(uint256 indexed _shipmentId, uint256 status);

    constructor(
        address _sl,
        address _owner,
        uint256 _maxCapacity
    ) BaseEntityContract(_owner, _sl, _maxCapacity) ConfirmedOwner(msg.sender) {
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
            0
        );
        return shipmentId;
    }

    function updateShipmentStatus(
        uint256 _shipmentId,
        uint256 _status
    ) public onlyRegistrar {
        require(_shipmentId <= shipmentId, "Invalid shipment ID");

        if (_status == 1) {
            shipmentOf[_shipmentId].timeAtDispatched = block.timestamp;
            shipmentOf[_shipmentId].status = ShipmentStatus.InTransit;
            CommonEntity _entity = CommonEntity(
                shipmentOf[_shipmentId].destination
            );
            _entity.receivedFromLogistic(
                shipmentOf[_shipmentId].batchId,
                _shipmentId
            );
        } else if (_status == 2) {
            // requestUpdateStaus(_shipmentId);

            // ===================== for local testing

            shipmentOf[_shipmentId].status = ShipmentStatus(2);
            shipmentOf[_shipmentId].timeAtArrived = block.timestamp;
            shipmentOf[_shipmentId].weightAtArrived = 95;
        } else {
            require(false, "status is wrong");
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
            "urlBTC",
            string(
                abi.encodePacked(
                    "https://api-supplyledger.onrender.com/api/",
                    uintToString(_shipmentId)
                )
            )
        );
        req.add("pathBTC", "ID");
        req.add(
            "urlUSD",
            string(
                abi.encodePacked(
                    "https://api-supplyledger.onrender.com/api/",
                    uintToString(_shipmentId)
                )
            )
        );
        req.add("pathUSD", "STATUS");
        req.add(
            "urlEUR",
            string(
                abi.encodePacked(
                    "https://api-supplyledger.onrender.com/api/",
                    uintToString(_shipmentId)
                )
            )
        );
        req.add("pathEUR", "WEIGHT");
        sendChainlinkRequest(req, fee); // MWR API.
    }

    /**
     * @notice Fulfillment function for multiple parameters in a single request
     * @dev This is called by the oracle. recordChainlinkFulfillment must be used.
     */
    function fulfillMultipleParameters(
        bytes32 requestId,
        uint256 idResponse,
        uint256 statusResponse,
        uint256 weightResponse
    ) public recordChainlinkFulfillment(requestId) {
        shipmentOf[idResponse / 100000].status = ShipmentStatus(
            statusResponse / 100000
        );
        shipmentOf[idResponse / 100000].timeAtArrived = block.timestamp;
        shipmentOf[idResponse / 100000].weightAtArrived =
            weightResponse /
            100000;
    }

    // function updateFinalStatus(uint256 _shipmentId, uint256 status) internal {
    //     if (status == 2) {
    //         shipmentOf[_shipmentId].status = ShipmentStatus.Arrived;
    //         shipmentOf[_shipmentId].timeAtUnLoaded = block.timestamp;
    //         CommonEntity _entity = CommonEntity(
    //             shipmentOf[_shipmentId].destination
    //         );
    //         _entity.receivedFromLogistic(
    //             shipmentOf[_shipmentId].batchId,
    //             _shipmentId
    //         );
    //     }
    // }
}
