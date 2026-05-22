export type AuLocation = {
  suburb: string;
  state: string;
  postcode: string;
  latitude: number;
  longitude: number;
};

const locations: AuLocation[] = [
  { suburb: "Brisbane City", state: "QLD", postcode: "4000", latitude: -27.4705, longitude: 153.0260 },
  { suburb: "Redbank Plains", state: "QLD", postcode: "4301", latitude: -27.6464, longitude: 152.8597 },
  { suburb: "Springfield", state: "QLD", postcode: "4300", latitude: -27.6530, longitude: 152.9170 },
  { suburb: "Springfield Lakes", state: "QLD", postcode: "4300", latitude: -27.6670, longitude: 152.9230 },
  { suburb: "Goodna", state: "QLD", postcode: "4300", latitude: -27.6108, longitude: 152.8986 },
  { suburb: "Ipswich", state: "QLD", postcode: "4305", latitude: -27.6167, longitude: 152.7667 },
  { suburb: "Fortitude Valley", state: "QLD", postcode: "4006", latitude: -27.4571, longitude: 153.0340 },
  { suburb: "West End", state: "QLD", postcode: "4101", latitude: -27.4803, longitude: 153.0120 },
  { suburb: "Woolloongabba", state: "QLD", postcode: "4102", latitude: -27.4880, longitude: 153.0360 },
  { suburb: "Sunnybank Hills", state: "QLD", postcode: "4109", latitude: -27.6100, longitude: 153.0540 },
  { suburb: "Indooroopilly", state: "QLD", postcode: "4068", latitude: -27.4990, longitude: 152.9730 },
  { suburb: "Gold Coast", state: "QLD", postcode: "4217", latitude: -28.0167, longitude: 153.4000 },
  { suburb: "Sydney", state: "NSW", postcode: "2000", latitude: -33.8688, longitude: 151.2093 },
  { suburb: "Newcastle", state: "NSW", postcode: "2300", latitude: -32.9283, longitude: 151.7817 },
  { suburb: "Melbourne", state: "VIC", postcode: "3000", latitude: -37.8136, longitude: 144.9631 },
  { suburb: "Perth", state: "WA", postcode: "6000", latitude: -31.9523, longitude: 115.8613 },
  { suburb: "Adelaide", state: "SA", postcode: "5000", latitude: -34.9285, longitude: 138.6007 },
  { suburb: "Hobart", state: "TAS", postcode: "7000", latitude: -42.8821, longitude: 147.3272 },
  { suburb: "Canberra", state: "ACT", postcode: "2600", latitude: -35.2809, longitude: 149.1300 },
  { suburb: "Darwin", state: "NT", postcode: "0800", latitude: -12.4634, longitude: 130.8456 },
];

function normalise(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function findAuLocation(input?: string | null, state?: string | null) {
  const raw = normalise(input || "");
  const selectedState = (state || "").trim().toUpperCase();

  if (!raw && !selectedState) return null;

  const exact = locations.find((location) => {
    const stateMatches = selectedState ? location.state === selectedState : true;
    if (!stateMatches) return false;

    const suburb = normalise(location.suburb);
    const postcode = normalise(location.postcode);
    const postcodeSuburb = normalise(`${location.postcode} ${location.suburb}`);
    const suburbPostcode = normalise(`${location.suburb} ${location.postcode}`);

    return raw === postcode || raw === suburb || raw === postcodeSuburb || raw === suburbPostcode;
  });

  if (exact) return exact;

  return locations.find((location) => {
    const stateMatches = selectedState ? location.state === selectedState : true;
    if (!stateMatches) return false;

    const haystack = normalise(`${location.postcode} ${location.suburb} ${location.state}`);
    return raw
      ? haystack.includes(raw) || raw.includes(normalise(location.suburb)) || raw.includes(location.postcode)
      : true;
  }) || null;
}

export function parseListingLocation(locationText?: string | null) {
  const text = locationText || "";
  const postcode = text.match(/\b\d{4}\b/)?.[0] || "";
  const state = text.match(/\b(QLD|NSW|VIC|SA|WA|TAS|ACT|NT)\b/i)?.[1]?.toUpperCase() || "";
  const withoutPostcode = text
    .replace(/\b\d{4}\b/g, "")
    .replace(/\b(QLD|NSW|VIC|SA|WA|TAS|ACT|NT)\b/gi, "")
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return findAuLocation(postcode || withoutPostcode, state);
}

export function distanceKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const earthRadiusKm = 6371;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function allAuLocations() {
  return locations;
}

