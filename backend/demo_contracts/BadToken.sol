// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

contract BadToken {
    mapping(address => uint256) public balances;
    uint256 public totalSupply;

    function mint(uint256 amount) public {
        balances[msg.sender] += amount;
        totalSupply += amount;
    }

    function transfer(address to, uint256 amount) public {
        require(balances[msg.sender] >= amount);
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }
}
