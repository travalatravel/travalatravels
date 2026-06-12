"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X, Minimize2, Headphones } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "@/i18n/useTranslations";
import { LOCALE_BCP47 } from "@/i18n/config";
import { OPEN_LIVE_CHAT_EVENT } from "@/lib/open-live-chat";

type ChatMessage = {
  id: string;
  sender: "VISITOR" | "ADMIN";
  body: string;
  createdAt: string;
};

type Conversation = {
  id: string;
  guestFirstName: string;
  guestLastName: string;
  email: string;
  status: string;
};

function formatTime(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function LiveChatWidget() {
  const { user } = useAuth();
  const { messages: m, locale } = useTranslations();
  const lc = m.liveChat;

  const [open, setOpen] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState("");
  const [unread, setUnread] = useState(0);

  const listRef = useRef<HTMLDivElement>(null);
  const lastSeenRef = useRef<string | null>(null);
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    if (!user) return;
    const parts = user.name.trim().split(/\s+/);
    if (!firstName && parts[0]) setFirstName(parts[0]);
    if (!lastName && parts.length > 1) setLastName(parts.slice(1).join(" "));
    if (!email) setEmail(user.email);
  }, [user, firstName, lastName, email]);

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  const loadConversation = useCallback(async () => {
    const res = await fetch("/api/chat/conversation");
    if (!res.ok) return;
    const data = await res.json();
    if (data.conversation) {
      setConversation(data.conversation);
      setRegistered(true);
      setFirstName(data.conversation.guestFirstName);
      setLastName(data.conversation.guestLastName);
      setEmail(data.conversation.email);
    }
    if (Array.isArray(data.messages)) {
      setMessages(data.messages);
      const lastAdmin = [...data.messages].reverse().find((msg: ChatMessage) => msg.sender === "ADMIN");
      if (lastAdmin && !openRef.current && lastAdmin.id !== lastSeenRef.current) {
        setUnread((u) => u + 1);
      }
    }
  }, []);

  useEffect(() => {
    void loadConversation();
  }, [loadConversation]);

  useEffect(() => {
    const onOpen = () => {
      setOpen(true);
      setUnread(0);
    };
    window.addEventListener(OPEN_LIVE_CHAT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_LIVE_CHAT_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    setUnread(0);
    const last = messages[messages.length - 1];
    if (last) lastSeenRef.current = last.id;
    scrollToBottom();
  }, [open, messages, scrollToBottom]);

  useEffect(() => {
    if (!open || !registered) return;
    const timer = setInterval(() => void loadConversation(), 4000);
    return () => clearInterval(timer);
  }, [open, registered, loadConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setRegistering(true);
    const res = await fetch("/api/chat/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestFirstName: firstName.trim(),
        guestLastName: lastName.trim(),
        email: email.trim(),
      }),
    });
    const data = await res.json();
    setRegistering(false);
    if (!res.ok) {
      setError(data.error || lc.registerFailed);
      return;
    }
    setConversation(data.conversation);
    setRegistered(true);
    await loadConversation();
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setError("");
    const res = await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text }),
    });
    const data = await res.json();
    setSending(false);
    if (!res.ok) {
      setError(data.error || lc.sendFailed);
      return;
    }
    setDraft("");
    setMessages((prev) => [...prev, data.message]);
    if (conversation?.status === "CLOSED") {
      setConversation((c) => (c ? { ...c, status: "OPEN" } : c));
    }
  };

  const toggleOpen = () => {
    setOpen((v) => !v);
    if (!open) setUnread(0);
  };

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex flex-col items-end sm:bottom-6 sm:right-6">
      {open && (
        <div
          className="pointer-events-auto mb-3 flex w-[min(100vw-2rem,380px)] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-[#1a5f94]/15"
          style={{ height: "min(520px, calc(100dvh - 6rem))" }}
        >
          <div className="flex items-center justify-between bg-gradient-to-r from-[#1a5f94] to-[#2D83C2] px-4 py-3.5 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <Headphones size={18} />
              </div>
              <div>
                <p className="text-sm font-bold">{lc.title}</p>
                <p className="text-[11px] text-white/80">{lc.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/10"
                aria-label={lc.minimize}
              >
                <Minimize2 size={18} />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/10"
                aria-label={lc.close}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!registered ? (
            <form onSubmit={handleRegister} className="flex flex-1 flex-col overflow-y-auto p-4">
              <p className="text-sm font-semibold text-[#1a1a1a]">{lc.introTitle}</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">{lc.introBody}</p>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">{lc.firstName}</label>
                  <input
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2D83C2] focus:ring-2 focus:ring-[#2D83C2]/10"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">{lc.lastName}</label>
                  <input
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2D83C2] focus:ring-2 focus:ring-[#2D83C2]/10"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">{lc.email}</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2D83C2] focus:ring-2 focus:ring-[#2D83C2]/10"
                  />
                </div>
              </div>
              {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={registering}
                className="mt-auto pt-4"
              >
                <span className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2D83C2] py-3 text-sm font-bold text-white hover:bg-[#1a5f94] disabled:opacity-60">
                  {registering ? lc.starting : lc.startChat}
                </span>
              </button>
            </form>
          ) : (
            <>
              <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50/80 px-3 py-4">
                {messages.length === 0 && (
                  <p className="rounded-xl bg-white px-3 py-2 text-center text-xs text-gray-500 shadow-sm">
                    {lc.emptyState}
                  </p>
                )}
                {messages.map((msg) => {
                  const isVisitor = msg.sender === "VISITOR";
                  return (
                    <div key={msg.id} className={`flex ${isVisitor ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                          isVisitor
                            ? "rounded-br-md bg-[#2D83C2] text-white"
                            : "rounded-bl-md border border-slate-100 bg-white text-[#1a1a1a]"
                        }`}
                      >
                        {!isVisitor && (
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[#2D83C2]">
                            {lc.supportTeam}
                          </p>
                        )}
                        <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.body}</p>
                        <p
                          className={`mt-1 text-[10px] ${isVisitor ? "text-white/70" : "text-gray-400"}`}
                        >
                          {formatTime(msg.createdAt, LOCALE_BCP47[locale])}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {conversation?.status === "CLOSED" && (
                  <p className="text-center text-xs text-gray-500">{lc.conversationClosed}</p>
                )}
              </div>

              <form onSubmit={handleSend} className="border-t border-slate-100 bg-white p-3">
                {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
                <div className="flex gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={lc.inputPlaceholder}
                    disabled={conversation?.status === "CLOSED" || sending}
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#2D83C2] focus:ring-2 focus:ring-[#2D83C2]/10 disabled:bg-gray-50"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || sending || conversation?.status === "CLOSED"}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2D83C2] text-white transition hover:bg-[#1a5f94] disabled:opacity-40"
                    aria-label={lc.send}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={toggleOpen}
        className="pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#1a5f94] to-[#2D83C2] text-white shadow-lg shadow-[#2D83C2]/30 transition hover:scale-105 hover:shadow-xl active:scale-95"
        aria-label={open ? lc.close : lc.open}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
        {!open && unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
    </div>
  );
}
