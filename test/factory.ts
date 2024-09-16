import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
describe("MultisigFactory", function () {
    async function deployFactoryContract() {

        const [owner, otherAccount, addr1, addr2, addr3] = await ethers.getSigners();
        const factory = await ethers.getContractFactory("MultisigFactory");
        const factoryAddress = await factory.deploy();
        return { factoryAddress, owner, otherAccount, addr1, addr2 }
    }

    describe("Create Multisig", function () {
        it("Should revert if quorum is not more than 1", async function () {
            const { factoryAddress, addr1, addr2 } = await loadFixture(deployFactoryContract);

            await expect((factoryAddress.createMultisig(1, [addr1.address, addr2.address]))).to.be.revertedWith("quorum is too small")
        })
        it("Should revert if quorum is  more than valid signers", async function () {
            const { factoryAddress, addr1, addr2 } = await loadFixture(deployFactoryContract);

            await expect((factoryAddress.createMultisig(3, [addr1.address, addr2.address]))).to.be.revertedWith("quorum is too big")
        })
        it("Should create a new multisig contract", async function () {
            const { factoryAddress, addr1, addr2 } = await loadFixture(deployFactoryContract);
            const res = await factoryAddress.createMultisig(2, [addr1.address, addr2.address]);

            expect((await factoryAddress.getMultisigClones()).length).to.be.equal(1)
        })
    })

})

