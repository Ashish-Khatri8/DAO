const { ethers } = require("hardhat");
const { DAO_ADDRESS, TREASURY_ADDRESS } = require("./helper.js");

async function main() {
    const [owner] = await ethers.getSigners();

    const DAO = await ethers.getContractFactory("DAO");
    const dao = await DAO.attach(DAO_ADDRESS);

    const Treasury = await ethers.getContractFactory("Treasury");
    const treasury = await Treasury.attach(TREASURY_ADDRESS);

    // Create a proposal.
    const proposalTxn = await dao.propose(
        [TREASURY_ADDRESS],
        [0],
        [await treasury.interface.encodeFunctionData("sendEther", [owner.address, ethers.utils.parseUnits("3", 18)])],
        "Sending ether!"
    );
    const txn = await proposalTxn.wait();
    const proposalId = txn.events[0].args.proposalId;
    console.log("/n -> Created a proposal to send 3 ethers to owner with id: ", proposalId);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
