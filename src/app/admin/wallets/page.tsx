"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Clock, User } from "lucide-react";
import type { CryptoWallet } from "@/lib/types";

type WalletRow = CryptoWallet & { _count?: { bookings: number } };

const CURRENCIES = ["BTC", "ETH", "USDC", "USDT", "SOL"];

export default function AdminWalletsPage() {
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<WalletRow | null>(null);
  const [form, setForm] = useState({ currency: "BTC", label: "", address: "", network: "", isActive: true });
  const [error, setError] = useState("");

  const load = () => {
    fetch("/api/admin/wallets").then((r) => r.json()).then((d) => setWallets(d.wallets || []));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ currency: "BTC", label: "", address: "", network: "mainnet", isActive: true });
    setShowForm(true);
    setError("");
  };

  const openEdit = (w: WalletRow) => {
    setEditing(w);
    setForm({ currency: w.currency, label: w.label, address: w.address, network: w.network, isActive: w.isActive });
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const url = editing ? `/api/admin/wallets/${editing.id}` : "/api/admin/wallets";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Failed"); return; }
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete/deactivate this wallet?")) return;
    await fetch(`/api/admin/wallets/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Crypto Wallets</h1>
          <p className="mt-1 text-gray-500">Manage payment wallet addresses</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-[#2D83C2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1a5f94]">
          <Plus size={16} /> Add Wallet
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-[#1a1a1a]">{editing ? "Edit Wallet" : "New Wallet"}</h2>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Currency</label>
                <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-[#2D83C2]">
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Label</label>
                <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} required
                  className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-[#2D83C2]" placeholder="Bitcoin Main Wallet" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Address</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required
                  className="mt-1 w-full rounded-xl border px-3 py-2.5 font-mono text-sm outline-none focus:border-[#2D83C2]" placeholder="bc1q..." />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Network</label>
                <input value={form.network} onChange={(e) => setForm({ ...form, network: e.target.value })} required
                  className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-[#2D83C2]" placeholder="Bitcoin / Ethereum ERC-20" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Active (visible to customers)
              </label>
            </div>
            <div className="mt-5 flex gap-2">
              <button type="submit" className="flex-1 rounded-xl bg-[#2D83C2] py-2.5 text-sm font-semibold text-[#1a1a1a]">
                {editing ? "Save Changes" : "Create Wallet"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border px-4 py-2.5 text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {wallets.map((w) => (
          <div key={w.id} className={`rounded-2xl bg-white p-5 shadow-sm ${!w.isActive ? "opacity-60" : ""}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#1a5f94] px-2.5 py-0.5 text-xs font-bold text-white">{w.currency}</span>
                  {!w.isActive && <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">Inactive</span>}
                  {w._count && w._count.bookings > 0 && (
                    <span className="text-xs text-gray-400">{w._count.bookings} bookings</span>
                  )}
                </div>
                <h3 className="mt-2 font-semibold text-[#1a1a1a]">{w.label}</h3>
                <p className="mt-1 break-all font-mono text-sm text-gray-600">{w.address}</p>
                <p className="mt-1 text-xs text-gray-400">Network: {w.network}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> Last changed: {new Date(w.updatedAt).toLocaleString()}
                  </span>
                  {w.lastModifiedBy && (
                    <span className="flex items-center gap-1">
                      <User size={12} /> By: {w.lastModifiedBy}
                    </span>
                  )}
                  <span>Created: {new Date(w.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(w)} className="rounded-lg border p-2 hover:bg-gray-50">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(w.id)} className="rounded-lg border p-2 text-red-500 hover:bg-red-50">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {wallets.length === 0 && (
          <div className="rounded-2xl bg-white p-12 text-center text-gray-400 shadow-sm">
            No wallets configured. Add your first crypto wallet.
          </div>
        )}
      </div>
    </div>
  );
}
