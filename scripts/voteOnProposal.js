const { ethers } = require("hardhat");
const { DAO_ADDRESS, PROPOSAL_ID } = require("./helper.js");

async function main() {
    const [owner, addr1, addr2, addr3, addr4, addr5] = await ethers.getSigners();

    const DAO = await ethers.getContractFactory("DAO");
    const dao = await DAO.attach(DAO_ADDRESS);

    // Now vote in support of proposal.
    await dao.connect(addr1).castVote(PROPOSAL_ID, 1);
    await dao.connect(addr2).castVote(PROPOSAL_ID, 1);
    await dao.connect(addr3).castVote(PROPOSAL_ID, 1);
    await dao.connect(addr4).castVote(PROPOSAL_ID, 1);
    await dao.connect(addr5).castVote(PROPOSAL_ID, 1);
    console.log("-> Voting on proposal completed");
    console.log("Proposal state: ", await dao.state(PROPOSAL_ID));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
