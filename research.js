/* FileReady research: patent prior-art check, case-law search and filing review.
   Text analysis runs on the device. Online searches send only the keywords the user approves. */
(function (root) {
  "use strict";
  var STOP = ("a about above after again against all also am an and any are as at be because been before being below between both but by can could did do does doing down during each few for from further had has have having he her here hers him his how i if in into is it its itself just me more most my no nor not now of off on once only or other our ours out over own same she should so some such than that the their them then there these they this those through to too under until up very was we were what when where which while who whom why will with would you your yours shall may said wherein thereof therein herein hereby whereby such each one two first second third plurality least means method system apparatus device configured comprising comprises comprise including includes include having based using used use via within without upon thereto one-or-more further wherein claim claims embodiment embodiments invention present example examples figure fig provide provided providing least portion portions member members unit units element elements least set sets least court plaintiff defendant case party parties filed filing motion order respondent petitioner appellant appellee pursuant section rule rules texas state states united inc llc corp company").split(/\s+/);
  var STOPSET = {}; STOP.forEach(function (w) { STOPSET[w] = 1; });
  function stem(w) { return w.replace(/(ies)$/, "y").replace(/(ing|edly|ed|es|s)$/, "").replace(/(ly)$/, ""); }
  function words(t) { return (String(t || "").toLowerCase().match(/[a-z][a-z\-]{2,}/g) || []).filter(function (w) { return !STOPSET[w] && w.length > 2; }); }
  function terms(t) { var o = {}; words(t).forEach(function (w) { var s = stem(w); if (s.length > 2 && !STOPSET[s]) o[s] = (o[s] || 0) + 1; }); return o; }
  function keywords(t, n) {
    var tf = terms(t), best = {};
    words(t).forEach(function (w) { var s = stem(w); if (!best[s] || w.length < best[s].length) best[s] = w; });
    var bi = {}, ws = words(t);
    for (var i = 0; i < ws.length - 1; i++) { var b = ws[i] + " " + ws[i + 1]; bi[b] = (bi[b] || 0) + 1; }
    var phrases = Object.keys(bi).filter(function (b) { return bi[b] >= 2; }).sort(function (a, b) { return bi[b] - bi[a]; }).slice(0, 4);
    var single = Object.keys(tf).sort(function (a, b) { return tf[b] - tf[a] || b.length - a.length; }).map(function (s) { return best[s] || s; });
    var out = phrases.slice();
    single.forEach(function (w) { if (out.length < (n || 10) && !out.some(function (p) { return p.indexOf(w) >= 0; })) out.push(w); });
    return out.slice(0, n || 10);
  }
  /* Overlap score (0-100): how many of the reference's content terms appear in your text, and how many of your key terms appear in the reference. */
  function overlap(mine, theirs, keys) {
    var A = terms(mine), B = terms(theirs), bk = Object.keys(B);
    if (!bk.length) return 0;
    var hit = bk.filter(function (k) { return A[k]; }).length / bk.length;
    var kk = (keys || []).map(function (k) { return k.split(" ").map(stem); });
    var khit = kk.length ? kk.filter(function (parts) { return parts.every(function (p) { return B[p]; }); }).length / kk.length : hit;
    return Math.round(Math.min(1, 0.55 * hit + 0.45 * khit) * 100);
  }
  function band(p) { return p >= 50 ? "high" : p >= 25 ? "medium" : "low"; }

  /* ---------- patent drafts ---------- */
  function readPatent(text) {
    var t = String(text || "").replace(/\r/g, "");
    var title = (t.match(/^\s*(?:title(?: of (?:the )?invention)?[:\s]+)?([^\n]{8,140})\n/i) || [])[1] || "";
    var abs = (t.match(/abstract(?: of the disclosure)?[:\s]*\n?([\s\S]{40,1500}?)(?:\n\s*\n|$)/i) || [])[1] || "";
    var ci = t.search(/(?:what is claimed is|we claim|i claim|claims?)\s*:?\s*\n?\s*1\s*[.)]/i), claims = [];
    if (ci >= 0) {
      var body = t.slice(ci).replace(/^[^\n]*?(?=1\s*[.)])/, "");
      claims = body.split(/\n\s*(?=\d{1,3}\s*[.)]\s)/).map(function (c) { return c.replace(/\s+/g, " ").trim(); }).filter(function (c) { return /^\d{1,3}\s*[.)]/.test(c) && c.length > 20; }).slice(0, 60);
    }
    var indep = claims.filter(function (c) { return !/\bclaim\s+\d+/i.test(c.replace(/^\d+\s*[.)]\s*/, "")); });
    var focus = (title + " " + abs + " " + indep.join(" ")) || t.slice(0, 6000);
    return { title: title.trim(), abstract: abs.trim(), claims: claims, independent: indep, keywords: keywords(focus.length > 200 ? focus : t, 10), focus: focus.length > 200 ? focus : t.slice(0, 8000) };
  }
  function elements(claim) { return claim.replace(/^\d+\s*[.)]\s*/, "").split(/;|:\s/).map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 12; }).slice(0, 12); }

  var PATENT_GUIDE = [
    ["Before you file", "You can still change anything. If a reference is close, narrow your claims to the features that are actually new in your invention, and describe those features in detail."],
    ["Tell the USPTO what you know", "Applicants must disclose references they know are material to patentability (duty of candor, 37 C.F.R. 1.56), usually with an Information Disclosure Statement (37 C.F.R. 1.97-1.98)."],
    ["Changing claims after filing", "Claims can be amended during examination, but new matter cannot be added (35 U.S.C. 132(a)). New features usually need a new application, such as a continuation-in-part."],
    ["Your own earlier disclosure", "In the U.S., your own public disclosure less than one year before filing generally does not count against you (35 U.S.C. 102(b)(1)). Many other countries have no such grace period."],
    ["Provisional applications", "A provisional application gives 12 months to file the full application and claim its date (35 U.S.C. 119(e))."],
    ["Making or selling a product", "Infringement depends on the claims of patents still in force (term generally 20 years from filing, 35 U.S.C. 154). Options to discuss with counsel: design around claim elements, seek a license, confirm a patent has expired or lapsed, or get a freedom-to-operate opinion."],
    ["Trademarks and copyright", "These use different tests (likelihood of confusion; substantial similarity). This check compares patent text only."]
  ];

  /* ---------- case descriptions ---------- */
  var ISSUES = [
    ["breach of contract", /breach(?:ed)? (?:of )?(?:the )?(?:contract|agreement)/i], ["negligence", /negligen/i], ["fraud", /\bfraud/i], ["wrongful termination", /wrongful(?:ly)? (?:termination|terminated|discharge)/i],
    ["discrimination", /discriminat/i], ["retaliation", /retaliat/i], ["non-compete", /non-?compet|covenant not to compete/i], ["trade secret", /trade secret/i],
    ["patent infringement", /patent infring|infring\w* (?:the |a |our )?patent/i], ["trademark infringement", /trademark|likelihood of confusion/i], ["copyright infringement", /copyright/i],
    ["defamation", /defam|libel|slander/i], ["personal injury", /injur(?:y|ies|ed)/i], ["medical malpractice", /malpractice|standard of care/i], ["premises liability", /premises|slip(?:ped)? and fall/i],
    ["product liability", /product liability|defective (?:product|design)/i], ["divorce", /divorce|dissolution of marriage/i], ["child custody", /custody|conservatorship/i], ["child support", /child support/i],
    ["eviction", /evict|forcible detainer/i], ["foreclosure", /foreclos/i], ["bankruptcy", /bankrupt|chapter (?:7|11|13)/i], ["immigration", /asylum|removal proceeding|deportation|visa/i],
    ["qualified immunity", /qualified immunity/i], ["excessive force", /excessive force/i], ["search and seizure", /search and seizure|fourth amendment|warrant/i], ["due process", /due process/i],
    ["summary judgment", /summary judgment/i], ["motion to dismiss", /motion to dismiss|failure to state a claim/i], ["personal jurisdiction", /personal jurisdiction|minimum contacts/i], ["statute of limitations", /statute of limitations|time-?barred|limitations period/i],
    ["arbitration", /arbitrat/i], ["class action", /class action|class certification/i], ["insurance coverage", /coverage|insurer|bad faith/i], ["securities fraud", /securities|10b-5/i], ["landlord tenant", /landlord|tenant|lease/i]
  ];
  function readCase(text) {
    var t = String(text || ""), found = ISSUES.filter(function (i) { return i[1].test(t); }).map(function (i) { return i[0]; }).slice(0, 4);
    return { issues: found, keywords: keywords(t, 8) };
  }
  function caseQuery(issues, keys) {
    var q = issues.slice(0, 2).map(function (i) { return '"' + i + '"'; }).join(" AND ");
    var k = keys.filter(function (w) { return !issues.some(function (i) { return i.indexOf(w) >= 0; }); }).slice(0, 5);
    if (k.length) q += (q ? " AND " : "") + "(" + k.join(" OR ") + ")";
    return q || keys.join(" ");
  }
  var COURTS = [
    ["", "All courts"], ["scotus", "U.S. Supreme Court"], ["scotus ca1 ca2 ca3 ca4 ca5 ca6 ca7 ca8 ca9 ca10 ca11 cadc cafc", "Federal appeals courts"],
    ["cafc", "Federal Circuit (patents)"], ["ca5 txnd txsd txed txwd", "Fifth Circuit and Texas federal courts"], ["tex texapp texcrimapp", "Texas state courts"]
  ];

  /* ---------- filing review (theirs or ours) ---------- */
  function cites(court, state) {
    var fed = court === "federal", tx = court === "state" && state === "TX";
    return {
      sign: fed ? "Fed. R. Civ. P. 11(a)" : tx ? "Tex. R. Civ. P. 57" : "Your court's signing rule",
      service: fed ? "Fed. R. Civ. P. 5" : tx ? "Tex. R. Civ. P. 21a" : "Your court's service rule",
      relief: fed ? "Fed. R. Civ. P. 8(a)" : tx ? "Tex. R. Civ. P. 47" : "Your court's pleading rule",
      challenge: fed ? "Fed. R. Civ. P. 12(b), 12(e), 12(f)" : tx ? "Tex. R. Civ. P. 91 (special exceptions)" : "Your court's rule for challenging pleadings",
      privacy: fed ? "Fed. R. Civ. P. 5.2" : null
    };
  }
  function review(text, side, issues, ctx) {
    var t = String(text || ""), low = t.toLowerCase(), out = [], C = cites(ctx.court, ctx.state), ours = side === "ours";
    function add(sev, title, why, theirsOpts, oursOpts, cite, q) { out.push({ sev: sev, title: title, why: why, options: ours ? oursOpts : theirsOpts, cite: cite, q: q }); }
    var kind = /petition|complaint/i.test(t.slice(0, 3000)) ? "pleading" : /\bmotion\b/i.test(t.slice(0, 3000)) ? "motion" : /affidavit|declaration/i.test(t.slice(0, 3000)) ? "declaration" : "filing";
    var legal = /\b(court|cause no|case no|civil action|plaintiff|defendant|petitioner|respondent|movant)\b/i.test(t.slice(0, 4000));
    if (legal && !/\/s\/|signature|respectfully submitted|signed|by:\s*_|attorney for|counsel for/i.test(low))
      add("must", "No signature block found", "Court papers generally must be signed by an attorney of record or the party.", ["Point out the missing signature; an unsigned paper may be stricken if not promptly corrected.", "Check whether a corrected copy was filed."], ["Add the signature block before filing."], C.sign, "unsigned pleading strike signature requirement");
    if (legal && !/certificate of service|served (?:a )?(?:true|copy)|was served|service list/i.test(low) && kind !== "declaration")
      add("should", "No certificate of service", "Most filings must state how and when the other parties were served.", ["Check when and how you were actually served; this can change your response deadline.", "Raise the service defect if it affected you."], ["Add a certificate of service listing every party and the method of service."], C.service, "defective service certificate of service response deadline");
    if (kind === "pleading" && !/wherefore|prays|prayer|relief requested|demand for judgment|request(?:s)? that the court/i.test(low))
      add("should", "No request for relief found", "A petition or complaint should say what relief is asked for.", ["Consider a challenge to the pleading for failing to state the relief sought."], ["Add a prayer or demand for relief."], C.relief, "failure to state relief sought pleading deficiency");
    if (kind === "pleading" && ctx.court === "state" && ctx.state === "TX" && !/rule 47|monetary relief|within the jurisdictional limits/i.test(low))
      add("should", "No Rule 47 statement of relief", "Texas petitions must state that damages are within the court's jurisdictional limits and which category of monetary relief is sought.", ["Consider special exceptions asking the court to require the statement."], ["Add the Rule 47 statement and relief category."], "Tex. R. Civ. P. 47, 91", "Rule 47 statement special exceptions monetary relief");
    if (kind === "pleading" && ctx.court === "federal" && !/jurisdiction/i.test(low))
      add("should", "No jurisdiction statement found", "A federal complaint must include a short statement of the grounds for the court's jurisdiction.", ["Consider whether subject-matter jurisdiction is actually present; a challenge may be raised by motion."], ["Add the grounds for jurisdiction."], "Fed. R. Civ. P. 8(a)(1), 12(b)(1)", "subject matter jurisdiction complaint failure to allege");
    if (kind === "declaration" && !/penalty of perjury|sworn|subscribed and sworn|notary/i.test(low))
      add("must", "Declaration or affidavit not sworn", "An unsworn declaration generally must be made under penalty of perjury, or the affidavit must be notarized.", ["Consider objecting to the declaration as evidence."], ["Add the penalty-of-perjury statement or have it notarized."], "28 U.S.C. 1746" + (ctx.state === "TX" ? "; Tex. Civ. Prac. & Rem. Code 132.001" : ""), "unsworn declaration penalty of perjury objection");
    (issues || []).forEach(function (x) {
      if (x.code === "covered") add("must", "Text readable under black boxes", "Something meant to be hidden can still be read.", ["If it looks privileged or confidential, stop reading and tell the sender; ethics rules generally require notice of documents sent by mistake (ABA Model Rule 4.4(b) and your state's version).", "Do not rely on the hidden text until the ethics question is resolved."], ["Use true redaction before filing."], "ABA Model Rule 4.4(b)", "inadvertent disclosure privileged document notify sender");
      else if (/^sens/.test(x.code) && x.sev === "must") add("must", x.title + " not redacted", "The filing shows personal data the court's privacy rule requires to be removed.", ["Consider asking the filer to file a redacted copy, or moving to seal or redact the record."], ["Redact it before filing."], (x.cite && x.cite.text) || C.privacy || "Your court's privacy rule", "motion to seal redact personal identifiers filing");
      else if (x.code === "docxhidden" || x.code === "hidden") add("should", "Hidden comments, tracked changes or metadata", "Hidden data can reveal drafts or internal notes.", ["Check your state's ethics opinions before reviewing metadata from the other side; they differ by state."], ["Remove hidden data before sending."], "State ethics opinions on metadata", "metadata inadvertent disclosure ethics opinion");
      else if (x.code === "missingatt") add("should", "Exhibit mentioned but not attached", x.detail, ["Ask for the missing exhibit; consider objecting to reliance on evidence not in the record."], ["Attach every exhibit you reference."], null, "exhibit not attached objection record evidence");
      else if (x.code === "placeholder" || x.code === "xref") add("should", x.title, x.detail, ["Note the drafting error; it may show the document was rushed or incomplete."], ["Fix before filing."], null, null);
      else if (x.code === "amount") add("must", "Amount in numbers and words differ", x.detail, ["Point out the inconsistency; ask which figure the filer relies on."], ["Make the numbers and words match."], null, "conflicting amount words numbers ambiguity construed");
      else if (x.code === "dates") add("should", "Dates that can be read two ways", x.detail, ["Confirm the intended date before calculating deadlines."], ["Write dates out in full."], null, null);
    });
    return { kind: legal ? kind : "document", findings: out };
  }

  /* ---------- online search (opt-in) ---------- */
  function nativeHttp() { try { var c = root.Capacitor; return c && c.isNativePlatform && c.isNativePlatform() && c.Plugins && c.Plugins.CapacitorHttp || null; } catch (e) { return null; } }
  async function getJSON(url, headers) {
    var n = nativeHttp();
    if (n) { var r = await n.get({ url: url, headers: headers || {}, responseType: "json" }); if (r.status >= 400) throw new Error("HTTP " + r.status); return typeof r.data === "string" ? JSON.parse(r.data) : r.data; }
    var res; try { res = await fetch(url, { headers: headers || {}, referrerPolicy: "no-referrer", credentials: "omit" }); } catch (e) { throw new Error("Could not reach the service from this browser. Use the Android or iPhone app, or open the search in your browser."); }
    if (!res.ok) throw new Error(res.status === 401 || res.status === 403 ? "The key was not accepted. Check it in Settings." : res.status === 429 ? "Too many searches. Wait a minute and try again." : "HTTP " + res.status);
    return res.json();
  }
  function firstArray(o) { if (Array.isArray(o)) return o; if (!o || typeof o !== "object") return []; for (var k in o) { if (Array.isArray(o[k]) && o[k].length && typeof o[k][0] === "object") return o[k]; } for (var k2 in o) { var a = firstArray(o[k2]); if (a.length) return a; } return []; }
  function pick(o, re, depth) { depth = depth || 0; if (!o || typeof o !== "object" || depth > 3) return ""; for (var k in o) { if (re.test(k) && (typeof o[k] === "string" || typeof o[k] === "number")) return String(o[k]); } for (var k2 in o) { if (o[k2] && typeof o[k2] === "object") { var v = pick(o[k2], re, depth + 1); if (v) return v; } } return ""; }
  async function patents(keys, apiKey) {
    var base = "https://api.uspto.gov/api/v1/patent/applications/search?limit=50&q=", h = { "X-API-KEY": apiKey, Accept: "application/json" }, data;
    try { data = await getJSON(base + encodeURIComponent("applicationMetaData.inventionTitle:(" + keys.join(" OR ") + ")"), h); if (!firstArray(data).length) throw 0; }
    catch (e) { if (e && e.message && /key|Too many|reach/.test(e.message)) throw e; data = await getJSON(base + encodeURIComponent(keys.join(" ")), h); }
    return firstArray(data).map(function (r) {
      var num = pick(r, /^patentNumber$/i), app = pick(r, /^applicationNumberText$/i), pub = pick(r, /earliestPublicationNumber/i);
      var id = num ? "US" + num.replace(/\D/g, "") : pub ? pub.replace(/\s/g, "") : "";
      return { app: app.replace(/\D/g, ""), title: pick(r, /inventionTitle/i) || "Untitled", number: num ? "US " + num : pub || (app ? "App. " + app : ""), filed: pick(r, /^filingDate$/i), granted: pick(r, /grantDate/i), status: pick(r, /applicationStatusDescriptionText/i), who: pick(r, /applicantNameText|firstApplicantName|firstInventorName/i), abstract: pick(r, /abstract/i),
        url: id ? "https://patents.google.com/patent/" + id + "/en" : app ? "https://patentcenter.uspto.gov/applications/" + app.replace(/\D/g, "") : "" };
    });
  }
  async function cases(q, court, token) {
    var url = "https://www.courtlistener.com/api/rest/v4/search/?type=o&order_by=" + encodeURIComponent("score desc") + "&q=" + encodeURIComponent(q) + (court ? "&court=" + encodeURIComponent(court) : "");
    var data = await getJSON(url, { Authorization: "Token " + token, Accept: "application/json" });
    return (data.results || []).map(function (r) {
      var snip = ((r.opinions && r.opinions[0] && r.opinions[0].snippet) || r.snippet || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      return { opinionId: r.opinions && r.opinions[0] && r.opinions[0].id, name: r.caseName || r.caseNameFull || "Case", court: r.court || r.court_id || "", date: r.dateFiled || "", cite: (r.citation || []).join(", "), cited: r.citeCount || 0, snippet: snip.slice(0, 320), url: r.absolute_url ? "https://www.courtlistener.com" + r.absolute_url : "" };
    });
  }
  function googlePatentsUrl(keys) { return "https://patents.google.com/?q=" + keys.map(function (k) { return encodeURIComponent("(" + k + ")"); }).join("&q=") + "&oq=" + encodeURIComponent(keys.join(" ")); }
  function courtListenerUrl(q, court) { return "https://www.courtlistener.com/?type=o&q=" + encodeURIComponent(q) + (court ? "&court=" + encodeURIComponent(court) : ""); }

  /* ---------- in-app reading (no leaving the app) ---------- */
  function htmlToText(html) {
    var d = new DOMParser().parseFromString("<div>" + String(html || "").replace(/<\/(p|div|h\d|li|blockquote|tr)>/gi, "\n\n").replace(/<br\s*\/?>/gi, "\n") + "</div>", "text/html");
    return (d.body.textContent || "").replace(/[ \t]+/g, " ").replace(/\n\s*\n\s*(\n\s*)+/g, "\n\n").trim();
  }
  async function opinion(id, token) {
    var o = await getJSON("https://www.courtlistener.com/api/rest/v4/opinions/" + encodeURIComponent(id) + "/?fields=plain_text,html_with_citations,html,html_lawbox,html_columbia,xml_harvard,author_str,type", { Authorization: "Token " + token, Accept: "application/json" });
    var t = (o.plain_text || "").trim();
    if (!t) t = htmlToText(o.html_with_citations || o.html || o.html_lawbox || o.html_columbia || o.xml_harvard || "");
    return { text: t, author: o.author_str || "", type: o.type || "" };
  }
  function b64bytes(s) { var b = atob(String(s).replace(/^data:[^,]+,/, "")), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  async function getBytes(url, headers) {
    var n = nativeHttp();
    if (n) { var r = await n.get({ url: url, headers: headers || {}, responseType: "arraybuffer" }); if (r.status >= 400) throw new Error("HTTP " + r.status); return typeof r.data === "string" ? b64bytes(r.data) : new Uint8Array(r.data); }
    var res = await fetch(url, { headers: headers || {}, referrerPolicy: "no-referrer", credentials: "omit" }); if (!res.ok) throw new Error("HTTP " + res.status); return new Uint8Array(await res.arrayBuffer());
  }
  /* Claims of a published application or patent, from the USPTO file wrapper documents (newest claims document). */
  async function patentClaims(app, apiKey) {
    if (!app) throw new Error("No application number for this record");
    var h = { "X-API-KEY": apiKey, Accept: "application/json" };
    var docs = firstArray(await getJSON("https://api.uspto.gov/api/v1/patent/applications/" + app + "/documents", h));
    var cl = docs.filter(function (d) { return /^CLM$/i.test(pick(d, /^documentCode$/i)); });
    if (!cl.length) cl = docs.filter(function (d) { return /claim/i.test(pick(d, /documentCodeDescriptionText|documentDescription/i)); });
    if (!cl.length) throw new Error("No claims document in this record yet");
    cl.sort(function (a, b) { return String(pick(b, /officialDate|mailDate/i)).localeCompare(String(pick(a, /officialDate|mailDate/i))); });
    var url = "", bag = cl[0].downloadOptionBag || [];
    bag.forEach(function (o) { if (!url && /pdf/i.test(o.mimeTypeIdentifier || "")) url = o.downloadUrl || o.downloadURI || ""; });
    if (!url) url = pick(cl[0], /downloadUrl|downloadURI/i);
    if (!url) throw new Error("The claims document cannot be downloaded");
    return { bytes: await getBytes(url, { "X-API-KEY": apiKey }), date: pick(cl[0], /officialDate|mailDate/i) };
  }

  root.FRX = { keywords: keywords, overlap: overlap, band: band, readPatent: readPatent, elements: elements, PATENT_GUIDE: PATENT_GUIDE, readCase: readCase, caseQuery: caseQuery, COURTS: COURTS, review: review, patents: patents, cases: cases, googlePatentsUrl: googlePatentsUrl, courtListenerUrl: courtListenerUrl, terms: terms, opinion: opinion, patentClaims: patentClaims, htmlToText: htmlToText };
})(window);
