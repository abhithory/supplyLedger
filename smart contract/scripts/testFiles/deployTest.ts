import { ethers } from "hardhat";

async function main() {
  const [registrar] = await ethers.getSigners();

  const TestApiCall = await ethers.getContractFactory("TestApiCall");
  const testApiCall = await TestApiCall.deploy();
  await testApiCall.deployed();

  console.log(
    `contract deployed to ${testApiCall.address}`
  );

    const contractABI = [
      {
        constant: false,
        inputs: [
          {
            name: "_to",
            type: "address",
          },
          {
            name: "_value",
            type: "uint256",
          },
        ],
        name: "transfer",
        outputs: [
          {
            name: "",
            type: "bool",
          },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
    ];
    const contract = new ethers.Contract("0x326C977E6efc84E512bB9C30f76E30c160eD06FB", contractABI, registrar);
  
    const amount = ethers.utils.parseUnits("1", "18");
  
    const tx = await contract.transfer(testApiCall.address, amount);
    await tx.wait();
  
    console.log("1 link Transfered complete!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
