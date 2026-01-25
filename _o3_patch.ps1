$ErrorActionPreference = "Stop"

$fp = ".\app\orders\[id]\pay\page.tsx"
if (!(Test-Path -LiteralPath $fp)) { throw "MISSING: $fp" }

$old = (Get-Content -LiteralPath $fp) -join "`n"

# GUARD: no prior injection
if ($old -like "*hasPayDetails*") { throw "GUARD FAIL: hasPayDetails already present. Restore file first." }

# 1) Insert hasPayDetails after sellerBankAccount line
$find1 = "  const sellerBankAccount = (seller?.bankAccount || `"`").trim();"
$ins1  = $find1 + "`n" +
"`n" +
"  const hasPayDetails = Boolean(" + "`n" +
"    sellerPayidEmail || sellerPayidMobile || (sellerBankBsb && sellerBankAccount)" + "`n" +
"  );"
if (($old -split "`n" | Where-Object { $_ -eq $find1 }).Count -ne 1) { throw "GUARD FAIL: sellerBankAccount anchor not exactly once" }
$new = $old.Replace($find1, $ins1)

# 2) Update missing-details sentence
$find2 = "                      Seller payout details are missing. Contact the seller to arrange payment."
$rep2  = "                      Seller payout details are missing. Please message the seller to add PayID/bank details."
if (($new -split "`n" | Where-Object { $_ -eq $find2 }).Count -ne 1) { throw "GUARD FAIL: missing-details anchor not exactly once" }
$new = $new.Replace($find2, $rep2)

# 3) Gate buyer block start
$find3 = "                  {isBuyer ? ("
$rep3  = "                  {isBuyer ? (hasPayDetails ? ("
if (($new -split "`n" | Where-Object { $_ -eq $find3 }).Count -ne 1) { throw "GUARD FAIL: isBuyer anchor not exactly once" }
$new = $new.Replace($find3, $rep3)

# 4) Replace PayConfirmClient line with gated branch
$find4 = "                    <PayConfirmClient orderId={order.id} />"
$rep4  = $find4 + "`n" +
"                  ) : (" + "`n" +
"                    <div className=`"text-sm bd-ink2`">" + "`n" +
"                      Waiting for the seller to add payout details. View the listing and message them to add PayID/bank details." + "`n" +
"                    </div>" + "`n" +
"                  )) : ("
if (($new -split "`n" | Where-Object { $_ -eq $find4 }).Count -ne 1) { throw "GUARD FAIL: PayConfirmClient anchor not exactly once" }
$new = $new.Replace($find4, $rep4)

# 5) Insert action card after Tip line
$find5 = "                  Tip: include the reference exactly so the seller can match your payment quickly."
$card  =
$find5 + "`n`n" +
"                {!hasPayDetails ? (" + "`n" +
"                  <div className=`"mt-3 bd-card p-4`">" + "`n" +
"                    <div className=`"text-sm font-extrabold bd-ink`">Missing payout details</div>" + "`n" +
"                    <div className=`"mt-1 text-sm bd-ink2`">" + "`n" +
"                      You can't complete payment until the seller adds PayID/bank details. Use the buttons below to view the listing and message them." + "`n" +
"                    </div>" + "`n" +
"                    <div className=`"mt-3 flex flex-wrap gap-2`">" + "`n" +
"                      <Link href={listingHref} className=`"bd-btn bd-btn-primary text-center`">View listing</Link>" + "`n" +
"                      <Link href={orderHref} className=`"bd-btn bd-btn-primary text-center`">Back to order</Link>" + "`n" +
"                      <Link href=`"/profile`" className=`"bd-btn bd-btn-primary text-center`">Account Settings</Link>" + "`n" +
"                    </div>" + "`n" +
"                  </div>" + "`n" +
"                ) : null}" + "`n"
if (($new -split "`n" | Where-Object { $_ -eq $find5 }).Count -ne 1) { throw "GUARD FAIL: tip anchor not exactly once" }
$new = $new.Replace($find5, $card)

# FINAL GUARDS
$h1 = (($new -split "`n") | Where-Object { $_ -like "*const hasPayDetails*" }).Count
if ($h1 -ne 1) { throw "PATCH FAIL: hasPayDetails not present once (found $h1)" }

$h2 = (($new -split "`n") | Where-Object { $_ -like "*{isBuyer ? (hasPayDetails ? (*" }).Count
if ($h2 -ne 1) { throw "PATCH FAIL: buyer gating line not present once (found $h2)" }

Set-Content -LiteralPath $fp -Encoding UTF8 -Value $new
"OK: O3 patch written to /orders/[id]/pay"
