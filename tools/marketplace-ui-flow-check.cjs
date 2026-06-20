const fs = require("fs");
const path = require("path");

const root = process.cwd();

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error("Missing required file: " + relativePath);
  }
  return fs.readFileSync(fullPath, "utf8");
}

function assertContains(file, content, pattern, label) {
  const ok = pattern instanceof RegExp ? pattern.test(content) : content.includes(pattern);
  if (!ok) {
    throw new Error(file + " missing UI flow anchor: " + label);
  }
}

function check(file, expectations) {
  const content = read(file);
  for (const expectation of expectations) {
    assertContains(file, content, expectation.pattern, expectation.label);
  }
  console.log("PASS " + file);
}

check("app/sell/new/sell-new-client.tsx", [
  { pattern: "field-title", label: "title field" },
  { pattern: "field-category-top", label: "top category select" },
  { pattern: "field-subcategory", label: "subcategory select" },
  { pattern: "field-condition", label: "condition select" },
  { pattern: "field-description", label: "description textarea" },
  { pattern: "What condition is it in?", label: "description condition prompt" },
  { pattern: "Pickup or postage details", label: "description handover prompt" },
  { pattern: "Description guide", label: "seller description guide action" },
  { pattern: "Marks or faults:", label: "description guide faults line" },
  { pattern: "Pickup/postage:", label: "description guide handover line" },
  { pattern: "field-location", label: "location field" },
  { pattern: "field-price", label: "buy now price field" },
  { pattern: "field-starting-bid", label: "starting offer field" },
  { pattern: "field-buy-now-price", label: "optional buy now field" },
  { pattern: "Continue", label: "publish/continue submit button" }
]);

check("app/sell/edit/[id]/edit-listing-client.tsx", [
  { pattern: '"SOLD"', label: "seller sold status option" },
  { pattern: "Mark sold", label: "seller mark sold action" },
  { pattern: "markListingSold", label: "seller mark sold handler" },
  { pattern: "/update", label: "listing update API call" }
]);

check("app/listings/[id]/buy-now-button.tsx", [
  { pattern: "Buy now", label: "buy now button" },
  { pattern: "/buy-now", label: "buy now API call" }
]);

check("app/listings/[id]/place-offer-client.tsx", [
  { pattern: "Make an offer", label: "offer button" },
  { pattern: "Enter your offer amount", label: "offer amount input" },
  { pattern: "/api/offers/place", label: "offer API call" },
  { pattern: "Current visible top offer", label: "proxy offer public display copy" },
  { pattern: "data?.isTop === true", label: "proxy offer top response handling" }
]);

check("app/listings/[id]/message-seller-button.tsx", [
  { pattern: "Message seller", label: "message seller button" },
  { pattern: "/api/messages/thread", label: "message thread API call" }
]);

check("app/listings/page.tsx", [
  { pattern: "selectedQuery", label: "keyword query state" },
  { pattern: 'name="q"', label: "keyword search input" },
  { pattern: "contains: selectedQuery", label: "server-side keyword filtering" },
  { pattern: "Search: {selectedQuery}", label: "keyword results summary" }
]);

check("app/messages/[id]/components/send-box.tsx", [
  { pattern: 'aria-label="Message text"', label: "message textarea label" },
  { pattern: "Send", label: "send button" },
  { pattern: "/send", label: "message send API call" }
]);

check("app/listings/c/[category]/page.tsx", [
  { pattern: "currentOfferAmount", label: "category page public current offer amount" }
]);

check("app/listings/c/[category]/[location]/page.tsx", [
  { pattern: "currentOfferAmount", label: "category-location page public current offer amount" }
]);

console.log("PASS Marketplace UI flow inventory checks completed.");

check("app/listings/[id]/page.tsx", [
  { pattern: "!!userId && !isOwner", label: "authenticated offer form gate" },
  { pattern: "showOfferLogin", label: "guest offer login gate" },
  { pattern: "Log in to make an offer", label: "guest offer login CTA" },
  { pattern: "ListingImageGallery", label: "multi-image detail gallery" },
  { pattern: "generateMetadata({ params }", label: "dynamic listing metadata" },
  { pattern: "alternates: { canonical: canonicalPath }", label: "listing canonical URL" },
  { pattern: "openGraph", label: "listing open graph metadata" }
]);

check("app/listings/[id]/layout.tsx", [
  { pattern: "ListingPublicQuestions", label: "public listing questions surface" },
  { pattern: "isOwner={userId === listing.sellerId}", label: "seller ownership passed to questions" }
]);

check("app/listings/[id]/listing-public-questions.tsx", [
  { pattern: "Post public question", label: "public question submit action" },
  { pattern: "/api/listings/", label: "public question API call" },
  { pattern: "Do not post phone numbers", label: "public safety guidance" }
]);

check("components/account-recovery-form.tsx", [
  { pattern: "/api/auth/password-reset/request", label: "account recovery API call" },
  { pattern: "Send reset link", label: "account recovery submit action" }
]);

check("app/account/layout.tsx", [
  { pattern: "Change password", label: "account security change password panel" },
  { pattern: "/forgot-password", label: "account security reset link" }
]);
