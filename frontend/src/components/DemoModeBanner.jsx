import React from 'react';
import { FEATURES, DEMO_MODE_MESSAGE } from '../config/solana';

/**
 * DemoModeBanner Component
 * Shows when smart contract is not yet deployed
 */
export const DemoModeBanner = () => {
    if (!FEATURES.SHOW_DEMO_MODE) return null;

    return (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-t border-b border-yellow-500/30 py-3 px-4">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <p className="text-sm font-medium text-yellow-200">
                    ⚠️ {DEMO_MODE_MESSAGE}
                </p>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            </div>
        </div>
    );
};

export default DemoModeBanner;
