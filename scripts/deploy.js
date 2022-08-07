const { ethers } = require("hardhat");

async function main() {
    const [owner, addr1, addr2, addr3, addr4, addr5] = await ethers.getSigners();

    // Deploy the BlazeToken contract.
    const BlazeToken = await ethers.getContractFactory("BlazeToken");
    const blazeToken = await BlazeToken.deploy();
    await blazeToken.deployed();
    console.log("-> BlazeToken contract is deployed at: ", blazeToken.address);

    // Deploy the TimeLock contract.
    const TimeLock = await ethers.getContractFactory("TimeLock");
    const timeLock = await TimeLock.deploy(1, [], ["0x0000000000000000000000000000000000000000"]);
    await timeLock.deployed();
    console.log("-> TimeLock contract deployed at: ", timeLock.address);

    // Deploy the DAO contract.
    const DAO = await ethers.getContractFactory("DAO");
    const dao = await DAO.deploy(
        blazeToken.address,
        timeLock.address,
        1,
        20,
        0,
        4
    );
    await dao.deployed();
    console.log("-> DAO contract deployed at: ", dao.address);

    // Deploy the Treasury contract.
    const Treasury = await ethers.getContractFactory("Treasury");
    const treasury = await Treasury.deploy();
    await treasury.deployed();
    console.log("-> Treasury contract deployed at: ", treasury.address);

    // ---------------------------------------------------------------

    // Make TimeLock contract the owner of Treasury contract.
    await treasury.transferOwnership(timeLock.address);
    console.log("\n-> Transferred Treasury's ownership to TimeLock contract");

    // Make DAO contract the proposer of TimeLock contract.
    await timeLock.grantRole(await timeLock.PROPOSER_ROLE(), dao.address);
    console.log("-> Made DAO contract the proposer of TimeLock contract");

    // Send some ethers to Treasury contract.
    const ethTxn = await owner.sendTransaction({
        to: treasury.address,
        value: ethers.utils.parseEther("3.0")
    });
    await ethTxn.wait();
    console.log("-> Sent 3 ethers to Treasury contract");

    // Mint the BLZ voting tokens to other addresses.
    await blazeToken.mint(addr1.address, 10000);
    await blazeToken.mint(addr2.address, 10000);
    await blazeToken.mint(addr3.address, 10000);
    await blazeToken.mint(addr4.address, 10000);
    await blazeToken.mint(addr5.address, 10000);
    console.log("-> Minted BLZ voting tokens to other addresses.")

    // Delegate BLZ voting tokens through each account to itself.
    await blazeToken.connect(addr1).delegate(addr1.address);
    await blazeToken.connect(addr2).delegate(addr2.address);
    await blazeToken.connect(addr3).delegate(addr3.address);
    await blazeToken.connect(addr4).delegate(addr4.address);
    await blazeToken.connect(addr5).delegate(addr5.address);
    console.log("-> Delegated voting power of each address to itself");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
