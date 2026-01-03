const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TradingBot Contract Tests", function () {
    let tradingBot;
    let owner;
    let user1;
    let user2;
    let admin;

    beforeEach(async function () {
        // Get signers
        [owner, user1, user2, admin] = await ethers.getSigners();

        // Deploy contract
        const TradingBot = await ethers.getContractFactory("TradingBot");
        tradingBot = await TradingBot.deploy();
        await tradingBot.waitForDeployment();

        console.log("Contract deployed to:", await tradingBot.getAddress());
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await tradingBot.owner()).to.equal(owner.address);
        });

        it("Should authorize owner as executor by default", async function () {
            expect(await tradingBot.authorizedExecutors(owner.address)).to.be.true;
        });
    });

    describe("Authorization", function () {
        it("Should allow owner to authorize executors", async function () {
            await tradingBot.setExecutorAuthorization(admin.address, true);
            expect(await tradingBot.authorizedExecutors(admin.address)).to.be.true;
        });

        it("Should allow owner to deauthorize executors", async function () {
            await tradingBot.setExecutorAuthorization(admin.address, true);
            await tradingBot.setExecutorAuthorization(admin.address, false);
            expect(await tradingBot.authorizedExecutors(admin.address)).to.be.false;
        });

        it("Should not allow non-owner to authorize executors", async function () {
            await expect(
                tradingBot.connect(user1).setExecutorAuthorization(admin.address, true)
            ).to.be.reverted;
        });
    });

    describe("Native MNT Deposits", function () {
        it("Should allow users to deposit MNT", async function () {
            const depositAmount = ethers.parseEther("1.0");

            await tradingBot.connect(user1).deposit(ethers.ZeroAddress, depositAmount, {
                value: depositAmount
            });

            const balance = await tradingBot.getBalance(user1.address, ethers.ZeroAddress);
            expect(balance).to.equal(depositAmount);
        });

        it("Should reject deposit with incorrect MNT amount", async function () {
            const depositAmount = ethers.parseEther("1.0");
            const sentAmount = ethers.parseEther("0.5");

            await expect(
                tradingBot.connect(user1).deposit(ethers.ZeroAddress, depositAmount, {
                    value: sentAmount
                })
            ).to.be.revertedWith("Incorrect MNT amount");
        });

        it("Should reject zero amount deposits", async function () {
            await expect(
                tradingBot.connect(user1).deposit(ethers.ZeroAddress, 0, { value: 0 })
            ).to.be.revertedWith("Amount must be greater than 0");
        });
    });

    describe("Native MNT Withdrawals", function () {
        beforeEach(async function () {
            // Deposit first
            const depositAmount = ethers.parseEther("2.0");
            await tradingBot.connect(user1).deposit(ethers.ZeroAddress, depositAmount, {
                value: depositAmount
            });
        });

        it("Should allow users to withdraw MNT", async function () {
            const withdrawAmount = ethers.parseEther("1.0");
            const initialBalance = await ethers.provider.getBalance(user1.address);

            const tx = await tradingBot.connect(user1).withdraw(ethers.ZeroAddress, withdrawAmount);
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;

            const finalBalance = await ethers.provider.getBalance(user1.address);
            const contractBalance = await tradingBot.getBalance(user1.address, ethers.ZeroAddress);

            expect(contractBalance).to.equal(ethers.parseEther("1.0"));
            expect(finalBalance).to.be.closeTo(
                initialBalance + withdrawAmount - gasUsed,
                ethers.parseEther("0.001") // Allow small difference for gas
            );
        });

        it("Should reject withdrawal with insufficient balance", async function () {
            const withdrawAmount = ethers.parseEther("5.0");

            await expect(
                tradingBot.connect(user1).withdraw(ethers.ZeroAddress, withdrawAmount)
            ).to.be.revertedWith("Insufficient balance");
        });

        it("Should reject zero amount withdrawals", async function () {
            await expect(
                tradingBot.connect(user1).withdraw(ethers.ZeroAddress, 0)
            ).to.be.revertedWith("Amount must be greater than 0");
        });
    });

    describe("Swap Execution", function () {
        beforeEach(async function () {
            // Authorize admin
            await tradingBot.setExecutorAuthorization(admin.address, true);

            // User deposits MNT (representing USDT)
            const depositAmount = ethers.parseEther("1000");
            await tradingBot.connect(user1).deposit(ethers.ZeroAddress, depositAmount, {
                value: depositAmount
            });
        });

        it("Should allow authorized executor to execute swap", async function () {
            const tokenIn = ethers.ZeroAddress; // MNT (representing USDT)
            const tokenOut = "0x0000000000000000000000000000000000000001"; // Mock WETH
            const amountIn = ethers.parseEther("100");
            const amountOut = ethers.parseEther("0.05"); // Mock: 100 USDT = 0.05 ETH

            await tradingBot.connect(admin).executeSwap(
                user1.address,
                tokenIn,
                tokenOut,
                amountIn,
                amountOut,
                "trigger-123"
            );

            const balanceIn = await tradingBot.getBalance(user1.address, tokenIn);
            const balanceOut = await tradingBot.getBalance(user1.address, tokenOut);

            expect(balanceIn).to.equal(ethers.parseEther("900")); // 1000 - 100
            expect(balanceOut).to.equal(amountOut);
        });

        it("Should reject swap from unauthorized executor", async function () {
            const tokenIn = ethers.ZeroAddress;
            const tokenOut = "0x0000000000000000000000000000000000000001";
            const amountIn = ethers.parseEther("100");
            const amountOut = ethers.parseEther("0.05");

            await expect(
                tradingBot.connect(user2).executeSwap(
                    user1.address,
                    tokenIn,
                    tokenOut,
                    amountIn,
                    amountOut,
                    "trigger-123"
                )
            ).to.be.revertedWith("Not authorized");
        });

        it("Should reject swap with insufficient balance", async function () {
            const tokenIn = ethers.ZeroAddress;
            const tokenOut = "0x0000000000000000000000000000000000000001";
            const amountIn = ethers.parseEther("2000"); // More than deposited
            const amountOut = ethers.parseEther("1");

            await expect(
                tradingBot.connect(admin).executeSwap(
                    user1.address,
                    tokenIn,
                    tokenOut,
                    amountIn,
                    amountOut,
                    "trigger-123"
                )
            ).to.be.revertedWith("Insufficient balance");
        });

        it("Should reject swap with zero amounts", async function () {
            const tokenIn = ethers.ZeroAddress;
            const tokenOut = "0x0000000000000000000000000000000000000001";

            await expect(
                tradingBot.connect(admin).executeSwap(
                    user1.address,
                    tokenIn,
                    tokenOut,
                    0,
                    ethers.parseEther("1"),
                    "trigger-123"
                )
            ).to.be.revertedWith("Invalid amounts");
        });

        it("Should emit SwapExecuted event", async function () {
            const tokenIn = ethers.ZeroAddress;
            const tokenOut = "0x0000000000000000000000000000000000000001";
            const amountIn = ethers.parseEther("100");
            const amountOut = ethers.parseEther("0.05");
            const triggerId = "trigger-123";

            await expect(
                tradingBot.connect(admin).executeSwap(
                    user1.address,
                    tokenIn,
                    tokenOut,
                    amountIn,
                    amountOut,
                    triggerId
                )
            )
                .to.emit(tradingBot, "SwapExecuted")
                .withArgs(user1.address, tokenIn, tokenOut, amountIn, amountOut, triggerId);
        });
    });

    describe("Balance Queries", function () {
        it("Should return correct balance for single token", async function () {
            const depositAmount = ethers.parseEther("5.0");
            await tradingBot.connect(user1).deposit(ethers.ZeroAddress, depositAmount, {
                value: depositAmount
            });

            const balance = await tradingBot.getBalance(user1.address, ethers.ZeroAddress);
            expect(balance).to.equal(depositAmount);
        });

        it("Should return correct balances for multiple tokens", async function () {
            const token1 = ethers.ZeroAddress;
            const token2 = "0x0000000000000000000000000000000000000001";

            // Deposit MNT
            await tradingBot.connect(user1).deposit(token1, ethers.parseEther("10"), {
                value: ethers.parseEther("10")
            });

            // Simulate swap to get token2
            await tradingBot.setExecutorAuthorization(admin.address, true);
            await tradingBot.connect(admin).executeSwap(
                user1.address,
                token1,
                token2,
                ethers.parseEther("5"),
                ethers.parseEther("2"),
                "test"
            );

            const balances = await tradingBot.getBalances(user1.address, [token1, token2]);
            expect(balances[0]).to.equal(ethers.parseEther("5"));
            expect(balances[1]).to.equal(ethers.parseEther("2"));
        });
    });

    describe("Emergency Withdraw", function () {
        it("Should allow owner to emergency withdraw", async function () {
            // User deposits
            await tradingBot.connect(user1).deposit(ethers.ZeroAddress, ethers.parseEther("10"), {
                value: ethers.parseEther("10")
            });

            const initialOwnerBalance = await ethers.provider.getBalance(owner.address);

            // Owner emergency withdraws
            const tx = await tradingBot.emergencyWithdraw(
                ethers.ZeroAddress,
                ethers.parseEther("5")
            );
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;

            const finalOwnerBalance = await ethers.provider.getBalance(owner.address);

            expect(finalOwnerBalance).to.be.closeTo(
                initialOwnerBalance + ethers.parseEther("5") - gasUsed,
                ethers.parseEther("0.001")
            );
        });

        it("Should not allow non-owner to emergency withdraw", async function () {
            await expect(
                tradingBot.connect(user1).emergencyWithdraw(ethers.ZeroAddress, ethers.parseEther("1"))
            ).to.be.reverted;
        });
    });

    describe("Events", function () {
        it("Should emit Deposit event", async function () {
            const amount = ethers.parseEther("1.0");

            await expect(
                tradingBot.connect(user1).deposit(ethers.ZeroAddress, amount, { value: amount })
            )
                .to.emit(tradingBot, "Deposit")
                .withArgs(user1.address, ethers.ZeroAddress, amount);
        });

        it("Should emit Withdraw event", async function () {
            const amount = ethers.parseEther("1.0");
            await tradingBot.connect(user1).deposit(ethers.ZeroAddress, amount, { value: amount });

            await expect(tradingBot.connect(user1).withdraw(ethers.ZeroAddress, amount))
                .to.emit(tradingBot, "Withdraw")
                .withArgs(user1.address, ethers.ZeroAddress, amount);
        });

        it("Should emit ExecutorAuthorized event", async function () {
            await expect(tradingBot.setExecutorAuthorization(admin.address, true))
                .to.emit(tradingBot, "ExecutorAuthorized")
                .withArgs(admin.address, true);
        });
    });
});
