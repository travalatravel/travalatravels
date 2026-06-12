export const OPEN_LIVE_CHAT_EVENT = "travala:open-live-chat";

export function openLiveChat() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_LIVE_CHAT_EVENT));
}
