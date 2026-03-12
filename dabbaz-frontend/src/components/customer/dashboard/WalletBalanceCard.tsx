import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';

interface Props {
    balance: number;
}

const WalletBalanceCard: React.FC<Props> = ({ balance }) => {
    return (
        <div className="bg-white rounded-[14px] p-6 shadow-sm border border-gray-100 mt-6 relative overflow-hidden">
            {/* Soft decorative background circle */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-orange-50 rounded-full blur-2xl opacity-60"></div>

            <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-brand-primary/10 rounded-lg">
                        <Wallet className="w-5 h-5 text-brand-primary" />
                    </div>
                </div>
                <Link to="/wallet/history" className="text-xs font-semibold text-brand-secondary hover:underline">
                    View History
                </Link>
            </div>

            <div className="mt-2 text-center md:text-left relative z-10 py-4">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Dabbaz Wallet</p>
                <h3 className="text-[32px] font-extrabold text-[#1A1A1A] leading-none mb-1">
                    ₹{balance}
                </h3>
                {balance === 0 && (
                    <p className="text-xs text-gray-400 font-medium">No credit available</p>
                )}
            </div>
        </div>
    );
};

export default WalletBalanceCard;
