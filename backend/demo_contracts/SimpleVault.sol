// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleVault {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {}

    function drain(address payable recipient) public {
        recipient.transfer(address(this).balance);
    }
}
