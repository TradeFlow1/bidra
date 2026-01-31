import Link from "next/link";
import { auth } from "@/lib/auth";
import { unstable_noStore as noStore } from "next/cache";

export const metadata = { title: "Feedback — Bidra" };

export default async function FeedbackPage() {
  noStore();
  const session = await auth();
  const signedIn = !!session?.user;

  return (
    <main className="bd-shell py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight bd-ink">Feedback</h1>
        <p className="mt-2 bd-ink2">
          Help us improve Bidra. Your message goes directly into our admin portal.
        </p>

        <div className="mt-6 rounded-xl border bd-bd bg-white p-5">
          <div className="text-sm font-extrabold bd-ink">Product feedback</div>
          <p className="mt-2 text-sm bd-ink2">
            Tell us what’s confusing, broken, or missing. Include steps to reproduce if you can.
          </p>

          {signedIn ? (
            <form className="mt-4 space-y-3" action="/api/feedback/site" method="post" onSubmit={(e)=>{e.preventDefault();}} data-bidra="client-submit">
              {/* This form is submitted by client JS below (fetch), to avoid full refresh */}
              <div>
                <label className="text-xs font-semibold bd-ink">Category (optional)</label>
                <select
                  id="bd_fb_category"
                  className="mt-1 w-full rounded-xl border bd-bd px-3 py-2"
                  defaultValue=""
                >
                  <option value="">Choose…</option>
                  <option value="Bug">Bug</option>
                  <option value="UX">UX / confusing</option>
                  <option value="Feature">Feature request</option>
                  <option value="Trust & Safety">Trust & Safety</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold bd-ink">Message</label>
                <textarea
                  id="bd_fb_message"
                  className="mt-1 w-full min-h-[140px] rounded-xl border bd-bd px-3 py-2"
                  placeholder="What happened? What did you expect? Steps to reproduce?"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button id="bd_fb_submit" type="button" className="bd-btn bd-btn-solid">
                  Send feedback
                </button>
                <Link href="/support" className="bd-btn bd-btn-outline">Support &amp; Safety</Link>
                <Link href="/contact" className="bd-btn bd-btn-outline">Contact</Link>
              </div>

              <div id="bd_fb_status" className="text-sm bd-ink2" aria-live="polite" />
              <script
                dangerouslySetInnerHTML={{
                  __html: `
(function(){
  var btn = document.getElementById("bd_fb_submit");
  if(!btn) return;
  btn.addEventListener("click", async function(){
    var cat = (document.getElementById("bd_fb_category")||{}).value || "";
    var msg = (document.getElementById("bd_fb_message")||{}).value || "";
    var status = document.getElementById("bd_fb_status");
    if(status) status.textContent = "";
    msg = (msg||"").trim();
    if(!msg){
      if(status) status.textContent = "Please enter a message.";
      return;
    }
    btn.disabled = true;
    try{
      var res = await fetch("/api/feedback/site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: cat, message: msg, pageUrl: window.location.href })
      });
      var j = null;
      try{ j = await res.json(); }catch(e){}
      if(!res.ok){
        if(status) status.textContent = (j && j.error) ? j.error : "Failed to send feedback.";
        return;
      }
      (document.getElementById("bd_fb_message")||{}).value = "";
      if(status) status.textContent = "Thanks — your feedback was sent.";
    }catch(e){
      if(status) status.textContent = "Failed to send feedback.";
    }finally{
      btn.disabled = false;
    }
  });
})();`
                }}
              />
            </form>
          ) : (
            <div className="mt-4 rounded-xl border bd-bd bg-white/60 p-4">
              <div className="text-sm font-extrabold bd-ink">Sign in required</div>
              <p className="mt-2 text-sm bd-ink2">
                Sign in to send product feedback so we can follow up if needed.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/auth/login?next=/feedback" className="bd-btn bd-btn-solid">Sign in</Link>
                <Link href="/auth/register" className="bd-btn bd-btn-outline">Create account</Link>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-xl border bd-bd bg-white p-5">
          <div className="text-sm font-extrabold bd-ink">Feedback on a purchase</div>
          <p className="mt-2 text-sm bd-ink2">
            Buyer/seller feedback is left from completed orders.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/orders" className="bd-btn bd-btn-outline">Go to orders</Link>
            <Link href="/how-it-works" className="bd-btn bd-btn-outline">How it works</Link>
          </div>
        </div>

        <div className="mt-4 text-xs bd-ink2">
          Note: Bidra is a platform only and is not the seller of items listed.
        </div>
      </div>
    </main>
  );
}
