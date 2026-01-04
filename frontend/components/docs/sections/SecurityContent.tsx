import React from 'react';
import { SecurityItem } from '../DocHelpers';

export const SecurityContent = () => (
    <ul className="space-y-4">
        <SecurityItem title="Wallet Signature Auth" desc="Login logic requires a cryptographic signature from your wallet, ensuring true ownership." />
        <SecurityItem title="Non-Custodial Logic" desc="While the bot executes trades, you retain withdrawal rights via the Smart Contract." />
        <SecurityItem title="Reentrancy Guards" desc="Smart contracts are protected against reentrancy attacks using OpenZeppelin guards." />
        <SecurityItem title="Environment Security" desc="Sensitive keys are managed via env variables and never exposed to the client." />
    </ul>
);
