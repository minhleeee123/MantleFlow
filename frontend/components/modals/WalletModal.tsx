import React from 'react';
import { X, Download, ArrowRight, Wallet, Shield } from 'lucide-react';

interface WalletOption {
    id: string;
    name: string;
    icon: string; // URL or simple placeholder
    downloadUrl: string;
    description: string;
    isPopular?: boolean;
}

interface WalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConnect: (walletId: string) => void;
}

const WALLETS: WalletOption[] = [
    {
        id: 'metamask',
        name: 'MetaMask',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
        downloadUrl: 'https://metamask.io/download/',
        description: 'Standard for Ethereum & EVM chains.',
        isPopular: true
    },
    {
        id: 'phantom',
        name: 'Phantom',
        icon: 'https://cryptologos.cc/logos/phantom-phantom-logo.png',
        downloadUrl: 'https://phantom.app/download',
        description: 'Best for Solana & Multichain.'
    },
    {
        id: 'coinbase',
        name: 'Coinbase Wallet',
        icon: 'https://images.ctfassets.net/q5ulk4bp65r7/3TBS4oVkD1ghowTqVQJlqj/2dfd4ea3b623a7c0d8deb2ff445dee9e/Consumer_Wordmark.svg',
        downloadUrl: 'https://www.coinbase.com/wallet/downloads',
        description: 'Secure wallet from Coinbase.'
    },
    {
        id: 'walletconnect',
        name: 'WalletConnect',
        icon: 'https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Logo/Blue%20(Default)/Logo.svg',
        downloadUrl: 'https://walletconnect.com/',
        description: 'Connect with mobile wallets.'
    }
];

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onConnect }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-lg border-4 border-black dark:border-white shadow-neo-lg relative flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b-4 border-black dark:border-white bg-neo-primary">
                    <div className="flex items-center gap-3">
                        <div className="bg-black text-white p-2 border-2 border-white">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Connect Wallet</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors shadow-neo-sm"
                    >
                        <X className="w-6 h-6" strokeWidth={3} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar bg-checkered">
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-6 bg-white dark:bg-black w-fit px-2 border border-black dark:border-gray-500">
                        Select a provider to access decentralized features.
                    </p>

                    <div className="space-y-4">
                        {WALLETS.map((wallet) => (
                            <div key={wallet.id} className="relative group">
                                <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 transition-transform group-hover:translate-x-2 group-hover:translate-y-2"></div>
                                <div className="relative bg-white dark:bg-[#262626] border-2 border-black dark:border-white p-4 flex items-center gap-4 transition-transform group-hover:-translate-y-0.5 group-hover:-translate-x-0.5">

                                    {/* Icon */}
                                    <div className="w-12 h-12 shrink-0 border-2 border-black dark:border-white bg-white flex items-center justify-center p-2">
                                        <img src={wallet.icon} alt={wallet.name} className="w-full h-full object-contain" />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-black text-lg uppercase text-black dark:text-white truncate">{wallet.name}</h3>
                                            {wallet.isPopular && (
                                                <span className="text-[10px] bg-neo-yellow border border-black px-1 font-bold uppercase">Popular</span>
                                            )}
                                        </div>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{wallet.description}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={wallet.downloadUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 transition-all rounded-none"
                                            title={`Download ${wallet.name}`}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Download className="w-5 h-5" />
                                        </a>
                                        <button
                                            onClick={() => onConnect(wallet.id)}
                                            className="bg-neo-accent hover:bg-neo-primary text-black hover:text-white border-2 border-black px-3 py-2 font-black uppercase text-sm flex items-center gap-1 transition-colors"
                                        >
                                            Connect <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-2 text-xs font-bold text-gray-500 uppercase">
                        <Shield className="w-4 h-4" />
                        <span>Encrypted & Secure Connection</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletModal;