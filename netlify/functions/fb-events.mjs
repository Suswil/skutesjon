// Skutesjön – hämtar kommande evenemang från Facebooksidan via Metas Graph API.
// Körs som Netlify-funktion. Nås på /api/events (se netlify.toml).
//
// Miljövariabler (Netlify → Site configuration → Environment variables):
//   FB_PAGE_ID       Facebooksidans ID (siffror)
//   FB_PAGE_TOKEN    Långlivad sidtoken (Page access token) med behörigheten pages_read_engagement
//   FB_GRAPH_VERSION (valfri) t.ex. "v23.0"
//
// Token ligger bara här på servern – den syns aldrig i webbläsaren.

const FIELDS = [
  "id", "name", "description", "start_time", "end_time",
  "place{name}", "cover{source}", "ticket_uri", "is_canceled", "event_times"
].join(",");

export default async () => {
  const pageId = process.env.FB_PAGE_ID;
  const token = process.env.FB_PAGE_TOKEN;
  const version = process.env.FB_GRAPH_VERSION || "v23.0";

  if (!pageId || !token) {
    return json({ events: [], error: "not_configured" }, 503, 60);
  }

  const url = `https://graph.facebook.com/${version}/${pageId}/events` +
    `?time_filter=upcoming&limit=50&fields=${encodeURIComponent(FIELDS)}` +
    `&access_token=${encodeURIComponent(token)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok || data.error) {
      console.error("Graph API error", data.error || res.status);
      return json({ events: [], error: "graph_error" }, 502, 60);
    }

    const events = [];
    for (const e of data.data || []) {
      if (e.is_canceled) continue;
      // Återkommande evenemang: varje tillfälle blir en egen rad
      const times = (e.event_times && e.event_times.length)
        ? e.event_times.map(t => ({ start: t.start_time, end: t.end_time, id: t.id }))
        : [{ start: e.start_time, end: e.end_time, id: e.id }];
      for (const t of times) {
        if (t.end ? new Date(t.end) < new Date() : new Date(t.start) < startOfToday()) continue;
        events.push({
          id: t.id,
          title: e.name,
          desc: shorten(e.description),
          start: t.start,
          end: t.end || null,
          place: e.place && e.place.name || null,
          image: e.cover && e.cover.source || null,
          tickets: e.ticket_uri || null,
          url: `https://www.facebook.com/events/${t.id}/`
        });
      }
    }
    events.sort((a, b) => new Date(a.start) - new Date(b.start));

    // Cachas 15 min i Netlifys CDN → snabb sida och få anrop mot Facebook
    return json({ events, source: "facebook", updated: new Date().toISOString() }, 200, 900);
  } catch (err) {
    console.error(err);
    return json({ events: [], error: "fetch_failed" }, 502, 60);
  }
};

function startOfToday() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }

function shorten(text, max = 180) {
  if (!text) return "";
  const first = text.split(/\n\s*\n/)[0].replace(/\s+/g, " ").trim();
  if (first.length <= max) return first;
  const cut = first.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:–-]+$/, "") + " …";
}

function json(body, status, maxAge) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=60",
      "netlify-cdn-cache-control": `public, s-maxage=${maxAge}, stale-while-revalidate=3600`
    }
  });
}

export const config = { path: "/api/events" };
