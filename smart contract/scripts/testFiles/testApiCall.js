// import { ethers } from "hardhat";

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
    callFunctions(testApiCall.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.



async function callFunctions(testApiContractAddr) {

  let testApiCall;
  async function main() {
    const TestApiCall = await ethers.getContractFactory("TestApiCall");
    testApiCall = await TestApiCall.attach(testApiContractAddr);
    await getVol();
    // await requestVolumeData()
    await getVolLoop();
  }

  const waitForSecs = ms => new Promise(res => setTimeout(res, ms));


  async function getVol() {
    const btc = await testApiCall.id();
    const status = await testApiCall.status();
    const weight = await testApiCall.weight();
    console.log(btc, status, weight)
  }

  async function getVolLoop() {
    while (true) {
      await requestVolumeData();
      await waitForSecs(10000)
      await getVol();
    }
  }

  async function requestVolumeData() {
    // await testApiCall.requestVolumeData();
    // const _v = await testApiCall.requestVolumeData({  gasLimit: 1000000  });
    const _v = await testApiCall.requestMultipleParameters(13);
    console.log("_vol");
    const _vol = await _v.wait();
    console.log("_vol");
  }



  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main()

}


main()
