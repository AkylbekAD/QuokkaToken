import hre from 'hardhat';
const ethers = hre.ethers;

const ERC20address = "0x58Dea97d56BAF80aFec00B48A2FC158E7703Fe80"

async function main() {
    const [owner] = await ethers.getSigners()

    const ExampleToken = await ethers.getContractFactory('ERC20', owner)
    const erc20 = await ExampleToken.deploy()
    await erc20.deployed()
    console.log(erc20.address)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });