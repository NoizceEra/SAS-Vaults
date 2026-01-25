import React, { useState } from 'react'
import { useAutoSavings } from './sdk/useAutoSavings'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

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

  return (
    <div className="min-h-screen bg-black text-slate-200 p-6">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">AutoSave</h1>
        <WalletMultiButton />
      </header>

      <main className="space-y-6">
        <section className="bg-slate-900 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-slate-400">Wallet</div>
              <div className="text-xl font-bold">{(walletBalance ?? 0).toFixed(4)} SOL</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Vault</div>
              <div className="text-xl font-bold">{(vaultBalance ?? 0).toFixed(4)} SOL</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Status</div>
              <div className="text-sm font-bold">{isInitialized ? 'Active' : 'Not initialized'}</div>
            </div>
          </div>
        </section>

        <section className="flex gap-4">
          <button onClick={doInitialize} disabled={!isConnected || isInitialized || loading} className="bg-purple-600 px-4 py-2 rounded">Initialize</button>
          <button onClick={() => setActiveModal('deposit')} disabled={!isConnected} className="bg-white text-black px-4 py-2 rounded">Deposit</button>
          <button onClick={() => setActiveModal('withdraw')} disabled={!isConnected || (vaultBalance ?? 0) === 0} className="bg-slate-700 px-4 py-2 rounded">Withdraw</button>
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
