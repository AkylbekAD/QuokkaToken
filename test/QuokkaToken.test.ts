import chai from "chai"
import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { solidity } from "ethereum-waffle"

chai.use(solidity);

describe("QuokkaToken contract", function () {

  let QuokkaToken;
  let QuokkaTokenInterface: Contract;
  let owner: SignerWithAddress;
  let acc1: SignerWithAddress;
  let acc2: SignerWithAddress;
  let zeroAddress = "0x0000000000000000000000000000000000000000";

  beforeEach(async function () {
      QuokkaToken = await ethers.getContractFactory("QuokkaToken");
      [owner, acc1, acc2] = await ethers.getSigners()    
      QuokkaTokenInterface = await QuokkaToken.deploy();
      await QuokkaTokenInterface.deployed()
  });

  async function buyingToken(account: SignerWithAddress, ether: string) {
    await QuokkaTokenInterface.connect(account).buyToken({value: ethers.utils.parseEther(ether)})
  }

  async function GetAccountBalance (account: SignerWithAddress): Promise<string> {
    const address = await account.getAddress()
    const rawBalance = await ethers.provider.getBalance(address);
    // console.log(ethers.utils.formatEther(rawBalance)); // to see in ETH
    const weiBalance = ethers.utils.formatUnits(rawBalance, 0)
    return weiBalance
};

  describe("Getter public functions", function () {
    it("Should return name of token from 'name' getter function", async function () {
      expect (await QuokkaTokenInterface.name()).to.equal("QuokkaToken")
    })

    it("Should return symbol of token from 'symbol' getter function", async function () {
      expect (await QuokkaTokenInterface.symbol()).to.equal("QTN")
    })

    it("Should return owner of token from 'owner' getter function", async function () {
      expect (await QuokkaTokenInterface.owner()).to.equal(await owner.getAddress())
    })

    it("Should return existingTokens of token from 'existingTokens' getter function", async function () {
      let result = await QuokkaTokenInterface.existingTokens()
      result = ethers.utils.formatUnits(result, 0)
      expect(result).to.equal("1000000000000000000")
    })

    it("Should return decimals of token from 'decimals' getter function", async function () {
      let result = await QuokkaTokenInterface.decimals()
      result = ethers.utils.formatUnits(result, 0)
      expect(result).to.equal("9")
    })

    it("Should return IPOrate of token from 'IPOrate' getter function", async function () {
      let result = await QuokkaTokenInterface.IPOrate()
      result = ethers.utils.formatUnits(result, 0)
      expect(result).to.equal("1000000")
    })
  }) 

  describe("buyToken function", function() {
    it("Anyone can buy tokens paying ETH according to the current QTN rate", async function () {
      buyingToken(acc1, '0.000001')
      let result = await QuokkaTokenInterface.connect(acc1).allowance(owner.address,acc1.address)
      result = ethers.utils.formatUnits(result, 0)
      expect(result).to.be.equal("1000000000")
    })

    it("User have to pay ETH to buy tokens", async function () {
      expect(buyingToken(acc1, '0')).to.be.revertedWith("You have to pay to buy QTN tokens")
    })

    it("User cant buy tokens if total supply is 0", async function () {
      const amount: BigInt = BigInt(1000000000*1000000000)
      const transfer = await QuokkaTokenInterface.connect(owner).transfer(acc2.address,amount)
      await transfer.wait();
      expect(buyingToken(acc1, '1')).to.be.revertedWith("No token left")
    })
  })

  describe("transferFrom function", function() {
    it("Anyone can transferFrom avaliable tokens from one address to another", async function () {
      buyingToken(acc1, '0.000001')
      const transferFrom = await QuokkaTokenInterface.connect(acc1).transferFrom(owner.address,acc1.address,1000000000)
      await transferFrom.wait();
      expect(transferFrom).to.emit(QuokkaTokenInterface, "Transfer").withArgs(owner.address, acc1.address, "1000000000")
      
      let result = await QuokkaTokenInterface.balanceOf(acc1.address)
      result = ethers.utils.formatUnits(result, 0)
      expect(result).to.equal("1000000000")
    })

    it("Revert if amount of tokens bigger then avaliable", async function () {
      buyingToken(acc1, '0.000001')
      await expect(QuokkaTokenInterface.connect(acc1).transferFrom(owner.address,acc1.address,10000000000)).to.be.revertedWith("Not enough allowed tokens")
    })
  })

  describe("transfer function", function() {
    it("Anyone can transfer tokens from his address to another", async function () {
      buyingToken(acc1, '0.000001')
      const transfer = await QuokkaTokenInterface.connect(owner).transfer(acc2.address,1000000000)
      await transfer.wait();
      expect(transfer).to.emit(QuokkaTokenInterface, "Transfer").withArgs(owner.address, acc2.address, "1000000000")

      let result = await QuokkaTokenInterface.balanceOf(acc2.address)
      result = ethers.utils.formatUnits(result, 0)
      expect(result).to.equal("1000000000")
    })

    it("Revert if amount of tokens is bigger then avaliable on balance", async function () { 
      await expect(QuokkaTokenInterface.connect(acc1).transfer(acc1.address,1000000000)).to.be.revertedWith("Not enough tokens to transfer")
    })
  })

  describe("approve function", function() {
    it("Anyone can set amount of tokens which it has to transfer from his address to another", async function () {
      await QuokkaTokenInterface.transfer(acc1.address,1000000000)
      const approve = await QuokkaTokenInterface.connect(acc1).approve(acc2.address,1000000000)
      await approve.wait();
      expect(approve).to.emit(QuokkaTokenInterface, "Approval").withArgs(acc1.address, acc2.address, "1000000000")

      let result = await QuokkaTokenInterface.allowance(acc1.address,acc2.address)
      result = ethers.utils.formatUnits(result, 0)
      expect(result).to.equal("1000000000")
    })

    it("Revert if amount of tokens bigger then account has on his balance", async function () {
      await expect(QuokkaTokenInterface.connect(acc1).approve(acc2.address,1000000000)).to.be.revertedWith("Not enough tokens to approve")
    })
  })
 
  describe("withdrawFee function", function() {
    it("Owner can withdraw fees from contract", async function () {
      const balanceBefore = +(await GetAccountBalance(owner))
      buyingToken(acc1, '1')
      await QuokkaTokenInterface.connect(owner).withdrawFee(owner.address, 100000000000000)
      const balanceAfter = +(await GetAccountBalance(owner))
      expect(balanceAfter).to.be.above(balanceBefore)
    })

    it("Only owner can withdraw fee", async function () { 
      await expect(QuokkaTokenInterface.connect(acc1).withdrawFee(acc1.address, 1000000000)).to.be.revertedWith("You`re not an owner!")
    })
  })
 
  describe("currentQuokkaRate function", function() {
    it("The first 1 Quokka Token could be bought for 0.000001 ETH", async function () {
      expect(await QuokkaTokenInterface.currentQuokkaRate()).to.be.equal("1000000000000")
      buyingToken(acc1, '0.000001')
      let result = await QuokkaTokenInterface.connect(acc1).allowance(owner.address,acc1.address)
      result = ethers.utils.formatUnits(result, 0)
      expect(result).to.equal("1000000000")
    })

    it("The next amount of Quokka tokens will be less for the same 0.000001 ETH", async function () {
      expect(await QuokkaTokenInterface.currentQuokkaRate()).to.be.equal("1000000000000") // IPO rate

      buyingToken(acc1, '0.000001') // first sold 1 token with IPOrate
      let Acc1result = await QuokkaTokenInterface.connect(acc1).allowance(owner.address,acc1.address)
      await QuokkaTokenInterface.connect(acc1).transferFrom(owner.address,acc1.address,1000000000) // after transfer current QTN rate would change

      expect(await QuokkaTokenInterface.currentQuokkaRate()).to.be.equal("999999999000") // rate after changed total supply

      buyingToken(acc2, '0.000001') // second buying would recive 0,999999999 QTN
      let Acc2result = await QuokkaTokenInterface.connect(acc2).allowance(owner.address,acc2.address)
      Acc1result = +(ethers.utils.formatUnits(Acc1result, 0))
      Acc2result = +(ethers.utils.formatUnits(Acc2result, 0))
      expect(Acc1result).to.be.above(Acc2result)
    })

    it("After 999999999 tokens were sold the rate of QTN would not change", async function () {
      const amount: BigInt = BigInt(999999999999*1000000)
      await QuokkaTokenInterface.transfer(acc1.address,amount) // transfering 999999999999000000 tokens, 999936 left
      buyingToken(acc1, '0.000001')
      buyingToken(acc2, '0.000001')
      let Acc1result = await QuokkaTokenInterface.connect(acc1).allowance(owner.address,acc1.address)
      let Acc2result = await QuokkaTokenInterface.connect(acc2).allowance(owner.address,acc2.address)
      Acc1result = +(ethers.utils.formatUnits(Acc1result, 0))
      Acc2result = +(ethers.utils.formatUnits(Acc2result, 0))
      expect(Acc1result).to.be.equal(Acc2result) // 1000 = 1000 tokens
    })
  })

  describe("burn and mint functions", function() {
    it("Anyone can burn their tokens and decrease existingTokens of tokens", async function () {
      await QuokkaTokenInterface.connect(owner).transfer(acc1.address,1000000000)
      const burn = await QuokkaTokenInterface.connect(acc1).burn(1000000000)
      await burn.wait();
      expect(burn).to.emit(QuokkaTokenInterface, "Transfer").withArgs(acc1.address, zeroAddress, "1000000000")

      let result = await QuokkaTokenInterface.existingTokens()
      result = ethers.utils.formatUnits(result, 0)
      expect(result).to.equal("999999999000000000")
    })

    it("Owner can mint new tokens and increase existingTokens of tokens", async function () {
      const mint = await QuokkaTokenInterface.connect(owner).mint(owner.address,1000000000)
      await mint.wait();
      expect(mint).to.emit(QuokkaTokenInterface, "Transfer").withArgs(zeroAddress, owner.address, "1000000000")

      let result = await QuokkaTokenInterface.existingTokens()
      result = ethers.utils.formatUnits(result, 0)
      expect(result).to.equal("1000000001000000000")
    })

    it("Only owner could mint new tokens", async function () {
      expect(QuokkaTokenInterface.connect(acc1).mint(acc1.address,1000000000)).to.be.revertedWith("You`re not an owner!")
    })
  })

  describe("getContractBalance function", function() {
    it("Balance of contract would be 0 when its deployed", async function () {
      expect(await QuokkaTokenInterface.connect(acc1).getContractBalance()).to.be.equal("0")
    })

    it("Balance of contract would change if someone buys a tokens", async function () {
      buyingToken(acc1, '0.000001')
      expect(await QuokkaTokenInterface.connect(acc1).getContractBalance()).to.be.equal("1000000000000")
    })
  })
})
