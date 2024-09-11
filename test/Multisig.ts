import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

describe("Multisig", function () {

  async function deployToken() {
    const [owner, otherAccount, addr1, addr2, addr3] = await hre.ethers.getSigners();
    const token = await hre.ethers.getContractFactory("LayintonToken");
    const tokenAddr = await token.deploy();
    return { tokenAddr }
  }
  async function deployMultisigContract() {
    const quorum = 3;

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, addr1, addr2, addr3] = await hre.ethers.getSigners();

    const { tokenAddr } = await loadFixture(deployToken);
    const Multisig = await hre.ethers.getContractFactory("Multisig");
    const multisig = await Multisig.deploy(quorum, [addr1.address, addr2.address]);

    return { multisig, quorum, tokenAddr, owner, otherAccount, addr1, addr2, addr3 };
  }

  describe("Token Deployment", function () {
    it("Should make sure only owner can mint", async function () {
      const [owner, otherAccount, addr1, addr2, addr3] = await hre.ethers.getSigners();
      const { tokenAddr } = await loadFixture(deployToken);
      const amount = hre.ethers.parseUnits("500", 18);

      await expect(tokenAddr.connect(otherAccount).mint(amount)).to.be.revertedWithCustomError(tokenAddr, "NotOwner");
    });
  })

  describe("Token Deployment", function () {
    it("Should mint the right amount to the owner address", async function () {
      const [owner, otherAccount, addr1, addr2, addr3] = await hre.ethers.getSigners();
      const { tokenAddr } = await loadFixture(deployToken);
      const amount = hre.ethers.parseUnits("100000", 1);

      await expect(tokenAddr.mint(100000)).to.emit(tokenAddr, "MintSuccessful") // tokenAddr.mint(amount);

      expect(await tokenAddr.balanceOf(owner.address)).to.equal(hre.ethers.parseUnits("600000", 18));

    });
  })

  describe("Deployment", function () {
    it("Should set the right quorum number", async function () {
      const [owner, otherAccount, addr1, addr2, addr3] = await hre.ethers.getSigners();
      const { multisig } = await loadFixture(deployMultisigContract);

      expect(await multisig.quorum()).to.equal(3);
    });
    it("Should set the rigth number of valid signers", async function () {
      const [owner, otherAccount, addr1, addr2, addr3] = await hre.ethers.getSigners();
      const { multisig } = await loadFixture(deployMultisigContract);

      expect(await multisig.noOfValidSigners()).to.equal(3);
    });

    it("Should add owner to valid signer if not added at deployment", async function () {
      const [owner, otherAccount, addr1, addr2, addr3] = await hre.ethers.getSigners();
      const { multisig } = await loadFixture(deployMultisigContract);

      expect(await multisig.getAVlaidSigner(owner.address)).to.equal(true);
    });

  });

  describe("Tranfer", function () {
    it("Should revert if the sender is not a valid signer", async function () {

      const { multisig, tokenAddr, addr1, addr2, addr3 } = await loadFixture(deployMultisigContract);
      const amount = hre.ethers.parseUnits("20", 18);

      await expect(multisig.connect(addr3).transfer(amount, addr1.address, tokenAddr)).to.revertedWith("invalid signer");
    });

    it("Should set the rigth number of valid signers", async function () {
      const [owner, otherAccount, addr1, addr2, addr3] = await hre.ethers.getSigners();
      const { multisig } = await loadFixture(deployMultisigContract);

      expect(await multisig.noOfValidSigners()).to.equal(3);
    });
    it("Should revert when zero amount is sent", async function () {
      const { multisig, tokenAddr, addr1, addr2, addr3 } = await loadFixture(deployMultisigContract);
      const amount = hre.ethers.parseUnits("0", 18);

      await expect(multisig.transfer(amount, addr1.address, tokenAddr)).to.revertedWith("can't send zero amount");
    });
    // it("Should revert if senders address is zero", async function () {
    //   const { multisig, tokenAddr, addr1, addr2, addr3 } = await loadFixture(deployMultisigContract);

    //   await tokenAddr.transfer(multisig, hre.ethers.parseUnits("500", 18));
    //   const amount = hre.ethers.parseUnits("10", 18);


    //   const zeroAddress = "0x0000000000000000000000000000000000000000";

    //   // Attempt a low-level call with the zero address
    //   await expect(
    //     ethers.provider.send("eth_sendTransaction", [{
    //       from: ethers.ze,
    //       to: multisig,
    //       data: multisig.interface.encodeFunctionData("transfer", [amount, addr1.address, tokenAddr]),

    //     }])
    //   ).to.be.revertedWith("address zero found");

    //   // await hre.ethers.provider.send("hardhat_setSender", ["0x0000000000000000000000000000000000000000"]); //set sender address to zero

    //   // await expect(multisig.transfer(amount, addr1.address, tokenAddr)).to.revertedWith("address zero found");
    // });
    it("Should revert if receipient address is zero", async function () {
      const { multisig, tokenAddr, addr1, addr2, addr3 } = await loadFixture(deployMultisigContract);
      const amount = hre.ethers.parseUnits("0", 18);

      await expect(multisig.transfer(amount, hre.ethers.ZeroAddress, tokenAddr)).to.revertedWith("can't send zero amount");
    });
    it("Should revert if token address is zero", async function () {
      const { multisig, tokenAddr, addr1, addr2, addr3 } = await loadFixture(deployMultisigContract);
      await tokenAddr.transfer(multisig, hre.ethers.parseUnits("500", 18));
      const amount = hre.ethers.parseUnits("10", 18);

      await expect(multisig.transfer(amount, addr2.address, hre.ethers.ZeroAddress)).to.revertedWith("address zero found");
    });
    it("Should revert if token address balance is less than amount", async function () {
      const { multisig, tokenAddr, addr1, addr2, addr3 } = await loadFixture(deployMultisigContract);
      await tokenAddr.transfer(multisig, hre.ethers.parseUnits("500", 18));
      const amount = hre.ethers.parseUnits("600", 18);

      await expect(multisig.transfer(amount, addr2.address, tokenAddr)).to.revertedWith("insufficient funds");
    });

    it("Should check if transaction is submitted correctly", async function () {
      const { multisig, tokenAddr, addr1, addr2, addr3 } = await loadFixture(deployMultisigContract);
      await tokenAddr.transfer(multisig, hre.ethers.parseUnits("500", 18));
      const amount = hre.ethers.parseUnits("20", 18);

      await multisig.transfer(amount, addr1.address, tokenAddr);

      expect(await multisig.txCount()).to.equal(1);


    });
  });

  describe("Approve Trx", function () {
    it("Should revert if invalid trx id is passed", async function () {
      const { multisig, tokenAddr, addr1, addr2, addr3 } = await loadFixture(deployMultisigContract);


      await expect(multisig.approveTx(0)).to.revertedWith("invalid tx id");

    });
    it("Should revert if token address balance is less than amount", async function () {
      const { multisig, tokenAddr, addr1, addr2, addr3 } = await loadFixture(deployMultisigContract);
      await tokenAddr.transfer(multisig, hre.ethers.parseUnits("500", 18));
      const amount = hre.ethers.parseUnits("600", 18);
      // await multisig.transfer(amount, addr1.address, tokenAddr);

      await expect(multisig.transfer(amount, addr1.address, tokenAddr)).to.revertedWith("insufficient funds");
    })
    it("Should revert if the sender is not a valid signer", async function () {

      const { multisig, tokenAddr, addr1, addr2, addr3 } = await loadFixture(deployMultisigContract);
      expect(multisig.connect(addr3).approveTx(1)).to.revertedWith("invalid signer");
    });
    it("Should revert if the sender tries to sign twice", async function () {

      const { multisig, tokenAddr, addr1, addr2, addr3 } = await loadFixture(deployMultisigContract);
      await tokenAddr.transfer(multisig, hre.ethers.parseUnits("500", 18));
      const amount = hre.ethers.parseUnits("20", 18);
      await multisig.transfer(amount, addr1.address, tokenAddr);
      await expect(multisig.approveTx(1)).to.revertedWith("can't sign twice");
    });
    it("Should revert if number of approvals reached quorum", async function () {

      const { multisig, tokenAddr, addr1, addr2, addr3 } = await loadFixture(deployMultisigContract);
      await tokenAddr.transfer(multisig, hre.ethers.parseUnits("500", 18));
      const amount = hre.ethers.parseUnits("20", 18);
      await multisig.transfer(amount, addr1.address, tokenAddr);
      await multisig.connect(addr1).approveTx(1);
      await multisig.connect(addr2).approveTx(1);

      await expect(multisig.approveTx(1)).to.revertedWith("approvals already reached");
    });
    it("Should successfully complete the transaction if number of approvals reached quorum and transaction is not completed before", async function () {

      const { multisig, tokenAddr, addr1, addr2, addr3 } = await loadFixture(deployMultisigContract);
      await tokenAddr.transfer(multisig, hre.ethers.parseUnits("500", 18));
      const amount = hre.ethers.parseUnits("20", 18);
      await multisig.transfer(amount, addr1.address, tokenAddr);
      await multisig.connect(addr1).approveTx(1);
      await multisig.connect(addr2).approveTx(1);
      expect(await tokenAddr.balanceOf(addr1.address)).to.be.equal(amount);
    });
  });

  describe("updateQuorum", function () {
    it("Should revert if sender is not a valid signer", async function () {
      const { multisig, tokenAddr, addr1, addr2, addr3 } = await loadFixture(deployMultisigContract);
      await tokenAddr.transfer(multisig, hre.ethers.parseUnits("500", 18));
      const amount = hre.ethers.parseUnits("20", 18);
      await multisig.transfer(amount, addr1.address, tokenAddr);

      await expect(multisig.connect(addr3).approveTx(1)).to.revertedWith("not a valid signer");
    }

    );
    it("Should revert if new quorum is greater than no of valid signers", async function () {
      const { multisig, tokenAddr, addr1, addr2, addr3 } = await loadFixture(deployMultisigContract);

      await expect(multisig.updateQuorum(4)).to.revertedWith("quorum greater than valid signers");
    }

    );
    it("Should revert if new quorum is not greater than 1", async function () {
      const { multisig, tokenAddr, addr1, addr2, addr3 } = await loadFixture(deployMultisigContract);

      await expect(multisig.updateQuorum(1)).to.revertedWith("quorum is too small");
    }


    );

    it("Should ensure that quorum update tx is submitted successfully", async function () {
      const { multisig, tokenAddr, addr1, addr2, addr3 } = await loadFixture(deployMultisigContract);
      await multisig.updateQuorum(2);


      expect(await multisig.quorumUpdateCount()).to.be.equal(1);
    }


    );

  });

  describe("Approve QuorumUpdate Trx", function () {
    it("Should revert if invalid trx id is passed", async function () {
      const { multisig, tokenAddr, addr1, addr2, addr3 } = await loadFixture(deployMultisigContract);

      await multisig.updateQuorum(2);
      await expect(multisig.approveQuorumUpdate(0)).to.be.revertedWith("invalid tx id");
    });

    it("Should revert if the sender is not a valid signer", async function () {
      const { multisig, tokenAddr, addr1, addr2, addr3 } = await loadFixture(deployMultisigContract);
      await multisig.updateQuorum(2);
      expect(multisig.connect(addr3).approveQuorumUpdate(1)).to.revertedWith("not a valid signer");
    });
    it("Should revert if the sender tries to sign twice", async function () {

      const { multisig, tokenAddr, addr1, addr2, addr3 } = await loadFixture(deployMultisigContract);

      await multisig.updateQuorum(2);
      await expect(multisig.approveQuorumUpdate(1)).to.be.revertedWith("can't sign twice");
    });

    it("Should revert if attempt to sign after transaction is completed", async function () {

      const { multisig, tokenAddr, addr1, addr2, addr3 } = await loadFixture(deployMultisigContract);
      await multisig.updateQuorum(2);
      await multisig.connect(addr1).approveQuorumUpdate(1);
      await multisig.connect(addr2).approveQuorumUpdate(1);

      await expect(multisig.approveQuorumUpdate(1)).to.revertedWith("transaction already completed");
    });

    it("Should successfully complete the quorum update if number of approvals reached quorum ", async function () {

      const { multisig, tokenAddr, addr1, addr2, addr3 } = await loadFixture(deployMultisigContract);
      await multisig.updateQuorum(2);
      await multisig.connect(addr1).approveQuorumUpdate(1);
      await multisig.connect(addr2).approveQuorumUpdate(1);
      expect(await multisig.quorum()).to.be.equal(2);
    });
  });
});