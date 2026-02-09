// FRONTEND WARNING BANNER
// Add this to your frontend/src/components/WarningBanner.tsx

import React from 'react';

export const BetaWarningBanner = () => {
  const [accepted, setAccepted] = React.useState(false);
  
  if (accepted) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 text-4xl">⚠️</div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">
              BETA SOFTWARE - USE AT YOUR OWN RISK
            </h2>
            <div className="space-y-2 text-sm">
              <p className="font-semibold">THIS SOFTWARE HAS NOT BEEN AUDITED</p>
              <ul className="list-disc list-inside space-y-1">
                <li>You could lose ALL deposited funds</li>
                <li>Swap feature is DISABLED (coming soon)</li>
                <li>Maximum TVL: $1,000 (10 SOL)</li>
                <li>This is experimental software</li>
                <li>No guarantees or warranties provided</li>
              </ul>
              <p className="font-semibold mt-3">
                By using this protocol, you acknowledge and accept all risks.
              </p>
            </div>
            <div className="mt-4 flex gap-4">
              <button
                onClick={() => setAccepted(true)}
                className="px-6 py-2 bg-white text-red-600 font-bold rounded hover:bg-gray-100"
              >
                I Understand the Risks
              </button>
              <a
                href="/"
                className="px-6 py-2 bg-red-800 text-white font-bold rounded hover:bg-red-900"
              >
                Exit
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// TVL CAP INDICATOR
// Shows how close to cap the protocol is

export const TvlCapIndicator = ({ currentTvl, cap }) => {
  const percentage = (currentTvl / cap) * 100;
  const remaining = cap - currentTvl;
  
  const getColor = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  return (
    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold">TVL Status</span>
        <span className="text-sm">
          {(currentTvl / 1e9).toFixed(2)} / {(cap / 1e9).toFixed(2)} SOL
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
        <div
          className={`h-4 rounded-full transition-all ${getColor()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      <p className="text-sm text-gray-700">
        {remaining > 0 ? (
          <>
            Remaining capacity: {(remaining / 1e9).toFixed(2)} SOL
            {percentage >= 90 && (
              <span className="text-red-600 font-semibold"> - Nearly Full!</span>
            )}
          </>
        ) : (
          <span className="text-red-600 font-semibold">
            TVL CAP REACHED - Deposits Disabled
          </span>
        )}
      </p>
    </div>
  );
};

// SWAP DISABLED NOTICE

export const SwapDisabledNotice = () => {
  return (
    <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="text-2xl">ℹ️</div>
        <div>
          <h3 className="font-bold text-blue-900 mb-1">
            Swap Feature Disabled
          </h3>
          <p className="text-sm text-blue-800">
            Token swaps are temporarily disabled in this beta version. 
            Core deposit and withdrawal functionality is available.
            Swap feature will be enabled after security audit completion.
          </p>
        </div>
      </div>
    </div>
  );
};

// USAGE IN APP

// In your main App.tsx or index page:
/*
import { BetaWarningBanner, TvlCapIndicator, SwapDisabledNotice } from './components/WarningBanner';

function App() {
  return (
    <>
      <BetaWarningBanner />
      <div className="pt-32"> {/* Add padding for fixed banner */}
        <TvlCapIndicator currentTvl={currentTvl} cap={10_000_000_000} />
        <SwapDisabledNotice />
        {/* Rest of your app */}
      </div>
    </>
  );
}
*/
