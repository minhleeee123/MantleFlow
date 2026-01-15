# ⚠️ DEPRECATED CONTRACTS

**These contracts are no longer in use and have been replaced by V2 contracts.**

---

## Status

❌ **NOT USED** - These contracts were part of the initial development phase and are now obsolete.

## Current Active Contracts

The system currently uses contracts from `../contractsV2/`:

- ✅ **VaultWithSwap.sol** - Multi-token vault with bot-authorized swaps
- ✅ **SimpleDEXV2.sol** - AMM with constant product formula

Deployed addresses can be found in `../addressesV3.json`

---

## Deprecated Contracts in This Folder

1. **AutoCompoundStaking.sol** - Old staking implementation
2. **LendingPool.sol** - Unused lending protocol
3. **MultiTokenVault.sol** - Replaced by VaultWithSwap
4. **NFTStaking.sol** - NFT staking (not implemented in app)
5. **ReferralRewards.sol** - Referral system (not used)
6. **SimpleDEX.sol** - Replaced by SimpleDEXV2
7. **StakingRewards.sol** - Old staking rewards

---

## Migration Notes

- All functionality has been consolidated into V2 contracts
- Users should NOT interact with these deprecated contracts
- This folder can be safely deleted for production deployments

---

**Last Updated:** January 15, 2026
