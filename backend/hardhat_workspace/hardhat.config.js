module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.20" },
      { version: "0.7.6" },
      { version: "0.6.12" }
    ]
  },
  networks: {
    hardhat: {
      accounts: {
        count: 5,
        accountsBalance: "100000000000000000000"
      }
    }
  }
};
