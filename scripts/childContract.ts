import { ethers } from "hardhat";
async function main() {
    const childContractAddress = "";
    const tokenAddress = "";
    const numberOfQuorum = 2;
    const validSigners = ["0x596BB27ceF5e94aEcA5Ba50E41Db077b1c23068B", "0xfd558120F12C855ba1C31E157741D39650Bd5DA9", "0x0FC46aC63C1d6e19c85E2e9B4273C5e2B2759df4"];

    const childContract = await ethers.getContractAt("Multisig", childContractAddress);

    const tokenContract = await ethers.getContractAt("LayintonToken", tokenAddress);

    await tokenContract.transfer(childContract, ethers.parseUnits("500", 18));
    const amount = ethers.parseUnits("20", 18);

    const trx = await childContract.transfer(amount, "0x0FC46aC63C1d6e19c85E2e9B4273C5e2B2759df4", tokenContract);
    const response = await trx.wait();
    console.log("tx hash: ", response);

    const validSignerTrx = await childContract.getAVlaidSigner("0xfd558120F12C855ba1C31E157741D39650Bd5DA9");
    console.log("validSigner: ", validSignerTrx);

    // const approval1 = await childContract.connect(ethers.getSigners()[0]).approveTx(1);
    // const approval1Response = await approval1.wait();
    // console.log("tx hash: ", approval1Response);

    // const approval2 = await childContract.approveTx(2);
    // const approval2Response = await approval2.wait();
    // console.log("tx hash: ", approval2Response);







}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })