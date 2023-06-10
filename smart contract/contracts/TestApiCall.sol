//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

/**
 * Request testnet LINK and ETH here: https://faucets.chain.link/
 * Find information on LINK Token Contracts and get the latest ETH and LINK faucets here: https://docs.chain.link/docs/link-token-contracts/
 */

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES HARDCODED VALUES FOR CLARITY.
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */

contract TestApiCall is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    bytes32 private jobId;
    uint256 private fee;

    // multiple params returned in a single oracle response
    uint256 public id;
    uint256 public status;
    uint256 public weight;

    event RequestMultipleFulfilled(
        bytes32 indexed requestId,
        uint256 btc,
        uint256 usd,
        uint256 eur
    );

    /**
     * @notice Initialize the link token and target oracle
     * @dev The oracle address must be an Operator contract for multiword response
     *
     *
     * Sepolia Testnet details:
     * Link Token: 0x326C977E6efc84E512bB9C30f76E30c160eD06FB
     * Oracle: 0x40193c8518BB267228Fc409a613bDbD8eC5a97b3 (Chainlink DevRel)
     * jobId: 53f9755920cd451a8fe46f5087468395
     *
     */
    constructor() ConfirmedOwner(msg.sender) {
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
        setChainlinkOracle(0x40193c8518BB267228Fc409a613bDbD8eC5a97b3);
        jobId = "53f9755920cd451a8fe46f5087468395";
        fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
    }

    /**
     * @notice Request mutiple parameters from the oracle in a single transaction
     */

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

    function requestMultipleParameters(uint256 _shipmentId) public {
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
        id = idResponse/100000;
        status = statusResponse/100000;
        weight = weightResponse/100000;
    }
}
