"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageSquare, RefreshCw, Send, XCircle } from "lucide-react";

type ConversationRow = {
  id: string;
  guestFirstName: string;
  guestLastName: string;
  email: string;
  status: string;
  lastMessageAt: string;
  preview: string;
  lastSender: string | null;
};

type ChatMessage = {
  id: string;
  sender: string;
  body: string;
  createdAt: string;
};

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AdminChatPage() {
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [filter, setFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [detail, setDetail] = useState<ConversationRow | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const loadList = useCallback(async () => {
    const qs = filter ? `?status=${filter}` : "";
    const res = await fetch(`/api/admin/chat/conversations${qs}`);
    const data = await res.json();
    setConversations(data.conversations || []);
  }, [filter]);

  const loadThread = useCallback(async (id: string) => {
    const res = await fetch(`/api/admin/chat/conversations/${id}`);
    const data = await res.json();
    if (!res.ok) return;
    setMessages(data.messages || []);
    setDetail({
      id: data.conversation.id,
      guestFirstName: data.conversation.guestFirstName,
      guestLastName: data.conversation.guestLastName,
      email: data.conversation.email,
      status: data.conversation.status,
      lastMessageAt: data.conversation.createdAt,
      preview: "",
      lastSender: null,
    });
  }, []);

  useEffect(() => {
    void loadList();
    const timer = setInterval(() => void loadList(), 8000);
    return () => clearInterval(timer);
  }, [loadList]);

  useEffect(() => {
    if (!selectedId) return;
    void loadThread(selectedId);
    const timer = setInterval(() => void loadThread(selectedId), 4000);
    return () => clearInterval(timer);
  }, [selectedId, loadThread]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !draft.trim() || sending) return;
    setSending(true);
    const res = await fetch(`/api/admin/chat/conversations/${selectedId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: draft.trim() }),
    });
    const data = await res.json();
    setSending(false);
    if (!res.ok) return;
    setDraft("");
    setMessages((prev) => [...prev, data.message]);
    void loadList();
  };

  const setStatus = async (status: "OPEN" | "CLOSED") => {
    if (!selectedId) return;
    await fetch(`/api/admin/chat/conversations/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    void loadThread(selectedId);
    void loadList();
  };

  const filters = ["", "OPEN", "CLOSED"];

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a] sm:text-2xl">Live Chat</h1>
          <p className="mt-1 text-gray-500">{conversations.length} conversations</p>
        </div>
        <button
          type="button"
          onClick={() => void loadList()}
          className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm hover:bg-gray-50"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f || "all"}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              filter === f ? "bg-[#2D83C2] text-white" : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f || "All"}
          </button>
        ))}
      </div>

      <div className="mt-6 grid min-h-[520px] gap-4 lg:grid-cols-[minmax(0,340px)_1fr]">
        <div className="max-h-[70vh] overflow-y-auto rounded-2xl bg-white shadow-sm lg:max-h-none">
          {conversations.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">No conversations yet.</p>
          ) : (
            conversations.map((c) => {
              const active = selectedId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={`block w-full border-b border-gray-100 px-4 py-3 text-left transition ${
                    active ? "bg-[#eef5fc]" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#1a1a1a]">
                        {c.guestFirstName} {c.guestLastName}
                      </p>
                      <p className="truncate text-xs text-gray-500">{c.email}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        c.status === "OPEN"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  {c.preview && (
                    <p className="mt-1 line-clamp-2 text-xs text-gray-600">{c.preview}</p>
                  )}
                  <p className="mt-1 text-[10px] text-gray-400">{formatWhen(c.lastMessageAt)}</p>
                </button>
              );
            })
          )}
        </div>

        <div className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
          {!selectedId || !detail ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-gray-400">
              <MessageSquare size={40} strokeWidth={1.25} />
              <p className="text-sm">Select a conversation to reply</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
                <div>
                  <p className="font-semibold text-[#1a1a1a]">
                    {detail.guestFirstName} {detail.guestLastName}
                  </p>
                  <p className="text-xs text-gray-500">{detail.email}</p>
                </div>
                <div className="flex gap-2">
                  {detail.status === "OPEN" ? (
                    <button
                      type="button"
                      onClick={() => void setStatus("CLOSED")}
                      className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                    >
                      <XCircle size={14} /> Close
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void setStatus("OPEN")}
                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-800"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>

              <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-4">
                {messages.map((msg) => {
                  const isAdmin = msg.sender === "ADMIN";
                  return (
                    <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                          isAdmin
                            ? "rounded-br-md bg-[#2D83C2] text-white"
                            : "rounded-bl-md border border-slate-100 bg-white text-[#1a1a1a]"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                        <p className={`mt-1 text-[10px] ${isAdmin ? "text-white/70" : "text-gray-400"}`}>
                          {formatWhen(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={sendReply} className="border-t border-gray-100 p-3">
                <div className="flex gap-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type your reply…"
                    rows={2}
                    disabled={detail.status === "CLOSED" || sending}
                    className="min-w-0 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#2D83C2] disabled:bg-gray-50"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || sending || detail.status === "CLOSED"}
                    className="flex h-11 w-11 shrink-0 items-center justify-center self-end rounded-xl bg-[#2D83C2] text-white hover:bg-[#1a5f94] disabled:opacity-40"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
