import chai from "chai"
import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract, Signer } from "ethers"
import { solidity } from "ethereum-waffle"

chai.use(solidity);

describe("QuokkaToken contract", function () {

  let QuokkaToken;
  let QuokkaTokenInterface: Contract;
  let owner: Signer;
  let acc1: Signer;
  let acc2: Signer;
  let acc3: Signer;

  beforeEach(async function () {
      QuokkaToken = await ethers.getContractFactory("QuokkaToken");
      [owner, acc1, acc2, acc3] = await ethers.getSigners()    
      QuokkaTokenInterface = await QuokkaToken.deploy();
      await QuokkaTokenInterface.deployed()
  });

  async function buyingToken(account: Signer, ether: string) {
    await QuokkaTokenInterface.connect(account).buyToken({value: ethers.utils.parseEther(ether)})
  }

  async function GetAccountBalance (account: Signer): Promise<string> {
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
      const ownerAddress = await owner.getAddress()
      const acc1Address = await acc1.getAddress()
      buyingToken(acc1, '0.000001')
      let Acc1result = await QuokkaTokenInterface.connect(acc1).allowance(ownerAddress,acc1Address)
      Acc1result = ethers.utils.formatUnits(Acc1result, 0)
      expect(Acc1result).to.be.equal("1000000000")
    })
  })

  describe("transferFrom function", function() {
    it("Anyone can transferFrom avaliable tokens from one address to another", async function () {
      buyingToken(acc1, '0.000001')
      const ownerAddress = await owner.getAddress()
      const acc1Address = await acc1.getAddress()
      await QuokkaTokenInterface.connect(acc1).transferFrom(ownerAddress,acc1Address,1000000000)
      let result = await QuokkaTokenInterface.balanceOf(acc1Address)
      result = ethers.utils.formatUnits(result, 0)
      expect(result).to.equal("1000000000")
    })

    it("Revert if amount of tokens bigger then avaliable", async function () {
      const ownerAddress = await owner.getAddress()
      const acc1Address = await acc1.getAddress()    
      buyingToken(acc1, '0.000001')
      await expect(QuokkaTokenInterface.connect(owner).transferFrom(ownerAddress,acc1Address,1000000000)).to.be.reverted
    })
  })

  describe("transfer function", function() {
    it("Anyone can transfer tokens from his address to another", async function () {
      buyingToken(acc1, '0.000001')
      const acc2Address = await acc2.getAddress()
      await QuokkaTokenInterface.connect(owner).transfer(acc2Address,1000000000)
      let result = await QuokkaTokenInterface.balanceOf(acc2Address)
      result = ethers.utils.formatUnits(result, 0)
      expect(result).to.equal("1000000000")
    })

    it("Revert if amount of tokens bigger then avaliable", async function () {
      const ownerAddress = await owner.getAddress()
      const acc2Address = await acc2.getAddress()    
      buyingToken(acc1, '0.000001')
      await expect(QuokkaTokenInterface.connect(acc1).transfer(acc2Address,1000000000)).to.be.reverted
    })
  })

  describe("approve function", function() {
    it("Anyone can set amount of tokens which it has to transfer from his address to another", async function () {
      const acc1Address = await acc1.getAddress()   
      const acc2Address = await acc2.getAddress()
      await QuokkaTokenInterface.transfer(acc1Address,1000000000)
      await QuokkaTokenInterface.connect(acc1).approve(acc2Address,1000000000)
      let result = await QuokkaTokenInterface.allowance(acc1Address,acc2Address)
      result = ethers.utils.formatUnits(result, 0)
      expect(result).to.equal("1000000000")
    })

    it("Revert if amount of tokens bigger then account has on his balance", async function () {
      const acc2Address = await acc2.getAddress()  
      await expect(QuokkaTokenInterface.connect(acc1).approve(acc2Address,1000000000)).to.be.revertedWith("Not enough tokens to approve")
    })
  })
 
  describe("withdrawFee function", function() {
    it("Owner can withdraw fees from contract", async function () {
      const balanceBefore = +(await GetAccountBalance(owner))
      buyingToken(acc1, '1')
      const ownerAddress = await owner.getAddress()   
      await QuokkaTokenInterface.connect(owner).withdrawFee(ownerAddress, 100000000000000)
      const balanceAfter = +(await GetAccountBalance(owner))
      expect(balanceAfter).to.be.above(balanceBefore)
    })

    it("Revert if amount of tokens bigger then account has on his balance", async function () {
      const acc1Address = await acc1.getAddress()  
      await expect(QuokkaTokenInterface.connect(acc1).withdrawFee(acc1Address, 1000000000)).to.be.revertedWith("You`re not an owner!")
    })
  })
 
  describe("currentQuokkaRate function", function() {
    it("The first 1 Quokka Token could be bought for 0.000001 ETH", async function () {
      buyingToken(acc1, '0.000001')
      const ownerAddress = await owner.getAddress()
      const acc1Address = await acc1.getAddress()
      let result = await QuokkaTokenInterface.connect(acc1).allowance(ownerAddress,acc1Address)
      result = ethers.utils.formatUnits(result, 0)
      expect(result).to.equal("1000000000")
    })

    it("The next amount of Quokka tokens will be less for the same 0.000001 ETH", async function () {
      buyingToken(acc1, '0.000001') // first sold 1 token with IPOrate
      const ownerAddress = await owner.getAddress()
      const acc1Address = await acc1.getAddress()
      const acc2Address = await acc2.getAddress()
      let Acc1result = await QuokkaTokenInterface.connect(acc1).allowance(ownerAddress,acc1Address)
      await QuokkaTokenInterface.connect(acc1).transferFrom(ownerAddress,acc1Address,1000000000) // after transfer current QTN rate would change
      buyingToken(acc2, '0.000001') // second buying would recive 0,999999999 QTN
      let Acc2result = await QuokkaTokenInterface.connect(acc2).allowance(ownerAddress,acc2Address)
      Acc1result = +(ethers.utils.formatUnits(Acc1result, 0))
      Acc2result = +(ethers.utils.formatUnits(Acc2result, 0))
      expect(Acc1result).to.be.above(Acc2result)
    })

    it("After 999999999 tokens were sold the rate of QTN would not change", async function () {
      const ownerAddress = await owner.getAddress()
      const acc1Address = await acc1.getAddress()
      const acc2Address = await acc2.getAddress()
      const amount: BigInt = BigInt(999999999999*1000000)
      await QuokkaTokenInterface.transfer(acc1Address,amount) // transfering 999999999999000000 tokens, 999936 left
      buyingToken(acc1, '0.000001')
      buyingToken(acc2, '0.000001')
      let Acc1result = await QuokkaTokenInterface.connect(acc1).allowance(ownerAddress,acc1Address)
      let Acc2result = await QuokkaTokenInterface.connect(acc2).allowance(ownerAddress,acc2Address)
      Acc1result = +(ethers.utils.formatUnits(Acc1result, 0))
      Acc2result = +(ethers.utils.formatUnits(Acc2result, 0))
      expect(Acc1result).to.be.equal(Acc2result) // 1000 = 1000 tokens
    })
  })

  describe("burn and mint functions", function() {
    it("Anyone can burn their tokens and decrease existingTokens of tokens", async function () {
      const acc1Address = await acc1.getAddress()
      await QuokkaTokenInterface.connect(owner).transfer(acc1Address,1000000000)
      await QuokkaTokenInterface.connect(acc1).burn(1000000000)
      let result = await QuokkaTokenInterface.existingTokens()
      result = ethers.utils.formatUnits(result, 0)
      expect(result).to.equal("999999999000000000")
    })

    it("Owner can mint new tokens and increase existingTokens of tokens", async function () {
      const ownerAddress = await owner.getAddress()
      await QuokkaTokenInterface.connect(owner).mint(ownerAddress,1000000000)
      let result = await QuokkaTokenInterface.existingTokens()
      result = ethers.utils.formatUnits(result, 0)
      expect(result).to.equal("1000000001000000000")
    })

    it("Only owner could mint new tokens", async function () {
      const acc1Address = await acc1.getAddress()
      expect(QuokkaTokenInterface.connect(acc1).mint(acc1Address,1000000000)).to.be.revertedWith("You`re not an owner!")
    })
  })
})
