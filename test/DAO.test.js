const { inputToConfig } = require("@ethereum-waffle/compiler");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DAO", () => {

    let owner, addr1, addr2, addr3, addr4, addr5;
    let BlazeToken, blazeToken, Treasury, TimeLock, timeLock, DAO, dao;
    let treasury;
    beforeEach(async () => {
        [owner, addr1, addr2, addr3, addr4, addr5] = await ethers.getSigners();

        // Deploy the BlazeToken contract.
        BlazeToken = await ethers.getContractFactory("BlazeToken");
        blazeToken = await BlazeToken.deploy();
        await blazeToken.deployed();

        // Deploy the TimeLock contract.
        TimeLock = await ethers.getContractFactory("TimeLock");
        timeLock = await TimeLock.deploy(1, [], ["0x0000000000000000000000000000000000000000"]);
        await timeLock.deployed();

        // Deploy the DAO contract.
        DAO = await ethers.getContractFactory("DAO");
        dao = await DAO.deploy(
            blazeToken.address,
            timeLock.address,
            1,
            9,
            0,
            4
        );
        await dao.deployed();

        // Deploy the Treasury contract.
        Treasury = await ethers.getContractFactory("Treasury");
        treasury = await Treasury.deploy();
        await treasury.deployed();

        // ---------------------------------------------------------------

        // Make TimeLock contract the owner of Treasury contract.
        await treasury.transferOwnership(timeLock.address);

        // Make DAO contract the proposer of TimeLock contract.
        await timeLock.grantRole(await timeLock.PROPOSER_ROLE(), dao.address);

        // Send some ethers to Treasury contract.
        const ethTxn = await owner.sendTransaction({
            to: treasury.address,
            value: ethers.utils.parseEther("3.0")
        });
        await ethTxn.wait(1);

        // ----------------------------------------------------------------

        // Mint BlazeTokens to other addresses.
        await blazeToken.mint(addr1.address, 10000);
        await blazeToken.mint(addr2.address, 10000);
        await blazeToken.mint(addr3.address, 10000);
        await blazeToken.mint(addr4.address, 10000);
        await blazeToken.mint(addr5.address, 10000);

        // Delegate BLZ voting tokens through each account to itself.
        await blazeToken.connect(addr1).delegate(addr1.address);
        await blazeToken.connect(addr2).delegate(addr2.address);
        await blazeToken.connect(addr3).delegate(addr3.address);
        await blazeToken.connect(addr4).delegate(addr4.address);
        await blazeToken.connect(addr5).delegate(addr5.address);

    });

    it("DAO members can create a proposal.", async () => {
        const proposalTxn = await dao.propose(
            [treasury.address],
            [0],
            [await treasury.interface.encodeFunctionData("sendEther", [owner.address, ethers.utils.parseUnits("3", 18)])],
            "Sending ether!"
        );
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        const txn = await proposalTxn.wait(3);

        const proposalId = txn.events[0].args.proposalId;
        expect(proposalId).to.not.be.equal(0);
    });

    it("DAO members can vote on created proposal and execute it.", async () => {
        // Create proposal and get proposalId
        const proposalTxn = await dao.propose(
            [treasury.address],
            [0],
            [await treasury.interface.encodeFunctionData("sendEther", [owner.address, ethers.utils.parseUnits("3", 18)])],
            "Sending ether!"
        );
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        const txn = await proposalTxn.wait(3);
        const proposalId = txn.events[0].args.proposalId;

        // Now vote in support of proposal.
        await dao.connect(addr1).castVote(proposalId, 1);
        await dao.connect(addr2).castVote(proposalId, 1);
        await dao.connect(addr3).castVote(proposalId, 1);
        await dao.connect(addr4).castVote(proposalId, 1);
        await dao.connect(addr5).castVote(proposalId, 1);
        
        async function mine(n) {
            for(let i=0; i<n; i++) {
                await ethers.provider.send('evm_mine');
            }
        }
        await mine(11);
        
        // Check the proposal state.
        expect(await dao.state(proposalId)).to.be.equal(4);

        // Now, queue the proposal.
        const queueTxn = await dao.queue(
            [treasury.address],
            [0],
            [await treasury.interface.encodeFunctionData("sendEther", [owner.address, ethers.utils.parseUnits("3", 18)])],
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Sending ether!"))
        );
        await ethers.provider.send('evm_mine');
        await queueTxn.wait(1);
        
        // Check the proposal state.
        expect(await dao.state(proposalId)).to.be.equal(5);

        // Now, execute the proposal.
        const executeTxn = await dao.execute(
            [treasury.address],
            [0],
            [await treasury.interface.encodeFunctionData("sendEther", [owner.address, ethers.utils.parseUnits("3", 18)])],
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Sending ether!"))
        );
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await ethers.provider.send('evm_mine');
        await executeTxn.wait(3);

        // Check the proposal state.
        expect(await dao.state(proposalId)).to.be.equal(7);
        
    });

});
