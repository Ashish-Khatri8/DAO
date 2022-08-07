const { ethers } = require("hardhat");
const { DAO_ADDRESS, TREASURY_ADDRESS, PROPOSAL_ID } = require("./helper.js");

async function main() {
    const [owner] = await ethers.getSigners();

    const DAO = await ethers.getContractFactory("DAO");
    const dao = await DAO.attach(DAO_ADDRESS);

    const Treasury = await ethers.getContractFactory("Treasury");
    const treasury = await Treasury.attach(TREASURY_ADDRESS);

    // Now execute the proposal.
    const executeTxn = await dao.execute(
        [TREASURY_ADDRESS],
        [0],
        [await treasury.interface.encodeFunctionData("sendEther", [owner.address, ethers.utils.parseUnits("3", 18)])],
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Sending ether!"))
    );
    await executeTxn.wait();
    console.log("Proposal state: ", await dao.state(PROPOSAL_ID));

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
