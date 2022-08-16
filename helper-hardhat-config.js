const { ethers } = require("hardhat")

const networkConfig = {
    4: {
        name: "rinkeby",
        mintFee: ethers.utils.parseEther("0.01"),
        maxSupply: 10000,
        minters: 5,
        maxMint: 2,
    },
    31337: {
        name: "hardhat",
        mintFee: ethers.utils.parseEther("0.01"),
        maxSupply: 5,
        minters: 5,
        maxMint: 2,
    },
}

const contractConfig = {
    name: "MyToken",
    token: {
        name: "MyToken",
        symbol: "MYT",
        uri: "/hello",
    },
}

const developmentChains = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developmentChains,
    contractConfig,
}
