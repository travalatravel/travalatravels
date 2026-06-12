"use client";

import { usePathname } from "next/navigation";
import LiveChatWidget from "./LiveChatWidget";

export default function LiveChatMount() {
  const pathname = usePathname() || "";
  if (pathname.startsWith("/admin")) return null;
  return <LiveChatWidget />;
}
