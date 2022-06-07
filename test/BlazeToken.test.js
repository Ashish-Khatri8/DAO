const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BlazeToken", () => {

    const tokenName = "BlazeToken";
    const tokenSymbol = "BLZ";

    let owner;
    let address1;
    let BlazeToken;
    let blazeToken;

    beforeEach(async () => {
        [owner, address1] = await ethers.getSigners();
        BlazeToken = await ethers.getContractFactory("BlazeToken");
        blazeToken = await BlazeToken.deploy();
        await blazeToken.deployed();
    });

    it("Sets correct token name and symbol", async () => {
        expect(await blazeToken.name()).to.equal(tokenName);
        expect(await blazeToken.symbol()).to.equal(tokenSymbol);
    });

    it("Owner can mint tokens to other addresses", async () => {
        await blazeToken.mint(address1.address, 100000000);
        expect(await blazeToken.balanceOf(address1.address))
            .to.equal(100000000);
    });

    it("People can delegate their votes.", async () => {
        await blazeToken.mint(address1.address, 1000);
        const votesBeforeDelegation = await blazeToken.getVotes(address1.address);

        // Delegate the votes.
        await blazeToken.connect(address1).delegate(address1.address);
        const votesAfterDelegation = await blazeToken.getVotes(address1.address);

        expect(votesBeforeDelegation).to.not.equal(votesAfterDelegation);
        expect(votesBeforeDelegation).to.equal(0);
        expect(votesAfterDelegation).to.equal(1000);
    });
});
