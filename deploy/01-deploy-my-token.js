const { network } = require("hardhat")
const { networkConfig, developmentChains, contractConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const { chainId, blockConfirmations } = network.config

    const mintFee = networkConfig[chainId].mintFee || 0
    const maxSupply = networkConfig[chainId].maxSupply || 5
    const maxMint = networkConfig[chainId].maxMint || 5

    const tokenName = contractConfig.token.name
    const symbol = contractConfig.token.symbol

    log("-----------------------------------")

    const args = [maxSupply, mintFee, maxMint, tokenName, symbol]
    const contract = await deploy(contractConfig.name, {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(contract.address, args)
    }

    log("-----------------------------------")
}

module.exports.tags = ["all"]
