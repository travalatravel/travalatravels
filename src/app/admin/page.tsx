"use client";

import { useEffect, useState } from "react";
import { Users, CalendarCheck, Wallet, DollarSign, Clock, Eye, MessageSquare } from "lucide-react";
import type { Booking } from "@/lib/types";
import { PAYMENT_STATUS_COLORS, PAYMENT_STATUS_LABELS } from "@/lib/types";
import PageViewsPanel from "@/components/admin/PageViewsPanel";

type Stats = {
  users: number;
  bookings: number;
  wallets: number;
  pendingPayments: number;
  paidBookings: number;
  totalRevenue: number;
  uniqueVisitorsToday: number;
  openChats: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Booking[]>([]);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        setStats(d.stats);
        setRecent(d.recentBookings || []);
      });
  }, []);

  const cards = stats
    ? [
        { label: "Registered Users", value: stats.users, icon: Users, color: "bg-blue-500" },
        { label: "Total Bookings", value: stats.bookings, icon: CalendarCheck, color: "bg-purple-500" },
        { label: "Pending Payments", value: stats.pendingPayments, icon: Clock, color: "bg-yellow-500" },
        { label: "Paid Bookings", value: stats.paidBookings, icon: DollarSign, color: "bg-green-500" },
        { label: "Crypto Wallets", value: stats.wallets, icon: Wallet, color: "bg-teal-500" },
        { label: "Total Revenue", value: `$${stats.totalRevenue.toFixed(0)}`, icon: DollarSign, color: "bg-[#2D83C2]" },
        { label: "Unique Visitors Today", value: stats.uniqueVisitorsToday, icon: Eye, color: "bg-indigo-500" },
        { label: "Open Chats", value: stats.openChats, icon: MessageSquare, color: "bg-orange-500" },
      ]
    : [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Dashboard</h1>
          <p className="mt-1 text-gray-500">Overview of your Travala platform</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.color} text-white`}>
              <c.icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1a1a1a]">{c.value}</p>
              <p className="text-sm text-gray-500">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-[#1a1a1a]">Recent Bookings</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 pr-4">User</th>
                <th className="pb-3 pr-4">Offer</th>
                <th className="pb-3 pr-4">Amount</th>
                <th className="pb-3 pr-4">Payment</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((b) => (
                <tr key={b.id} className="border-b border-gray-50">
                  <td className="py-3 pr-4">
                    <div className="font-medium">{b.user?.name}</div>
                    <div className="text-xs text-gray-400">{b.user?.email}</div>
                  </td>
                  <td className="py-3 pr-4">{b.offer?.title}</td>
                  <td className="py-3 pr-4 font-semibold">${b.totalPrice.toFixed(2)}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PAYMENT_STATUS_COLORS[b.paymentStatus as keyof typeof PAYMENT_STATUS_COLORS] || ""}`}>
                      {PAYMENT_STATUS_LABELS[b.paymentStatus as keyof typeof PAYMENT_STATUS_LABELS] || b.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">{new Date(b.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">No bookings yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8">
        <PageViewsPanel
          title="All Page Views"
          description="Every tracked visit on the public site — filter by path or browse pages"
        />
      </div>
    </div>
  );
}
