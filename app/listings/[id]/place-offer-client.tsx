"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
export default function PlaceOfferClient({ listingId, minOfferCents, offerState = "NONE", viewerHasAnyOffer = false, disabled = false, disabledText = "Waiting for seller decision.", endsAtIso, }: {
    listingId: string;
    minOfferCents: number;
    offerState?: "NONE" | "TOP" | "OUTBID";
    viewerHasAnyOffer?: boolean;
    disabled?: boolean;
    disabledText?: string;
    endsAtIso?: string;
}) {
    const safeMinCents = Number.isFinite(Number(minOfferCents)) ? Number(minOfferCents) : 0;
    const minDollars = safeMinCents / 100;
    const [amount, setAmount] = useState<string>(minDollars ? minDollars.toFixed(2) : "");
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string>("");
    const [needAuth, setNeedAuth] = useState(false);
    const [lastResult, setLastResult] = useState<null | {
        submittedCents: number;
        currentCents: number | null;
        isTop: boolean;
    }>(null);
    const router = useRouter();
    const [clientEnded, setClientEnded] = useState(false);
    useEffect(() => {
        if (!endsAtIso)
            return;
        const end = new Date(endsAtIso).getTime();
        if (!Number.isFinite(end))
            return;
        const tick = () => setClientEnded(Date.now() >= end);
        tick();
        const t = setInterval(tick, 1000);
        return () => clearInterval(t);
    }, [endsAtIso]);
    const hardDisabled = Boolean(disabled) || Boolean(clientEnded);
    const hardDisabledText = clientEnded ? "Offers are closed for this listing." : (disabledText || "Waiting for seller decision.");
    async function submit() {
        if (hardDisabled) {
            setMsg(hardDisabledText);
            return;
        }
        if (loading) {
            return;
        }
        setMsg("");
        setNeedAuth(false);
        setLastResult(null);
        const value = Number(amount);
        if (!Number.isFinite(value) || value <= 0) {
            setMsg("Enter a valid offer amount before submitting.");
            return;
        }
        const cents = Math.round(value * 100);
        if (cents < safeMinCents) {
            setMsg(`Offer must be at least $${(safeMinCents / 100).toFixed(2)}.`);
            return;
        }
        try {
            setLoading(true);
            const res = await fetch("/api/offers/place", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ listingId: listingId, amount: value }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                const raw = String(data?.error || data?.reason || "");
                if (raw === "NOT_AUTHENTICATED") {
                    setNeedAuth(true);
                    setMsg("");
                    return;
                }
                setMsg(raw || "We could not place your offer. Please try again.");
                return;
            }
            const isTop = data?.isTop === true || data?.status === "TOP" || data?.status === "HIGHEST" || data?.status === "WINNING";
            setLastResult({
                submittedCents: cents,
                currentCents: (typeof data?.currentOfferCents === "number") ? data.currentOfferCents : null,
                isTop: isTop,
            });
            setMsg("");
            router.refresh();
        }
        catch {
            setMsg("We could not place your offer. Please try again.");
        }
        finally {
            setLoading(false);
        }
    }
    if (needAuth) {
        return (<div>
        <div>
          <div>Sign in to make an offer</div>
          <div>
            Sign in so your offer can be linked to your account and kept with the listing conversation.
          </div>
          <button type="button" onClick={() => router.push("/auth/login?next=" + encodeURIComponent("/listings/" + listingId))}>
            Log in
          </button>
        </div>
      </div>);
    }
    return (<div>
      {lastResult ? (<div>
          <div>Offer submitted</div>
          <div>
            Max offer:{" "}
            <span>
              ${(lastResult.submittedCents / 100).toFixed(2)}
            </span>
            {lastResult.currentCents !== null ? (<>
                {" "} - Current visible top offer:{" "}
                <span>
                  ${(lastResult.currentCents / 100).toFixed(2)}
                </span>
              </>) : null}
          </div>
          <div>
            {lastResult.isTop ? (<>You are currently the highest offer. If the seller accepts, Bidra creates an order for the next step.</>) : (<>You have been out-offered. Increase your offer only if you are prepared to honour it.</>)}
          </div>
        </div>) : null}

      {viewerHasAnyOffer && offerState === "TOP" ? (<div>
          You are the highest offer. If the seller accepts, the order will appear in Orders.
        </div>) : viewerHasAnyOffer && offerState === "OUTBID" ? (<div>
          <div>You have been out-offered.</div>
          <div>Increase your offer only if you are prepared to honour it.</div>
        </div>) : null}

      <div>
        Minimum offer:{" "}
        <span>
          ${minDollars.toFixed(2)}
        </span>
      </div>

      <div>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") {
        e.preventDefault();
        submit();
    } }} inputMode="decimal" placeholder="Enter your offer amount, e.g. 25.50" disabled={hardDisabled || loading}/>

        <button type="button" onClick={submit} disabled={loading || hardDisabled}>
          {loading ? "Sending offer..." : "Make an offer"}
        </button>
      </div>

      {(hardDisabled && !msg) ? <div>{hardDisabledText}</div> : null}
      {msg ? <div>{msg}</div> : null}
    </div>);
}
