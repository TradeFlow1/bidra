"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type MessageItem = {
  id: string;
  body: string;
  createdAt: string;
  userId: string;
};

type LiveMessageListProps = {
  threadId: string;
  me: string;
  initialMessages: MessageItem[];
};

type ThreadResponse = {
  messages?: MessageItem[];
};

const POLL_MS = 3000;

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" });
}

export default function LiveMessageList({ threadId, me, initialMessages }: LiveMessageListProps) {
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [updateError, setUpdateError] = useState(false);
  const inFlightRef = useRef(false);

  const latestMessageId = useMemo(function () {
    return messages.length ? messages[messages.length - 1].id : "";
  }, [messages]);

  const refreshMessages = useCallback(async function () {
    if (inFlightRef.current) return;
    if (typeof document !== "undefined" && document.visibilityState !== "visible") return;

    inFlightRef.current = true;

    try {
      const res = await fetch("/api/messages/thread/" + encodeURIComponent(threadId), {
        method: "GET",
        cache: "no-store",
        headers: { accept: "application/json" },
      });

      if (!res.ok) return;

      const data = (await res.json()) as ThreadResponse;
      const nextMessages = Array.isArray(data.messages) ? data.messages : [];

      setMessages(function (current) {
        const currentLast = current.length ? current[current.length - 1].id : "";
        const nextLast = nextMessages.length ? nextMessages[nextMessages.length - 1].id : "";
        if (current.length === nextMessages.length && currentLast === nextLast) return current;
        return nextMessages;
      });
      setUpdateError(false);
    } catch {
      setUpdateError(true);
    } finally {
      inFlightRef.current = false;
    }
  }, [threadId]);

  useEffect(function () {
    let stopped = false;

    function tick() {
      if (stopped) return;
      refreshMessages();
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") tick();
    }

    function onSent() {
      tick();
    }

    tick();
    const timer = window.setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("bidra:message-sent", onSent);

    return function () {
      stopped = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("bidra:message-sent", onSent);
    };
  }, [refreshMessages]);

  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-4 sm:space-y-5 sm:px-6 sm:py-7">
      <div className="flex items-center gap-5 text-sm font-black text-[#8B7A98]">
        <div className="h-px flex-1 bg-[#F0EAFE]" />
        <span>Today</span>
        <div className="h-px flex-1 bg-[#F0EAFE]" />
      </div>

      {updateError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
          Live updates paused. Reconnecting automatically.
        </div>
      ) : null}

      {messages.map(function (message) {
        const mine = String(message.userId) === me;
        const seen = mine && message.id === latestMessageId;

        return (
          <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[84%] sm:max-w-[78%] ${mine ? "text-right" : "text-left"}`}>
              <div className={`rounded-2xl px-4 py-3 text-sm font-semibold leading-6 shadow-sm sm:px-5 sm:py-4 sm:text-base ${mine ? "bd-message-bubble-mine" : "bd-message-bubble-other"}`}>
                {message.body}
              </div>
              <div className="mt-2 text-sm font-semibold text-[#8B7A98]">
                {formatTime(message.createdAt)}{seen ? "" : ""}
              </div>
            </div>
          </div>
        );
      })}

      {messages.length === 0 ? (
        <div className="rounded-[24px] border border-[#EDE9FE] bg-[#FBF9FF] p-8 text-center">
          <h3 className="text-2xl font-black">No messages yet</h3>
          <p className="mt-3 text-base font-semibold text-[#62516F]">Start the conversation below.</p>
        </div>
      ) : null}
    </div>
  );
}
