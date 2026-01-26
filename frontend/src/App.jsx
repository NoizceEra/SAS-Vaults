import React, { useState } from 'react'
import { useAutoSavings } from './sdk/useAutoSavings'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'

const App = () => {
  const [activeModal, setActiveModal] = useState(null)
  const [amount, setAmount] = useState('')

  const {
    isConnected,
    isInitialized,
    walletBalance,
    vaultBalance,
    userConfig,
    initializeUser,
    deposit,
    withdraw,
    loading,
    refresh,
  } = useAutoSavings()

  const doInitialize = async () => {
    try {
      await initializeUser(10)
      alert('Initialized')
      await refresh()
    } catch (e) {
      console.error(e)
      alert('Init failed: ' + (e.message || e))
    }
  }

  const doSubmit = async () => {
    const value = parseFloat(amount)
    if (Number.isNaN(value) || value <= 0) return alert('Enter amount > 0')
    try {
      if (activeModal === 'deposit') await deposit(value)
      else await withdraw(value)
      setAmount('')
      setActiveModal(null)
      await refresh()
      alert('Transaction submitted')
    } catch (e) {
      console.error(e)
      alert('Transaction failed: ' + (e.message || e))
    }
  }

  const wallet = useWallet()
  const shortAddress = wallet?.publicKey ? `${wallet.publicKey.toString().slice(0,4)}...${wallet.publicKey.toString().slice(-4)}` : null

  const copyAddress = async () => {
    if (!wallet?.publicKey) return
    try {
      await navigator.clipboard.writeText(wallet.publicKey.toString())
      alert('Copied wallet address')
    } catch (e) {
      console.error(e)
      alert('Unable to copy')
    }
  }

  return (
    <div className="min-h-screen bg-black text-slate-200 p-6">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 via-purple-600 to-indigo-500 flex items-center justify-center shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m0 0l3-3m-3 3l-3-3" />
            </svg>
          </div>
          <div>
            <div className="text-2xl font-bold">AutoSave</div>
            <div className="text-xs text-slate-400">Automatic micro-savings — DeFi native</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {shortAddress && (
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              <div className="text-sm font-mono text-slate-200">{shortAddress}</div>
              <button onClick={copyAddress} className="text-slate-400 hover:text-slate-200 text-sm">Copy</button>
            </div>
          )}
          <div className="rounded-lg overflow-hidden">
            <WalletMultiButton />
          </div>
        </div>
      </header>

      <main className="space-y-6 max-w-5xl mx-auto">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 card-gradient p-6 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold">Dashboard</h2>
                <div className="text-xs text-slate-400">Overview of your savings</div>
              </div>
              <div className="text-sm text-slate-400">Connected: {isConnected ? 'Yes' : 'No'}</div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="stat-card bg-transparent">
                <div className="text-xs muted">Wallet</div>
                <div className="text-2xl font-bold">{(walletBalance ?? 0).toFixed(4)} SOL</div>
              </div>
              <div className="stat-card bg-transparent">
                <div className="text-xs muted">Vault</div>
                <div className="text-2xl font-bold">{(vaultBalance ?? 0).toFixed(4)} SOL</div>
              </div>
              <div className="stat-card bg-transparent">
                <div className="text-xs muted">Status</div>
                <div className="flex items-center gap-2">
                  <div className={`text-sm font-bold ${isInitialized ? 'text-emerald-400' : 'text-slate-400'}`}>{isInitialized ? 'Active' : 'Not initialized'}</div>
                  {loading && <div className="spinner" aria-hidden />}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs muted mb-2">Savings Rate</div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div className="h-3 bg-gradient-to-r from-rose-500 to-indigo-500" style={{ width: `${(userConfig?.savingsRate ?? 0)}%` }} />
              </div>
              <div className="text-xs text-slate-400 mt-2">{userConfig?.savingsRate ?? '--'}% of transfers saved</div>
            </div>

            <div className="flex gap-3">
              <button onClick={doInitialize} disabled={!isConnected || isInitialized || loading} className="btn-primary">Initialize</button>
              <button onClick={() => setActiveModal('deposit')} disabled={!isConnected} className="btn-secondary">Deposit</button>
              <button onClick={() => setActiveModal('withdraw')} disabled={!isConnected || (vaultBalance ?? 0) === 0} className="btn-secondary">Withdraw</button>
              <button onClick={refresh} className="btn-ghost">Refresh</button>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="card-gradient p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-bold">Your Wallet</div>
                <div className="text-xs text-slate-400">{shortAddress}</div>
              </div>
              <div className="text-2xl font-bold mb-2">{(walletBalance ?? 0).toFixed(4)} SOL</div>
              <div className="text-xs text-slate-400">Main balance</div>
            </div>

            <div className="card-gradient p-4 rounded-xl">
              <div className="text-sm font-bold mb-2">Vault Insights</div>
              <div className="text-lg font-semibold">{(vaultBalance ?? 0).toFixed(4)} SOL</div>
              <div className="text-xs text-slate-400 mt-2">Auto-saved amount across transactions</div>
            </div>
          </aside>
        </section>

        {activeModal && (
          <section className="bg-slate-900 p-4 rounded">
            <h3 className="font-bold mb-2">{activeModal === 'deposit' ? 'Deposit' : 'Withdraw'}</h3>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-2 mb-2 bg-black/40 rounded" placeholder="Amount in SOL" />
            <div className="flex gap-2">
              <button onClick={doSubmit} className="bg-green-600 px-4 py-2 rounded">Confirm</button>
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 rounded border">Cancel</button>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
