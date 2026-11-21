/* FileReady engine: on-device PDF checks, fixes and filing builder.
   Uses pdf.js (Apache-2.0) for reading/rendering and pdf-lib (MIT) for writing. Nothing leaves the device. */
(function (root) {
  "use strict";
  var L = function () { return root.PDFLib; };
  var J = function () { return root.pdfjsLib; };
  var SIZES = { letter: [612, 792], legal: [612, 1008], a4: [595, 842] };

  function copy(b) { return b instanceof Uint8Array ? b.slice() : new Uint8Array(b).slice(); }
  async function openJs(bytes) {
    var t = J().getDocument({ data: copy(bytes), isEvalSupported: false, verbosity: 0 });
    var d = await t.promise; d.__task = t; return d;
  }
  function close(d) { try { if (d && d.__task) d.__task.destroy(); else if (d && d.destroy) d.destroy(); } catch (e) { /* ignore */ } }
  async function openLib(bytes) {
    return L().PDFDocument.load(copy(bytes), { updateMetadata: false, ignoreEncryption: true });
  }
  function mk(w, h) { var c = document.createElement("canvas"); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }
  async function render(page, scale) {
    var vp = page.getViewport({ scale: scale });
    var c = mk(vp.width, vp.height), ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
    await page.render({ canvasContext: ctx, canvas: c, viewport: vp }).promise;
    return { canvas: c, ctx: ctx, vp: vp };
  }
  function darkShare(ctx, x, y, w, h) {
    x = Math.max(0, Math.floor(x)); y = Math.max(0, Math.floor(y));
    w = Math.min(ctx.canvas.width - x, Math.ceil(w)); h = Math.min(ctx.canvas.height - y, Math.ceil(h));
    if (w < 2 || h < 2) return 0;
    var d = ctx.getImageData(x, y, w, h).data, n = 0, dark = 0;
    for (var i = 0; i < d.length; i += 16) { n++; if (d[i] + d[i + 1] + d[i + 2] < 150) dark++; }
    return n ? dark / n : 0;
  }
  function inkShare(ctx) {
    var c = ctx.canvas, d = ctx.getImageData(0, 0, c.width, c.height).data, n = 0, ink = 0;
    for (var i = 0; i < d.length; i += 8) { n++; if (d[i] + d[i + 1] + d[i + 2] < 600) ink++; }
    return n ? ink / n : 0;
  }
  function hashStr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
  function luhn(d) { var s = 0, alt = false; for (var i = d.length - 1; i >= 0; i--) { var n = +d[i]; if (alt) { n *= 2; if (n > 9) n -= 9; } s += n; alt = !alt; } return s % 10 === 0; }
  function mask(v) { var d = v.replace(/[^0-9A-Za-z]/g, ""); return d.length <= 4 ? "****" : v.replace(/[0-9A-Za-z](?=(?:[^0-9A-Za-z]*[0-9A-Za-z]){4})/g, "*"); }

  /* Sensitive-data patterns. Each returns matches {start,end,show}. */
  var PAT = {
    ssn: { label: "Social Security number", re: /\b(?!000|666|9\d\d)\d{3}[- ](?!00)\d{2}[- ](?!0000)\d{4}\b|\b(?:SSN|social security(?: number| no\.?)?)\s*[:#]?\s*(\d{9})\b/gi },
    card: { label: "Credit or debit card number", re: /\b(?:\d[ -]?){13,19}\b/g, test: function (m) { var d = m.replace(/\D/g, ""); return d.length >= 13 && d.length <= 19 && luhn(d) && /^[3-6]/.test(d); } },
    acct: { label: "Financial account number", re: /\b(?:account|acct|routing|iban)\s*(?:no\.?|number|#)?\s*[:#]?\s*([0-9][0-9 -]{5,20}[0-9])/gi, group: 1 },
    dob: { label: "Full date of birth", re: /\b(?:DOB|D\.O\.B\.|date of birth|born(?: on)?|birth ?date)\s*[:,]?\s*((?:\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4})|(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.? \d{1,2},? \d{4}))/gi, group: 1 },
    dl: { label: "Driver's license number", re: /\b(?:driver'?s? licen[cs]e|DL|DLN|driver licen[cs]e)\s*(?:no\.?|number|#)?\s*[:#]?\s*([A-Z0-9][A-Z0-9-]{4,15})\b/gi, group: 1, test: function (m) { return /\d/.test(m); } },
    passport: { label: "Passport number", re: /\bpassport\s*(?:no\.?|number|#)?\s*[:#]?\s*([A-Z0-9]{6,9})\b/gi, group: 1, test: function (m) { return /\d/.test(m); } },
    anum: { label: "Alien registration (A-) number", re: /\bA[- #]?(?:\d{3}[- ]?\d{3}[- ]?\d{3}|\d{8})\b/g },
    tin: { label: "Taxpayer ID / EIN", re: /\b(?:EIN|TIN|ITIN|tax(?:payer)? id(?:entification)?(?: number| no\.?)?)\s*[:#]?\s*(\d{2}-?\d{7}|\d{3}-?\d{2}-?\d{4})\b/gi, group: 1 },
    minor: { label: "Minor's full name", re: /\b(?:minor(?: child)?|child|juvenile|son|daughter|student)\s*[:,]?\s+((?:[A-Z][a-z]+ ){1,2}[A-Z][a-z]+)\b/g, group: 1, test: function (m) { return !/^(The|This|That|Court|State|County)\b/.test(m); } },
    victim: { label: "Victim's name", re: /\b(?:victim|complainant)\s*[:,]?\s+((?:[A-Z][a-z]+ ){1,2}[A-Z][a-z]+)\b/g, group: 1 },
    medical: { label: "Medical or health information", re: /\b(?:diagnos(?:is|ed)|prescri(?:bed|ption)|medical record(?: number)?|MRN|HIV|psychiatric|mental health|treatment plan|ICD-?10)\b/gi },
    phone: { label: "Phone number of a party", re: /\(?\b\d{3}\)?[-. ]\d{3}[-. ]\d{4}\b/g },
    iban: { label: "IBAN bank account", re: /\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]{4}){2,7}(?: ?[A-Z0-9]{1,4})?\b/g, test: function (m) { return ibanOk(m); } },
    swift: { label: "SWIFT / BIC bank code", re: /\b(?:SWIFT|BIC)(?: code)?\s*[:#]?\s*([A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?)\b/g, group: 1 },
    vat: { label: "EU VAT number", re: /\b(?:VAT|USt-?IdNr\.?|TVA|IVA|BTW|NIF)\s*(?:no\.?|number|#|ID)?\s*[:#]?\s*([A-Z]{2}\s?[0-9A-Z]{8,12})\b/g, group: 1 },
    nino: { label: "UK National Insurance number", re: /\b(?!BG|GB|NK|KN|TN|NT|ZZ)[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z] ?\d{2} ?\d{2} ?\d{2} ?[A-D]\b/g },
    pan: { label: "India PAN", re: /\b[A-Z]{3}[ABCFGHLJPT][A-Z]\d{4}[A-Z]\b/g },
    aadhaar: { label: "India Aadhaar number", re: /\b(?:Aadhaar|Aadhar|UIDAI|UID)(?: no\.?| number)?\s*[:#]?\s*([2-9]\d{3}[ -]?\d{4}[ -]?\d{4})\b/gi, group: 1 },
    sin: { label: "Canada Social Insurance Number", re: /\b(?:SIN|social insurance(?: number| no\.?)?)\s*[:#]?\s*(\d{3}[ -]?\d{3}[ -]?\d{3})\b/gi, group: 1, test: function (m) { return luhn(m.replace(/\D/g, "")); } },
    email: { label: "Personal email address", re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g },
    intlphone: { label: "International phone number", re: /\+\d{1,3}[ .-]?\(?\d{1,4}\)?(?:[ .-]?\d{2,4}){2,4}\b/g },
    custom: { label: "Term on your redaction list", re: null }
  };
  function ibanOk(v) {
    var s = v.replace(/\s/g, ""); if (s.length < 15 || s.length > 34) return false;
    var r = (s.slice(4) + s.slice(0, 4)).replace(/[A-Z]/g, function (c) { return String(c.charCodeAt(0) - 55); }), m = 0;
    for (var i = 0; i < r.length; i++) m = (m * 10 + +r[i]) % 97;
    return m === 1;
  }

  function esc(x) { return x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  function findSensitive(text, types, custom) {
    var out = [];
    types.forEach(function (t) {
      var p = PAT[t]; if (!p) return;
      if (t === "custom") {
        (custom || []).filter(function (c) { return c && c.trim().length > 1; }).forEach(function (c) {
          var re = new RegExp(esc(c.trim()).replace(/\s+/g, "\\s+"), "gi"), m;
          while ((m = re.exec(text))) { out.push({ type: t, raw: m[0], start: m.index, end: m.index + m[0].length, show: "\u201C" + c.trim() + "\u201D" }); if (out.length > 200) break; }
        });
        return;
      }
      p.re.lastIndex = 0; var m;
      while ((m = p.re.exec(text))) {
        var val = p.group && m[p.group] ? m[p.group] : (m[1] && t === "ssn" ? m[1] : m[0]);
        if (p.test && !p.test(val)) continue;
        var start = m.index + m[0].lastIndexOf(val);
        out.push({ type: t, raw: val, start: start, end: start + val.length, show: t === "medical" || t === "minor" || t === "victim" || t === "email" ? val : mask(val) });
        if (out.length > 200) break;
      }
    });
    var kept = [];
    out.forEach(function (o) { if (!kept.some(function (k) { return o.type !== k.type && o.start < k.end && o.end > k.start; })) kept.push(o); });
    return kept;
  }

  /* Map character ranges of the page string back to boxes in viewport space. */
  function pageText(items) {
    var s = "", map = [];
    items.forEach(function (it, i) {
      if (!it.str) { if (it.hasEOL) s += "\n"; return; }
      map.push({ i: i, a: s.length, b: s.length + it.str.length });
      s += it.str + (it.hasEOL ? "\n" : " ");
    });
    return { text: s, map: map };
  }
  var mctx = null;
  function measure(str, fam) { if (!mctx) mctx = mk(4, 4).getContext("2d"); mctx.font = "100px " + (fam || "serif"); return mctx.measureText(str).width; }
  function boxesFor(items, map, start, end, vp, styles) {
    var out = [];
    map.forEach(function (m) {
      if (m.b <= start || m.a >= end) return;
      var it = items[m.i], len = it.str.length || 1;
      var a = Math.max(start, m.a) - m.a, b = Math.min(end, m.b) - m.a;
      var tx = J().Util.transform(vp.transform, it.transform);
      var fh = Math.hypot(tx[2], tx[3]) || 10, w = (it.width || 0) * vp.scale;
      var ang = Math.atan2(tx[1], tx[0]);
      if (Math.abs(ang) > 0.2) { out.push({ x: tx[4] - fh, y: tx[5] - (it.width || 0) * vp.scale - fh, w: fh * 2.2, h: w + fh * 2 }); return; }
      var fam = styles && it.fontName && styles[it.fontName] ? styles[it.fontName].fontFamily : "serif";
      var tot = measure(it.str, fam) || 1, x0 = w * (measure(it.str.slice(0, a), fam) / tot), x1 = w * (measure(it.str.slice(0, b), fam) / tot);
      var padc = w / len * 0.6;
      out.push({ x: tx[4] + x0 - padc, y: tx[5] - fh * 0.98, w: Math.max(4, x1 - x0) + padc * 2, h: fh * 1.3 });
    });
    return out;
  }
  var STOP = /\b(the|and|of|to|in|that|is|for|on|with|as|by|this|be|was|are|or|it|from|at|an|not|have|has|shall|court|plaintiff|defendant)\b/gi;

  /* Analyze one PDF. Returns per-page facts used by the checker. */
  async function analyze(bytes, opt, onProgress) {
    opt = opt || {};
    var res = { size: bytes.byteLength || bytes.length, pages: [], meta: {}, encrypted: false, error: "", attachments: 0, js: false, xmp: false };
    var doc;
    try { doc = await openJs(bytes); }
    catch (e) {
      if (e && (e.name === "PasswordException" || /password/i.test(e.message || ""))) { res.encrypted = true; res.error = "Password protected"; }
      else res.error = "This file could not be opened as a PDF.";
      return res;
    }
    try {
      var md = await doc.getMetadata();
      var info = (md && md.info) || {};
      ["Title", "Author", "Subject", "Keywords", "Creator", "Producer"].forEach(function (k) { if (info[k] && String(info[k]).trim()) res.meta[k] = String(info[k]).slice(0, 120); });
      res.xmp = !!(md && md.metadata);
      if (info.IsAcroFormPresent) res.acroform = true;
    } catch (e) { /* ignore */ }
    try { var att = await doc.getAttachments(); res.attachments = att ? Object.keys(att).length : 0; } catch (e) { /* ignore */ }
    try { var lib = await openLib(bytes); res.encrypted = res.encrypted || lib.isEncrypted; res.js = hasJS(lib); res.fonts = unembedded(lib); } catch (e) { if (/encrypt/i.test(e.message || "")) res.encrypted = true; }

    for (var p = 1; p <= doc.numPages; p++) {
      var page = await doc.getPage(p);
      var base = page.getViewport({ scale: 1 });
      var tc = await page.getTextContent();
      var items = tc.items.filter(function (i) { return "str" in i; });
      var pt = pageText(items);
      var chars = pt.text.replace(/\s/g, "").length;
      var annots = [];
      try { annots = await page.getAnnotations(); } catch (e) { annots = []; }
      var r = await render(page, Math.min(1.25, 900 / Math.max(base.width, base.height)));
      var ink = inkShare(r.ctx);
      // text hidden under solid dark boxes (failed redaction)
      var covered = [];
      items.forEach(function (it) {
        if (!it.str || !it.str.trim() || it.str.trim().length < 2) return;
        var tx = J().Util.transform(r.vp.transform, it.transform);
        var fh = Math.hypot(tx[2], tx[3]); var w = (it.width || 0) * r.vp.scale;
        if (fh < 4 || w < 6 || Math.abs(Math.atan2(tx[1], tx[0])) > 0.2) return;
        var share = darkShare(r.ctx, tx[4] + 1, tx[5] - fh * 0.8, w - 2, fh * 0.75);
        if (share > 0.9) covered.push({ text: it.str.trim().slice(0, 40), box: { x: tx[4] - 2, y: tx[5] - fh, w: w + 4, h: fh * 1.3 } });
      });
      var sens = opt.types && opt.types.length ? findSensitive(pt.text, opt.types, opt.custom) : [];
      sens.forEach(function (s) { s.boxes = boxesFor(items, pt.map, s.start, s.end, r.vp, tc.styles); });
      var words = (pt.text.match(/[A-Za-zÀ-ɏ]{2,}/g) || []).length;
      var stop = (pt.text.match(STOP) || []).length;
      res.pages.push({
        n: p, w: Math.round(Math.abs(page.view[2] - page.view[0])), h: Math.round(Math.abs(page.view[3] - page.view[1])), rot: ((page.rotate || 0) % 360 + 360) % 360,
        chars: chars, ink: ink, blank: chars < 3 && ink < 0.0015, text: pt.text.slice(0, 20000),
        hash: chars > 150 ? hashStr(pt.text.replace(/\b\d{1,4}\b/g, "").replace(/\s+/g, " ")) : "",
        covered: covered, sens: sens, vpScale: r.vp.scale,
        foreign: words > 60 && stop / words < 0.04,
        comments: annots.filter(function (a) { return a.subtype && ["Link", "Widget", "Popup"].indexOf(a.subtype) < 0; }).length,
        fields: annots.filter(function (a) { return a.subtype === "Widget"; }).length
      });
      page.cleanup();
      if (onProgress) onProgress(p / doc.numPages);
    }
    close(doc);
    return res;
  }
  function unembedded(lib) {
    var N = L().PDFName, out = {}, seen = new Set();
    function fontOk(fd) { return fd && (fd.get(N.of("FontFile")) || fd.get(N.of("FontFile2")) || fd.get(N.of("FontFile3"))); }
    function look(dict) {
      if (!dict || !dict.keys) return;
      dict.keys().forEach(function (k) {
        var f = dict.lookup(k); if (!f || !f.get || seen.has(f)) return; seen.add(f);
        var sub = String(f.get(N.of("Subtype")) || ""), name = String(f.get(N.of("BaseFont")) || "").replace(/^\//, "").replace(/^[A-Z]{6}\+/, "");
        if (sub === "/Type3") return;
        var fd = f.lookup(N.of("FontDescriptor"));
        if (sub === "/Type0") { var df = f.lookup(N.of("DescendantFonts")); var d0 = df && df.lookup && df.lookup(0); fd = d0 && d0.lookup && d0.lookup(N.of("FontDescriptor")); }
        if (!fontOk(fd)) out[name || "Unnamed font"] = 1;
      });
    }
    try {
      lib.getPages().forEach(function (p) {
        var res = p.node.Resources && p.node.Resources(); if (!res) return;
        look(res.lookup(N.of("Font")));
        var xo = res.lookup(N.of("XObject"));
        if (xo && xo.keys) xo.keys().forEach(function (k) { var x = xo.lookup(k); var r2 = x && x.dict && x.dict.lookup && x.dict.lookup(N.of("Resources")); if (r2) look(r2.lookup(N.of("Font"))); });
      });
    } catch (e) { /* ignore */ }
    return Object.keys(out);
  }
  function hasJS(lib) {
    try {
      var N = L().PDFName, cat = lib.catalog;
      if (cat.get(N.of("OpenAction")) || cat.get(N.of("AA"))) {
        var oa = cat.lookup(N.of("OpenAction"));
        if (oa && oa.get && oa.get(N.of("JS"))) return true;
      }
      var names = cat.lookup(N.of("Names"));
      return !!(names && names.get && names.get(N.of("JavaScript")));
    } catch (e) { return false; }
  }

  /* Turn analysis results into issues using the active profile (rule pack + practice area + overrides). */
  function check(files, prof) {
    var issues = [], passed = [], seen = {};
    var lim = prof.maxMB || 0;
    function add(o) { issues.push(o); }
    var anySens = false, anyCovered = false, anyBlank = false, anySide = false, anySize = false, anyMeta = false, anyText = false;
    files.forEach(function (f) {
      var a = f.analysis; if (!a) return;
      var base = { file: f.id, fileName: f.label || f.name };
      if (a.kind === "docx" && !a.error) {
        a.pages.forEach(function (p) {
          var byType = {};
          p.sens.forEach(function (sx) { (byType[sx.type] = byType[sx.type] || []).push(sx); });
          Object.keys(byType).forEach(function (t) {
            anySens = true; var rule = prof.redactRule(t), list = byType[t];
            add(Object.assign({ sev: rule.must ? "must" : "should", code: "sens-" + t, type: t, title: PAT[t].label, detail: "Section " + p.n + " \u00b7 " + list.slice(0, 2).map(function (x) { return x.show; }).join(", ") + (list.length > 2 ? " +" + (list.length - 2) : "") + (rule.how ? " \u00b7 " + rule.how : ""), page: p.n, raws: list.map(function (x) { return x.raw; }), fix: t === "medical" ? "review" : "redactDocx", cite: rule.cite, docx: true }, base));
          });
        });
        docxIssues(f, a, prof, add, base);
        if (lim && a.size > lim * 1048576) { anySize = true; add(Object.assign({ sev: "should", code: "size", title: "Word file is large", detail: (a.size / 1048576).toFixed(1) + " MB", fix: "review" }, base)); }
        if (prof.contracts) contract(f, a, prof).forEach(function (x) { x.docx = true; add(Object.assign(x, base)); });
        if (a.revisions || a.comments || Object.keys(a.meta).length) anyMeta = true;
        return;
      }
      if (a.error) { add(Object.assign({ sev: "must", code: a.encrypted ? "encrypted" : "broken", title: a.encrypted ? "Password protected" : "Cannot open file", detail: a.encrypted ? "Courts usually reject protected PDFs. Save an unprotected copy first." : a.error, cite: prof.cite("format") }, base)); return; }
      if (a.encrypted) add(Object.assign({ sev: "must", code: "encrypted", title: "Security settings on file", detail: "Remove passwords and restrictions before filing.", fix: "scrub" }, base));
      if (lim && a.size > lim * 1048576) { anySize = true; add(Object.assign({ sev: "must", code: "size", title: "File too large", detail: (a.size / 1048576).toFixed(1) + " MB · limit " + lim + " MB", fix: "split", cite: prof.cite("size") }, base)); }
      var want = SIZES[prof.pageSize], both = prof.pageSize === "letterA4";
      var wrong = [], side = [], blank = [], scan = [];
      a.pages.forEach(function (p) {
        var vw = p.rot % 180 ? p.h : p.w, vh = p.rot % 180 ? p.w : p.h;
        if (both) {
          var fits = function (a, b) { return (a <= 612 + 8 && b <= 842 + 8); };
          if (vw > vh * 1.15 && fits(vh, vw)) side.push(p.n); else if (!fits(vw, vh)) wrong.push(p.n);
        } else if (want) {
          var ok = (Math.abs(vw - want[0]) < 8 && Math.abs(vh - want[1]) < 8);
          var land = (Math.abs(vh - want[0]) < 8 && Math.abs(vw - want[1]) < 8);
          if (land) side.push(p.n); else if (!ok) wrong.push(p.n);
        } else if (vw > vh * 1.15) side.push(p.n);
        if (p.blank) blank.push(p.n);
        if (!p.blank && p.chars < 25) scan.push(p.n);
        p.covered.forEach(function (c) { anyCovered = true; add(Object.assign({ sev: "must", code: "covered", title: "Text under a black box", detail: "Page " + p.n + " · hidden text still readable: “" + c.text.slice(0, 18) + "…”", page: p.n, boxes: [c.box], scale: p.vpScale, fix: "redact", cite: prof.cite("redact") }, base)); });
        var byType = {};
        p.sens.forEach(function (s) { (byType[s.type] = byType[s.type] || []).push(s); });
        Object.keys(byType).forEach(function (t) {
          anySens = true;
          var rule = prof.redactRule(t), list = byType[t];
          add(Object.assign({ sev: rule.must ? "must" : "should", code: "sens-" + t, type: t, title: PAT[t].label, detail: "Page " + p.n + " · " + list.slice(0, 2).map(function (s) { return s.show; }).join(", ") + (list.length > 2 ? " +" + (list.length - 2) : "") + (rule.how ? " · " + rule.how : ""), page: p.n, boxes: [].concat.apply([], list.map(function (s) { return s.boxes; })), scale: p.vpScale, fix: t === "medical" ? "review" : "redact", cite: rule.cite }, base));
        });
        if (p.foreign && prof.flagForeign) add(Object.assign({ sev: "should", code: "foreign", title: "May not be in English", detail: "Page " + p.n + " · a certified translation may be required", page: p.n, cite: prof.cite("translation") }, base));
        if (p.hash) { if (seen[p.hash]) add(Object.assign({ sev: "should", code: "dupe", title: "Duplicate page", detail: "Page " + p.n + " repeats " + seen[p.hash], page: p.n, fix: "removePage" }, base)); else seen[p.hash] = (f.label || f.name) + " p." + p.n; }
      });
      if (side.length) { anySide = true; add(Object.assign({ sev: "should", code: "sideways", title: "Sideways pages", detail: "Page" + plural(side) + " " + list(side), pages: side, page: side[0], fix: "rotate" }, base)); }
      if (wrong.length) add(Object.assign({ sev: prof.pageSizeStrict ? "must" : "should", code: "pagesize", title: both ? "Page larger than Letter or A4" : "Page size is not " + cap(prof.pageSize), detail: "Page" + plural(wrong) + " " + list(wrong), pages: wrong, page: wrong[0], fix: "resize", cite: prof.cite("pagesize") }, base));
      if (blank.length) { anyBlank = true; add(Object.assign({ sev: "should", code: "blank", title: "Blank page" + (blank.length > 1 ? "s" : ""), detail: "Page" + plural(blank) + " " + list(blank), pages: blank, page: blank[0], fix: "removeBlank" }, base)); }
      if (scan.length) { anyText = true; add(Object.assign({ sev: prof.requireText ? "must" : "should", code: "scan", title: "Not text-searchable", detail: scan.length + " scanned page" + (scan.length > 1 ? "s" : "") + " · run OCR before filing", pages: scan, page: scan[0], fix: "ocr", cite: prof.cite("searchable") }, base)); }
      var hid = [];
      if (Object.keys(a.meta).some(function (k) { return k !== "Producer" && k !== "Creator"; }) || a.xmp) hid.push("document properties" + (a.meta.Author ? " (author: " + a.meta.Author + ")" : ""));
      var cm = a.pages.reduce(function (s, p) { return s + p.comments; }, 0), fl = a.pages.reduce(function (s, p) { return s + p.fields; }, 0);
      if (cm) hid.push(cm + " comment" + (cm > 1 ? "s" : "") + " or markup");
      if (fl) hid.push(fl + " form field" + (fl > 1 ? "s" : ""));
      if (a.attachments) hid.push(a.attachments + " attached file" + (a.attachments > 1 ? "s" : ""));
      if (a.js) hid.push("embedded script");
      if (hid.length) { anyMeta = true; add(Object.assign({ sev: a.js || a.attachments ? "must" : "should", code: "hidden", title: "Hidden data", detail: hid.join(" · "), fix: "scrub", cite: prof.cite("format") }, base)); }
      if (prof.fonts && a.fonts && a.fonts.length) add(Object.assign({ sev: "must", code: "fonts", title: "Fonts not embedded", detail: a.fonts.slice(0, 3).join(", ") + (a.fonts.length > 3 ? " +" + (a.fonts.length - 3) : ""), fix: "flattenAll", cite: prof.cite("fonts") }, base));
      if (prof.contracts) contract(f, a, prof).forEach(function (x) { add(Object.assign(x, base)); });
      if (/[^A-Za-z0-9 ._()-]/.test(f.name) || f.name.length > 80) add(Object.assign({ sev: "should", code: "name", title: "File name may be rejected", detail: "Use letters, numbers, dashes and spaces", fix: "rename" }, base));
    });
    if (!anyCovered) passed.push("No text under black boxes");
    if (!anySens) passed.push("No sensitive numbers found");
    if (!anyBlank) passed.push("No blank pages");
    if (!anySide) passed.push("All pages upright");
    if (!anySize && lim) passed.push("Under " + lim + " MB limit");
    if (!anyMeta) passed.push("No hidden data");
    if (!anyText) passed.push("Text-searchable");
    passed.push("Opens without password");
    if (prof.contracts && !issues.some(function (i) { return i.code === "placeholder"; })) passed.push("No leftover placeholders");
    if (prof.contracts && !issues.some(function (i) { return i.code === "amount"; })) passed.push("Amounts match their words");
    if (prof.fonts && !issues.some(function (i) { return i.code === "fonts"; })) passed.push("All fonts embedded");
    return { issues: issues, passed: passed };
  }
  /* ---------- contract and deal checks ---------- */
  var ONES = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
  var BIG = { thousand: 1e3, million: 1e6, billion: 1e9, trillion: 1e12 };
  function words2num(w) {
    var t = w.toLowerCase().replace(/-/g, " ").replace(/\band\b|\bu\.s\.|\bus\b|dollars?|euros?|pounds?|rupees?|no\/100|\b00\/100|cents?/g, " ").split(/[\s,]+/).filter(Boolean);
    var total = 0, cur = 0, any = false;
    for (var i = 0; i < t.length; i++) {
      var x = t[i];
      if (ONES[x] != null) { cur += ONES[x]; any = true; }
      else if (x === "hundred") { cur = (cur || 1) * 100; any = true; }
      else if (BIG[x]) { total += (cur || 1) * BIG[x]; cur = 0; any = true; }
      else if (/^\d+(\.\d+)?$/.test(x)) { cur += parseFloat(x); any = true; }
      else return null;
    }
    return any ? total + cur : null;
  }
  function contract(f, a, prof) {
    var out = [], all = a.pages.map(function (p) { return p.text; }).join("\n"), first = function (re) { for (var i = 0; i < a.pages.length; i++) { re.lastIndex = 0; if (re.test(a.pages[i].text)) return a.pages[i].n; } return null; };
    // leftover placeholders
    var ph = /\[(?!RESERVED|INTENTIONALLY|SIGNATURE PAGE)[A-Z][A-Z0-9 \-\/&'.]{2,40}\]|\[(?:\s*\u25CF\s*|\s*\u2022\s*|_+|\s*(?:NAME|DATE|AMOUNT|ADDRESS|COMPANY|PARTY|INSERT[^\]]{0,30}|TBD|TBC|XX+|\?+)\s*)\]|\bTBD\b|\bTBC\b|\[\s*\]|<<[^>]{1,30}>>|\{\{[^}]{1,30}\}\}|\bINSERT (?:NAME|DATE|AMOUNT)\b/g;
    var phs = all.match(ph) || [];
    if (phs.length) out.push({ sev: "must", code: "placeholder", title: "Unfinished placeholders", detail: phs.length + " found, e.g. " + phs.slice(0, 3).join("  "), page: first(ph), fix: "review" });
    // referenced exhibits / schedules that are not in the document
    var refRe = /\b(Exhibit|Schedule|Annex|Appendix|Attachment)\s+([A-Z]{1,2}|\d{1,2}(?:\.\d{1,2})?)\b/g, refs = {}, m;
    while ((m = refRe.exec(all))) refs[m[1] + " " + m[2]] = 1;
    var present = {};
    a.pages.forEach(function (p) { var head = p.text.slice(0, 160); var hr = /\b(EXHIBIT|SCHEDULE|ANNEX|APPENDIX|ATTACHMENT)\s+([A-Z]{1,2}|\d{1,2}(?:\.\d{1,2})?)\b/g, h; while ((h = hr.exec(head))) present[cap(h[1].toLowerCase()) + " " + h[2]] = 1; });
    (f.siblings || []).forEach(function (n) { var r = /\b(Exhibit|Schedule|Annex|Appendix|Attachment)\s+([A-Z]{1,2}|\d{1,2}(?:\.\d{1,2})?)\b/i.exec(n); if (r) present[cap(r[1].toLowerCase()) + " " + r[2].toUpperCase()] = 1; });
    var missing = Object.keys(refs).filter(function (k) { return !present[k]; });
    if (missing.length && Object.keys(refs).length) out.push({ sev: "should", code: "missingatt", title: "Referenced but not attached", detail: missing.slice(0, 5).join(", ") + (missing.length > 5 ? " +" + (missing.length - 5) : ""), fix: "review" });
    // section cross-references
    var defs = {}, dr = /(?:^|\n)\s*(?:Section\s+|\u00A7\s*)?(\d{1,2}(?:\.\d{1,2}){0,3})[.)]?\s+[A-Z(]/g;
    while ((m = dr.exec(all))) defs[m[1].replace(/\.$/, "")] = 1;
    if (Object.keys(defs).length >= 5) {
      var xr = /\b(?:Section|Sections|\u00A7)\s+(\d{1,2}(?:\.\d{1,2}){0,3})/g, bad = {};
      while ((m = xr.exec(all))) { var k = m[1].replace(/\.$/, ""); if (!defs[k] && !defs[k.split(".")[0]] ) bad[k] = 1; else if (!defs[k] && k.indexOf(".") > 0) bad[k] = 1; }
      var bl = Object.keys(bad);
      if (bl.length) out.push({ sev: "should", code: "xref", title: "Cross-reference to a missing section", detail: "Section " + bl.slice(0, 5).join(", ") + (bl.length > 5 ? " +" + (bl.length - 5) : ""), fix: "review" });
    }
    // signature blocks with no typed signer
    var sb = 0, sp = null;
    a.pages.forEach(function (p) { if (/\bBy:\s*_{3,}/.test(p.text) && /\bName:\s*(?:_{3,}|\n|$)/.test(p.text)) { sb++; sp = sp || p.n; } });
    if (sb) out.push({ sev: "should", code: "sigblock", title: "Signature block missing signer name", detail: sb + " page" + (sb > 1 ? "s" : "") + " with a blank Name line", page: sp, fix: "review" });
    // amounts in digits vs words
    var am = /([$\u20AC\u00A3\u20B9])\s?([\d,]+(?:\.\d{2})?)\s*\(([A-Za-z][A-Za-z ,\-\/]+?)(?:\s*(?:U\.S\.|US)?\s*(?:Dollars|Euros|Pounds|Rupees))?(?:\s*\([^)]*\))?\)/g, mm = [];
    while ((m = am.exec(all))) { var n = parseFloat(m[2].replace(/,/g, "")), w = words2num(m[3]); if (w != null && Math.abs(w - n) > 0.009 && Math.abs(w - Math.floor(n)) > 0.009) mm.push(m[1] + m[2] + " vs \u201C" + m[3].trim().slice(0, 40) + "\u201D"); }
    if (mm.length) out.push({ sev: "must", code: "amount", title: "Amount in numbers and words differ", detail: mm.slice(0, 2).join(" \u00B7 "), page: first(am), fix: "review" });
    // currencies
    if (prof.intl) {
      var cur = {};
      [["USD", /\$|\bUSD\b/], ["EUR", /\u20AC|\bEUR\b/], ["GBP", /\u00A3|\bGBP\b/], ["INR", /\u20B9|\bINR\b|\bRs\.?\s?\d/], ["JPY", /\u00A5|\bJPY\b/], ["CAD", /\bCAD\b|C\$/], ["AUD", /\bAUD\b|A\$/], ["SGD", /\bSGD\b|S\$/]].forEach(function (c) { if (c[1].test(all)) cur[c[0]] = 1; });
      var cl = Object.keys(cur); if (cl.length > 1 && !(cl.length === 2 && cur.USD && (cur.CAD || cur.AUD || cur.SGD) && false)) out.push({ sev: "should", code: "currency", title: "More than one currency", detail: cl.join(", ") + " \u00B7 confirm which governs", fix: "review" });
      var dd = /\b(0?[1-9]|1[0-2])[\/.](0?[1-9]|1[0-2])[\/.](\d{2}|\d{4})\b/g, amb = [];
      while ((m = dd.exec(all))) if (+m[1] !== +m[2]) amb.push(m[0]);
      if (amb.length) out.push({ sev: "should", code: "dates", title: "Dates that read differently abroad", detail: amb.slice(0, 3).join(", ") + " \u00B7 write the month in words", page: first(dd), fix: "review" });
    }
    return out;
  }
  function plural(a) { return a.length > 1 ? "s" : ""; }
  function list(a) { return a.length > 6 ? a.slice(0, 6).join(", ") + " +" + (a.length - 6) : a.join(", "); }
  function cap(s) { return s ? s[0].toUpperCase() + s.slice(1) : ""; }

  /* ---------- fixes (each returns new bytes; originals are kept by the app) ---------- */
  async function save(doc) { return doc.save({ useObjectStreams: true, addDefaultPage: false, updateFieldAppearances: false }); }
  async function removePages(bytes, nums) {
    var doc = await openLib(bytes);
    nums.slice().sort(function (a, b) { return b - a; }).forEach(function (n) { if (doc.getPageCount() > 1) doc.removePage(n - 1); });
    return save(doc);
  }
  async function rotatePages(bytes, nums, deg) {
    var doc = await openLib(bytes), D = L().degrees;
    nums.forEach(function (n) { var p = doc.getPage(n - 1); p.setRotation(D(((p.getRotation().angle || 0) + (deg || 90) + 360) % 360)); });
    return save(doc);
  }
  async function movePage(bytes, from, to) {
    var src = await openLib(bytes), out = await L().PDFDocument.create();
    var order = []; for (var i = 0; i < src.getPageCount(); i++) order.push(i);
    var x = order.splice(from - 1, 1)[0]; order.splice(to - 1, 0, x);
    (await out.copyPages(src, order)).forEach(function (p) { out.addPage(p); });
    return save(out);
  }
  async function scrub(bytes) {
    var doc = await openLib(bytes), N = L().PDFName;
    try { doc.getForm().flatten(); } catch (e) { /* no form */ }
    var cat = doc.catalog;
    ["Metadata", "OpenAction", "AA", "AcroForm", "PieceInfo", "StructTreeRoot", "MarkInfo"].forEach(function (k) { if (k !== "StructTreeRoot" && k !== "MarkInfo") cat.delete(N.of(k)); });
    var names = cat.lookup(N.of("Names"));
    if (names && names.delete) { names.delete(N.of("JavaScript")); names.delete(N.of("EmbeddedFiles")); }
    doc.getPages().forEach(function (pg) {
      var node = pg.node; node.delete(N.of("AA")); node.delete(N.of("PieceInfo")); node.delete(N.of("Metadata"));
      var an = node.lookup(N.of("Annots"));
      if (an && an.size) {
        var keep = [];
        for (var i = 0; i < an.size(); i++) {
          var ref = an.get(i), d = doc.context.lookup(ref);
          var st = d && d.get && d.get(N.of("Subtype"));
          if (st && String(st) === "/Link") { d.delete(N.of("A")) ; keep.push(ref); }
        }
        if (keep.length) node.set(N.of("Annots"), doc.context.obj(keep)); else node.delete(N.of("Annots"));
      }
    });
    var infoRef = doc.context.trailerInfo.Info;
    var info = infoRef && doc.context.lookup(infoRef);
    if (info && info.delete) ["Title", "Author", "Subject", "Keywords", "Creator", "Producer", "CreationDate", "ModDate", "Company", "SourceModified"].forEach(function (k) { info.delete(N.of(k)); });
    if (info && info.keys) info.keys().slice().forEach(function (k) { info.delete(k); });
    return save(doc);
  }
  /* True redaction: the page is redrawn as an image with black boxes burned in, so the hidden text is gone. */
  async function redactPage(bytes, pageNum, boxes, boxScale) {
    var js = await openJs(bytes), page = await js.getPage(pageNum);
    var scale = 2.2, r = await render(page, scale), k = scale / (boxScale || 1);
    var hits = (boxes || []).map(function (b) { return { x: b.x * k - 2, y: b.y * k - 2, w: b.w * k + 4, h: b.h * k + 4 }; });
    r.ctx.fillStyle = "#000";
    hits.forEach(function (b) { r.ctx.fillRect(b.x, b.y, b.w, b.h); });
    // keep the rest of the page searchable: invisible text for every word not under a redaction box
    var tc = await page.getTextContent(), keep = [];
    tc.items.forEach(function (it) {
      if (!it.str || !it.str.trim()) return;
      var tx = J().Util.transform(r.vp.transform, it.transform), fh = Math.hypot(tx[2], tx[3]), w = (it.width || 0) * scale;
      if (Math.abs(Math.atan2(tx[1], tx[0])) > 0.2) return;
      var fam = tc.styles && tc.styles[it.fontName] ? tc.styles[it.fontName].fontFamily : "serif", tot = measure(it.str, fam) || 1;
      var top = tx[5] - fh, bot = tx[5];
      var rowHits = hits.filter(function (hb) { return top < hb.y + hb.h && bot > hb.y; });
      // keep only the characters outside every redaction box, in runs
      var run = "", runX = null, str = it.str;
      function flush() { if (run.trim()) keep.push({ s: safe(run), x: runX / scale, y: tx[5] / scale, size: fh / scale, w: (w * measure(run, fam) / tot) / scale }); run = ""; runX = null; }
      for (var c = 0; c < str.length; c++) {
        var cx0 = tx[4] + w * measure(str.slice(0, c), fam) / tot, cx1 = tx[4] + w * measure(str.slice(0, c + 1), fam) / tot;
        var hidden = rowHits.some(function (hb) { return cx1 > hb.x && cx0 < hb.x + hb.w; });
        if (hidden) flush(); else { if (runX == null) runX = cx0; run += str[c]; }
      }
      flush();
    });
    var jpg = await new Promise(function (res) { r.canvas.toBlob(function (b) { b.arrayBuffer().then(function (x) { res(new Uint8Array(x)); }); }, "image/jpeg", 0.88); });
    var wPt = r.vp.width / scale, hPt = r.vp.height / scale;
    close(js);
    var doc = await openLib(bytes), img = await doc.embedJpg(jpg), F = await doc.embedFont(L().StandardFonts.Helvetica);
    var np = doc.insertPage(pageNum - 1, [wPt, hPt]);
    np.drawImage(img, { x: 0, y: 0, width: wPt, height: hPt });
    keep.forEach(function (t) {
      if (!t.s || t.size < 2) return;
      var natural = F.widthOfTextAtSize(t.s, t.size) || 1;
      try { np.drawText(t.s, { x: t.x, y: hPt - t.y, size: t.size * Math.min(1.4, Math.max(0.6, t.w / natural)), font: F, opacity: 0 }); } catch (e) { /* skip glyphs Helvetica lacks */ }
    });
    doc.removePage(pageNum);
    return save(doc);
  }
  async function flattenAll(bytes) {
    var n = await pageCount(bytes), b = bytes;
    for (var i = 1; i <= n; i++) b = await redactPage(b, i, [], 1);
    return b;
  }
  /* Signature packets: find signature pages in every document and group them by signer. */
  async function sigPackets(files) {
    var P = L(), groups = {}, order = [];
    for (var fi = 0; fi < files.length; fi++) {
      var f = files[fi], a = f.analysis; if (!a || !a.pages) continue;
      a.pages.forEach(function (p) {
        var t = p.text;
        var isSig = /IN WITNESS WHEREOF|\[?\s*Signature [Pp]age|SIGNATURE PAGE|\bBy:\s*_{3,}|\bSignature:\s*_{3,}/.test(t) && /\b(?:Name|Title|By):/.test(t);
        if (!isSig) return;
        var names = [], m, re = /\bName:\s*([A-Z][A-Za-z.'\- ]{2,40}?)\s*(?:\n|Title:|Date:|$)/g;
        while ((m = re.exec(t))) names.push(m[1].trim());
        var ents = [], er = /\n\s*([A-Z][A-Z0-9&.,' \-]{3,60}(?:INC\.?|LLC|L\.L\.C\.|LP|LTD\.?|CORP\.?|CORPORATION|COMPANY|N\.A\.|PLC|GMBH|S\.A\.|PTE\.? LTD\.?))\s*\n/g;
        while ((m = er.exec("\n" + t))) ents.push(m[1].trim());
        var who = names.length ? names : ents.length ? ents : ["Unassigned"];
        who.forEach(function (w) { if (!groups[w]) { groups[w] = []; order.push(w); } groups[w].push({ file: f, page: p.n, doc: f.label || f.name }); });
      });
    }
    var out = [];
    for (var gi = 0; gi < order.length; gi++) {
      var w = order[gi], list = groups[w], d = await P.PDFDocument.create(), F = await d.embedFont(P.StandardFonts.Helvetica), FB = await d.embedFont(P.StandardFonts.HelveticaBold);
      var cv = d.addPage([612, 792]);
      cv.drawText("Signature packet", { x: 72, y: 700, size: 26, font: FB });
      cv.drawText(safe(w), { x: 72, y: 664, size: 16, font: F });
      var y = 620;
      list.forEach(function (it, i) { if (y > 80) { cv.drawText(safe((i + 1) + ". " + it.doc + " - page " + it.page).slice(0, 90), { x: 72, y: y, size: 11, font: F }); y -= 18; } });
      cv.drawText("Sign each page where marked, then return all pages.", { x: 72, y: 60, size: 10, font: F, color: P.rgb(0.35, 0.35, 0.4) });
      for (var i = 0; i < list.length; i++) {
        var src = await openLib(list[i].file.bytes); var cp = (await d.copyPages(src, [list[i].page - 1]))[0]; d.addPage(cp);
        var sp = stamper(cp), tag = safe("FileReady signature page " + (i + 1) + " of " + list.length + " - " + list[i].doc + " p." + list[i].page).slice(0, 95);
        sp.text(tag, 36, 14, { size: 6.5, font: F, color: P.rgb(0.45, 0.47, 0.52) });
      }
      out.push({ signer: w, pages: list.length, docs: list.map(function (x) { return x.doc; }), items: list.map(function (x) { return { fileId: x.file.id, doc: x.doc, page: x.page }; }), bytes: await save(d) });
    }
    return out;
  }

  /* Signed pages back into documents. reps: [{page, bytes, srcPage}] (1-based pages). Each signed page is scaled onto the original page size. When several people sign the same page, every signed copy goes in, in order (counterparts). */
  async function insertSigned(bytes, reps) {
    var P = L(), src = await openLib(bytes), out = await P.PDFDocument.create(), byPage = {}, cache = {};
    reps.forEach(function (r) { (byPage[r.page] = byPage[r.page] || []).push(r); });
    var n = src.getPageCount();
    for (var i = 0; i < n; i++) {
      var rl = byPage[i + 1];
      if (!rl) { out.addPage((await out.copyPages(src, [i]))[0]); continue; }
      for (var q = 0; q < rl.length; q++) { var r = rl[q];
      var orig = src.getPage(i), ow = orig.getWidth(), oh = orig.getHeight(), orot = (orig.getRotation().angle || 0) % 180;
      if (orot) { var t = ow; ow = oh; oh = t; }
      var sd = cache[r.key] || (cache[r.key] = await openLib(r.bytes)), sp = sd.getPage(r.srcPage - 1), rot = (sp.getRotation().angle || 0) % 360;
      var emb = await out.embedPage(sp), w = emb.width, h = emb.height, vw = rot % 180 ? h : w, vh = rot % 180 ? w : h;
      var s = Math.min(ow / vw, oh / vh), pg = out.addPage([ow, oh]), dw = vw * s, dh = vh * s, x0 = (ow - dw) / 2, y0 = (oh - dh) / 2, D = P.degrees;
      pg.drawRectangle({ x: 0, y: 0, width: ow, height: oh, color: P.rgb(1, 1, 1) });
      if (rot === 90) pg.drawPage(emb, { x: x0, y: y0 + dh, xScale: s, yScale: s, rotate: D(-90) });
      else if (rot === 180) pg.drawPage(emb, { x: x0 + dw, y: y0 + dh, xScale: s, yScale: s, rotate: D(180) });
      else if (rot === 270) pg.drawPage(emb, { x: x0 + dw, y: y0, xScale: s, yScale: s, rotate: D(90) });
      else pg.drawPage(emb, { x: x0, y: y0, xScale: s, yScale: s });
      }
    }
    out.setProducer("FileReady"); return save(out);
  }
  /* Match a returned packet to the pages that were sent. Uses the FileReady footer when text is readable, otherwise page order (skipping the cover page). */
  async function matchSigned(bytes, items) {
    var n = await pageCount(bytes), map = [], texts = [];
    try { var doc = await pdfjsLib.getDocument({ data: bytes.slice(0), isEvalSupported: false }).promise; for (var i = 1; i <= n; i++) { var tc = await (await doc.getPage(i)).getTextContent(); texts.push(tc.items.map(function (x) { return x.str; }).join(" ")); } try { doc.destroy(); } catch (e) { } } catch (e) { texts = []; }
    var byTag = {};
    texts.forEach(function (t, i) { var m = /FileReady signature page (\d+) of (\d+)/.exec(t); if (m) byTag[+m[1]] = i + 1; });
    var cover = texts.length && /Signature packet/.test(texts[0] || "") ? 1 : (n === items.length + 1 ? 1 : 0);
    items.forEach(function (it, k) { var p = byTag[k + 1] || (k + 1 + cover <= n ? k + 1 + cover : 0); map.push(p); });
    return { pages: n, map: map, byFooter: Object.keys(byTag).length };
  }
  /* Closing checklist as a PDF table. rows: [{tab, title, who, status, sig}] */
  function drawChecklist(d, F, FB, rows, title) {
    var P = L(), rgb = P.rgb, pg = d.addPage([612, 792]), y = 700, first = pg;
    var done = rows.filter(function (r) { return r.status === "Done"; }).length;
    pg.drawText(safe(title || "Closing checklist"), { x: 54, y: 736, size: 18, font: FB });
    pg.drawText(done + " of " + rows.length + " items done", { x: 54, y: 716, size: 10, font: F, color: rgb(0.35, 0.37, 0.42) });
    function head() { [["Tab", 54], ["Document or item", 100], ["Responsible", 330], ["Signatures", 432], ["Status", 512]].forEach(function (c) { pg.drawText(c[0], { x: c[1], y: y, size: 9, font: FB }); }); pg.drawLine({ start: { x: 54, y: y - 6 }, end: { x: 558, y: y - 6 }, thickness: 0.8 }); y -= 22; }
    head();
    rows.forEach(function (r) {
      var lines = wrap(F, r.title, 9.5, 220).slice(0, 3), hgt = Math.max(1, lines.length) * 12 + 10;
      if (y - hgt < 60) { pg = d.addPage([612, 792]); y = 740; head(); }
      var col = r.status === "Done" ? rgb(0.06, 0.6, 0.32) : r.status === "Waiting" ? rgb(0.8, 0.5, 0) : rgb(0.35, 0.37, 0.42);
      pg.drawText(safe(r.tab || "-"), { x: 54, y: y, size: 9.5, font: FB });
      lines.forEach(function (ln, k) { pg.drawText(ln, { x: 100, y: y - k * 12, size: 9.5, font: F }); });
      pg.drawText(safe(r.who || "-").slice(0, 20), { x: 330, y: y, size: 9.5, font: F });
      pg.drawText(safe(r.sig || "-"), { x: 432, y: y, size: 9.5, font: F });
      pg.drawRectangle({ x: 508, y: y - 4, width: 50, height: 15, color: col, opacity: 0.14 });
      pg.drawText(safe(r.status), { x: 512, y: y, size: 9, font: FB, color: col });
      y -= hgt;
    });
    return first;
  }
  async function checklistPdf(rows, title) {
    var P = L(), d = await P.PDFDocument.create(), F = await d.embedFont(P.StandardFonts.Helvetica), FB = await d.embedFont(P.StandardFonts.HelveticaBold);
    drawChecklist(d, F, FB, rows, title); d.setTitle(safe(title || "Closing checklist")); d.setProducer("FileReady"); return save(d);
  }
  /* Scale pages onto the court's page size, keeping proportions. */
  async function resize(bytes, nums, sizeName) {
    var S = SIZES[sizeName === "letterA4" ? "letter" : sizeName] || SIZES.letter;
    var src = await openLib(bytes), out = await L().PDFDocument.create();
    var all = src.getPages();
    for (var i = 0; i < all.length; i++) {
      if (nums.indexOf(i + 1) < 0) { var cp = (await out.copyPages(src, [i]))[0]; out.addPage(cp); continue; }
      var emb = await out.embedPage(all[i]), rot = (all[i].getRotation().angle || 0) % 360;
      var w = emb.width, h = emb.height, vw = rot % 180 ? h : w, vh = rot % 180 ? w : h;
      var s = Math.min(S[0] / vw, S[1] / vh), pg = out.addPage([S[0], S[1]]);
      var dw = vw * s, dh = vh * s, x0 = (S[0] - dw) / 2, y0 = (S[1] - dh) / 2;
      var D = L().degrees;
      if (rot === 90) pg.drawPage(emb, { x: x0, y: y0 + dh, xScale: s, yScale: s, rotate: D(-90) });
      else if (rot === 180) pg.drawPage(emb, { x: x0 + dw, y: y0 + dh, xScale: s, yScale: s, rotate: D(180) });
      else if (rot === 270) pg.drawPage(emb, { x: x0 + dw, y: y0, xScale: s, yScale: s, rotate: D(90) });
      else pg.drawPage(emb, { x: x0, y: y0, xScale: s, yScale: s });
    }
    return save(out);
  }
  /* Split into parts under the size limit. Returns array of byte arrays. */
  async function split(bytes, maxMB) {
    var limit = maxMB * 1048576 * 0.97, src = await openLib(bytes), n = src.getPageCount(), parts = [], i = 0;
    while (i < n) {
      var lo = 1, hi = n - i, best = 1, bestBytes = null;
      while (lo <= hi) {
        var mid = Math.floor((lo + hi) / 2), d = await L().PDFDocument.create();
        var idx = []; for (var j = 0; j < mid; j++) idx.push(i + j);
        (await d.copyPages(src, idx)).forEach(function (p) { d.addPage(p); });
        var b = await save(d);
        if (b.length <= limit || mid === 1) { best = mid; bestBytes = b; lo = mid + 1; } else hi = mid - 1;
      }
      parts.push(bestBytes); i += best;
    }
    return parts;
  }

  /* ---------- stamping helpers that respect page rotation ---------- */
  function stamper(page) {
    var rot = ((page.getRotation().angle || 0) % 360 + 360) % 360, mb = page.getMediaBox();
    var W = rot % 180 ? mb.height : mb.width, H = rot % 180 ? mb.width : mb.height;
    function toPdf(X, Y) {
      if (rot === 90) return { x: mb.x + mb.width - Y, y: mb.y + X };
      if (rot === 180) return { x: mb.x + mb.width - X, y: mb.y + mb.height - Y };
      if (rot === 270) return { x: mb.x + Y, y: mb.y + mb.height - X };
      return { x: mb.x + X, y: mb.y + Y };
    }
    var D = L().degrees(rot);
    return {
      W: W, H: H,
      text: function (t, X, Y, o) { var p = toPdf(X, Y); page.drawText(t, Object.assign({ x: p.x, y: p.y, rotate: D }, o)); },
      rect: function (X, Y, w, h, o) { var p = toPdf(X, Y); page.drawRectangle(Object.assign({ x: p.x, y: p.y, width: w, height: h, rotate: D }, o)); }
    };
  }
  function label(style, i) {
    if (style === "1") return String(i + 1);
    if (style === "I") { var r = "", n = i + 1, t = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]]; t.forEach(function (x) { while (n >= x[0]) { r += x[1]; n -= x[0]; } }); return r; }
    var s = "", k = i; do { s = String.fromCharCode(65 + (k % 26)) + s; k = Math.floor(k / 26) - 1; } while (k >= 0); return s;
  }
  function bates(prefix, n, digits) { var s = String(n); while (s.length < digits) s = "0" + s; return prefix + s; }
  function safe(t) { return String(t || "").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-").replace(/…/g, "...").replace(/[^\x20-\x7E\xA0-\xFF]/g, ""); }
  function wrap(font, text, size, maxW) {
    var words = safe(text).split(/\s+/), lines = [], cur = "";
    words.forEach(function (w) { var t = cur ? cur + " " + w : w; if (font.widthOfTextAtSize(t, size) > maxW && cur) { lines.push(cur); cur = w; } else cur = t; });
    if (cur) lines.push(cur); return lines;
  }

  async function stampBates(doc, o) {
    var F = await doc.embedFont(L().StandardFonts.HelveticaBold), rgb = L().rgb, n = o.start;
    doc.getPages().forEach(function (page) {
      var s = stamper(page), t = bates(o.prefix, n++, o.digits), size = o.size || 9, tw = F.widthOfTextAtSize(t, size), m = 18;
      var X = o.pos === "left" ? m : o.pos === "center" ? (s.W - tw) / 2 : s.W - m - tw;
      s.rect(X - 4, m - 4, tw + 8, size + 7, { color: rgb(1, 1, 1), opacity: 0.92 });
      s.text(t, X, m, { size: size, font: F, color: rgb(0, 0, 0) });
    });
    return n;
  }

  /* Build the full filing: lead documents, index, exhibits with cover sheets/labels, Bates, bookmarks, scrub. */
  async function build(files, o, onStep) {
    var P = L(), out = await P.PDFDocument.create(), rgb = P.rgb;
    var F = await out.embedFont(P.StandardFonts.Helvetica), FB = await out.embedFont(P.StandardFonts.HelveticaBold);
    var marks = [], exhibits = [], step = function (m) { if (onStep) onStep(m); };
    var leads = files.filter(function (f) { return f.role === "main"; }), exs = files.filter(function (f) { return f.role !== "main"; });
    for (var i = 0; i < leads.length; i++) {
      step("Adding " + leads[i].name);
      var src = await openLib(leads[i].bytes), start = out.getPageCount();
      (await out.copyPages(src, src.getPageIndices())).forEach(function (p) { out.addPage(p); });
      marks.push({ title: leads[i].label || leads[i].name, page: start });
    }
    var indexAt = -1;
    if (o.index && exs.length) { indexAt = out.getPageCount(); out.addPage([612, 792]); marks.push({ title: "Index of exhibits", page: indexAt }); }
    for (var e = 0; e < exs.length; e++) {
      var f = exs[e], lab = (o.word || "Exhibit") + " " + label(o.style, e);
      step("Adding " + lab);
      var first = out.getPageCount();
      if (o.covers) {
        var cv = out.addPage([612, 792]), big = o.binder ? 40 : 46, tw = FB.widthOfTextAtSize(lab.toUpperCase(), big);
        cv.drawText(lab.toUpperCase(), { x: (612 - tw) / 2, y: 430, size: big, font: FB, color: rgb(0, 0, 0) });
        if (o.binder) { cv.drawRectangle({ x: 540, y: 600 - (e % 8) * 62, width: 72, height: 54, color: rgb(0.12, 0.13, 0.18) }); var tl2 = label(o.style, e); cv.drawText(tl2, { x: 576 - FB.widthOfTextAtSize(tl2, 18) / 2, y: 620 - (e % 8) * 62, size: 18, font: FB, color: rgb(1, 1, 1) }); }
        if (f.desc) wrap(F, f.desc, 15, 440).slice(0, 4).forEach(function (ln, k) { var w = F.widthOfTextAtSize(ln, 15); cv.drawText(ln, { x: (612 - w) / 2, y: 385 - k * 21, size: 15, font: F, color: rgb(0.2, 0.2, 0.2) }); });
      }
      var s2 = await openLib(f.bytes), firstDocPage = out.getPageCount();
      (await out.copyPages(s2, s2.getPageIndices())).forEach(function (p) { out.addPage(p); });
      if (o.stamp) {
        var st = stamper(out.getPage(firstDocPage)), tl = lab.toUpperCase(), lw = FB.widthOfTextAtSize(tl, 11);
        st.rect(st.W - lw - 34, st.H - 40, lw + 16, 22, { color: rgb(1, 1, 1), borderColor: rgb(0, 0, 0), borderWidth: 1.2 });
        st.text(tl, st.W - lw - 26, st.H - 33, { size: 11, font: FB, color: rgb(0, 0, 0) });
      }
      exhibits.push({ label: lab, desc: f.desc || f.label || f.name, first: first, last: out.getPageCount() - 1 });
      marks.push({ title: lab + (f.desc ? " - " + f.desc : ""), page: first });
    }
    if (o.checklist && o.checklist.length) {
      step("Adding closing checklist");
      var tmp = await P.PDFDocument.create(), tF = await tmp.embedFont(P.StandardFonts.Helvetica), tB = await tmp.embedFont(P.StandardFonts.HelveticaBold);
      drawChecklist(tmp, tF, tB, o.checklist, "Closing checklist");
      var at = indexAt >= 0 ? indexAt + 1 : exhibits.length ? exhibits[0].first : out.getPageCount(), cps = await out.copyPages(tmp, tmp.getPageIndices());
      cps.forEach(function (p, k) { out.insertPage(at + k, p); });
      marks.forEach(function (m) { if (m.page >= at) m.page += cps.length; });
      exhibits.forEach(function (x) { if (x.first >= at) { x.first += cps.length; x.last += cps.length; } });
      marks.push({ title: "Closing checklist", page: at }); marks.sort(function (a, b) { return a.page - b.page; });
    }
    var bStart = o.bates && o.bates.on ? o.bates.start : null;
    if (indexAt >= 0) {
      step("Writing index");
      var ip = out.getPage(indexAt), y = 700;
      ip.drawText(safe(o.title || "Index of exhibits"), { x: 72, y: 730, size: 18, font: FB });
      ip.drawText(o.bates && o.bates.on ? "Bates range" : "Pages", { x: 430, y: y, size: 10, font: FB });
      ip.drawText(o.binder ? "Tab" : "Exhibit", { x: 72, y: y, size: 10, font: FB }); ip.drawText("Description", { x: 160, y: y, size: 10, font: FB });
      ip.drawLine({ start: { x: 72, y: y - 6 }, end: { x: 540, y: y - 6 }, thickness: 0.8 });
      y -= 26;
      exhibits.forEach(function (x) {
        var rng = bStart != null ? bates(o.bates.prefix, bStart + x.first, o.bates.digits) + " - " + bates(o.bates.prefix, bStart + x.last, o.bates.digits) : (x.first + 1) + " - " + (x.last + 1);
        var lines = wrap(F, x.desc, 10, 255).slice(0, 3);
        ip.drawText(safe(x.label), { x: 72, y: y, size: 10, font: FB });
        lines.forEach(function (ln, k) { ip.drawText(ln, { x: 160, y: y - k * 13, size: 10, font: F }); });
        ip.drawText(rng, { x: 430, y: y, size: 9, font: F });
        y -= Math.max(1, lines.length) * 13 + 12;
      });
    }
    if (bStart != null) { step("Bates numbering"); await stampBates(out, o.bates); }
    if (o.bookmarks) addOutline(out, marks);
    out.setTitle(safe(o.title || "Filing")); out.setProducer("FileReady"); out.setCreator("FileReady");
    var bytes = await save(out);
    if (o.scrub) { step("Removing hidden data"); bytes = await scrub(bytes); if (o.bookmarks) { var d2 = await openLib(bytes); addOutline(d2, marks); bytes = await save(d2); } }
    return { bytes: bytes, pages: out.getPageCount(), exhibits: exhibits, batesEnd: bStart != null ? bStart + out.getPageCount() - 1 : null };
  }
  function addOutline(doc, marks) {
    if (!marks.length) return;
    var P = L(), N = P.PDFName, ctx = doc.context, root = ctx.nextRef(), refs = marks.map(function () { return ctx.nextRef(); });
    marks.forEach(function (m, i) {
      var d = { Title: P.PDFHexString.fromText(safe(m.title).slice(0, 120)), Parent: root, Dest: ctx.obj([doc.getPage(Math.min(m.page, doc.getPageCount() - 1)).ref, N.of("Fit")]) };
      if (i > 0) d.Prev = refs[i - 1]; if (i < refs.length - 1) d.Next = refs[i + 1];
      ctx.assign(refs[i], ctx.obj(d));
    });
    ctx.assign(root, ctx.obj({ Type: "Outlines", First: refs[0], Last: refs[refs.length - 1], Count: refs.length }));
    doc.catalog.set(N.of("Outlines"), root); doc.catalog.set(N.of("PageMode"), N.of("UseOutlines"));
  }

  /* One- or two-page check report. */
  async function report(r) {
    var P = L(), d = await P.PDFDocument.create(), F = await d.embedFont(P.StandardFonts.Helvetica), FB = await d.embedFont(P.StandardFonts.HelveticaBold), rgb = P.rgb;
    var pg = d.addPage([612, 792]), y = 742;
    function line(t, o) { o = o || {}; var sz = o.size || 10, f = o.bold ? FB : F; wrap(f, t, sz, o.w || 468).forEach(function (ln) { if (y < 70) { pg = d.addPage([612, 792]); y = 742; } pg.drawText(ln, { x: o.x || 72, y: y, size: sz, font: f, color: o.color || rgb(0.1, 0.1, 0.12) }); y -= sz + 5; }); }
    pg.drawRectangle({ x: 0, y: 762, width: 612, height: 30, color: rgb(0.07, 0.08, 0.1) });
    pg.drawText("FileReady check report", { x: 72, y: 772, size: 12, font: FB, color: rgb(0.3, 0.94, 0.6) });
    line(r.title, { size: 18, bold: true }); y -= 4;
    line("Checked " + r.when + (r.by ? " by " + r.by : "") + " · " + r.pack + " · " + r.area, { color: rgb(0.35, 0.37, 0.42) });
    line("Files: " + r.files.join(", "), { color: rgb(0.35, 0.37, 0.42) }); y -= 8;
    line("Summary: " + r.must + " must fix, " + r.should + " should fix, " + r.passed.length + " checks passed.", { bold: true, size: 11 }); y -= 6;
    if (r.issues.length) { line("Open issues", { bold: true, size: 12 }); r.issues.forEach(function (i) { line((i.sev === "must" ? "[MUST] " : "[SHOULD] ") + i.title + " - " + i.fileName + " - " + i.detail + (i.cite ? " (" + i.cite.text + ")" : ""), { x: 82, w: 458 }); }); y -= 6; }
    line("Passed", { bold: true, size: 12 }); r.passed.forEach(function (p) { line("+ " + p, { x: 82 }); }); y -= 6;
    if (r.log.length) { line("Changes made in FileReady", { bold: true, size: 12 }); r.log.slice(-40).forEach(function (l) { line(l, { x: 82, w: 458 }); }); y -= 6; }
    line("Rule pack: " + r.pack + (r.verified ? ", sources last reviewed " + r.verified : "") + ". FileReady flags common filing problems. It is not legal advice and does not guarantee acceptance. Always confirm the current rules of your court and any judge-specific orders.", { size: 8.5, color: rgb(0.4, 0.42, 0.46) });
    d.setTitle("FileReady check report"); d.setProducer("FileReady");
    return save(d);
  }

  /* Page image for thumbnails and the viewer. */
  async function pageImage(bytes, n, maxPx) {
    var js = await openJs(bytes), page = await js.getPage(n), base = page.getViewport({ scale: 1 });
    var r = await render(page, (maxPx || 300) / Math.max(base.width, base.height));
    var url = r.canvas.toDataURL("image/jpeg", 0.82), out = { url: url, w: r.canvas.width, h: r.canvas.height, scale: r.vp.scale, count: js.numPages };
    close(js); return out;
  }
  async function pageCount(bytes) { try { var d = await openLib(bytes); return d.getPageCount(); } catch (e) { return 0; } }

  /* Demo filing with fictional, deliberately flawed documents. */
  async function demo() {
    var P = L(), rgb = P.rgb, files = [];
    async function mkDoc(title, pages, opts) {
      opts = opts || {};
      var d = await P.PDFDocument.create(), F = await d.embedFont(P.StandardFonts.TimesRoman), FB = await d.embedFont(P.StandardFonts.TimesRomanBold);
      if (opts.author) { d.setAuthor(opts.author); d.setTitle(title + " (draft)"); }
      pages.forEach(function (body, i) {
        if (body === "BLANK") { d.addPage([612, 792]); return; }
        var land = body && body.land, pg = d.addPage(land ? [792, 612] : [612, 792]), y = (land ? 612 : 792) - 80;
        pg.drawText(title.toUpperCase(), { x: 72, y: y, size: 13, font: FB }); y -= 30;
        (body.lines || body).forEach(function (t, li) { wrap(F, t, 12, (land ? 792 : 612) - 144).forEach(function (ln) { pg.drawText(ln, { x: 72, y: y, size: 12, font: F }); if (body.cover === li) pg.drawRectangle({ x: 70, y: y - 4, width: F.widthOfTextAtSize(ln, 12) + 4, height: 16, color: rgb(0, 0, 0) }); y -= 17; }); y -= 6; });
        pg.drawText(String(i + 1), { x: 300, y: 36, size: 10, font: F });
      });
      return save(d);
    }
    var lorem = "This sample document is fictional and was created by FileReady for demonstration. The parties, facts and numbers are invented and do not describe real people or cases.";
    files.push({ name: "Motion to Modify.pdf", role: "main", label: "Motion to modify", bytes: await mkDoc("Petitioner's Motion to Modify", [[lorem, "Petitioner Jordan Sample asks the Court to modify the prior order for the reasons stated below and in the attached exhibits.", "1. The parties' circumstances have changed materially since the order was signed.", "2. The supporting records are attached as Exhibits A through D."], [lorem, "Respectfully submitted, Counsel for Petitioner."]], { author: "J. Smith, Paralegal" }) });
    files.push({ name: "Exhibit A - Lease.pdf", role: "exhibit", desc: "Residential lease, signed copy", bytes: await mkDoc("Residential Lease", [[lorem, "Tenant agrees to pay rent on the first day of each month."], { land: true, lines: [lorem, "Schedule of payments (wide table page that was scanned sideways)."] }, [lorem, "Signature page."]]) });
    files.push({ name: "Exhibit B - Bank statement.pdf", role: "exhibit", desc: "Bank statement, March", bytes: await mkDoc("Account Statement", [[lorem, "Account holder: Jordan Sample. Account number: 4471 2290 1183 556.", "SSN on file: 123-45-6789. Date of birth: 04/12/1986."], "BLANK", [lorem, "Closing balance and transaction list."]]) });
    files.push({ name: "Exhibit C - Report.pdf", role: "exhibit", desc: "Incident report, partly redacted", bytes: await mkDoc("Incident Report", [{ cover: 2, lines: [lorem, "Witness statement taken on the date of the incident.", "Confidential informant name: Taylor Example Witness"] }, { lines: [lorem, "Minor child Riley Sample Doe was present.", "Notes continue on this page."] }]) });
    files.push({ name: "Exhibit D - Photos.pdf", role: "exhibit", desc: "Photographs of the property", bytes: await mkDoc("Photographs", [[lorem, "Photograph 1: front entrance."], [lorem, "Photograph 1: front entrance."]]) });
    return files;
  }

  var DEMO_DOCX = "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";
  async function demoDeal() {
    var P = L(), files = [];
    async function doc(title, pages, author) {
      var d = await P.PDFDocument.create(), F = await d.embedFont(P.StandardFonts.TimesRoman), FB = await d.embedFont(P.StandardFonts.TimesRomanBold);
      if (author) d.setAuthor(author);
      pages.forEach(function (lines) {
        var pg = d.addPage([612, 792]), y = 712;
        pg.drawText(title.toUpperCase(), { x: 72, y: y, size: 13, font: FB }); y -= 30;
        lines.forEach(function (t) { t.split("\n").forEach(function (part) { wrap(F, part, 11.5, 468).forEach(function (ln) { pg.drawText(ln, { x: 72, y: y, size: 11.5, font: F }); y -= 16; }); }); y -= 6; });
      });
      return save(d);
    }
    var note = "Fictional sample created by FileReady for demonstration. All companies, people and numbers are invented.";
    files.push({ name: "Asset Purchase Agreement.pdf", role: "main", label: "Asset Purchase Agreement", bytes: await doc("Asset Purchase Agreement", [
      [note, "This Asset Purchase Agreement is dated 03/04/2026 between NORTHWIND LABS, INC. (\"Buyer\") and [SELLER NAME] (\"Seller\").",
       "1. Definitions. Terms are defined in Schedule 1.1.", "2. Purchase Price. Buyer shall pay $1,250,000 (One Hundred Twenty-Five Thousand Dollars) at Closing, subject to Section 2.3.",
       "2.1 Escrow. EUR 50,000 shall be held in escrow under the Escrow Agreement attached as Exhibit B.", "2.2 Adjustments. As set out in Section 7.4.", "3. Closing. Closing shall occur on [DATE].", "4. Representations. Seller makes the representations in Schedule 4.", "5. Covenants. TBD", "6. Termination. Either party may terminate under Section 6.1."],
      ["7. Wire instructions. Pay to IBAN DE89 3704 0044 0532 0130 00, SWIFT: COBADEFFXXX.", "8. Notices. Notices go to legal@northwind-example.com or +44 20 7946 0958.", "9. Governing law. Delaware.",
       "IN WITNESS WHEREOF, the parties have signed this Agreement.", "NORTHWIND LABS, INC.\nBy: ________________\nName: Avery Example\nTitle: CEO", "SELLER\nBy: ________________\nName: ________________\nTitle: ________________"]
    ], "Draft - K. Associate") });
    files.push({ name: "Schedule 1.1 - Definitions.pdf", role: "exhibit", desc: "Schedule 1.1 Definitions", bytes: await doc("Schedule 1.1", [[note, "\"Business\" means the analytics business of Seller.", "\"Closing\" has the meaning in Section 3."]]) });
    files.push({ name: "Escrow Agreement.pdf", role: "exhibit", desc: "Exhibit B Escrow Agreement", bytes: await doc("Escrow Agreement", [[note, "Escrow Agent shall hold the Escrow Amount.", "IN WITNESS WHEREOF the parties sign below.", "NORTHWIND LABS, INC.\nBy: ________________\nName: Avery Example\nTitle: CEO", "ESCROW AGENT\nBy: ________________\nName: Jordan Trustee\nTitle: VP"]]) });
    var bin = atob(DEMO_DOCX), dx = new Uint8Array(bin.length); for (var q = 0; q < bin.length; q++) dx[q] = bin.charCodeAt(q);
    files.push({ name: "Asset Purchase Agreement v2.docx", role: "exhibit", desc: "Revised draft from the other side (Word)", bytes: dx });
    files.push({ name: "Board Consent.pdf", role: "exhibit", desc: "Board consent approving the purchase", bytes: await doc("Unanimous Written Consent of the Board", [[note, "The Board approves the Asset Purchase Agreement.", "Director signature page.", "By: ________________\nName: Avery Example", "By: ________________\nName: Casey Director"]]) });
    return files;
  }

  /* ===================== Word (.docx) ===================== */
  var W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
  function isDocx(b) { return b && b[0] === 0x50 && b[1] === 0x4B; }
  async function zipOf(bytes) { return root.JSZip.loadAsync(copy(bytes)); }
  function xml(t) { return new DOMParser().parseFromString(t, "application/xml"); }
  function paraText(p) {
    var out = "";
    var walk = function (n) {
      for (var c = n.firstChild; c; c = c.nextSibling) {
        if (c.nodeType !== 1) continue;
        var ln = c.localName;
        if (ln === "del" || ln === "moveFrom" || ln === "delText") continue;
        if (ln === "t") out += c.textContent;
        else if (ln === "tab") out += "\t";
        else if (ln === "br" || ln === "cr") out += "\n";
        else if (ln === "r" && isHidden(c)) continue;
        else walk(c);
      }
    };
    walk(p); return out;
  }
  function isHidden(r) { var rp = r.getElementsByTagNameNS(W, "rPr")[0]; return !!(rp && rp.getElementsByTagNameNS(W, "vanish").length && rp.parentNode === r); }
  async function docxParts(z) { return Object.keys(z.files).filter(function (n) { return /^word\/(document|header\d*|footer\d*|footnotes|endnotes)\.xml$/.test(n); }); }
  async function analyzeDocx(bytes, opt, onP) {
    opt = opt || {};
    var res = { kind: "docx", size: bytes.byteLength || bytes.length, pages: [], meta: {}, paras: [], comments: 0, revisions: 0, hidden: 0, error: "" };
    var z; try { z = await zipOf(bytes); } catch (e) { res.error = "This Word file could not be opened."; return res; }
    var docF = z.file("word/document.xml"); if (!docF) { res.error = "This file is not a Word document."; return res; }
    var parts = await docxParts(z); parts.sort(function (a, b) { return a === "word/document.xml" ? -1 : b === "word/document.xml" ? 1 : 0; });
    for (var i = 0; i < parts.length; i++) {
      var d = xml(await z.file(parts[i]).async("string"));
      res.revisions += d.getElementsByTagNameNS(W, "ins").length + d.getElementsByTagNameNS(W, "del").length + d.getElementsByTagNameNS(W, "moveFrom").length;
      [].forEach.call(d.getElementsByTagNameNS(W, "r"), function (r) { if (isHidden(r) && r.textContent.trim()) res.hidden++; });
      [].forEach.call(d.getElementsByTagNameNS(W, "p"), function (p) { var t = paraText(p); if (parts[i] === "word/document.xml") res.paras.push(t); else if (t.trim()) res.paras.push(t); });
    }
    var cm = z.file("word/comments.xml"); if (cm) res.comments = xml(await cm.async("string")).getElementsByTagNameNS(W, "comment").length;
    var core = z.file("docProps/core.xml");
    if (core) { var c = xml(await core.async("string")); [["creator", "Author"], ["lastModifiedBy", "Last edited by"], ["title", "Title"], ["subject", "Subject"], ["keywords", "Keywords"], ["description", "Comments"]].forEach(function (k) { var el = c.getElementsByTagNameNS("*", k[0])[0]; if (el && el.textContent.trim()) res.meta[k[1]] = el.textContent.trim().slice(0, 80); }); }
    var app = z.file("docProps/app.xml");
    if (app) { var a2 = xml(await app.async("string")); ["Company", "Manager"].forEach(function (k) { var el = a2.getElementsByTagName(k)[0]; if (el && el.textContent.trim()) res.meta[k] = el.textContent.trim().slice(0, 80); }); }
    // split paragraphs into readable "sections" so findings point somewhere useful
    var buf = [], len = 0, n = 0;
    function push() { if (!buf.length) return; n++; var text = buf.join("\n"); var sens = opt.types && opt.types.length ? findSensitive(text, opt.types, opt.custom) : []; res.pages.push({ n: n, text: text.slice(0, 40000), chars: text.replace(/\s/g, "").length, blank: false, ink: 1, covered: [], sens: sens, hash: "", w: 612, h: 792, rot: 0, comments: 0, fields: 0, foreign: false }); buf = []; len = 0; }
    res.paras.forEach(function (p) { buf.push(p); len += p.length; if (len > 3500) push(); });
    push();
    if (!res.pages.length) res.pages.push({ n: 1, text: "", chars: 0, blank: true, ink: 0, covered: [], sens: [], hash: "", w: 612, h: 792, rot: 0, comments: 0, fields: 0 });
    if (onP) onP(1);
    return res;
  }
  function docxIssues(f, a, prof, add, base) {
    var hid = [];
    if (a.revisions) hid.push(a.revisions + " tracked change" + (a.revisions > 1 ? "s" : ""));
    if (a.comments) hid.push(a.comments + " comment" + (a.comments > 1 ? "s" : ""));
    if (a.hidden) hid.push(a.hidden + " hidden text run" + (a.hidden > 1 ? "s" : ""));
    var who = a.meta.Author || a.meta["Last edited by"];
    if (Object.keys(a.meta).length) hid.push("document properties" + (who ? " (" + who + ")" : ""));
    if (hid.length) add(Object.assign({ sev: a.revisions || a.comments || a.hidden ? "must" : "should", code: "docxhidden", title: "Hidden Word data", detail: hid.join(" · "), fix: "cleanDocx" }, base));
  }
  function stripDoc(d) {
    var rm = function (ln) { [].slice.call(d.getElementsByTagNameNS(W, ln)).forEach(function (e) { e.parentNode && e.parentNode.removeChild(e); }); };
    var unwrap = function (ln) { [].slice.call(d.getElementsByTagNameNS(W, ln)).forEach(function (e) { var p = e.parentNode; if (!p) return; while (e.firstChild) p.insertBefore(e.firstChild, e); p.removeChild(e); }); };
    ["del", "moveFrom", "rPrChange", "pPrChange", "sectPrChange", "tblPrChange", "trPrChange", "tcPrChange", "numberingChange", "commentRangeStart", "commentRangeEnd", "moveFromRangeStart", "moveFromRangeEnd", "moveToRangeStart", "moveToRangeEnd"].forEach(rm);
    ["ins", "moveTo"].forEach(unwrap);
    [].slice.call(d.getElementsByTagNameNS(W, "commentReference")).forEach(function (e) { var r = e.parentNode; if (r && r.parentNode) r.parentNode.removeChild(r); });
    [].slice.call(d.getElementsByTagNameNS(W, "r")).forEach(function (r) { if (isHidden(r) && r.parentNode) r.parentNode.removeChild(r); });
  }
  async function cleanDocx(bytes) {
    var z = await zipOf(bytes), ser = new XMLSerializer();
    var parts = await docxParts(z);
    for (var i = 0; i < parts.length; i++) { var d = xml(await z.file(parts[i]).async("string")); stripDoc(d); z.file(parts[i], ser.serializeToString(d)); }
    ["word/comments.xml", "word/commentsExtended.xml", "word/commentsIds.xml", "word/commentsExtensible.xml", "word/people.xml"].forEach(function (p) {
      if (!z.file(p)) return;
      if (p === "word/comments.xml") z.file(p, '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:comments xmlns:w="' + W + '"/>');
      else if (p === "word/people.xml") z.file(p, '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w15:people xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml"/>');
    });
    var core = z.file("docProps/core.xml");
    if (core) { var c = xml(await core.async("string")); ["creator", "lastModifiedBy", "keywords", "description", "subject", "title", "category"].forEach(function (k) { [].forEach.call(c.getElementsByTagNameNS("*", k), function (el) { el.textContent = ""; }); }); z.file("docProps/core.xml", ser.serializeToString(c)); }
    var app = z.file("docProps/app.xml");
    if (app) { var a2 = xml(await app.async("string")); ["Company", "Manager"].forEach(function (k) { [].forEach.call(a2.getElementsByTagName(k), function (el) { el.textContent = ""; }); }); z.file("docProps/app.xml", ser.serializeToString(a2)); }
    var sett = z.file("word/settings.xml");
    if (sett) { var st = xml(await sett.async("string")); [].slice.call(st.getElementsByTagNameNS(W, "trackRevisions")).forEach(function (e) { e.parentNode.removeChild(e); }); z.file("word/settings.xml", ser.serializeToString(st)); }
    return new Uint8Array(await z.generateAsync({ type: "uint8array", compression: "DEFLATE" }));
  }
  /* Redact in Word: each matched value is replaced with X characters (same length), as many court rules describe. */
  async function redactDocx(bytes, raws) {
    raws = (raws || []).filter(function (r) { return r && r.length > 1; }).sort(function (a, b) { return b.length - a.length; });
    var z = await zipOf(bytes), ser = new XMLSerializer(), parts = await docxParts(z), missed = 0;
    for (var i = 0; i < parts.length; i++) {
      var d = xml(await z.file(parts[i]).async("string")), changed = false;
      [].forEach.call(d.getElementsByTagNameNS(W, "p"), function (p) {
        var ts = [].slice.call(p.getElementsByTagNameNS(W, "t")); if (!ts.length) return;
        var full = ts.map(function (t) { return t.textContent; }).join("");
        raws.forEach(function (raw) {
          var idx = full.indexOf(raw);
          while (idx >= 0) {
            // replace characters across however many runs the value spans
            var pos = 0;
            ts.forEach(function (t) {
              var tx = t.textContent, a = Math.max(idx, pos), b = Math.min(idx + raw.length, pos + tx.length);
              if (a < b) { t.textContent = tx.slice(0, a - pos) + tx.slice(a - pos, b - pos).replace(/[^\s\-\/.]/g, "X") + tx.slice(b - pos); changed = true; }
              pos += tx.length;
            });
            full = ts.map(function (t) { return t.textContent; }).join("");
            idx = full.indexOf(raw, idx + 1);
          }
        });
      });
      if (changed) z.file(parts[i], ser.serializeToString(d));
    }
    return new Uint8Array(await z.generateAsync({ type: "uint8array", compression: "DEFLATE" }));
  }

  /* ===================== Compare (redline) ===================== */
  function myers(a, b, eq) {
    var n = a.length, m = b.length, max = n + m, v = { 1: 0 }, trace = [];
    if (max === 0) return [];
    var LIMIT = 4000;
    for (var d = 0; d <= Math.min(max, LIMIT); d++) {
      trace.push(Object.assign({}, v));
      for (var k = -d; k <= d; k += 2) {
        var x = (k === -d || (k !== d && v[k - 1] < v[k + 1])) ? v[k + 1] : v[k - 1] + 1, y = x - k;
        while (x < n && y < m && eq(a[x], b[y])) { x++; y++; }
        v[k] = x;
        if (x >= n && y >= m) return backtrack(trace, a, b, d);
      }
    }
    return [{ t: "-", v: a }, { t: "+", v: b }];
  }
  function backtrack(trace, a, b, D) {
    var x = a.length, y = b.length, ops = [];
    for (var d = D; d > 0; d--) {
      var v = trace[d], k = x - y, pk = (k === -d || (k !== d && v[k - 1] < v[k + 1])) ? k + 1 : k - 1, px = v[pk], py = px - pk;
      while (x > px && y > py) { ops.push({ t: "=", v: [a[x - 1]] }); x--; y--; }
      if (x === px) { ops.push({ t: "+", v: [b[y - 1]] }); y--; } else { ops.push({ t: "-", v: [a[x - 1]] }); x--; }
    }
    while (x > 0 && y > 0) { ops.push({ t: "=", v: [a[x - 1]] }); x--; y--; }
    ops.reverse();
    var out = []; ops.forEach(function (o) { var l = out[out.length - 1]; if (l && l.t === o.t) l.v = l.v.concat(o.v); else out.push({ t: o.t, v: o.v.slice() }); });
    return out;
  }
  function toks(s) { return s.match(/\s+|[A-Za-z0-9À-ɏ'$%.,]+|[^\sA-Za-z0-9]/g) || []; }
  /* Compare two lists of paragraphs. Returns paragraphs as runs of { t: "=", "+", "-", s }. */
  function compare(pa, pb) {
    var sent = function (list) { return list.join(" ").replace(/\s+/g, " ").trim().split(/(?<=[.;:!?])\s+(?=[A-Z0-9("\u201C\[])/).map(function (x) { return x.trim(); }).filter(Boolean); };
    pa = sent(pa); pb = sent(pb);
    var blocks = myers(pa, pb, function (x, y) { return x === y; }), paras = [], stats = { ins: 0, del: 0, changed: 0, same: 0 };
    for (var i = 0; i < blocks.length; i++) {
      var bl = blocks[i];
      if (bl.t === "=") { bl.v.forEach(function (p) { paras.push([{ t: "=", s: p }]); stats.same++; }); continue; }
      var dels = bl.t === "-" ? bl.v : [], adds = bl.t === "+" ? bl.v : [];
      if (bl.t === "-" && blocks[i + 1] && blocks[i + 1].t === "+") { adds = blocks[i + 1].v; i++; }
      var k = Math.max(dels.length, adds.length);
      for (var j = 0; j < k; j++) {
        var A = dels[j], B = adds[j];
        if (A != null && B != null) {
          var ops = myers(toks(A), toks(B), function (x, y) { return x === y; }), runs = [];
          ops.forEach(function (o) { runs.push({ t: o.t, s: o.v.join("") }); if (o.t === "+") stats.ins += o.v.filter(function (w) { return /\S/.test(w); }).length; if (o.t === "-") stats.del += o.v.filter(function (w) { return /\S/.test(w); }).length; });
          paras.push(runs); stats.changed++;
        } else if (A != null) { paras.push([{ t: "-", s: A }]); stats.del += toks(A).filter(function (w) { return /\S/.test(w); }).length; stats.changed++; }
        else { paras.push([{ t: "+", s: B }]); stats.ins += toks(B).filter(function (w) { return /\S/.test(w); }).length; stats.changed++; }
      }
    }
    return { paras: paras, stats: stats };
  }
  async function redlinePdf(cmp, nameA, nameB, when) {
    var P = L(), d = await P.PDFDocument.create(), F = await d.embedFont(P.StandardFonts.Helvetica), FB = await d.embedFont(P.StandardFonts.HelveticaBold), rgb = P.rgb;
    var pg = d.addPage([612, 792]), y = 740, X0 = 60, XM = 552, size = 10, lh = 14;
    pg.drawText("Redline comparison", { x: X0, y: y, size: 18, font: FB }); y -= 22;
    pg.drawText(safe("Original: " + nameA).slice(0, 100), { x: X0, y: y, size: 9, font: F, color: rgb(.35, .35, .4) }); y -= 12;
    pg.drawText(safe("Revised: " + nameB).slice(0, 100), { x: X0, y: y, size: 9, font: F, color: rgb(.35, .35, .4) }); y -= 12;
    pg.drawText(safe(when + "  ·  " + cmp.stats.ins + " words added, " + cmp.stats.del + " removed, " + cmp.stats.changed + " paragraphs changed"), { x: X0, y: y, size: 9, font: F, color: rgb(.35, .35, .4) }); y -= 24;
    var GREEN = rgb(0.05, 0.5, 0.25), RED = rgb(0.8, 0.12, 0.12), INK = rgb(0.1, 0.1, 0.12);
    function nl() { y -= lh; if (y < 60) { pg = d.addPage([612, 792]); y = 740; } }
    cmp.paras.forEach(function (runs) {
      var x = X0;
      runs.forEach(function (r) {
        (r.s.match(/\s+|\S+/g) || []).forEach(function (w) {
          var t = safe(w); if (!t) return;
          if (/^\s+$/.test(t)) { x += F.widthOfTextAtSize(" ", size); return; }
          var f = r.t === "=" ? F : FB, wd = f.widthOfTextAtSize(t, size);
          if (x + wd > XM) { nl(); x = X0; }
          var col = r.t === "+" ? GREEN : r.t === "-" ? RED : INK;
          pg.drawText(t, { x: x, y: y, size: size, font: f, color: col });
          if (r.t === "+") pg.drawLine({ start: { x: x, y: y - 2 }, end: { x: x + wd, y: y - 2 }, thickness: .8, color: GREEN });
          if (r.t === "-") pg.drawLine({ start: { x: x, y: y + 3.4 }, end: { x: x + wd, y: y + 3.4 }, thickness: .9, color: RED });
          x += wd;
        });
      });
      nl(); y -= 4;
    });
    d.setTitle("Redline comparison"); d.setProducer("FileReady");
    return save(d);
  }

  /* ===================== OCR text layer ===================== */
  /* recognize(canvas) must resolve to [{ text, x0, y0, x1, y1 }] in canvas pixels. */
  async function ocr(bytes, pages, recognize, onP) {
    var js = await openJs(bytes), layer = {};
    for (var i = 0; i < pages.length; i++) {
      var page = await js.getPage(pages[i]), r = await render(page, 2.4), words = await recognize(r.canvas);
      layer[pages[i]] = words.filter(function (w) { return w.text && w.text.trim(); }).map(function (w) {
        var a = r.vp.convertToPdfPoint(w.x0, w.y1), b = r.vp.convertToPdfPoint(w.x1, w.y0);
        return { s: safe(w.text), x: Math.min(a[0], b[0]), y: Math.min(a[1], b[1]), w: Math.abs(b[0] - a[0]), h: Math.abs(b[1] - a[1]) };
      });
      if (onP) onP((i + 1) / pages.length);
    }
    close(js);
    var doc = await openLib(bytes), Fh = await doc.embedFont(L().StandardFonts.Helvetica);
    Object.keys(layer).forEach(function (n) {
      var pg = doc.getPage(+n - 1);
      layer[n].forEach(function (w) {
        if (!w.s || w.h < 2) return;
        var size = w.h * 0.95, nat = Fh.widthOfTextAtSize(w.s, size) || 1;
        try { pg.drawText(w.s, { x: w.x, y: w.y + w.h * 0.15, size: size * Math.max(.5, Math.min(1.6, w.w / nat)), font: Fh, opacity: 0 }); } catch (e) { /* skip */ }
      });
    });
    return save(doc);
  }
  root.FRE = { insertSigned: insertSigned, matchSigned: matchSigned, checklistPdf: checklistPdf, isDocx: isDocx, analyzeDocx: analyzeDocx, cleanDocx: cleanDocx, redactDocx: redactDocx, compare: compare, redlinePdf: redlinePdf, ocr: ocr, demoDeal: demoDeal, flattenAll: flattenAll, sigPackets: sigPackets, words2num: words2num, analyze: analyze, check: check, removePages: removePages, rotatePages: rotatePages, movePage: movePage, scrub: scrub, redactPage: redactPage, resize: resize, split: split, build: build, report: report, pageImage: pageImage, pageCount: pageCount, demo: demo, PAT: PAT, label: label, bates: bates, SIZES: SIZES, findSensitive: findSensitive };
})(window);
