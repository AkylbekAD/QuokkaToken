//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract QuokkaToken {
    string public symbol = "QTN";
    string public name = "QuokkaToken";
    uint8 public decimals = 9;
    uint public existingTokens = 1000000000000000000;
    uint public IPOrate = 1000000;
    address public owner ;
 
    mapping(address => uint) private userBalance;
    mapping(address => mapping(address => uint)) private allowed;

    event Transfer(address from, address to, uint256 value);
    event Approval(address owner, address spender, uint256 value);
 
    constructor() {
        owner = msg.sender;
        userBalance[owner] = existingTokens;    
    }

    function totalSupply() public view returns(uint) {
        return userBalance[owner];
    }

    function balanceOf(address tokenOwner) public view returns(uint balance) {
        return userBalance[tokenOwner];
    }

    function allowance(address tokenOwner, address spender) public view returns(uint tokens) {
        return allowed[tokenOwner][spender];
    }

    function transfer(address to, uint tokens) public returns(bool) {
        require(tokens <= userBalance[msg.sender], "Not enough tokens to transfer");
        userBalance[msg.sender] -= tokens;
        userBalance[to] += tokens;
        emit Transfer(msg.sender, to, tokens);
        return true;
    }

    function approve(address spender, uint tokens) public returns(bool) {
        require(userBalance[msg.sender] >= tokens, "Not enough tokens to approve");
        allowed[msg.sender][spender] = tokens;
        emit Approval(msg.sender, spender, tokens);
        return true;
    }

    function transferFrom(address from, address to, uint tokens) public returns(bool) {
        require(allowed[from][to] >= tokens, "Not enough allowed tokens");
        allowed[from][to] -= tokens;
        userBalance[from] -= tokens;
        userBalance[to] += tokens;
        emit Transfer(from, to, tokens);
        return true;
    }

    function buyToken() public payable {
        require(msg.value > 0, "You have to pay to buy QTN tokens");
        require(userBalance[owner] > 0, "No token left");
        allowed[owner][msg.sender] += currentQuokkaRate() * msg.value / 1000000000000000;
    }

    function burn(uint tokens) public {
        userBalance[msg.sender] -= tokens;
        existingTokens -= tokens;
        emit Transfer(msg.sender, address(0), tokens);
    }

    function mint(address to, uint tokens) external onlyOwner {
        userBalance[to] += tokens;
        existingTokens += tokens;
        emit Transfer(address(0), to, tokens);
    }

    function currentQuokkaRate() public view returns (uint rate) {
       uint current = totalSupply() / IPOrate;
       if (current > IPOrate) {
           return current;
       } 
       return IPOrate;
    }

    function withdrawFee(address payable _receiver, uint amount) external onlyOwner {
        _receiver.transfer(amount);
    }

    function getContractBalance() public view returns (uint) {
       return address(this).balance;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You`re not an owner!");
        _;
    }
}