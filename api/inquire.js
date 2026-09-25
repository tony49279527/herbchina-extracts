// POST /api/inquire — HerbChina website inquiry form backend.
// Sends the inquiry via Resend (key from Vercel env RESEND_API_KEY).
// From: sales@helloredlight.com (verified Resend domain), subject tagged [HerbChina Inquiry].

const TO = "leetony4927@gmail.com";
const FROM = "sales@helloredlight.com";

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};
  const name = String(body.name || "").trim().slice(0, 120);
  const email = String(body.email || "").trim().slice(0, 160);
  const company = String(body.company || "").trim().slice(0, 160);
  const country = String(body.country || "").trim().slice(0, 80);
  const product = String(body.product || "").trim().slice(0, 160);
  const interest = String(body.interest || "").trim().slice(0, 80);
  const message = String(body.message || "").trim().slice(0, 4000);
  // honeypot
  if (body.website) { res.status(200).json({ ok: true }); return; }

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) {
    res.status(400).json({ ok: false, error: "Please provide your name, a valid email, and your message." });
    return;
  }
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(500).json({ ok: false, error: "Email service not configured. Please contact us via WeChat +86 135 7292 7148." });
    return;
  }

  const subject = `[HerbChina Inquiry] ${product || interest || "Website inquiry"} — ${company || name}`;
  const htmlBody =
    `<h2>New inquiry from herbchina-extracts.vercel.app</h2>` +
    `<table border="0" cellpadding="6">` +
    `<tr><td><b>Name</b></td><td>${esc(name)}</td></tr>` +
    `<tr><td><b>Email</b></td><td>${esc(email)}</td></tr>` +
    `<tr><td><b>Company</b></td><td>${esc(company) || "-"}</td></tr>` +
    `<tr><td><b>Country</b></td><td>${esc(country) || "-"}</td></tr>` +
    `<tr><td><b>Product</b></td><td>${esc(product) || "-"}</td></tr>` +
    `<tr><td><b>Interest</b></td><td>${esc(interest) || "-"}</td></tr>` +
    `</table><p><b>Message</b></p><p>${esc(message).replace(/\n/g, "<br>")}</p>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [TO], subject, html: htmlBody, reply_to: email }),
    });
    if (!r.ok) {
      const t = await r.text();
      console.error("resend error", r.status, t.slice(0, 300));
      res.status(502).json({ ok: false, error: "Email service temporarily unavailable. Please contact us via WeChat +86 135 7292 7148." });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error("inquire failed", String(e).slice(0, 200));
    res.status(502).json({ ok: false, error: "Network error. Please contact us via WeChat +86 135 7292 7148." });
  }
};
