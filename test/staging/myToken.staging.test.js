const { network, ethers, getNamedAccounts } = require("hardhat")
const { assert } = require("chai")
const { developmentChains, networkConfig, contractConfig } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("My Token Staging Test", function () {
          let mintFee,
              maxSupply,
              tokenCounter,
              c_mintFee,
              c_maxSupply,
              c_tokenCounter,
              myContract,
              blockConfirmations,
              transaction,
              transactionReceipt,
              minters,
              contractName,
              uri,
              deployer,
              maxMint,
              c_maxMint

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              const { chainId, blockConfirmations: blockConfirmations } = network.config

              contractName = contractConfig.name
              uri = contractConfig.token.uri

              mintFee = networkConfig[chainId].mintFee
              maxSupply = networkConfig[chainId].maxSupply
              minters = networkConfig[chainId].minters
              maxMint = networkConfig[chainId].maxMint

              tokenCounter = 0

              myContract = await ethers.getContract(contractName, deployer)

              c_mintFee = await myContract.getMintFee()
              c_maxSupply = await myContract.getMaxSupply()
              c_tokenCounter = await myContract.getTokenCounter()
              c_maxMint = await myContract.getMaxMint()
          })

          describe("constructor", function () {
              it("Successfully sets constructor", async () => {
                  c_mintCount = await myContract.getMintCount(deployer)
                  assert.equal(c_mintFee.toString(), mintFee)
                  assert.equal(c_maxSupply.toString(), maxSupply)
                  assert.equal(c_tokenCounter.toString(), tokenCounter)
                  assert.equal(c_mintCount.toString(), "0")
              })
          })

          describe("mint", function () {
              it("Successfully mints NFT", async () => {
                  transaction = await myContract.safeMint(uri, { value: c_mintFee })
                  transactionReceipt = await transaction.wait(blockConfirmations)

                  tokenCounter = await myContract.getTokenCounter()
                  c_mintCount = await myContract.getMintCount(deployer.address)

                  assert.equal(tokenCounter.toString(), "1")
                  assert.equal(c_mintCount.toString(), "1")
              })
          })

          describe("withdraw", function () {
              it("Successfully withdraws", async () => {
                  const prevBalanceDeployer = await myContract.provider.getBalance(deployer)
                  const prevBalanceContract = await myContract.provider.getBalance(
                      myContract.address
                  )

                  transaction = await myContract.withdraw()
                  transactionReceipt = await transaction.wait(blockConfirmations)

                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const currBalanceDeployer = await myContract.provider.getBalance(deployer)
                  const currBalanceContract = await myContract.provider.getBalance(
                      myContract.address
                  )

                  assert.equal(currBalanceContract.toString(), "0")
                  assert.equal(
                      currBalanceDeployer.add(gasCost).toString(),
                      prevBalanceDeployer.add(prevBalanceContract).toString()
                  )
              })
          })
      })
