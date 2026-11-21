/* FileReady license codes. Run by the "Make license code" GitHub workflow.
   First run: creates a P-256 signing key, stores it only encrypted (scrypt + AES-256-GCM with SIGNING_PASSWORD)
   in signing/license.key.enc, and writes the public key to license-pub.js for the app.
   Every run: signs a code for the firm and prints it to the job summary. */
const crypto = require("crypto"), fs = require("fs");
const pw = process.env.SIGNING_PASSWORD;
if (!pw) { console.error("Missing SIGNING_PASSWORD secret"); process.exit(1); }
const firm = String(process.env.FIRM || "").trim().slice(0, 80);
const seats = Math.max(1, Math.min(10000, parseInt(process.env.SEATS || "5", 10) || 5));
const months = Math.max(1, Math.min(60, parseInt(process.env.MONTHS || "12", 10) || 12));
if (!firm) { console.error("Firm name is required"); process.exit(1); }
const KEY = "signing/license.key.enc";
const b64u = (b) => Buffer.from(b).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
function lock(text) { const s = crypto.randomBytes(16), i = crypto.randomBytes(12), k = crypto.scryptSync(pw, s, 32, { N: 1 << 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }); const c = crypto.createCipheriv("aes-256-gcm", k, i); const ct = Buffer.concat([c.update(text, "utf8"), c.final()]); return JSON.stringify({ v: 1, s: s.toString("base64"), i: i.toString("base64"), t: c.getAuthTag().toString("base64"), c: ct.toString("base64") }); }
function unlock(json) { const o = JSON.parse(json), k = crypto.scryptSync(pw, Buffer.from(o.s, "base64"), 32, { N: 1 << 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }); const d = crypto.createDecipheriv("aes-256-gcm", k, Buffer.from(o.i, "base64")); d.setAuthTag(Buffer.from(o.t, "base64")); return Buffer.concat([d.update(Buffer.from(o.c, "base64")), d.final()]).toString("utf8"); }
let priv, created = false;
if (fs.existsSync(KEY)) {
  try { priv = crypto.createPrivateKey(unlock(fs.readFileSync(KEY, "utf8"))); } catch (e) { console.error("Could not unlock the license key. Check SIGNING_PASSWORD."); process.exit(1); }
} else {
  const kp = crypto.generateKeyPairSync("ec", { namedCurve: "P-256" });
  priv = kp.privateKey; created = true;
  fs.mkdirSync("signing", { recursive: true });
  fs.writeFileSync(KEY, lock(priv.export({ type: "pkcs8", format: "pem" })));
  const pub = kp.publicKey.export({ type: "spki", format: "der" }).toString("base64");
  fs.writeFileSync("license-pub.js", "/* FileReady license public key (made by license-tool.js). */\nwindow.FR_LICENSE_PUB = \"" + pub + "\";\n");
}
const now = new Date(), exp = new Date(now); exp.setMonth(exp.getMonth() + months);
const payload = { f: firm, s: seats, i: now.toISOString().slice(0, 10), e: exp.toISOString().slice(0, 10), id: crypto.randomBytes(4).toString("hex") };
const body = Buffer.from(JSON.stringify(payload), "utf8");
const sig = crypto.sign("sha256", body, { key: priv, dsaEncoding: "ieee-p1363" });
const code = "FR1." + b64u(body) + "." + b64u(sig);
const out = "## License code for " + firm + "\n\n" + seats + " people, valid until " + payload.e + ".\n\n```\n" + code + "\n```\n\nSend this code to the firm. In FileReady: Settings > License > paste the code.\n" + (created ? "\n**First run:** a new license key was created. Run **Build APK** and **Deploy website** once so the app can check codes.\n" : "");
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, out);
console.log(out);
