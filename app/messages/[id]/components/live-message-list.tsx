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
    if (Number.isNaN(date.getTime()))
        return "";
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
        if (inFlightRef.current)
            return;
        if (typeof document !== "undefined" && document.visibilityState !== "visible")
            return;
        inFlightRef.current = true;
        try {
            const res = await fetch("/api/messages/thread/" + encodeURIComponent(threadId), {
                method: "GET",
                cache: "no-store",
                headers: { accept: "application/json" },
            });
            if (!res.ok)
                return;
            const data = (await res.json()) as ThreadResponse;
            const nextMessages = Array.isArray(data.messages) ? data.messages : [];
            setMessages(function (current) {
                const currentLast = current.length ? current[current.length - 1].id : "";
                const nextLast = nextMessages.length ? nextMessages[nextMessages.length - 1].id : "";
                if (current.length === nextMessages.length && currentLast === nextLast)
                    return current;
                return nextMessages;
            });
            setUpdateError(false);
        }
        catch {
            setUpdateError(true);
        }
        finally {
            inFlightRef.current = false;
        }
    }, [threadId]);
    useEffect(function () {
        let stopped = false;
        function tick() {
            if (stopped)
                return;
            refreshMessages();
        }
        function onVisibilityChange() {
            if (document.visibilityState === "visible")
                tick();
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
    return (<div>
      <div>
        <div />
        <span>Today</span>
        <div />
      </div>

      {updateError ? (<div>
          Live updates paused. Reconnecting automatically.
        </div>) : null}

      {messages.map(function (message) {
            const mine = String(message.userId) === me;
            const seen = mine && message.id === latestMessageId;
            return (<div key={message.id}>
            <div>
              <div>
                {message.body}
              </div>
              <div>
                {formatTime(message.createdAt)}{seen ? "" : ""}
              </div>
            </div>
          </div>);
        })}

      {messages.length === 0 ? (<div>
          <h3>No messages yet</h3>
          <p>Start the conversation below.</p>
        </div>) : null}
    </div>);
}
