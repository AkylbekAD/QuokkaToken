import hre from 'hardhat';
const ethers = hre.ethers;

async function main() {
    const [owner] = await ethers.getSigners()

    const QuokkaToken = await ethers.getContractFactory('QuokkaToken', owner)
    const qoukkaToken = await QuokkaToken.deploy()
    await qoukkaToken.deployed()
    console.log(qoukkaToken.address)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });