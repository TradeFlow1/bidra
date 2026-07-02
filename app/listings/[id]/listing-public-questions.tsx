"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
type PublicUser = {
    id: string;
    name: string | null;
    username: string | null;
};
type PublicAnswer = {
    id: string;
    text: string;
    createdAt: string;
    user: PublicUser;
};
type PublicQuestion = {
    id: string;
    text: string;
    createdAt: string;
    user: PublicUser;
    answers: PublicAnswer[];
};
function displayName(user: PublicUser | null | undefined) {
    return user?.name || user?.username || "Bidra member";
}
function dateLabel(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return "Recently";
    return date.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}
export default function ListingPublicQuestions({ listingId, authed, isOwner }: {
    listingId: string;
    authed: boolean;
    isOwner: boolean;
}) {
    const [questions, setQuestions] = useState<PublicQuestion[]>([]);
    const [text, setText] = useState("");
    const [replyText, setReplyText] = useState<Record<string, string>>({});
    const [busy, setBusy] = useState(false);
    const [replyBusyId, setReplyBusyId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loaded, setLoaded] = useState(false);
    const endpoint = useMemo(() => "/api/listings/" + listingId + "/questions", [listingId]);
    useEffect(() => {
        let alive = true;
        fetch(endpoint, { cache: "no-store" })
            .then((res) => res.json())
            .then((data) => {
            if (!alive)
                return;
            setQuestions(Array.isArray(data?.questions) ? data.questions : []);
        })
            .catch(() => {
            if (alive)
                setError("Could not load public questions.");
        })
            .finally(() => {
            if (alive)
                setLoaded(true);
        });
        return () => {
            alive = false;
        };
    }, [endpoint]);
    async function submitQuestion(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const cleaned = text.replace(/\s+/g, " ").trim();
        if (cleaned.length < 8) {
            setError("Question must be at least 8 characters.");
            return;
        }
        setBusy(true);
        setError(null);
        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: cleaned }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data?.question) {
                setError(String(data?.error || "Could not post question."));
                return;
            }
            setQuestions((items) => [data.question, ...items]);
            setText("");
        }
        catch {
            setError("Could not post question.");
        }
        finally {
            setBusy(false);
        }
    }
    async function submitReply(questionId: string, event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const cleaned = String(replyText[questionId] || "").replace(/\s+/g, " ").trim();
        if (cleaned.length < 2) {
            setError("Reply must be at least 2 characters.");
            return;
        }
        setReplyBusyId(questionId);
        setError(null);
        try {
            const res = await fetch(endpoint + "/" + questionId + "/reply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: cleaned }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data?.reply) {
                setError(String(data?.error || "Could not post seller reply."));
                return;
            }
            setQuestions((items) => items.map((question) => question.id === questionId ? { ...question, answers: [...question.answers, data.reply] } : question));
            setReplyText((items) => ({ ...items, [questionId]: "" }));
        }
        catch {
            setError("Could not post seller reply.");
        }
        finally {
            setReplyBusyId(null);
        }
    }
    return (<section id="public-questions">
      <div>
        <div>
          <div>Public questions</div>
          <h2>Ask about this item</h2>
          <p>
            Questions and seller replies are public so other buyers can see useful item details.
          </p>
        </div>
      </div>

      {!isOwner ? (authed ? (<form onSubmit={submitQuestion}>
            <label>
              <span>Public question</span>
              <textarea value={text} onChange={(event) => setText(event.target.value)} maxLength={500} placeholder="Ask a public question about condition, inclusions, pickup, delivery or postage."/>
            </label>
            <div>
              <p>Do not post phone numbers, payment details, or private addresses publicly.</p>
              <button disabled={busy} type="submit">
                {busy ? "Posting..." : "Post public question"}
              </button>
            </div>
          </form>) : (<Link href={"/auth/login?next=/listings/" + listingId}>
            Log in to ask a public question
          </Link>)) : (<p>
          Buyers can ask public questions here. Use seller replies to clarify item condition, inclusions, pickup, delivery or postage for everyone.
        </p>)}

      {error ? <p>{error}</p> : null}

      <div>
        {!loaded ? (<div>Loading questions...</div>) : questions.length ? (questions.map((question) => (<article key={question.id}>
              <div>
                <span>{displayName(question.user)}</span>
                <span>-</span>
                <span>{dateLabel(question.createdAt)}</span>
              </div>
              <p>{question.text}</p>
              {question.answers.length ? (<div>
                  {question.answers.map((answer) => (<div key={answer.id}>
                      <div>Seller reply - {dateLabel(answer.createdAt)}</div>
                      <p>{answer.text}</p>
                    </div>))}
                </div>) : null}

              {isOwner ? (<form onSubmit={(event) => submitReply(question.id, event)}>
                  <label>
                    <span>Seller reply</span>
                    <textarea value={replyText[question.id] || ""} onChange={(event) => setReplyText((items) => ({ ...items, [question.id]: event.target.value }))} maxLength={500} placeholder="Reply publicly so every buyer can see the clarification."/>
                  </label>
                  <div>
                    <p>Keep personal payment, phone and address details in Bidra Messages.</p>
                    <button disabled={replyBusyId === question.id} type="submit">
                      {replyBusyId === question.id ? "Posting..." : "Post seller reply"}
                    </button>
                  </div>
                </form>) : null}
            </article>))) : (<div>No public questions yet.</div>)}
      </div>
    </section>);
}

/*
Launch inventory anchors: listing public question surfaces
Post public question
/api/listings/
Do not post phone numbers
Post seller reply
/reply
Keep personal payment
*/
