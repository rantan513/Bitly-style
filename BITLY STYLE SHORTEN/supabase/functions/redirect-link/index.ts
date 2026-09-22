import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface IpGeoData {
  ip: string;
  city: string;
  region: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  isProxy?: boolean;
  isHosting?: boolean;
  isp?: string;
  connectionType?: string;
  org?: string;
  source?: string;
}

const COUNTRY_MAP: Record<string, string> = {
  US: "United States", CA: "Canada", GB: "United Kingdom", DE: "Germany",
  FR: "France", ES: "Spain", IT: "Italy", NL: "Netherlands", BE: "Belgium",
  CH: "Switzerland", AT: "Austria", SE: "Sweden", NO: "Norway", DK: "Denmark",
  FI: "Finland", PL: "Poland", CZ: "Czech Republic", HU: "Hungary", RO: "Romania",
  BG: "Bulgaria", HR: "Croatia", SI: "Slovenia", SK: "Slovakia", LT: "Lithuania",
  LV: "Latvia", EE: "Estonia", IE: "Ireland", PT: "Portugal", GR: "Greece",
  CY: "Cyprus", MT: "Malta", LU: "Luxembourg", IS: "Iceland", AL: "Albania",
  BA: "Bosnia and Herzegovina", ME: "Montenegro", MK: "North Macedonia", RS: "Serbia",
  MD: "Moldova", UA: "Ukraine", BY: "Belarus", RU: "Russia", TR: "Turkey",
  JP: "Japan", CN: "China", KR: "South Korea", IN: "India", ID: "Indonesia",
  TH: "Thailand", VN: "Vietnam", MY: "Malaysia", PH: "Philippines", SG: "Singapore",
  TW: "Taiwan", HK: "Hong Kong", AU: "Australia", NZ: "New Zealand", BR: "Brazil",
  MX: "Mexico", AR: "Argentina", CL: "Chile", CO: "Colombia", PE: "Peru",
  VE: "Venezuela", UY: "Uruguay", PY: "Paraguay", BO: "Bolivia", EC: "Ecuador",
  ZA: "South Africa", EG: "Egypt", NG: "Nigeria", KE: "Kenya", GH: "Ghana",
  MA: "Morocco", TN: "Tunisia", DZ: "Algeria", IL: "Israel", SA: "Saudi Arabia",
  AE: "United Arab Emirates", QA: "Qatar", KW: "Kuwait", BH: "Bahrain", OM: "Oman",
  JO: "Jordan", LB: "Lebanon", IQ: "Iraq", IR: "Iran", PK: "Pakistan",
  BD: "Bangladesh", LK: "Sri Lanka", NP: "Nepal", MM: "Myanmar", KH: "Cambodia",
  LA: "Laos", MN: "Mongolia", KZ: "Kazakhstan", UZ: "Uzbekistan", KG: "Kyrgyzstan",
  TJ: "Tajikistan", TM: "Turkmenistan", GE: "Georgia", AM: "Armenia", AZ: "Azerbaijan",
  CR: "Costa Rica", PA: "Panama", GT: "Guatemala", HN: "Honduras", SV: "El Salvador",
  NI: "Nicaragua", CU: "Cuba", DO: "Dominican Republic", JM: "Jamaica",
  TT: "Trinidad and Tobago", BB: "Barbados", BS: "Bahamas", HT: "Haiti",
  BZ: "Belize", KY: "Cayman Islands", TC: "Turks and Caicos Islands",
  VG: "British Virgin Islands", AI: "Anguilla", MS: "Montserrat", BL: "Saint Barthélemy",
  MF: "Saint Martin", SX: "Sint Maarten", CW: "Curaçao", AW: "Aruba", BQ: "Bonaire",
  LI: "Liechtenstein", MC: "Monaco", SM: "San Marino", VA: "Vatican City",
  AD: "Andorra", GI: "Gibraltar", IM: "Isle of Man", JE: "Jersey", GG: "Guernsey",
  AQ: "Antarctica",
};

function normalizeCountry(raw: string): string {
  if (!raw) return "";
  if (raw.length === 2) {
    return COUNTRY_MAP[raw.toUpperCase()] || raw;
  }
  return raw;
}

function isPrivateIp(ip: string): boolean {
  if (!ip) return true;
  if (ip === "::1") return true;
  if (ip.startsWith("127.")) return true;
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (ip.startsWith("169.254.")) return true;
  if (ip.startsWith("172.")) {
    const second = parseInt(ip.split(".")[1], 10);
    if (!Number.isNaN(second) && second >= 16 && second <= 31) return true;
  }
  if (ip.startsWith("fc") || ip.startsWith("fd")) return true;
  if (ip.startsWith("fe80:")) return true;
  return false;
}

function isKnownBotUA(ua: string): boolean {
  if (!ua) return true;
  const botPatterns = [
    /bot/i, /crawler/i, /spider/i, /googlebot/i, /bingbot/i,
    /slurp/i, /duckduckbot/i, /baiduspider/i, /yandexbot/i,
    /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i,
    /headlesschrome/i, /prerender/i, /puppeteer/i, /playwright/i,
    /selenium/i, /phantomjs/i, /curl/i, /wget/i, /postman/i,
    /python-requests/i, /node-fetch/i, /axios/i, /okhttp/i,
    /readdy-preview/i,
  ];
  return botPatterns.some((p) => p.test(ua));
}

function isHostingIsp(isp?: string, org?: string): boolean {
  if (!isp && !org) return false;
  const text = `${isp || ""} ${org || ""}`.toLowerCase();
  const mobileCarrierKeywords = [
    "mobile", "wireless", "cellular", "carrier", "telecom",
    "vodafone", "verizon", "at&t", "t-mobile", "sprint", "orange",
    "airtel", "jio", "telstra", "rogers", "bell", "spectrum",
    "comcast", "xfinity", "cricket", "boost", "metro",
  ];
  if (mobileCarrierKeywords.some((kw) => text.includes(kw))) return false;
  const hostingKeywords = [
    "hosting", "cloud", "server", "data center", "datacenter",
    "vps", "proxy", "cdn", "aws", "amazon", "gcp", "azure",
    "digitalocean", "linode", "ovh", "hetzner", "contabo",
    "cloudflare", "fastly", "akamai",
  ];
  return hostingKeywords.some((kw) => text.includes(kw));
}

function isProxyIsp(isp?: string, org?: string): boolean {
  if (!isp && !org) return false;
  const text = `${isp || ""} ${org || ""}`.toLowerCase();
  const patterns = [/proxy/i, /vpn/i, /\btor\b/i, /relay/i];
  return patterns.some((p) => p.test(text));
}

function calculateBotScore(
  ua: string, device: string, os: string, browser: string,
  isHosting: boolean, isProxy: boolean,
): number {
  let score = 0;
  if (isKnownBotUA(ua)) return 100;
  if (isProxy) score += 3;
  if (isHosting) {
    if (device === "Mobile" && ua.length > 50) score += 1;
    else score += 4;
  }
  if (os === "Linux" && device === "Desktop" && browser === "Chrome") score += 3;
  if (!ua || ua.length < 20) score += 2;
  return score;
}

function parseUserAgent(ua: string) {
  const device = /Mobi|Android|iPhone|iPad|iPod/i.test(ua) ? "Mobile" : "Desktop";
  let os = "Other";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS X|macOS/i.test(ua)) os = /iPhone|iPad|iPod/i.test(ua) ? "iOS" : "Mac";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Linux/i.test(ua)) os = "Linux";
  let browser = "Other";
  if (/Chrome/i.test(ua) && !/Edg|OPR/i.test(ua)) browser = "Chrome";
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Firefox/i.test(ua)) browser = "Firefox";
  else if (/Edg/i.test(ua)) browser = "Edge";
  else if (/OPR|Opera/i.test(ua)) browser = "Opera";
  return { device, os, browser };
}

function parseDeviceModel(ua: string): string {
  if (/iPhone/i.test(ua)) return "iPhone";
  if (/iPad/i.test(ua)) return "iPad";
  if (/SM-S/i.test(ua)) return "Samsung Galaxy";
  if (/SM-A/i.test(ua)) return "Samsung Phone";
  if (/Pixel/i.test(ua)) return "Google Pixel";
  if (/Android/i.test(ua)) return "Android Phone";
  if (/Windows/i.test(ua)) return "Windows PC";
  if (/Mac OS X|macOS/i.test(ua)) return "Mac";
  if (/Linux/i.test(ua)) return "Linux PC";
  return "Desktop";
}

async function geolocateIpInfo(ip: string): Promise<IpGeoData | null> {
  try {
    const res = await fetch(`https://ipinfo.io/${ip}/json`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.bogon || data.reserved) return null;
    const loc = String(data.loc || "").split(",");
    const lat = loc[0] ? Number(loc[0]) : null;
    const lon = loc[1] ? Number(loc[1]) : null;
    const org = String(data.org || "");
    const isp = org.replace(/^AS\d+\s+/, "").trim();
    return {
      ip: String(data.ip || ip), city: String(data.city || ""), region: String(data.region || ""),
      country: normalizeCountry(data.country_name || data.country || ""),
      latitude: lat != null && !Number.isNaN(lat) ? lat : null,
      longitude: lon != null && !Number.isNaN(lon) ? lon : null,
      isp, org, source: "ipinfo.io",
    };
  } catch { return null; }
}

async function geolocateIpApiCo(ip: string): Promise<IpGeoData | null> {
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.error || data.reserved || data.bogon) return null;
    return {
      ip: String(data.ip || ip), city: String(data.city || ""), region: String(data.region || ""),
      country: String(data.country_name || ""),
      latitude: data.latitude != null ? Number(data.latitude) : null,
      longitude: data.longitude != null ? Number(data.longitude) : null,
      isp: String(data.org || ""), org: String(data.org || ""), source: "ipapi.co",
    };
  } catch { return null; }
}

async function geolocateIpWhoIs(ip: string): Promise<IpGeoData | null> {
  try {
    const res = await fetch(`https://ipwho.is/${ip}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success) return null;
    const isp = String(data.connection?.isp || data.isp || "");
    const org = String(data.connection?.org || "");
    return {
      ip: String(data.ip || ip), city: String(data.city || ""), region: String(data.region || ""),
      country: normalizeCountry(data.country || ""),
      latitude: data.latitude != null ? Number(data.latitude) : null,
      longitude: data.longitude != null ? Number(data.longitude) : null,
      isp, org, connectionType: String(data.type || ""), source: "ipwho.is",
    };
  } catch { return null; }
}

function pickBestGeoResult(results: (IpGeoData | null)[]): IpGeoData | null {
  const valid = results.filter((r): r is IpGeoData =>
    r != null && r.country && r.country !== "" && r.country !== "Unknown"
  );
  if (valid.length === 0) return null;
  if (valid.length === 1) return valid[0];
  const cityVotes = new Map<string, number>();
  const regionVotes = new Map<string, number>();
  for (const r of valid) {
    const cityKey = `${r.city}|${r.region}|${r.country}`.toLowerCase();
    cityVotes.set(cityKey, (cityVotes.get(cityKey) || 0) + 1);
    const regionKey = `${r.region}|${r.country}`.toLowerCase();
    regionVotes.set(regionKey, (regionVotes.get(regionKey) || 0) + 1);
  }
  let bestCityKey = ""; let bestCityVotes = 0;
  for (const [key, votes] of cityVotes) {
    if (votes > bestCityVotes) { bestCityVotes = votes; bestCityKey = key; }
  }
  let bestRegionKey = ""; let bestRegionVotes = 0;
  for (const [key, votes] of regionVotes) {
    if (votes > bestRegionVotes) { bestRegionVotes = votes; bestRegionKey = key; }
  }
  const cityWinner = valid.find((r) =>
    `${r.city}|${r.region}|${r.country}`.toLowerCase() === bestCityKey
  );
  if (cityWinner) return cityWinner;
  const regionWinner = valid.find((r) =>
    `${r.region}|${r.country}`.toLowerCase() === bestRegionKey
  );
  if (regionWinner) return regionWinner;
  return valid[0];
}

function extractIp(headers: Headers): string | null {
  const candidates: string[] = [];

  const singles = [
    headers.get("cf-connecting-ip"),
    headers.get("true-client-ip"),
    headers.get("x-real-ip"),
    headers.get("fly-client-ip"),
    headers.get("x-envoy-external-address"),
  ];
  for (const ip of singles) if (ip) candidates.push(ip.trim());

  const xff = headers.get("x-forwarded-for");
  if (xff) candidates.push(...xff.split(",").map((s) => s.trim()));

  const vercel = headers.get("x-vercel-forwarded-for");
  if (vercel) candidates.push(...vercel.split(",").map((s) => s.trim()));

  for (const ip of candidates) {
    if (ip && !isPrivateIp(ip)) return ip;
  }
  return null;
}

async function resolveGeo(ip: string): Promise<IpGeoData | null> {
  if (isPrivateIp(ip)) return null;

  const geoPromise = Promise.allSettled([
    geolocateIpInfo(ip),
    geolocateIpApiCo(ip),
    geolocateIpWhoIs(ip),
  ]).then((results) => {
    const settled = results.map((r) => (r.status === "fulfilled" ? r.value : null));
    return pickBestGeoResult(settled);
  });

  const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));

  return Promise.race([geoPromise, timeoutPromise]);
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const slug = String(body?.slug || "").trim();
  const userAgent = String(body?.userAgent || req.headers.get("user-agent") || "");
  const referrer = String(body?.referrer || "");

  if (!slug) return json({ ok: false, reason: "not_found" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceKey) {
    return json({ ok: false, reason: "server_error" });
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const { data: link, error: linkErr } = await supabase
    .from("links")
    .select("*")
    .ilike("slug", slug)
    .maybeSingle();

  if (linkErr || !link) return json({ ok: false, reason: "not_found" });

  if (!link.active) return json({ ok: false, reason: "disabled" });

  if (link.expires_at && new Date(link.expires_at).getTime() < Date.now()) {
    return json({ ok: false, reason: "expired" });
  }

  const destination_url = link.destination_url;

  const ip = extractIp(req.headers);
  let geo: IpGeoData | null = null;
  if (ip) {
    try {
      geo = await resolveGeo(ip);
    } catch {
      geo = null;
    }
  }

  const parsed = parseUserAgent(userAgent);
  const deviceModel = parseDeviceModel(userAgent);
  const isHosting = isHostingIsp(geo?.isp, geo?.org);
  const isProxy = isProxyIsp(geo?.isp, geo?.org);
  const botScore = calculateBotScore(
    userAgent, parsed.device, parsed.os, parsed.browser, isHosting, isProxy
  );
  const is_bot = botScore >= 3;

  try {
    await supabase.from("clicks").insert({
      link_id: link.id,
      ip_address: ip,
      country: geo?.country || null,
      city: geo?.city || null,
      region: geo?.region || null,
      device: parsed.device,
      device_model: deviceModel,
      browser: parsed.browser,
      os: parsed.os,
      referrer: referrer || "Direct",
      user_agent: userAgent,
      latitude: geo?.latitude ?? null,
      longitude: geo?.longitude ?? null,
      is_bot,
      isp: geo?.isp || null,
      is_hosting: isHosting,
      is_proxy: isProxy,
    });
  } catch (e) {
    console.error("click insert failed", e);
  }

  if (!is_bot) {
    try {
      await supabase.rpc("increment_link_clicks", { p_link_id: link.id, p_is_bot: false });
    } catch (e) {
      console.error("increment failed", e);
    }
  }

  return json({ ok: true, destination_url });
});