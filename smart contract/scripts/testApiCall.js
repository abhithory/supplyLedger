// import { ethers } from "hardhat";

const testApiContractAddr = "0x09E7dd0270841c137f25c6512EAD17daF1d639d8";

let testApiCall;
async function main() {
  const TestApiCall = await ethers.getContractFactory("TestApiCall");
  testApiCall = await TestApiCall.attach(testApiContractAddr);
  await getVol();  
  // await requestVolumeData()
  await getVolLoop();
}

async function getVol(){
  const btc = await testApiCall.btc();
  const usd = await testApiCall.usd();
  const eur = await testApiCall.eur();

  console.log(btc,usd,eur);
}

async function getVolLoop(){
  const start = new Date();
  while(true){
    await getVol();

      console.log(new Date() - start);
  }
}

async function requestVolumeData(){
  // await testApiCall.requestVolumeData();
  // const _v = await testApiCall.requestVolumeData({  gasLimit: 1000000  });
  const _v = await testApiCall.requestMultipleParameters();
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
