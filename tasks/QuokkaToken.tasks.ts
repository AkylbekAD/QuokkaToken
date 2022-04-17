import { task } from "hardhat/config";

// const ContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3" // for localhost network:
const ContractAddress = "0x657F104eF04Ce2566446f728e50be17eA3fa76B7" // for rinkeby network:

task("getContractBalance", "Prints constract`s balance")
    .setAction(async (taskArgs, hre) => {
        const QuokkaTokenInterface = await hre.ethers.getContractAt("QuokkaToken",ContractAddress)
        let balance = await QuokkaTokenInterface.getContractBalance()
        balance = balance.toString()
        console.log("Contract`s balance: ",balance)
    })

task("balanceOf", "Prints address token balance")
    .addParam("address", "Address balance to check")
    .setAction(async (taskArgs, hre) => {
        const QuokkaTokenInterface = await hre.ethers.getContractAt("QuokkaToken",ContractAddress)
        let balance = await QuokkaTokenInterface.balanceOf(taskArgs.address)
        balance = balance.toString()
        console.log(`${taskArgs.address} balance is ${balance} tokens`)
    })

task("totalSupply", "Prints tokens supply balance")
    .setAction(async (taskArgs, hre) => {
        const QuokkaTokenInterface = await hre.ethers.getContractAt("QuokkaToken",ContractAddress)
        let totalSupply = await QuokkaTokenInterface.totalSupply()
        totalSupply = totalSupply.toString()
        console.log("Total tokens supply balance: ",totalSupply)
    })

task("existingTokens", "Prints tokens supply balance")
    .setAction(async (taskArgs, hre) => {
        const QuokkaTokenInterface = await hre.ethers.getContractAt("QuokkaToken",ContractAddress)
        let totalSupply = await QuokkaTokenInterface.existingTokens()
        totalSupply = totalSupply.toString()
        console.log("All QTN tokens exist: ",totalSupply)
    })

task("symbol", "Prints tokens symbol")
    .setAction(async (taskArgs, hre) => {
        const QuokkaTokenInterface = await hre.ethers.getContractAt("QuokkaToken",ContractAddress)
        let symbol = await QuokkaTokenInterface.symbol()
        symbol = symbol.toString()
        console.log("Total tokens symbol: ",symbol)
    })

task("decimals", "Prints number of decimal places of QTN token")
    .setAction(async (taskArgs, hre) => {
        const QuokkaTokenInterface = await hre.ethers.getContractAt("QuokkaToken",ContractAddress)
        let decimals = await QuokkaTokenInterface.decimals()
        decimals = decimals.toString()
        console.log("Number of decimal places of QTN token: ",decimals)
    })

task("owner", "Prints owner address")
    .setAction(async (taskArgs, hre) => {
        const QuokkaTokenInterface = await hre.ethers.getContractAt("QuokkaToken",ContractAddress)
        let owner = await QuokkaTokenInterface.owner()
        console.log("Contract owner is: ",owner)
    })

task("IPOrate", "Prints amount of QTN tokens avalible to buy for 0.000001 ETH at IPO")
    .setAction(async (taskArgs, hre) => {
        const QuokkaTokenInterface = await hre.ethers.getContractAt("QuokkaToken",ContractAddress)
        let IPOrate = await QuokkaTokenInterface.IPOrate()
        console.log("Amount of QTN tokens avalible to buy for 0.000001 ETH at IPO: ",IPOrate)
    })

task("name", "Prints tokens name")
    .setAction(async (taskArgs, hre) => {
        const QuokkaTokenInterface = await hre.ethers.getContractAt("QuokkaToken",ContractAddress)
        let name = await QuokkaTokenInterface.name()
        name = name.toString()
        console.log("Total tokens name: ",name)
    })

task("allowance", "Prints amount of allowed to transfer tokens")
    .addParam("from", "Address to see allowance to transfer from")
    .addParam("to", "Address allowed transfer to it")
    .setAction(async (taskArgs, hre) => {
        const QuokkaTokenInterface = await hre.ethers.getContractAt("QuokkaToken",ContractAddress)
        let allowance = await QuokkaTokenInterface.allowance(taskArgs.from, taskArgs.to)
        allowance = allowance.toString()
        console.log("Tokens allowed to transfer: ",allowance)
    })

task("currentQuokkaRate", "Prints current rate of QTN to 0.000001 ETH")
    .setAction(async (taskArgs, hre) => {
        const QuokkaTokenInterface = await hre.ethers.getContractAt("QuokkaToken",ContractAddress)
        let currentQuokkaRate = await QuokkaTokenInterface.currentQuokkaRate()
        currentQuokkaRate = currentQuokkaRate.toString()
        console.log("Total tokens name: ",currentQuokkaRate)
    })

task("transfer", "Transfers tokens from sender to receiver")
    .addParam("address", "Receiver address")
    .addParam("tokens", "Amount of tokens")
    .setAction(async (taskArgs, hre) => {
        const QuokkaTokenInterface = await hre.ethers.getContractAt("QuokkaToken",ContractAddress)
        await QuokkaTokenInterface.transfer(taskArgs.address, taskArgs.tokens)
        console.log(`${taskArgs.tokens} have been sent to ${taskArgs.address}`)
    })

task("transferFrom", "Transfers allowed tokens from certain address to receiver")
    .addParam("from", "Address allowed to transfer")
    .addParam("to", "Receiver address")
    .addParam("tokens", "Amount of tokens")
    .setAction(async (taskArgs, hre) => {
        const QuokkaTokenInterface = await hre.ethers.getContractAt("QuokkaToken",ContractAddress)
        await QuokkaTokenInterface.transferFrom(taskArgs.from, taskArgs.to, taskArgs.tokens)
        console.log(`${taskArgs.tokens} have been transfered to ${taskArgs.to} from ${taskArgs.from}`)
    })

task("approve", "Approve to transfer tokens from sender to receiver")
    .addParam("spender", "Spender address")
    .addParam("tokens", "Amount of tokens to approve")
    .setAction(async (taskArgs, hre) => {
        const QuokkaTokenInterface = await hre.ethers.getContractAt("QuokkaToken",ContractAddress)
        await QuokkaTokenInterface.approve(taskArgs.spender, taskArgs.tokens)
        console.log(`${taskArgs.tokens} now allowed to transfer to ${taskArgs.spender}`)
    })

task("buyToken", "Buys tokens for ether based on QTN current rate")
    .addParam("ether", "ETH to pay for tokens")
    .setAction(async (taskArgs, hre) => {
        const QuokkaTokenInterface = await hre.ethers.getContractAt("QuokkaToken",ContractAddress)
        taskArgs.ether = hre.ethers.utils.parseEther(taskArgs.ether).toHexString()
        await QuokkaTokenInterface.buyToken({value: taskArgs.ether})
        console.log(`You have bought QTN tokens!`)
    })

task("burn", "Burns tokens from sender balance")
    .addParam("tokens", "Amount of tokens to burn")
    .setAction(async (taskArgs, hre) => {
        const QuokkaTokenInterface = await hre.ethers.getContractAt("QuokkaToken",ContractAddress)
        await QuokkaTokenInterface.burn(taskArgs.tokens)
        console.log(`You have burn ${taskArgs.tokens} from your balance`)
    })

task("mint", "Owner mints new tokens at certain balance")
    .addParam("to", "Receiver address")  
    .addParam("tokens", "Amount of tokens to burn")
    .setAction(async (taskArgs, hre) => {
        const QuokkaTokenInterface = await hre.ethers.getContractAt("QuokkaToken",ContractAddress)
        await QuokkaTokenInterface.mint(taskArgs.to, taskArgs.tokens)
        console.log(`You have minted ${taskArgs.tokens} at ${taskArgs.to} balance`)
    })

task("withdrawFee", "Owner withdraw fee from contract balance")
    .addParam("receiver", "Receiver address")  
    .addParam("amount", "Amount of ETH to withdraw")
    .setAction(async (taskArgs, hre) => {
        const QuokkaTokenInterface = await hre.ethers.getContractAt("QuokkaToken",ContractAddress)
        await QuokkaTokenInterface.withdrawFee(taskArgs.receiver, taskArgs.amount)
        console.log(`You have withdrawn ${taskArgs.amount} ETH to ${taskArgs.receiver}`)
    })