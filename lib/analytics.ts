export function getAnalyticsFoundationSummary() {
  return {
    mode: "internal-foundation",
    adminEvents: true,
    activitySessions: true,
    aggregateCounts: true,
    externalProviderActive: false,
    googleAnalytics: false,
    metaPixel: false,
    postHog: false,
    segment: false,
    mixpanel: false,
    cookieConsentRequiredForExternalTracking: false,
    summary: "Bidra currently uses internal AdminEvent rows, ActivitySession rows, and aggregate marketplace counts for operational review. External analytics providers are not active yet.",
  };
}

export function getAnalyticsLimitBullets() {
  return [
    "No Google Analytics or GA4 integration is active.",
    "No Meta Pixel integration is active.",
    "No PostHog, Segment, Mixpanel, Amplitude, Plausible, Umami, Hotjar, or Clarity integration is active.",
    "No external attribution model, cookie-consent tracking banner, or event warehouse is active.",
    "Internal analytics should be treated as operational review signals, not a complete revenue or attribution dashboard.",
  ];
}
