import { ethers } from "hardhat";

async function main() {
    const factoryContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const numberOfQuorum = 2;
    const validSigners = ["0x596BB27ceF5e94aEcA5Ba50E41Db077b1c23068B", "0xfd558120F12C855ba1C31E157741D39650Bd5DA9", "0x0FC46aC63C1d6e19c85E2e9B4273C5e2B2759df4"];

    const factoryContract = await ethers.getContractAt("MultisigFactory", factoryContractAddress);

    const tx = await factoryContract.createMultisig(numberOfQuorum, validSigners);
    const res = await tx.wait();
    console.log("tx hash: ", res);

    const clones = await factoryContract.getAMultisigClone(0);
    console.log("clones: ", clones);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })