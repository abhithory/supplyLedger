import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("SupplyLeger", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function supplyLegerFixture() {
        // Contracts are deployed using the first signer/account by default
        const [registrar, farm, localCollector, retailStore] = await ethers.getSigners();

        const SupplyLeger = await ethers.getContractFactory("SupplyLeger");
        const supplyLeger = await SupplyLeger.deploy();

        return { supplyLeger, registrar, farm, localCollector, retailStore };
    }

    describe("Deployment + Registrartion", function () {
        it("Should set the right registrar", async function () {
            const { supplyLeger, registrar } = await loadFixture(supplyLegerFixture);
            //   expect(await lock.unlockTime()).to.equal(unlockTime);
        });

        it("Should registrer right farm", async function () {
            const { supplyLeger, farm } = await loadFixture(supplyLegerFixture);
            expect((await supplyLeger.farmStatus(farm.address)).status).to.equal(false);
            await supplyLeger.registerFarm("FARM001", farm.address);
            expect((await supplyLeger.farmStatus(farm.address)).status).to.equal(true);
        });

        it("Should registrer right local collector", async function () {
            const { supplyLeger, localCollector } = await loadFixture(supplyLegerFixture);
            expect((await supplyLeger.lCStatus(localCollector.address)).status).to.equal(false);
            await supplyLeger.registerLC("Collector001", localCollector.address);
            expect((await supplyLeger.lCStatus(localCollector.address)).status).to.equal(true);
        });

        it("Should registrer right Retail Store", async function () {
            const { supplyLeger, retailStore } = await loadFixture(supplyLegerFixture);
            expect((await supplyLeger.rSStatus(retailStore.address)).status).to.equal(false);
            await supplyLeger.registerRS("Retail001", retailStore.address);
            expect((await supplyLeger.rSStatus(retailStore.address)).status).to.equal(true);
        });
    });

    describe("Storing + Retriving Details from Farm Contract", function () {

        it("Should add food item in farm", async function () {
            const { supplyLeger, farm } = await loadFixture(supplyLegerFixture);
            await supplyLeger.registerFarm("FARM001", farm.address);
            const farmEntity = await supplyLeger.farmStatus(farm.address);
            expect(farmEntity.status).to.equal(true);

            const _id = await supplyLeger.foodItemId();
            await supplyLeger.connect(farm).addFoodItemsAtFarm();

            const FarmContract = await ethers.getContractFactory("Farm");
            const farmContract = FarmContract.attach(farmEntity.contractAddr);

            const _farmData = await farmContract.itemDetailFromFarm(_id);
            // console.log('====================================');
            // console.log(_farmData);
            // console.log('====================================');
        });
    });

});
