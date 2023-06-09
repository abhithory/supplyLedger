// import { ethers } from "hardhat";

const testApiContractAddr = "0x5284B002b97A325927C6957fcc35702d0b9486f0";

let testApiCall;
async function main() {
  const TestApiCall = await ethers.getContractFactory("TestApiCall");
  testApiCall = await TestApiCall.attach(testApiContractAddr);
  await getVol();  
  await requestVolumeData()
  await getVolLoop();
}

async function getVol(){
  const _vol = await testApiCall.volume();
  console.log(_vol);
}

async function getVolLoop(){
  const start = new Date();
  while(true){
    let _vol = await testApiCall.volume();
    console.log(Number(_vol));
    if (Number(_vol) != 0) {

      console.log(new Date() - start);
      break;
    }
  }
}

async function requestVolumeData(){
  // await testApiCall.requestVolumeData();
  // const _v = await testApiCall.requestVolumeData({  gasLimit: 1000000  });
  const _v = await testApiCall.requestVolumeData();
  console.log("_vol");
  const _vol = await _v.wait();
  console.log("_vol");
}



// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
