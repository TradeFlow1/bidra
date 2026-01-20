# Bidra — Tonight Public Launch Buckets (Matchbox)
Date: 2026-01-17 (AEST)
Rule: Only mark DONE after (1) npm run build is green and (2) git commit + push.

## Scope (Tonight) — #1–#5 ONLY
- [x] #1: Re-check #1–#5 status in this file (truth)
- [x] #2: Confirm DONE vs pending for #1–#5 (truth)
- [x] #3: Live-site “must not fail” smoke sweep (home/ctas, listings+filters, listing detail+gallery+message seller, login/register/logout, legal+support)
- [x] #4: Brand assets verification (only kangaroo + hero-clouds; /brand/*.png 200; no mixed-domain issues)
- [x] #5: Git hygiene / deploy sync (git status clean; only trigger-deploy commit if Vercel is stale)


## P0 (Must fix)
- [x] P0-6 (NEW): Imported screenshot issues + confirmed key features exist in repo (local listings hook, category suggestion code, message delete/report routes, restrictions TTL fields, admin reports routes, offers endpoints)  ✅ DONE
- [x] P0-7: Remove public 'coming soon' copy on /orders/[id]/pay-now (redirect to /orders/[id]/pay)  ✅ DONE
- [x] P0-8: Messages no longer redirects to restrictions for non-UNDER_18 + fix mojibake dash  ✅ DONE
- [x] P0-9: Brand assets locked to kangaroo + hero-clouds only; remove light/dark icon + favicons; prod /brand/*.png returns 200  ✅ DONE

## P1 (Should fix)
- [ ] P1-1:
- [ ] P1-2:

## P2 (Nice to have)
- [ ] P2-1:

## Screenshot issues (intake)
- [x] ISSUE: rotating listings on the home page by area closest (LOCAL LISTINGS)  ✅ DONE (home uses /api/listings?local=1; API ranks by postcode/suburb/state + daily rotation; falls back when logged out)
- [x] ISSUE: suggest category by description when selling an item  ✅ DONE (token/word-boundary matching; avoids false matches like 'tools' -> pets; commit 48fdfa1)
- [x] ISSUE: Pay Now – cannot use signup email as PayID (most people use mobile); allow user to add PayID/bank details
- [ ] ISSUE: notifications for users – how do we set that up
- [x] ISSUE: when user lists an item, default location to their signed-up suburb, allow manual change
- [x] ISSUE: AI suggestions for product descriptions when listing an item  ✅ DONE
- [x] ISSUE: seller has relist on live listing – should only be available on expired listing  ✅ DONE
- [ ] ISSUE: item that has been 'bought' still showing as active listings to other users
- [x] ISSUE: no option to delete old messages or report in messages
- [x] ISSUE: restricted account past timeout did not automatically end restriction
- [ ] ISSUE: admin report system needs to be better
- [x] ISSUE: avoid off-platform payments text needs to go until Stripe later  ✅ DONE
- [x] ISSUE: suggest better wording for Australia-wide marketplace on the hero  ✅ DONE
- [x] ISSUE: some listings show on home but not listings page; others show in listings but not home
- [ ] ISSUE: messages page – show small photo of the listing you’re messaging about
- [ ] ISSUE: no time remaining on a listing (countdown clock)
- [ ] ISSUE: fix postcode + suburb UX across Bidra to be more user friendly
- [x] ISSUE: submit feedback error 500  ✅ DONE
- [ ] ISSUE: my offer on a listing failed – check offers flow + ensure no broken links
- [ ] ISSUE: the whole website screams amateur (UX polish pass)


