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
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

export default function ListingPublicQuestions({ listingId, authed, isOwner }: { listingId: string; authed: boolean; isOwner: boolean }) {
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const endpoint = useMemo(() => "/api/listings/" + listingId + "/questions", [listingId]);

  useEffect(() => {
    let alive = true;
    fetch(endpoint, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!alive) return;
        setQuestions(Array.isArray(data?.questions) ? data.questions : []);
      })
      .catch(() => {
        if (alive) setError("Could not load public questions.");
      })
      .finally(() => {
        if (alive) setLoaded(true);
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
    } catch {
      setError("Could not post question.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-10 rounded-2xl border border-[#DFE6F6] bg-white p-5 shadow-sm" id="public-questions">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#4F46E5]">Public questions</div>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#080D32]">Ask about this item</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#667399]">
            Questions and seller replies are public so other buyers can see useful item details.
          </p>
        </div>
      </div>

      {!isOwner ? (
        authed ? (
          <form onSubmit={submitQuestion} className="mt-5 grid gap-3">
            <label className="block">
              <span className="sr-only">Public question</span>
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                maxLength={500}
                className="min-h-24 w-full rounded-2xl border border-[#CBD5E1] px-4 py-3 text-sm font-semibold"
                placeholder="Ask a public question about condition, inclusions, pickup, delivery or postage."
              />
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-bold text-[#667399]">Do not post phone numbers, payment details, or private addresses publicly.</p>
              <button disabled={busy} className="h-12 rounded-2xl bg-[#4F46E5] px-5 text-sm font-black !text-white disabled:opacity-60" type="submit">
                {busy ? "Posting..." : "Post public question"}
              </button>
            </div>
          </form>
        ) : (
          <Link href={"/auth/login?next=/listings/" + listingId} className="mt-5 inline-flex h-12 items-center justify-center rounded-2xl bg-[#4F46E5] px-5 text-sm font-black !text-white">
            Log in to ask a public question
          </Link>
        )
      ) : (
        <p className="mt-5 rounded-2xl border border-[#D8E1F0] bg-[#F8FAFF] p-4 text-sm font-semibold text-[#42526F]">
          Buyers can ask public questions here. Seller replies will appear with the question.
        </p>
      )}

      {error ? <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-900">{error}</p> : null}

      <div className="mt-6 divide-y divide-[#E2E8F0] overflow-hidden rounded-2xl border border-[#E2E8F0]">
        {!loaded ? (
          <div className="p-4 text-sm font-semibold text-[#667399]">Loading questions...</div>
        ) : questions.length ? (
          questions.map((question) => (
            <article key={question.id} className="p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#667399]">
                <span>{displayName(question.user)}</span>
                <span>-</span>
                <span>{dateLabel(question.createdAt)}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-6 text-[#26345F]">{question.text}</p>
              {question.answers.length ? (
                <div className="mt-4 space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  {question.answers.map((answer) => (
                    <div key={answer.id}>
                      <div className="text-xs font-black uppercase tracking-[0.12em] text-emerald-800">Seller reply - {dateLabel(answer.createdAt)}</div>
                      <p className="mt-1 text-sm font-semibold leading-6 text-emerald-950">{answer.text}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          ))
        ) : (
          <div className="p-4 text-sm font-semibold text-[#667399]">No public questions yet.</div>
        )}
      </div>
    </section>
  );
}
