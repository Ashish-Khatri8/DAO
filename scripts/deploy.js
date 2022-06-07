const { ethers } = require("hardhat");

async function main() {
    const [owner, addr1, addr2, addr3, addr4, addr5] = await ethers.getSigners();

    // Deploy the BlazeToken contract.
    const BlazeToken = await ethers.getContractFactory("BlazeToken");
    const blazeToken = await BlazeToken.deploy();
    await blazeToken.deployed();
    console.log("BlazeToken contract is deployed at: ", blazeToken.address);

    // Mint the BLZ voting tokens to other addresses.
    await blazeToken.mint(addr1.address, 10000);
    await blazeToken.mint(addr2.address, 10000);
    await blazeToken.mint(addr3.address, 10000);
    await blazeToken.mint(addr4.address, 10000);
    await blazeToken.mint(addr5.address, 10000);
    console.log("Minted BLZ voting tokens to other addresses.")

    // Delegate BLZ voting tokens through each account to itself.
    await blazeToken.connect(addr1).delegate(addr1.address);
    await blazeToken.connect(addr2).delegate(addr2.address);
    await blazeToken.connect(addr3).delegate(addr3.address);
    await blazeToken.connect(addr4).delegate(addr4.address);
    await blazeToken.connect(addr5).delegate(addr5.address);
    console.log("Each address has delegated itself to vote.");

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
