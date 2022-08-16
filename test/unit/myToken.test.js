const { network, ethers, deployments } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains, networkConfig, contractConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("My Token Unit Test", function () {
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
              c_maxMint,
              accts,
              acctContract,
              c_mintCount

          beforeEach(async () => {
              deployer = (await ethers.getSigners())[0]
              accts = await ethers.getSigners()
              const { chainId, blockConfirmations: blockConfirmations } = network.config

              contractName = contractConfig.name
              uri = contractConfig.token.uri

              mintFee = networkConfig[chainId].mintFee
              maxSupply = networkConfig[chainId].maxSupply
              minters = networkConfig[chainId].minters
              maxMint = networkConfig[chainId].maxMint

              tokenCounter = 0

              await deployments.fixture(["all"])

              myContract = await ethers.getContract(contractName, deployer)

              c_mintFee = await myContract.getMintFee()
              c_maxSupply = await myContract.getMaxSupply()
              c_tokenCounter = await myContract.getTokenCounter()
              c_maxMint = await myContract.getMaxMint()
          })

          describe("constructor", function () {
              it("Successfully sets constructor", async () => {
                  c_mintCount = await myContract.getMintCount(deployer.address)

                  assert.equal(c_mintFee.toString(), mintFee)
                  assert.equal(c_maxSupply.toString(), maxSupply)
                  assert.equal(c_tokenCounter.toString(), tokenCounter)
                  assert.equal(c_maxMint.toString(), maxMint)
                  assert.equal(mintCount.toString(), "0")
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
              it("Fails when below mint fee", async () => {
                  await expect(myContract.safeMint(uri)).to.be.revertedWith(
                      "MyToken__NeedMoreETHSent"
                  )
              })
              it("Fails when reached maximum supply", async () => {
                  for (let ctr = 0; ctr < c_maxSupply; ctr++) {
                      acctContract = myContract.connect(accts[ctr])
                      transaction = await acctContract.safeMint(uri, { value: c_mintFee })
                      transactionReceipt = await transaction.wait(blockConfirmations)
                  }

                  tokenCounter = await myContract.getTokenCounter()

                  assert.equal(tokenCounter.toString(), c_maxSupply)

                  await expect(myContract.safeMint(uri, { value: c_mintFee })).to.be.revertedWith(
                      "MyToken__MaxSupplyReached"
                  )
              })
              it("Fails when reached maximum mints", async () => {
                  for (let ctr = 0; ctr < c_maxMint; ctr++) {
                      transaction = await myContract.safeMint(uri, { value: c_mintFee })
                      transactionReceipt = await transaction.wait(blockConfirmations)
                  }

                  await expect(myContract.safeMint(uri, { value: c_mintFee })).to.be.revertedWith(
                      "MyToken__MaxMintReached"
                  )
              })
          })

          describe("withdraw", function () {
              it("Successfully withdraws", async () => {
                  for (let ctr = 0; ctr < minters; ctr++) {
                      acctContract = myContract.connect(accts[ctr])
                      transaction = await acctContract.safeMint(uri, { value: c_mintFee })
                      transactionReceipt = await transaction.wait(blockConfirmations)
                  }

                  const prevBalanceDeployer = await deployer.getBalance()
                  const prevBalanceContract = await myContract.provider.getBalance(
                      myContract.address
                  )

                  transaction = await myContract.withdraw()
                  transactionReceipt = await transaction.wait(blockConfirmations)

                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const currBalanceDeployer = await deployer.getBalance()
                  const currBalanceContract = await myContract.provider.getBalance(
                      myContract.address
                  )

                  assert.equal(currBalanceContract.toString(), "0")
                  assert.equal(
                      currBalanceDeployer.add(gasCost).toString(),
                      prevBalanceDeployer.add(prevBalanceContract).toString()
                  )
              })
              it("Fails when not owner", async () => {
                  const nonOwner = (await ethers.getSigners())[1]

                  const nonOwnerContract = myContract.connect(nonOwner)

                  await expect(nonOwnerContract.withdraw()).to.be.revertedWith(
                      "Ownable: caller is not the owner"
                  )
              })
          })
      })
