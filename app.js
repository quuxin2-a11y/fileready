/* FileReady app UI. All processing happens on this device. */
(function () {
  "use strict";
  var E = window.FRE, R = window.FRR, V = "1.0.0";
  var root = document.getElementById("app");

  /* ---------- icons ---------- */
  var IC = {
    chk: '<path d="M9 4h6v3H9z"/><path d="M15 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"/><path d="M9 14l2 2 4-4"/>',
    fold: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    stack: '<rect x="7" y="3" width="12" height="15" rx="2"/><path d="M5 7v12a2 2 0 0 0 2 2h9"/>',
    rep: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 17v-3M12 17v-5M15 17v-2"/>',
    set: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', ext: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>', search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    hash: '<path d="M5 9h14M5 15h14M10 3L8 21M16 3l-2 18"/>', eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    scrub: '<path d="M4 20h16"/><path d="M14 4l6 6-9 9H5v-6z"/>', shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    alert: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
    rotR: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>', rotL: '<path d="M4 11a8 8 0 1 1 2.3 5.7"/><path d="M4 4v7h7"/>',
    blank: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 12h6"/>', lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>', file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
    spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>', chev: '<path d="M9 6l6 6-6 6"/>', back: '<path d="M15 6l-6 6 6 6"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>', trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13M9 7V4h6v3"/>',
    undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>', share: '<path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M16 6l-4-4-4 4M12 2v14"/>',
    dl: '<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/><path d="M7 11l5 5 5-5M12 4v12"/>', up: '<path d="M6 15l6-6 6 6"/>', down: '<path d="M6 9l6 6 6-6"/>',
    left: '<path d="M15 6l-6 6 6 6"/>', right: '<path d="M9 6l6 6-6 6"/>', pages: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="9" rx="1.5"/><rect x="3" y="15" width="7" height="6" rx="1.5"/><rect x="14" y="15" width="7" height="6" rx="1.5"/>',
    scale: '<path d="M12 3v18M7 21h10M5 7h14"/><path d="M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>', brief: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>', home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
    heart: '<path d="M12 20s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z"/>', coins: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>', pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    finger: '<path d="M12 11v4M8 13a4 4 0 0 1 8 0v3M5 12a7 7 0 0 1 14 0v2M6 18c1 1.5 2 2.5 3 3M18 17c-.4 1.6-1 2.9-2 4"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    text: '<path d="M4 7V5h16v2M9 19h6M12 5v14"/>', book: '<path d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M8 7h7"/>', link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    sig: '<path d="M3 17c3 0 4-8 7-8s1 8 4 8 3-3 5-3"/><path d="M3 21h18"/>', binder: '<rect x="4" y="3" width="14" height="18" rx="2"/><path d="M8 3v18M18 7h2M18 12h2M18 17h2"/>', cmp: '<path d="M8 3v14M16 7v14"/><path d="M5 6l3-3 3 3M13 18l3 3 3-3"/>', word: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M8 12l1.5 6 2.5-5 2.5 5 1.5-6"/>', team: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20a6 6 0 0 1 12 0M14 20a4.5 4.5 0 0 1 8 0"/>', scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M7 12h10"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'
  };
  function ic(n, s, c, w) { return '<svg viewBox="0 0 24 24" width="' + (s || 22) + '" height="' + (s || 22) + '" fill="none" stroke="' + (c || "currentColor") + '" stroke-width="' + (w || 2) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IC[n] || "") + "</svg>"; }
  var lid = 0;
  function logo(px, light) {
    var v = "L" + (++lid), b1 = light ? "#ffffff" : "#1d2233", b2 = light ? "#dfe5f0" : "#07080c";
    return '<svg viewBox="0 0 200 200" width="' + px + '" height="' + px + '" role="img" aria-label="FileReady"><defs>' +
      '<linearGradient id="bg' + v + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + b1 + '"/><stop offset="1" stop-color="' + b2 + '"/></linearGradient>' +
      '<radialGradient id="ga' + v + '" cx=".75" cy=".2" r=".7"><stop offset="0" stop-color="#7c8cff" stop-opacity=".55"/><stop offset="1" stop-color="#7c8cff" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="gb' + v + '" cx=".2" cy=".9" r=".6"><stop offset="0" stop-color="#1ec26a" stop-opacity=".45"/><stop offset="1" stop-color="#1ec26a" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="p1' + v + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9aa6ff"/><stop offset="1" stop-color="#5b6cff"/></linearGradient>' +
      '<linearGradient id="p2' + v + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd76a"/><stop offset="1" stop-color="#ffb020"/></linearGradient>' +
      '<linearGradient id="p3' + v + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffa27a"/><stop offset="1" stop-color="#ff6a3d"/></linearGradient>' +
      '<linearGradient id="pw' + v + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#e9edf5"/></linearGradient>' +
      '<linearGradient id="ck' + v + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4ef09a"/><stop offset="1" stop-color="#10a957"/></linearGradient></defs>' +
      '<rect width="200" height="200" rx="46" fill="url(#bg' + v + ')"/><rect width="200" height="200" rx="46" fill="url(#ga' + v + ')"/><rect width="200" height="200" rx="46" fill="url(#gb' + v + ')"/>' +
      '<rect x="84" y="36" width="68" height="90" rx="12" fill="url(#p1' + v + ')" transform="rotate(16 118 81)"/><rect x="74" y="40" width="68" height="90" rx="12" fill="url(#p2' + v + ')" transform="rotate(6 108 85)"/>' +
      '<rect x="62" y="46" width="68" height="90" rx="12" fill="url(#p3' + v + ')" transform="rotate(-5 96 91)"/><rect x="54" y="54" width="70" height="94" rx="12" fill="url(#pw' + v + ')"/>' +
      '<rect x="67" y="74" width="38" height="7" rx="3.5" fill="#cfd6e4"/><rect x="67" y="89" width="44" height="7" rx="3.5" fill="#cfd6e4"/><rect x="67" y="104" width="28" height="7" rx="3.5" fill="#cfd6e4"/>' +
      '<circle cx="128" cy="138" r="27" fill="url(#ck' + v + ')"/><path d="M116 138L124.5 146.5L141 129" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  function h(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function mb(n) { return n > 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB"; }
  function when(t) { var d = new Date(t); return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + ", " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }); }

  /* ---------- settings ---------- */
  var DEF = { onboarded: false, name: "", court: "state", state: "TX", area: "civil", region: "none", custom: [], over: {}, theme: "dark", style: "aurora", labs: false, big: false, pin: "",
    ex: { style: "A", word: "Exhibit", covers: true, stamp: true, index: true, bookmarks: true, scrub: true, split: false, binder: false, checklist: true },
    bates: { on: true, prefix: "", start: 1, digits: 6, pos: "right" } };
  var S = load();
  function load() { try { var s = JSON.parse(localStorage.getItem("fr.settings") || "{}"); var o = Object.assign({}, DEF, s); o.ex = Object.assign({}, DEF.ex, s.ex || {}); o.bates = Object.assign({}, DEF.bates, s.bates || {}); o.over = s.over || {}; return o; } catch (e) { return JSON.parse(JSON.stringify(DEF)); } }
  function saveS() { try { localStorage.setItem("fr.settings", JSON.stringify(S)); } catch (e) { /* storage full */ } }
  function prof() { return R.profile(S); }
  function applyLook() { var c = document.documentElement.classList; c.toggle("light", S.theme === "light"); c.toggle("aurora", S.theme !== "light" && S.style !== "classic"); c.toggle("big", !!S.big); var m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = S.theme === "light" ? "#f2f4f8" : "#07080c"; }

  /* ---------- storage (IndexedDB) ---------- */
  var db;
  function idb() {
    return new Promise(function (res, rej) {
      var r = indexedDB.open("fileready", 1);
      r.onupgradeneeded = function () { var d = r.result; d.createObjectStore("filings", { keyPath: "id" }); d.createObjectStore("blobs"); d.createObjectStore("an"); };
      r.onsuccess = function () { db = r.result; res(); }; r.onerror = function () { rej(r.error); };
    });
  }
  function tx(store, mode, fn) { return new Promise(function (res, rej) { var t = db.transaction(store, mode), s = t.objectStore(store), out = fn(s); t.oncomplete = function () { res(out && "result" in out ? out.result : out); }; t.onerror = function () { rej(t.error); }; }); }
  var put = function (store, val, key) { return tx(store, "readwrite", function (s) { return key != null ? s.put(val, key) : s.put(val); }); };
  var get = function (store, key) { return tx(store, "readonly", function (s) { return s.get(key); }); };
  var del = function (store, key) { return tx(store, "readwrite", function (s) { return s.delete(key); }); };
  var all = function (store) { return tx(store, "readonly", function (s) { return s.getAll(); }); };
  async function blob(key) { var b = await get("blobs", key); return b ? new Uint8Array(b) : null; }

  /* ---------- runtime state ---------- */
  var st = { tab: "check", screen: null, fid: null, filings: [], an: {}, busy: "", pct: 0, sel: {}, unlocked: false, filter: "all", q: "", onb: 0, view: null, last: null, packets: null, pin: "" };
  function cur() { return st.filings.filter(function (f) { return f.id === st.fid; })[0] || null; }
  function curV(file) { return file.versions[file.versions.length - 1]; }
  async function saveF(f) { f.updated = Date.now(); await put("filings", f); }
  async function loadFilings() { st.filings = (await all("filings")).sort(function (a, b) { return b.updated - a.updated; }); if (!cur() && st.filings[0]) st.fid = st.filings[0].id; }
  function log(f, msg) { f.log = f.log || []; f.log.push(when(Date.now()) + " - " + msg); }

  /* ---------- feedback ---------- */
  function buzz(kind) {
    try { var Hp = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics; if (Hp) { if (kind === "ok") Hp.notification({ type: "SUCCESS" }); else Hp.impact({ style: "LIGHT" }); return; } } catch (e) { /* ignore */ }
    try { if (navigator.vibrate) navigator.vibrate(kind === "ok" ? [12, 40, 18] : 10); } catch (e) { /* ignore */ }
  }
  var toastT;
  function toast(m) { var t = document.querySelector(".toast"); if (t) t.remove(); t = document.createElement("div"); t.className = "toast"; t.textContent = m; document.body.appendChild(t); clearTimeout(toastT); toastT = setTimeout(function () { t.remove(); }, 2600); }

  /* ---------- checking ---------- */
  function sig(p) { return p.types.join(",") + "|" + (p.custom || []).join("~"); }
  async function analysisFor(file, p, onP) {
    var v = curV(file), k = v.key + "|" + sig(p);
    if (st.an[k]) return st.an[k];
    var saved = await get("an", k); if (saved) { st.an[k] = saved; return saved; }
    var bytes = await blob(v.key), a = file.kind === "docx" ? await E.analyzeDocx(bytes, { types: p.types, custom: p.custom }, onP) : await E.analyze(bytes, { types: p.types, custom: p.custom }, onP);
    st.an[k] = a; try { await put("an", a, k); } catch (e) { /* ignore */ } return a;
  }
  async function runCheck(quiet) {
    var f = cur(); if (!f || !f.files.length) return;
    var p = prof(); st.busy = "Checking"; st.pct = 0; if (!quiet) render();
    var arr = [];
    for (var i = 0; i < f.files.length; i++) {
      var file = f.files[i];
      var a = await analysisFor(file, p, function (x) { st.pct = (i + x) / f.files.length; setPct(); });
      arr.push({ id: file.id, name: file.name, label: file.label, analysis: a, siblings: f.files.map(function (x) { return (x.desc || "") + " " + x.name; }) });
    }
    var r = E.check(arr, p), dis = f.dismissed || {};
    r.issues = r.issues.filter(function (x) { return !dis[isig(x)]; }).map(function (x, i) { x._o = i; return x; }).sort(function (a, b) { return (a.sev === "must" ? 0 : 1) - (b.sev === "must" ? 0 : 1) || a._o - b._o; });
    f.result = { issues: r.issues, passed: r.passed, must: r.issues.filter(function (x) { return x.sev === "must"; }).length, should: r.issues.filter(function (x) { return x.sev === "should"; }).length, at: Date.now(), pages: arr.reduce(function (s, x) { return s + (x.analysis.pages || []).length; }, 0), pack: p.packShort };
    await saveF(f); st.busy = ""; render(true);
  }
  function isig(x) { return x.file + "|" + x.code + "|" + (x.page || "") + "|" + (x.detail || "").slice(0, 40); }
  function setPct() { var b = document.querySelector(".prog i"); if (b) b.style.width = Math.round(st.pct * 100) + "%"; var t = document.getElementById("pctt"); if (t) t.textContent = Math.round(st.pct * 100) + "%"; }
  function score(r) { if (!r) return 0; var bad = r.must * 3 + r.should, good = r.passed.length * 2; return r.must + r.should === 0 ? 100 : Math.max(5, Math.min(97, Math.round(100 * good / (good + bad)))); }

  /* ---------- files ---------- */
  var picker = document.createElement("input"); picker.type = "file"; picker.accept = "application/pdf,.pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"; picker.multiple = true; picker.style.display = "none"; document.body.appendChild(picker);
  picker.addEventListener("change", function () { var fl = [].slice.call(picker.files || []); picker.value = ""; if (fl.length) addFiles(fl); });
  async function newFiling(name) { var f = { id: uid(), name: name || "New filing " + new Date().toLocaleDateString(), created: Date.now(), updated: Date.now(), files: [], outputs: [], log: [], dismissed: {} }; await saveF(f); st.filings.unshift(f); st.fid = f.id; return f; }
  function persist() { try { if (navigator.storage && navigator.storage.persist && !window.Capacitor) navigator.storage.persist(); } catch (e) { } }
  async function addFiles(list) {
    persist();
    var f = cur() || await newFiling(); st.busy = "Adding files"; render();
    for (var i = 0; i < list.length; i++) {
      var it = list[i], bytes = it.bytes || new Uint8Array(await it.arrayBuffer()), name = it.name || "Document.pdf";
      var kind = /\.docx$/i.test(name) || E.isDocx(bytes) ? "docx" : "pdf";
      if (kind === "pdf" && !/\.pdf$/i.test(name) && !(bytes[0] === 37 && bytes[1] === 80)) { toast(name + " is not a PDF or Word file"); continue; }
      if (kind === "docx" && /\.doc$/i.test(name)) { toast("Save " + name + " as .docx first"); continue; }
      var key = uid(); await put("blobs", bytes, key);
      var n = kind === "docx" ? (await E.analyzeDocx(bytes, {})).pages.length : await E.pageCount(bytes);
      var role = it.role || (!f.files.some(function (x) { return x.role === "main"; }) && /motion|petition|brief|complaint|answer|agreement|contract|application|response|reply/i.test(name) ? "main" : "exhibit");
      f.files.push({ id: uid(), kind: kind, name: name, label: it.label || name.replace(/\.(pdf|docx)$/i, ""), role: kind === "docx" ? "exhibit" : role, desc: it.desc || "", versions: [{ key: key, label: "Original", at: Date.now(), size: bytes.length, pages: n }] });
      log(f, "Added " + name);
    }
    if (/^New filing/.test(f.name) && f.files[0]) f.name = (f.files.filter(function (x) { return x.role === "main"; })[0] || f.files[0]).label.slice(0, 60);
    await saveF(f); st.tab = "check"; st.screen = null; await runCheck();
  }
  async function newVersion(f, file, bytes, label) {
    var key = uid(); await put("blobs", bytes, key);
    file.versions.push({ key: key, label: label, at: Date.now(), size: bytes.length, pages: file.kind === "docx" ? (await E.analyzeDocx(bytes, {})).pages.length : await E.pageCount(bytes) });
    log(f, (file.label || file.name) + ": " + label);
  }
  async function undo(file) {
    var f = cur(); if (file.versions.length < 2) return toast("Nothing to undo");
    var v = file.versions.pop(); log(f, (file.label || file.name) + ": undid " + v.label); await saveF(f); buzz(); toast("Undone: " + v.label); await runCheck(true);
  }

  /* ---------- fixes ---------- */
  var SAFE = { removeBlank: 1, rotate: 1, scrub: 1, redact: 1, resize: 1, cleanDocx: 1, redactDocx: 1 };
  async function doFix(x, opts) {
    var f = cur(), file = f.files.filter(function (y) { return y.id === x.file; })[0]; if (!file) return;
    var p = prof(), bytes = await blob(curV(file).key), out = null, label = "";
    try {
      if (x.fix === "removeBlank" || x.fix === "removePage") { out = await E.removePages(bytes, x.pages || [x.page]); label = "Removed page" + ((x.pages || []).length > 1 ? "s " : " ") + (x.pages || [x.page]).join(", "); }
      else if (x.fix === "rotate") { out = await E.rotatePages(bytes, x.pages || [x.page], 90); label = "Turned pages upright"; }
      else if (x.fix === "scrub") { out = await E.scrub(bytes); label = "Removed hidden data"; }
      else if (x.fix === "redact") { out = await E.redactPage(bytes, x.page, x.boxes, x.scale); label = "Redacted page " + x.page + " (" + x.title.toLowerCase() + ")"; }
      else if (x.fix === "resize") { out = await E.resize(bytes, x.pages || [x.page], p.pageSize); label = "Fit pages to " + (p.pageSize === "letterA4" ? "Letter" : p.pageSize); }
      else if (x.fix === "flattenAll") { st.busy = "Embedding fonts"; render(); out = await E.flattenAll(bytes); label = "Converted pages so all fonts are included"; }
      else if (x.fix === "split") { await splitFile(f, file, p.maxMB); return; }
      else if (x.fix === "cleanDocx") { out = await E.cleanDocx(bytes); label = "Accepted tracked changes, removed comments and author details"; }
      else if (x.fix === "redactDocx") { out = await E.redactDocx(bytes, x.raws || []); label = "Replaced " + x.title.toLowerCase() + " with X characters"; }
      else if (x.fix === "ocr") { await runOcr(f, file, x.pages || [x.page]); return; }
      else if (x.fix === "rename") return renameSheet(file);
      else return openIssue(x);
    } catch (e) { st.busy = ""; toast("Could not fix: " + (e.message || e)); render(); return; }
    await newVersion(f, file, out, label); await saveF(f);
    if (!opts || !opts.batch) { buzz("ok"); toast(label); st.screen = st.screen === "viewer" ? null : st.screen; await runCheck(true); }
  }
  async function splitFile(f, file, maxMB) {
    st.busy = "Splitting"; render();
    var parts = await E.split(await blob(curV(file).key), maxMB || 25), idx = f.files.indexOf(file), news = [];
    for (var i = 0; i < parts.length; i++) {
      var key = uid(); await put("blobs", parts[i], key);
      news.push({ id: uid(), name: file.name.replace(/\.pdf$/i, "") + " part " + (i + 1) + ".pdf", label: (file.label || file.name) + " (part " + (i + 1) + " of " + parts.length + ")", role: file.role, desc: file.desc, versions: [{ key: key, label: "Split from " + file.name, at: Date.now(), size: parts[i].length, pages: await E.pageCount(parts[i]) }] });
    }
    f.files.splice.apply(f.files, [idx, 1].concat(news)); log(f, "Split " + file.name + " into " + parts.length + " parts"); await saveF(f); buzz("ok"); toast("Split into " + parts.length + " parts"); await runCheck(true);
  }
  async function fixAll() {
    var f = cur(); if (!f || !f.result) return;
    var list = f.result.issues.filter(function (x) { return SAFE[x.fix] && !(/^redact/.test(x.fix) && x.sev !== "must"); });
    if (!list.length) return toast("Nothing to fix automatically. Review the rest.");
    st.busy = "Fixing " + list.length + " issue" + (list.length > 1 ? "s" : ""); render();
    // one redaction pass per page with all boxes on it
    var byPage = {}, other = [];
    list.forEach(function (x) { if (x.fix === "redact") { var k = x.file + "#" + x.page; if (!byPage[k]) byPage[k] = Object.assign({}, x, { boxes: [] }); byPage[k].boxes = byPage[k].boxes.concat(x.boxes || []); } else other.push(x); });
    var order = [];
    Object.keys(byPage).forEach(function (k) { order.push(byPage[k]); });
    var dred = {}; other.filter(function (x) { return x.fix === "redactDocx"; }).forEach(function (x) { if (!dred[x.file]) { dred[x.file] = Object.assign({}, x, { raws: [] }); order.push(dred[x.file]); } dred[x.file].raws = dred[x.file].raws.concat(x.raws || []); });
    other.filter(function (x) { return x.fix === "cleanDocx"; }).forEach(function (x) { order.push(x); });
    other.filter(function (x) { return x.fix === "scrub"; }).forEach(function (x) { order.push(x); });
    other.filter(function (x) { return x.fix === "rotate" || x.fix === "resize"; }).forEach(function (x) { order.push(x); });
    other.filter(function (x) { return x.fix === "removeBlank"; }).forEach(function (x) { order.push(x); });
    for (var i = 0; i < order.length; i++) await doFix(order[i], { batch: true });
    await saveF(f); buzz("ok"); toast("Fixed " + order.length + " item" + (order.length > 1 ? "s" : ""));
    await runCheck(true);
    if (f.result && !f.result.must && !f.result.should) { st.screen = "ready"; render(); celebrate(); }
  }
  async function dismiss(x) { var f = cur(); f.dismissed = f.dismissed || {}; f.dismissed[isig(x)] = 1; log(f, "Marked reviewed: " + x.title + " (" + (x.fileName || "") + ")"); await saveF(f); st.screen = st.screen === "viewer" ? null : st.screen; buzz(); await runCheck(true); }

  /* ---------- text recognition (OCR), on this device ---------- */
  var ocrWorker = null;
  function loadScript(src) { return new Promise(function (res, rej) { var sc = document.createElement("script"); sc.src = src; sc.onload = res; sc.onerror = rej; document.head.appendChild(sc); }); }
  async function getOcr() {
    if (ocrWorker) return ocrWorker;
    var local = false;
    try { local = (await fetch("ocr/tesseract.min.js", { method: "HEAD" })).ok; } catch (e) { local = false; }
    if (!window.Tesseract) await loadScript(local ? "ocr/tesseract.min.js" : "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js");
    var base = new URL(".", location.href).href;
    var opts = local ? { workerPath: base + "ocr/worker.min.js", corePath: base + "ocr/core/", langPath: base + "ocr/lang", gzip: true } : { langPath: "https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int", gzip: true }; /* web: engine and language file only from cdn.jsdelivr.net (allowed by the CSP) */
    ocrWorker = await window.Tesseract.createWorker("eng", 1, opts);
    return ocrWorker;
  }
  async function runOcr(f, file, pages) {
    st.busy = "Reading scanned pages"; st.pct = 0; render();
    try {
      var w = await getOcr();
      var out = await E.ocr(await blob(curV(file).key), pages, async function (canvas) {
        var r = await w.recognize(canvas); var ws = (r && r.data && r.data.words) || [];
        return ws.filter(function (x) { return x.confidence > 35; }).map(function (x) { return { text: x.text, x0: x.bbox.x0, y0: x.bbox.y0, x1: x.bbox.x1, y1: x.bbox.y1 }; });
      }, function (p) { st.pct = p; setPct(); });
      await newVersion(f, file, out, "Made page" + (pages.length > 1 ? "s " : " ") + pages.join(", ") + " searchable (text recognition)");
      await saveF(f); buzz("ok"); toast("Scanned pages are now searchable"); await runCheck(true);
    } catch (e) { st.busy = ""; render(); toast("Text recognition is not available right now. Connect once to download it, or use the Android app."); }
  }

  /* ---------- compare (redline) ---------- */
  async function textOf(file) { var a = await analysisFor(file, prof()); return a.kind === "docx" ? a.paras : a.pages.map(function (p) { return p.text; }); }
  async function runCompare(idA, idB) {
    var f = cur(), A = byId(idA), B = byId(idB); if (!A || !B || A === B) return toast("Pick two different files");
    st.busy = "Comparing"; render();
    var cmp = E.compare(await textOf(A), await textOf(B));
    st.cmp = { a: A.label || A.name, b: B.label || B.name, res: cmp }; st.busy = ""; st.screen = "compare"; render();
  }
  async function saveRedline() {
    var f = cur(), c = st.cmp; if (!c) return;
    var bytes = await E.redlinePdf(c.res, c.a, c.b, when(Date.now()));
    var o = await addOutput(f, bytes, "Redline - " + clean(c.a) + " vs " + clean(c.b) + ".pdf", "redline", null);
    buzz("ok"); share(bytes, o.name);
  }

  /* ---------- firm settings file ---------- */
  var SHARE_KEYS = ["area", "court", "state", "region", "custom", "over", "ex", "bates"];
  async function exportSettings() {
    var o = { fileready: "firm-settings", version: 1, savedBy: S.name || "", savedAt: new Date().toISOString() };
    SHARE_KEYS.forEach(function (k) { o[k] = S[k]; });
    var bytes = new TextEncoder().encode(JSON.stringify(o, null, 2));
    share(bytes, "FileReady firm settings" + (S.name ? " - " + S.name : "") + ".json", "application/json");
  }
  var setPicker = document.createElement("input"); setPicker.type = "file"; setPicker.accept = ".json,application/json"; setPicker.style.display = "none"; document.body.appendChild(setPicker);
  setPicker.addEventListener("change", async function () {
    var fl = setPicker.files && setPicker.files[0]; setPicker.value = ""; if (!fl) return;
    try {
      var o = JSON.parse(await fl.text()); if (o.fileready !== "firm-settings") throw new Error("not a FileReady settings file");
      SHARE_KEYS.forEach(function (k) { if (o[k] != null) S[k] = o[k]; });
      S.ex = Object.assign({}, DEF.ex, S.ex || {}); S.bates = Object.assign({}, DEF.bates, S.bates || {}); S.over = S.over || {}; S.custom = Array.isArray(S.custom) ? S.custom : [];
      saveS(); buzz("ok"); toast("Firm settings loaded" + (o.savedBy ? " from " + o.savedBy : "")); recheck();
    } catch (e) { toast("Could not read that file: " + e.message); }
  });

  /* ---------- output: share / save ---------- */
  function b64(u8) { var s = "", CH = 0x8000; for (var i = 0; i < u8.length; i += CH) s += String.fromCharCode.apply(null, u8.subarray(i, i + CH)); return btoa(s); }
  function plug(n) { return window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform() && window.Capacitor.Plugins && window.Capacitor.Plugins[n]; }
  function clean(n) { return String(n || "FileReady").replace(/[^A-Za-z0-9 ._()-]/g, "").replace(/\s+/g, " ").trim().slice(0, 80) || "FileReady"; }
  function mimeOf(name) { return /\.docx$/i.test(name) ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : /\.json$/i.test(name) ? "application/json" : "application/pdf"; }
  async function share(bytes, name, mime) {
    name = clean(name); if (!/\.(pdf|docx|json)$/i.test(name)) name += ".pdf"; mime = mime || mimeOf(name);
    var FS = plug("Filesystem"), SH = plug("Share");
    if (FS && SH) { try { var w = await FS.writeFile({ path: name, data: b64(bytes), directory: "CACHE" }); await SH.share({ title: name, files: [w.uri] }); return; } catch (e) { if (!/cancel/i.test(e.message || "")) toast("Share failed: " + (e.message || e)); return; } }
    try { var file = new File([bytes], name, { type: mime }); if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: name }); return; } } catch (e) { if (e && e.name === "AbortError") return; }
    download(bytes, name, mime);
  }
  var IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var STANDALONE = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
  async function saveFile(bytes, name) {
    name = clean(name); if (!/\.(pdf|docx|json)$/i.test(name)) name += ".pdf";
    var FS = plug("Filesystem");
    if (!FS && IOS) { toast("Choose Save to Files"); return share(bytes, name); } /* iPhone: the share sheet has Save to Files */
    if (FS) { try { await FS.writeFile({ path: "FileReady/" + name, data: b64(bytes), directory: "DOCUMENTS", recursive: true }); buzz("ok"); toast("Saved to Documents/FileReady"); return; } catch (e) { toast("Save failed: " + (e.message || e)); return; } }
    download(bytes, name, mimeOf(name));
  }
  function download(bytes, name, mime) { var u = URL.createObjectURL(new Blob([bytes], { type: mime || mimeOf(name) })), a = document.createElement("a"); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 4000); toast("Downloaded " + name); }
  async function addOutput(f, bytes, name, kind, pages) { var key = uid(); await put("blobs", bytes, key); f.outputs = f.outputs || []; f.outputs.unshift({ id: uid(), key: key, name: name, kind: kind, at: Date.now(), size: bytes.length, pages: pages }); log(f, "Created " + name); await saveF(f); return f.outputs[0]; }

  /* ---------- build ---------- */
  async function build() {
    var f = cur(), p = prof(); if (!f || !f.files.length) return;
    st.busy = "Building filing"; st.pct = 0; render();
    var files = [];
    for (var i = 0; i < f.files.length; i++) { var x = f.files[i]; if (x.kind === "docx") continue; files.push({ name: x.name, label: x.label, role: x.role, desc: x.desc || x.label, bytes: await blob(curV(x).key) }); }
    if (!files.length) { st.busy = ""; render(); return toast("Add PDFs to build. Save Word files as PDF first."); }
    var b = S.bates, ex = S.ex, steps = files.length + 4, n = 0;
    try {
      var r = await E.build(files, { style: ex.binder ? "1" : ex.style, word: ex.binder ? "Tab" : (ex.word || "Exhibit"), covers: ex.covers, stamp: ex.stamp && !ex.binder, index: ex.index, bookmarks: ex.bookmarks, scrub: ex.scrub, binder: ex.binder, checklist: ex.binder && ex.checklist ? clRows(f) : null,
        bates: { on: b.on, prefix: b.prefix || initials(f.name), start: +b.start || 1, digits: +b.digits || 6, pos: b.pos }, title: ex.binder ? "Closing set - " + f.name : f.name },
        function (m) { st.busy = m; n++; st.pct = Math.min(.95, n / steps); var t = document.getElementById("busyt"); if (t) t.textContent = m; setPct(); });
      var base = clean(f.name) + (ex.binder ? " - closing set" : " - filing");
      if (ex.split && p.maxMB && r.bytes.length > p.maxMB * 1048576) {
        st.busy = "Splitting to " + p.maxMB + " MB"; var parts = await E.split(r.bytes, p.maxMB);
        for (var k = parts.length - 1; k >= 0; k--) await addOutput(f, parts[k], base + " part " + (k + 1) + " of " + parts.length + ".pdf", "filing", null);
      } else await addOutput(f, r.bytes, base + ".pdf", ex.binder ? "binder" : "filing", r.pages);
      st.last = { pages: r.pages, bates: b.on ? (b.prefix || initials(f.name)) + pad(+b.start || 1, b.digits) + " - " + (b.prefix || initials(f.name)) + pad(r.batesEnd, b.digits) : "", exhibits: r.exhibits.length, size: r.bytes.length };
      st.busy = ""; st.screen = "built"; buzz("ok"); render(); celebrate();
    } catch (e) { st.busy = ""; render(); toast("Build failed: " + (e.message || e)); }
  }
  function pad(n, d) { var s = String(n); while (s.length < d) s = "0" + s; return s; }
  function initials(n) { var w = String(n || "").replace(/\bv\.?\b|\bvs\.?\b|\band\b|\bthe\b/gi, " ").match(/[A-Za-z]+/g) || ["FR"]; return (w.length > 1 ? w[0][0] + w[1][0] : w[0].slice(0, 2)).toUpperCase(); }
  async function report() {
    var f = cur(), p = prof(); if (!f || !f.result) return toast("Run a check first");
    st.busy = "Writing report"; render();
    var bytes = await E.report({ title: f.name, when: when(Date.now()), by: S.name, pack: p.packName, area: p.areaName + (p.region.law ? " · " + p.regionName : ""), files: f.files.map(function (x) { return x.label || x.name; }), must: f.result.must, should: f.result.should, passed: f.result.passed, issues: f.result.issues, log: f.log || [], verified: p.verified });
    var o = await addOutput(f, bytes, clean(f.name) + " - check report.pdf", "report", null);
    st.busy = ""; st.tab = "exhibits"; st.screen = null; render(); buzz("ok"); share(bytes, o.name);
  }
  async function packets() {
    var f = cur(); if (!f) return; st.busy = "Finding signature pages"; render();
    var p = prof(), arr = [];
    var vk = {};
    for (var i = 0; i < f.files.length; i++) { var x = f.files[i]; if (x.kind === "docx") continue; vk[x.id] = curV(x).key; arr.push({ id: x.id, name: x.name, label: x.label, bytes: await blob(curV(x).key), analysis: await analysisFor(x, p) }); }
    var res = await E.sigPackets(arr), sg = [];
    for (var k = res.length - 1; k >= 0; k--) { var o = await addOutput(f, res[k].bytes, "Signature packet - " + res[k].signer + ".pdf", "packet", res[k].pages + 1); sg.unshift({ name: res[k].signer, items: res[k].items, out: o.id, signed: null }); }
    f.sig = { at: Date.now(), vk: vk, signers: sg };
    syncChecklist(f); f.checklist.forEach(function (c) { var t = sigCount(f, c.fileId); if (t.total && c.status === "To do") c.status = "Waiting"; });
    await saveF(f); st.busy = ""; st.screen = "packets"; buzz("ok"); render();
  }

  /* ---------- signed pages back into documents ---------- */
  var sigPicker = document.createElement("input"); sigPicker.type = "file"; sigPicker.accept = "application/pdf,.pdf"; sigPicker.style.display = "none"; document.body.appendChild(sigPicker);
  sigPicker.addEventListener("change", async function () {
    var fl = sigPicker.files && sigPicker.files[0]; sigPicker.value = ""; var f = cur(); if (!fl || !f || !f.sig) return;
    var sgn = f.sig.signers[st.sigFor]; if (!sgn) return;
    st.busy = "Matching signed pages"; render();
    try {
      var bytes = new Uint8Array(await fl.arrayBuffer()), key = uid(); await put("blobs", bytes, key);
      var m = await E.matchSigned(bytes, sgn.items);
      sgn.signed = { key: key, name: fl.name, pages: m.pages, map: m.map, at: Date.now() };
      log(f, "Signed pages received from " + sgn.name); await saveF(f);
      var got = m.map.filter(Boolean).length; st.busy = ""; render(); buzz("ok");
      toast(got + " of " + sgn.items.length + " pages matched" + (m.byFooter ? " by page footer" : " by page order") + ". Check below.");
    } catch (e) { st.busy = ""; render(); toast("Could not read that PDF: " + (e.message || e)); }
  });
  function sigCount(f, fileId) {
    var t = { total: 0, got: 0 }; if (!f.sig || !fileId) return t;
    f.sig.signers.forEach(function (sg) { sg.items.forEach(function (it, k) { if (it.fileId !== fileId) return; t.total++; if (sg.signed && sg.signed.map[k]) t.got++; }); });
    return t;
  }
  async function assemble() {
    var f = cur(); if (!f || !f.sig) return;
    var by = {}, n = 0;
    f.sig.signers.forEach(function (sg) { if (!sg.signed) return; sg.items.forEach(function (it, k) { var pgn = sg.signed.map[k]; if (!pgn) return; (by[it.fileId] = by[it.fileId] || []).push({ page: it.page, key: sg.signed.key, srcPage: pgn }); n++; }); });
    var ids = Object.keys(by); if (!ids.length) return toast("Add a signed packet first");
    st.busy = "Putting signed pages into documents"; render();
    var cache = {}, done = 0, warn = 0;
    try {
      for (var i = 0; i < ids.length; i++) {
        var file = byId(ids[i]); if (!file) continue;
        if (f.sig.vk[file.id] && f.sig.vk[file.id] !== curV(file).key) warn++;
        var reps = by[ids[i]];
        for (var j = 0; j < reps.length; j++) reps[j].bytes = cache[reps[j].key] || (cache[reps[j].key] = await blob(reps[j].key));
        var out = await E.insertSigned(await blob(curV(file).key), reps), sc = sigCount(f, file.id);
        await newVersion(f, file, out, "Signed pages added (" + sc.got + " of " + sc.total + ")");
        f.sig.vk[file.id] = curV(file).key;
        await addOutput(f, out, (file.label || file.name).replace(/\.pdf$/i, "") + (sc.got === sc.total ? " - executed" : " - partly signed") + ".pdf", "executed", curV(file).pages);
        var c = (f.checklist || []).filter(function (x) { return x.fileId === file.id; })[0]; if (c && sc.got === sc.total) c.status = "Done";
        done++;
      }
      await saveF(f); st.busy = ""; render(); buzz("ok"); celebrateSoft();
      toast(done + " document" + (done === 1 ? "" : "s") + " updated with " + n + " signed page" + (n === 1 ? "" : "s") + (warn ? ". Some files changed after packets were made: check page order." : ""));
    } catch (e) { st.busy = ""; render(); toast("Could not update: " + (e.message || e)); }
  }
  function celebrateSoft() { var m = document.querySelector("main"); if (!m) return; m.classList.remove("flash"); void m.offsetWidth; m.classList.add("flash"); }

  /* ---------- closing checklist ---------- */
  function syncChecklist(f) {
    f.checklist = f.checklist || [];
    var ids = f.files.map(function (x) { return x.id; });
    f.checklist = f.checklist.filter(function (c) { return !c.fileId || ids.indexOf(c.fileId) >= 0; });
    f.files.forEach(function (x) { if (!f.checklist.some(function (c) { return c.fileId === x.id; })) f.checklist.push({ id: uid(), fileId: x.id, title: x.label || x.name, who: "", status: "To do" }); });
    var fileItems = f.files.map(function (x) { return f.checklist.filter(function (c) { return c.fileId === x.id; })[0]; }), custom = f.checklist.filter(function (c) { return !c.fileId; });
    f.checklist = fileItems.concat(custom);
  }
  function clTab(f, c) {
    if (!c.fileId) return "";
    var x = byId(c.fileId); if (!x || x.kind === "docx") return "";
    if (x.role === "main") return "Lead";
    var ex = f.files.filter(function (y) { return y.role !== "main" && y.kind !== "docx"; });
    return E.label("1", ex.indexOf(x));
  }
  function clRows(f) {
    syncChecklist(f);
    return f.checklist.map(function (c) { var sc = sigCount(f, c.fileId), x = c.fileId ? byId(c.fileId) : null; return { tab: clTab(f, c), title: x ? (x.label || x.name) : c.title, who: c.who, status: c.status, sig: sc.total ? sc.got + " of " + sc.total : "" }; });
  }
  async function checklistShare() {
    var f = cur(); if (!f) return;
    var bytes = await E.checklistPdf(clRows(f), "Closing checklist - " + f.name);
    var o = await addOutput(f, bytes, clean(f.name) + " - closing checklist.pdf", "report", null);
    share(bytes, o.name);
  }

  /* ---------- research: patents, cases, filing review ---------- */
  var X = window.FRX;
  function rkey(k) { var own = (S.keys || {})[k]; if (own) return { key: own, own: true }; var b = (window.FR_KEYS || {})[k]; return b ? { key: b, own: false } : null; }
  async function fileText(fileId) { var f = cur(), x = f && byId(fileId); if (!x) return ""; var a = await analysisFor(x, prof()); return (a.pages || []).map(function (pg) { return pg.text || ""; }).join("\n\n"); }
  function filePicker(id, sel) { var f = cur(); if (!f || !f.files.length) return '<p class="mut sm">Add the document to a filing first, or paste the text below.</p>'; return '<label class="f">Use a file from “' + h(f.name) + '”</label><select class="inp" id="' + id + '"><option value="">Paste text instead</option>' + f.files.map(function (x) { return '<option value="' + x.id + '"' + (x.id === sel ? " selected" : "") + ">" + h((x.kind === "docx" ? "[Word] " : "") + (x.label || x.name)) + "</option>"; }).join("") + "</select>"; }
  function pct(p) { var b = X.band(p), col = b === "high" ? "var(--o2)" : b === "medium" ? "var(--y2)" : "var(--g1)"; return '<div class="ovl"><div class="ovb"><i style="width:' + p + "%;background:" + col + '"></i></div><b style="color:' + col + '">' + p + "%</b></div>"; }
  function sentNote(where) { return '<div class="note glass sm">' + ic("lock", 14) + " Your document stays on this phone. Only the search words below are sent to " + where + ", and only when you tap Search.</div>"; }
  function keyNote(k, name) { var r = rkey(k); return r ? '<p class="xs mut" style="margin:6px 2px 0">Using ' + (r.own ? "your own " : "the built-in ") + name + " key.</p>" : '<p class="xs mut" style="margin:6px 2px 0">No ' + name + ' key yet. Add one in Settings → Online research.</p>'; }
  function researchCard() { return '<button class="rxc glass mt" data-a="research"><span class="ic gP">' + ic("book", 22, "#0b0d12") + '</span><span class="tx"><b>Research<span class="beta">BETA</span></b><small>Review a filing and find similar cases</small></span>' + ic("chev", 18) + "</button>"; }

  /* Example prompts (fictional), so people can see how the research tools work. */
  var RX_EX = {
    rxcase: [
      ["Non-compete", "Former employee in Austin joined a competitor. The employer sues for breach of a non-compete agreement and trade secret misappropriation. We think the non-compete is unreasonable in time and area."],
      ["Slip and fall", "Tenant slipped on an icy outdoor stairway at an apartment complex in Dallas. The landlord knew about the broken gutter for weeks and did nothing. Premises liability claim."],
      ["Contract notice", "Software customer says the vendor terminated the license without the 30-day written notice the contract requires. Breach of contract and lost profits."],
      ["Car search", "Police searched a car without a warrant after a traffic stop for a broken taillight and found evidence. Motion to suppress under the Fourth Amendment."]
    ],
    rxrev: [
      ["Their motion (no signature)", "IN THE DISTRICT COURT OF TRAVIS COUNTY, TEXAS\nCause No. D-1-GN-26-000000\nACME ROOFING LLC, Plaintiff, v. BLUE OAK HOMES INC., Defendant.\n\nPLAINTIFF'S MOTION TO COMPEL\n\nPlaintiff asks the Court to compel Defendant to produce the documents listed in Exhibit A within ten days. Defendant has not responded to Plaintiff's requests for production served on March 3, 2026.\n\nWHEREFORE, Plaintiff requests that the Court grant this motion."],
      ["Their petition (no Rule 47)", "IN THE DISTRICT COURT OF HARRIS COUNTY, TEXAS\nCause No. 2026-00000\nJORDAN LEE, Plaintiff, v. RIVERSIDE STORAGE LLC, Defendant.\n\nPLAINTIFF'S ORIGINAL PETITION\n\nPlaintiff sues Defendant for breach of contract. Defendant agreed to store Plaintiff's furniture and lost it. Plaintiff seeks damages, costs and fees.\n\nWHEREFORE, Plaintiff prays for judgment against Defendant.\n\nRespectfully submitted,\n/s/ Sam Rivera, Attorney for Plaintiff"],
      ["Our declaration (not sworn)", "IN THE UNITED STATES DISTRICT COURT FOR THE WESTERN DISTRICT OF TEXAS\nCivil Action No. 1:26-cv-00000\n\nDECLARATION OF ALEX MORGAN\n\nI, Alex Morgan, state as follows: I am the operations manager of the plaintiff company. On May 1, 2026, I received the shipment described in Exhibit C. The goods were damaged.\n\nSigned on May 20, 2026.\n/s/ Alex Morgan"]
    ]
  };
  /* ---------- license codes (firms pay directly; the code unlocks the firm name and seats) ---------- */
  function b64u(x) { x = String(x).replace(/-/g, "+").replace(/_/g, "/"); while (x.length % 4) x += "="; var b = atob(x), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  async function verifyLicense(code) {
    var pub = window.FR_LICENSE_PUB; if (!pub) throw new Error("License checking is not set up in this build yet");
    var m = /^FR1\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/.exec(String(code || "").trim()); if (!m) throw new Error("That is not a FileReady license code");
    var key = await crypto.subtle.importKey("spki", b64u(pub), { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
    var body = b64u(m[1]), ok = await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, key, b64u(m[2]), body);
    if (!ok) throw new Error("This code is not valid");
    var p = JSON.parse(new TextDecoder().decode(body));
    return { firm: p.f, seats: p.s, issued: p.i, until: p.e, id: p.id, expired: new Date(p.e + "T23:59:59") < new Date() };
  }
  st.lic = null;
  (async function () { if (S.license) { try { st.lic = await verifyLicense(S.license); } catch (e) { st.lic = { bad: true }; } if (S.onboarded && st.tab === "settings") render(); } })();
  function licRow() {
    function li(act, t, sub) { return '<button class="li" data-a="' + act + '"><span class="tx"><b>' + h(t) + "</b><small>" + h(sub) + "</small></span>" + ic("chev", 18) + "</button>"; }
    var L = st.lic;
    var t = L && !L.bad ? (L.expired ? "License expired" : "Licensed to " + L.firm) : "Free pilot";
    var sub = L && !L.bad ? L.seats + " " + (L.seats === 1 ? "person" : "people") + " · " + (L.expired ? "ended " : "until ") + L.until : L && L.bad ? "The saved code could not be checked · tap to enter a new one" : "Have a license code? Tap to enter it";
    return '<div class="sec"><b>License</b></div><div class="glass list">' + li("slic", t, sub) + (S.license ? li("slicoff", "Remove license code", "Goes back to the free pilot") : "") + "</div>";
  }
  function exBlock(kind) {
    var L = RX_EX[kind]; if (!L) return "";
    if (S.hideEx) return '<button class="lnk sm" data-a="rxexshow" style="display:block;margin:8px 0 0">Show example prompts</button>';
    return '<div class="exs"><span class="xs mut">Try an example (fictional):</span><div class="chips" style="flex-wrap:wrap;margin-top:6px">' + L.map(function (x, i) { return '<button class="chip" data-a="rxex" data-v="' + i + '">' + h(x[0]) + "</button>"; }).join("") + '</div><button class="lnk sm" data-a="rxexhide" style="margin-top:4px">Hide examples</button></div>';
  }
  function viewResearch() {
    function card(a, icn, col, t, s, tag) { return '<button class="rxc glass" data-a="' + a + '"><span class="ic ' + col + '">' + ic(icn, 24, "#0b0d12") + '</span><span class="tx"><b>' + t + (tag ? '<span class="beta">' + tag + "</span>" : "") + "</b><small>" + s + "</small></span>" + ic("chev", 18) + "</button>"; }
    return header("Research", "Patents, case law and filing review", "", true) + '<main class="enter">' +
      card("rxrev", "eye", "gO", "Review a filing", "Find mistakes in the other side's filing, or in yours before you file, with options and rule citations.", "BETA") +
      card("rxcase", "book", "gG", "Find similar cases", "Describe your case or use a document; get court opinions with similar issues.", "BETA") +
      (S.labs ? card("rxpat", "spark", "gP", "Patent check before filing", "Compare your draft with published U.S. patents and applications, with an overlap score for each.", "LABS") : "") +
      '<p class="xs mut" style="margin:4px 4px 0">Beta tools are new: check every result.' + (S.labs ? " Labs tools are turned on in Settings." : "") + "</p>" +
      '<p class="disc">Research tools give information, not legal advice. Overlap scores compare wording only and are not a legal opinion on patentability or infringement. Confirm every case and rule before relying on it.</p></main>';
  }
  function viewPatent() {
    var r = st.rx || {}, P = r.pat;
    var top = '<div class="glass list mt" style="padding:12px 16px">' + filePicker("rxf", r.file) + '<label class="f">Or paste the description and claims</label><textarea class="inp" id="rxt" rows="5" placeholder="Title, abstract and claims of your invention">' + h(r.text || "") + '</textarea><button class="btn mt" data-a="rxpread">' + ic("search", 19, "#04140b", 2.4) + "Read my invention</button></div>";
    if (!P) return header("Patent check", "Before you file", "", true) + '<main class="enter">' + top + '<p class="disc">Searches published U.S. patents and applications (USPTO Open Data Portal). Information only, not legal advice.</p></main>';
    var kw = P.keys.map(function (k, i) { return '<button class="chip on" data-a="rxkw" data-v="' + i + '">' + h(k) + " ×</button>"; }).join("");
    var res = (r.results || []).map(function (x, i) { return '<div class="rxr glass"><div style="display:flex;gap:10px;align-items:flex-start"><div style="flex:1;min-width:0"><b>' + h(x.title) + '</b><small class="mut">' + h([x.number, x.who, x.granted ? "granted " + x.granted : x.filed ? "filed " + x.filed : "", x.status].filter(Boolean).join(" · ")) + "</small></div></div>" + pct(x.score) + '<button class="lnk sm" data-a="rxpread1" data-v="' + i + '">Read the claims and compare ' + ic("chev", 13) + "</button>" + "</div>"; }).join("");
    var hi = (r.results || [])[0], g = hi ? X.band(hi.score) : null;
    var verdict = hi ? '<div class="hero glass" style="padding:16px"><span class="pill">' + ic("info", 14) + " Closest match " + hi.score + '%</span><h2 style="font-size:1.15rem">' + (g === "high" ? "A close reference exists. Review it before filing." : g === "medium" ? "Some overlap. Make sure your claims cover what is new." : "No close wording found in these results.") + '</h2><p class="mut sm" style="margin:4px 0 0">' + (g === "low" ? "A low score is not a clearance: wording can differ while the idea is the same. A professional search is still recommended." : "Compare its claims with yours element by element, and consider narrowing your claims to the features that are new.") + "</p></div>" : "";
    var guide = '<div class="sec"><b>Timing and options</b></div><div class="glass list">' + X.PATENT_GUIDE.map(function (gd) { return '<div class="li"><span class="tx"><b>' + h(gd[0]) + "</b><small>" + h(gd[1]) + "</small></span></div>"; }).join("") + "</div>";
    return header("Patent check", P.title || "Your invention", "", true) + '<main class="enter">' +
      '<div class="glass list" style="padding:12px 16px"><b>' + (P.claims ? P.claims + " claims found (" + P.indep + " independent)" : "No numbered claims found; using the whole text") + '</b><label class="f">Search words (tap to remove)</label><div class="chips" style="flex-wrap:wrap">' + kw + '</div><input class="inp mt" id="rxadd" placeholder="Add a word and tap Search"></div>' +
      sentNote("the USPTO") + '<button class="btn mt" data-a="rxpsearch">' + ic("search", 19, "#04140b", 2.4) + 'Search USPTO</button>' + keyNote("uspto", "USPTO") +
      (r.err ? '<div class="note glass mt">' + h(r.err) + "</div>" : "") + verdict + (res ? '<div class="sec"><b>Closest results</b><span class="xs mut">' + r.results.length + " found</span></div>" + res : "") + guide +
      '<button class="btn2 glass mt" data-a="rxreset">Check another invention</button><p class="disc">Overlap compares the words of your draft with the title and any summary the USPTO returns, not the full claims. It is not a legal opinion on novelty, obviousness or infringement. Talk to a registered patent attorney or agent before filing.</p></main>';
  }
  function viewCases() {
    var r = st.rx || {}, C = r.cs;
    var courts = X.COURTS.map(function (c) { return '<option value="' + c[0] + '"' + (c[0] === (r.court || "") ? " selected" : "") + ">" + c[1] + "</option>"; }).join("");
    var top = '<div class="glass list mt" style="padding:12px 16px">' + filePicker("rxf", r.file) + '<label class="f">Or describe your case</label>' + exBlock("rxcase") + '<textarea class="inp mt" id="rxt" rows="5" placeholder="What happened, what you are claiming or defending, and where">' + h(r.text || "") + '</textarea><button class="lnk sm" data-a="rxclear">Clear text</button><label class="f">Courts</label><select class="inp" id="rxc">' + courts + '</select><button class="btn mt" data-a="rxcread">' + ic("search", 19, "#04140b", 2.4) + "Find the issues</button></div>";
    if (!C) return header("Similar cases", "Find precedent", "", true) + '<main class="enter">' + top + '<p class="disc">Searches court opinions on CourtListener (Free Law Project). Information only, not legal advice.</p></main>';
    var res = (r.results || []).map(function (x, i) { return '<div class="rxr glass"><b>' + h(x.name) + '</b><small class="mut">' + h([x.cite, x.court, x.date, x.cited ? "cited " + x.cited + " times" : ""].filter(Boolean).join(" · ")) + "</small>" + pct(x.score) + (x.snippet ? '<p class="sm mut" style="margin:6px 0">' + h(x.snippet) + "…</p>" : "") + (x.opinionId ? '<button class="lnk sm" data-a="rxcread1" data-v="' + i + '">Read the opinion ' + ic("chev", 13) + "</button>" : "") + "</div>"; }).join("");
    return header("Similar cases", C.issues.length ? C.issues.join(", ") : "Your case", "", true) + '<main class="enter">' +
      '<div class="glass list" style="padding:12px 16px"><b>' + (C.issues.length ? "Issues found: " + h(C.issues.join(", ")) : "No standard issue names found; using key words") + '</b><label class="f">Search</label><input class="inp" id="rxq" value="' + h(C.q) + '"><p class="xs mut" style="margin:6px 2px 0">Use quotes for exact phrases, AND / OR to combine.</p></div>' +
      sentNote("CourtListener") + '<button class="btn mt" data-a="rxcsearch">' + ic("search", 19, "#04140b", 2.4) + 'Search cases</button>' + keyNote("courtlistener", "CourtListener") +
      (r.err ? '<div class="note glass mt">' + h(r.err) + "</div>" : "") + (res ? '<div class="sec"><b>Most similar</b><span class="xs mut">' + r.results.length + " found</span></div>" + res : "") +
      '<button class="btn2 glass mt" data-a="rxreset">Search another case</button><p class="disc">Match scores compare wording with the case name and excerpt. Read each opinion, check that it is still good law and that it is binding or persuasive in your court before citing it. Not legal advice.</p></main>';
  }
  function viewReview() {
    var r = st.rx || {}, R = r.rev, f = cur();
    var top = '<div class="glass list mt" style="padding:12px 16px">' + filePicker("rxf", r.file) + '<label class="f">Or paste the filing text</label>' + exBlock("rxrev") + '<textarea class="inp mt" id="rxt" rows="4" placeholder="Paste the motion, petition or answer">' + h(r.text || "") + '</textarea><button class="lnk sm" data-a="rxclear">Clear text</button><label class="f">Whose filing is it?</label><div class="seg glass"><button class="' + (r.side !== "ours" ? "on" : "") + '" data-a="rxside" data-v="theirs">The other side</button><button class="' + (r.side === "ours" ? "on" : "") + '" data-a="rxside" data-v="ours">Ours, before filing</button></div><button class="btn mt" data-a="rxrev">' + ic("eye", 19, "#04140b", 2.4) + "Review it</button></div>";
    if (!R) return header("Review a filing", "Find mistakes", "", true) + '<main class="enter">' + top + '<p class="disc">Runs on this phone. Uses ' + h(prof().packName) + " rules. Information only, not legal advice.</p></main>";
    var rows = R.findings.map(function (x, i) { return '<div class="rxr glass ' + x.sev + '"><b>' + h(x.title) + '<span class="tag">' + (x.sev === "must" ? "IMPORTANT" : "REVIEW") + '</span></b><small class="mut">' + h(x.why) + '</small><div class="n2">Options to consider</div><ul class="opt">' + x.options.map(function (o) { return "<li>" + h(o) + "</li>"; }).join("") + "</ul>" + (x.cite ? '<span class="cite">' + ic("book", 13) + h(x.cite) + "</span>" : "") + (x.q ? '<button class="lnk sm" data-a="rxfind" data-v="' + i + '" style="display:block;margin-top:6px">Find cases on this ' + ic("chev", 13) + "</button>" : "") + "</div>"; }).join("");
    return header("Review a filing", (r.side === "ours" ? "Our " : "Their ") + R.kind, "", true) + '<main class="enter">' +
      '<div class="hero glass" style="padding:16px"><span class="pill">' + ic("shield", 14) + " " + h(prof().packShort) + '</span><h2 style="font-size:1.2rem">' + (R.findings.length ? R.findings.length + " thing" + (R.findings.length > 1 ? "s" : "") + " to look at" : "No common mistakes found") + '</h2><p class="mut sm" style="margin:4px 0 0">' + (r.side === "ours" ? "Fix these before the other side finds them." : "Possible issues in the other side's filing, with options to discuss with your attorney.") + "</p></div>" +
      rows + '<button class="btn2 glass mt" data-a="rxreset">Review another filing</button><p class="disc">These are common, checkable mistakes, not a full legal review. Deadlines, waiver and strategy depend on your case and court. The options listed are things to consider with a licensed attorney, not advice to file anything.</p></main>';
  }
  function viewReader() {
    var d = (st.rx || {}).doc || {}, paras = String(d.text || "").split(/\n{2,}/).filter(function (p) { return p.trim(); }).slice(0, 600);
    return header(d.kind === "case" ? "Opinion" : "Claims", d.title || "", "", true) + '<main class="enter">' +
      '<div class="hero glass" style="padding:16px"><span class="pill">' + ic(d.kind === "case" ? "book" : "spark", 14) + " " + h(d.meta || "") + "</span>" + (d.score != null ? '<h2 style="font-size:1.1rem">Wording overlap with ' + (d.kind === "case" ? "your case" : "your claims") + "</h2>" + pct(d.score) : "") + (d.note ? '<p class="mut sm" style="margin:6px 0 0">' + h(d.note) + "</p>" : "") + "</div>" +
      (d.kind === "case" ? '<div class="row2 mt"><button class="btn2 glass" data-a="rxcopy">' + ic("file", 18) + 'Copy citation</button><button class="btn2 glass" data-a="rxfindin">' + ic("search", 18) + "Find in text</button></div>" : '<button class="btn2 glass mt" data-a="rxfindin">' + ic("search", 18) + "Find in text</button>") +
      '<article class="reader glass mt">' + (paras.length ? paras.map(function (p) { return "<p>" + hl(h(p.trim())) + "</p>"; }).join("") : '<p class="mut">No text available for this record.</p>') + "</article>" +
      '<p class="disc">' + (d.kind === "case" ? "Text from CourtListener (Free Law Project). Check that the case is still good law and applies in your court before citing it." : "Claims text from the USPTO file record, read on this phone. Compare claims element by element with a registered patent attorney or agent.") + " Not legal advice.</p></main>";
  }
  function hl(t) { var w = (st.rx && st.rx.doc && st.rx.doc.find) || ""; if (!w || w.length < 3) return t; var esc = h(w).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); return t.replace(new RegExp("(" + esc + ")", "gi"), "<mark>$1</mark>"); }
  async function rxOpenCase(i) {
    var r = st.rx, x = r.results[i], k = rkey("courtlistener"); if (!k) return toast("Add a CourtListener key in Settings");
    st.busy = "Loading the opinion"; render();
    try { var o = await X.opinion(x.opinionId, k.key); r.doc = { kind: "case", title: x.name, meta: [x.cite, x.court, x.date].filter(Boolean).join(" · "), cite: x.name + (x.cite ? ", " + x.cite : "") + (x.date ? " (" + x.date.slice(0, 4) + ")" : ""), text: o.text, score: X.overlap(r.cs.focus, o.text.slice(0, 20000), r.cs.keys.concat(r.cs.issues)), note: o.author ? "Opinion by " + o.author : "" }; r.from = "rxcase"; st.screen = "rxread"; }
    catch (e) { r.err = "Could not load the opinion: " + (e.message || e); }
    st.busy = ""; render(true);
  }
  async function rxOpenPatent(i) {
    var r = st.rx, x = r.results[i], k = rkey("uspto"); if (!k) return toast("Add a USPTO key in Settings");
    st.busy = "Getting the claims"; render();
    try {
      var c = await X.patentClaims(x.app, k.key), a = await E.analyze(c.bytes, { types: [] }), text = (a.pages || []).map(function (p) { return p.text; }).join("\n\n");
      if (text.replace(/\s/g, "").length < 120) {
        st.busy = "Reading the scanned claims"; render();
        var w = await getOcr(), n = Math.min((a.pages || []).length, 8), pg = []; for (var q = 1; q <= n; q++) pg.push(q);
        var o2 = await E.ocr(c.bytes, pg, async function (canvas) { var rr = await w.recognize(canvas); var ws = (rr && rr.data && rr.data.words) || []; return ws.filter(function (z) { return z.confidence > 35; }).map(function (z) { return { text: z.text, x0: z.bbox.x0, y0: z.bbox.y0, x1: z.bbox.x1, y1: z.bbox.y1 }; }); });
        var a2 = await E.analyze(o2, { types: [] }); text = (a2.pages || []).map(function (p) { return p.text; }).join("\n\n");
      }
      r.doc = { kind: "patent", title: x.title, meta: [x.number, x.who, c.date ? "claims dated " + String(c.date).slice(0, 10) : ""].filter(Boolean).join(" · "), text: text.replace(/(\s)(\d{1,3}\s*\.\s+(?:A|An|The)\b)/g, "\n\n$2"), score: X.overlap(r.pat.focus, text, r.pat.keys), note: "Compares the wording of your claims with these claims." };
      r.from = "rxpat"; st.screen = "rxread";
    } catch (e) { r.err = "Could not get the claims: " + (e.message || e) + ". The USPTO may not have a claims document for this record."; }
    st.busy = ""; render(true);
  }
  async function rxRead(kind) {
    var sel = document.getElementById("rxf"), ta = document.getElementById("rxt"), cs = document.getElementById("rxc");
    var r = st.rx = st.rx || {}; r.file = sel ? sel.value : ""; r.text = ta ? ta.value : ""; r.err = ""; r.results = null; if (cs) r.court = cs.value;
    var text = r.file ? await fileText(r.file) : r.text;
    if (!text || text.trim().length < 40) return toast(r.file ? "No readable text in that file. Run text recognition first." : "Add a file or paste more text");
    if (kind === "pat") { var P = X.readPatent(text); r.pat = { title: P.title, claims: P.claims.length, indep: P.independent.length, keys: P.keywords.slice(0, 8), focus: P.focus }; }
    else if (kind === "case") { var c = X.readCase(text); r.cs = { issues: c.issues, keys: c.keywords, q: X.caseQuery(c.issues, c.keywords), focus: text.slice(0, 8000) }; }
    else { var f = cur(), iss = []; if (r.file && f && f.result) iss = f.result.issues.filter(function (x) { return x.file === r.file; }); r.rev = X.review(text, r.side || "theirs", iss, { court: S.court, state: S.state }); }
    buzz(); render(true);
  }
  async function rxPatSearch() {
    var r = st.rx, P = r.pat, add = document.getElementById("rxadd"); if (add && add.value.trim()) { P.keys.push(add.value.trim().toLowerCase()); add.value = ""; }
    var k = rkey("uspto"); if (!k) { r.err = "No USPTO key yet. Add one in Settings → Online research."; return render(); }
    if (!P.keys.length) return toast("Add at least one search word");
    st.busy = "Searching USPTO"; render();
    try { var list = await X.patents(P.keys, k.key); list.forEach(function (x) { x.score = X.overlap(P.focus, x.title + " " + (x.abstract || ""), P.keys); }); list.sort(function (a, b) { return b.score - a.score; }); r.results = list.slice(0, 25); r.err = list.length ? "" : "No results. Try fewer or broader words."; }
    catch (e) { r.err = "Search failed: " + (e.message || e); }
    st.busy = ""; render(true);
  }
  async function rxCaseSearch() {
    var r = st.rx, C = r.cs, q = document.getElementById("rxq"); if (q) C.q = q.value.trim();
    var k = rkey("courtlistener"); if (!k) { r.err = "No CourtListener key yet. Add one in Settings → Online research."; return render(); }
    st.busy = "Searching court opinions"; render();
    try {
      var list = await X.cases(C.q, r.court || "", k.key);
      if (!list.length && C.keys.length) list = await X.cases(C.keys.slice(0, 6).join(" OR "), r.court || "", k.key);
      var qw = Object.keys(X.terms(C.keys.concat(C.issues).join(" "))); list.forEach(function (x) { var rt = X.terms(x.name + " " + x.snippet), wh = qw.length ? qw.filter(function (w) { return rt[w]; }).length / qw.length : 0; x.score = Math.max(X.overlap(C.focus, x.name + " " + x.snippet, C.keys.concat(C.issues)), Math.round(100 * Math.min(1, wh * 1.4))); }); list.sort(function (a, b) { return b.score - a.score || b.cited - a.cited; });
      r.results = list.slice(0, 20); r.err = list.length ? "" : "No cases found. Try different words or All courts.";
    } catch (e) { r.err = "Search failed: " + (e.message || e); }
    st.busy = ""; render(true);
  }

  /* ---------- celebration ---------- */
  function celebrate() {
    var host = document.querySelector(".bigcheck"); if (!host) return;
    var cols = ["#4ef09a", "#ffb020", "#ff6a3d", "#7c8cff", "#22d3ee"];
    for (var i = 0; i < 26; i++) { var s = document.createElement("i"); s.className = "spark"; var a = Math.random() * Math.PI * 2, d = 90 + Math.random() * 110; s.style.cssText = "left:75px;top:75px;background:" + cols[i % 5] + ";--x:" + Math.cos(a) * d + "px;--y:" + Math.sin(a) * d + "px;animation-delay:" + (.3 + Math.random() * .2) + "s"; host.appendChild(s); }
  }

  /* ---------- views ---------- */
  /* The bottom bar lives outside the redrawn page, so it never flickers or shifts when you switch tabs. */
  var navHost = document.createElement("div"); navHost.id = "navhost"; document.body.appendChild(navHost);
  function syncNav(show) {
    if (!show) { navHost.style.display = "none"; return; }
    navHost.style.display = "";
    if (!navHost.firstChild) { navHost.innerHTML = navBar(); return; }
    var f = cur(), empty = !f || !f.files.length;
    [].forEach.call(navHost.querySelectorAll("[data-a=tab]"), function (b) { b.className = b.getAttribute("data-v") === st.tab ? "on" : ""; });
    var fab = navHost.querySelector(".fab"); if (fab) fab.classList.toggle("pulse", empty);
  }
  navHost.addEventListener("click", function (e) {
    var el = e.target.closest("[data-a]"); if (!el) return;
    var a = el.getAttribute("data-a");
    if (a === "tab") { var nt = el.getAttribute("data-v"); if (nt !== st.tab || st.screen) { st.tab = nt; st.screen = null; render(); window.scrollTo(0, 0); } return; }
    if (a === "add") return addSheet();
  });
  function navBar() {
    var t = st.tab, f = cur(), empty = !f || !f.files.length;
    function b(id, icon, label) { return '<button data-a="tab" data-v="' + id + '" class="' + (t === id ? "on" : "") + '">' + ic(icon) + label + "</button>"; }
    return '<nav class="nav">' + b("check", "chk", "Check") + b("files", "fold", "Files") + '<button class="fab' + (empty ? " pulse" : "") + '" data-a="add" aria-label="Add">' + ic("plus", 26, "#04140b", 2.6) + "</button>" + b("exhibits", "stack", "Build") + b("settings", "set", "Settings") + "</nav>";
  }
  function header(title, sub, right, back) {
    return '<div class="hd">' + (back ? '<button class="ib glass" data-a="back" aria-label="Back">' + ic("back") + "</button>" : '<div class="logo">' + logo(46) + "</div>") +
      '<div class="t"><small>' + h(sub) + "</small><b>" + h(title) + "</b></div>" + (right || "") + "</div>";
  }
  function busyView() {
    return '<div class="empty enter"><div class="art"><div style="width:150px;height:150px;border-radius:40px;overflow:hidden;filter:drop-shadow(0 0 30px rgba(78,240,154,.45))">' + logo(150) + '</div></div><h2 id="busyt">' + h(st.busy) + '…</h2><p class="sm">Everything stays on this device.</p><div class="prog" style="max-width:280px;margin:0 auto"><i style="width:' + Math.round(st.pct * 100) + '%"></i></div><p class="xs mut" id="pctt" style="margin-top:8px">' + Math.round(st.pct * 100) + "%</p></div>";
  }
  function ringSvg(pct, size) {
    var r = 48, c = 2 * Math.PI * r, id = "rg" + (++lid);
    return '<svg class="ring" viewBox="0 0 120 120" width="' + (size || 112) + '" height="' + (size || 112) + '"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4ef09a"/><stop offset=".6" stop-color="#22d3ee"/><stop offset="1" stop-color="#7c8cff"/></linearGradient></defs>' +
      '<circle cx="60" cy="60" r="48" fill="none" stroke="var(--card2)" stroke-width="12"/><circle class="arc" data-to="' + (c * (1 - pct / 100)).toFixed(1) + '" cx="60" cy="60" r="48" fill="none" stroke="url(#' + id + ')" stroke-width="12" stroke-linecap="round" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + c.toFixed(1) + '" transform="rotate(-90 60 60)" style="transition:stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1);filter:drop-shadow(0 0 7px rgba(78,240,154,.55))"/>' +
      '<text x="60" y="63" text-anchor="middle" font-size="27" font-weight="800" fill="var(--tx)" letter-spacing="-1"><tspan data-count="' + pct + '">0</tspan>%</text><text x="60" y="81" text-anchor="middle" font-size="10" fill="var(--mut)" font-weight="700" letter-spacing="1">READY</text></svg>';
  }
  function issueRow(x, i) {
    var icn = { covered: "eye", blank: "blank", sideways: "rotR", size: "stack", hidden: "scrub", scan: "text", pagesize: "pages", fonts: "text", placeholder: "pen", amount: "coins", missingatt: "link", xref: "link", sigblock: "sig", currency: "coins", dates: "info", foreign: "globe", dupe: "pages", docxhidden: "word", name: "file", encrypted: "lock", broken: "alert" }[x.code] || (x.code.indexOf("sens") === 0 ? "lock" : "alert");
    var act = x.fix === "redact" || x.fix === "redactDocx" ? "Redact" : x.fix === "cleanDocx" ? "Clean" : x.fix === "ocr" ? "Read text" : x.fix === "review" ? "View" : x.fix ? "Fix" : "View";
    return '<div class="iss glass ' + x.sev + '"><span class="bar"></span><button class="ic" data-a="open" data-i="' + i + '" aria-label="Show on page">' + ic(icn, 22) + '</button><button class="tx" data-a="open" data-i="' + i + '" style="text-align:left"><b>' + h(x.title) + '<span class="tag">' + (x.sev === "must" ? "MUST" : "SHOULD") + "</span></b><small>" + h((x.fileName || "") + " · " + x.detail) + "</small>" + (x.cite ? '<span class="cite">' + ic("book", 13) + h(x.cite.text) + "</span>" : "") + '</button><button class="fix" data-a="fix" data-i="' + i + '">' + act + "</button></div>";
  }
  function viewHome() {
    var f = cur(), p = prof();
    if (!f || !f.files.length) {
      return header("FileReady", greet(), '<button class="ib glass" data-a="tab" data-v="settings" aria-label="Settings">' + ic("user", 22) + "</button>") +
        '<main class="enter"><div class="empty"><div class="art"><div style="width:150px;height:150px;border-radius:40px;overflow:hidden;filter:drop-shadow(0 0 34px rgba(78,240,154,.5))">' + logo(150) + "</div></div>" +
        "<h2>Add your first filing</h2><p>Drop in the PDFs you plan to file or send. FileReady checks them against " + h(p.packShort) + " rules and fixes what it can, right on this phone.</p>" +
        '<button class="btn" data-a="pick">' + ic("plus", 20, "#04140b", 2.6) + 'Add PDFs</button><div class="row2 mt"><button class="btn2 glass" data-a="demo" data-v="court">' + ic("scale", 18) + 'Court demo</button><button class="btn2 glass" data-a="demo" data-v="deal">' + ic("brief", 18) + "Deal demo</button></div>" + researchCard() +
        '<p class="xs mut" style="margin-top:22px">' + ic("lock", 13) + " Files never leave this device.</p></div>" + filingList() + "</main>";
    }
    var r = f.result, pct = score(r), top = r ? r.issues.slice(0, 3) : [];
    var bento = r ? '<div class="bento"><button class="tile t1" data-a="issues" data-v="must"><small>' + ic("alert", 15, "#3a1305", 2.4) + 'Must fix</small><b data-count="' + r.must + '">0</b><div class="xs" style="font-weight:700;opacity:.75;margin-top:10px">' + h(topKinds(r, "must")) + '</div><div class="bg">' + ic("alert", 110, "#3a1305", 1.6) + "</div></button>" +
      '<button class="tile t2" data-a="issues" data-v="should"><small>Should fix</small><b data-count="' + r.should + '">0</b><div class="bg">' + ic("eye", 80, "#3a2a00", 1.6) + "</div></button>" +
      '<button class="tile t3" data-a="issues" data-v="passed"><small>Passed</small><b data-count="' + r.passed.length + '">0</b><div class="bg">' + ic("chk", 80, "#04140b", 1.6) + "</div></button></div>" +
      '<div class="bento" style="grid-template-rows:auto;margin-top:12px"><button class="tile t4" data-a="tab" data-v="exhibits"><div><small>Pages · ' + (S.bates.on ? "Bates ready" : "ready to build") + '</small><b data-count="' + r.pages + '" style="font-size:2rem">0</b></div><div style="display:flex;padding-right:8px">' +
      [[.35, -8], [.55, -2], [.85, 5]].map(function (q) { return '<div style="width:34px;height:44px;border-radius:7px;background:rgba(255,255,255,' + q[0] + ');margin-left:-14px;border:1px solid rgba(255,255,255,.5);transform:rotate(' + q[1] + 'deg)"></div>'; }).join("") + "</div></button></div>" : "";
    return header("Good " + daypart() + (S.name ? ", " + S.name.split(" ")[0] : ""), today() + " · On-device only", '<button class="ib glass" data-a="tab" data-v="settings" aria-label="Settings">' + ic("user", 22) + (r && r.must ? '<i class="dot"></i>' : "") + "</button>") +
      '<main class="enter"><button class="search glass" data-a="search">' + ic("search", 20) + "Search all exhibits<kbd>" + (r ? r.pages + " pages" : "") + "</kbd></button>" +
      '<div class="hero glass mt2"><div class="top">' + ringSvg(pct) + '<div style="min-width:0"><button class="pill" data-a="rules">' + ic("shield", 14, "currentColor", 2.4) + h(p.packShort + " · " + shortArea(p.areaName)) + '</button><h2><button data-a="rename" style="text-align:left">' + h(f.name) + "</button></h2><div class=\"mut sm\">" + f.files.length + " file" + (f.files.length > 1 ? "s" : "") + (r ? " · checked " + when(r.at) : "") + "</div></div></div>" + bento + "</div>" +
      '<div class="sec"><b>Quick actions</b></div><div class="qa">' + qa("spark", "Fix all", "fixall", "gG") + qa("hash", "Build", "tab\" data-v=\"exhibits", "gP") + qa(p.contracts ? "cmp" : "scrub", p.contracts ? "Compare" : "Scrub", p.contracts ? "compare" : "scrubAll", "gY") + qa("rep", "Report", "report", "gO") + "</div>" +
      researchCard() +
      (r && r.issues.length ? '<div class="sec"><b>Needs attention</b><button class="lnk" data-a="issues" data-v="all">See all ' + r.issues.length + "</button></div>" + top.map(function (x) { return issueRow(x, r.issues.indexOf(x)); }).join("") :
        r ? '<div class="sec"><b>All clear</b></div><div class="iss glass okk"><span class="ic">' + ic("chk", 22) + '</span><div class="tx"><b>No issues found</b><small>Build your filing when you are ready.</small></div><button class="fix" data-a="tab" data-v="exhibits">Build</button></div>' : "") +
      filingList() + '<p class="disc">FileReady flags common problems using ' + h(p.packName) + ". It is not legal advice. Confirm your court's current rules.</p></main>";
  }
  function qa(icon, label, act, cls) { return '<button class="q glass" data-a="' + act + '"><span class="' + cls + '">' + ic(icon, 22, "#0b0d12", 2.2) + "</span>" + label + "</button>"; }
  function topKinds(r, sev) { var k = {}; r.issues.filter(function (x) { return x.sev === sev; }).forEach(function (x) { k[x.title.split(" ")[0].replace(/[^A-Za-z]/g, "")] = 1; }); var l = Object.keys(k).slice(0, 2); return l.join(" · ") || "Nothing urgent"; }
  function shortArea(a) { return a.split(/[ ,]/)[0]; }
  function daypart() { var hr = new Date().getHours(); return hr < 12 ? "morning" : hr < 18 ? "afternoon" : "evening"; }
  function greet() { return today() + " · On-device only"; }
  function today() { return new Date().toLocaleDateString(undefined, { weekday: "long" }); }
  function filingList() {
    var others = st.filings.filter(function (x) { return x.id !== st.fid || !x.files.length; });
    if (!st.filings.length) return "";
    return '<div class="sec"><b>Your filings</b><button class="lnk" data-a="newfiling">+ New</button></div>' + st.filings.map(function (x) {
      var r = x.result, on = x.id === st.fid;
      return '<button class="out glass fw" data-a="pickfiling" data-v="' + x.id + '" style="' + (on ? "border-color:rgba(78,240,154,.45)" : "") + '"><span class="ic gP">' + ic("stack", 20, "#0b0d12") + '</span><span class="tx" style="flex:1;min-width:0;text-align:left"><b style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + h(x.name) + '</b><small class="mut">' + x.files.length + " files" + (r ? " · " + r.must + " must · " + r.should + " should" : "") + "</small></span>" + (on ? '<span class="badge2">OPEN</span>' : ic("chev", 18)) + "</button>";
    }).join("");
  }
  function viewIssues() {
    var f = cur(), r = f && f.result; if (!r) return header("Issues", "", "", true) + "<main></main>";
    var fl = st.filter, list = r.issues.map(function (x, i) { return [x, i]; }).filter(function (p) { return fl === "all" || p[0].sev === fl; });
    var chips = [["all", "All " + r.issues.length], ["must", "Must " + r.must], ["should", "Should " + r.should], ["passed", "Passed " + r.passed.length]].map(function (c) { return '<button class="chip' + (fl === c[0] ? " on" : "") + '" data-a="filter" data-v="' + c[0] + '">' + c[1] + "</button>"; }).join("");
    var body = fl === "passed" ? r.passed.map(function (t) { return '<div class="iss glass okk"><span class="ic">' + ic("chk", 22) + '</span><div class="tx"><b>' + h(t) + "</b></div></div>"; }).join("") :
      list.length ? list.map(function (p) { return issueRow(p[0], p[1]); }).join("") : '<div class="note glass">Nothing here.</div>';
    return header("Check results", f.name, '<button class="ib glass" data-a="fixall" aria-label="Fix all">' + ic("spark", 22) + "</button>", true) + '<main class="enter"><div class="chips">' + chips + "</div><div class=\"mt\"></div>" + body +
      (r.issues.some(function (x) { return SAFE[x.fix]; }) ? '<button class="btn mt2" data-a="fixall">' + ic("spark", 20, "#04140b", 2.4) + "Fix all safe issues</button>" : "") + "</main>";
  }
  function viewViewer() {
    var v = st.view, x = v.issue;
    var boxes = (x && x.boxes && v.img ? x.boxes : []).map(function (b) { var k = v.img.scale / (x.scale || 1); return '<i class="hl" style="left:' + (b.x * k / v.img.w * 100).toFixed(2) + "%;top:" + (b.y * k / v.img.h * 100).toFixed(2) + "%;width:" + (b.w * k / v.img.w * 100).toFixed(2) + "%;height:" + (b.h * k / v.img.h * 100).toFixed(2) + '%"></i>'; }).join("");
    var act = x ? (x.fix === "redact" || x.fix === "redactDocx" ? "Redact now" : x.fix === "cleanDocx" ? "Clean the Word file" : x.fix === "ocr" ? "Read text on this device" : SAFE[x.fix] || x.fix === "split" || x.fix === "flattenAll" ? "Fix it" : "") : "";
    return header(v.label, (v.docx ? "Section " : "Page ") + v.page + " of " + (v.count || "?"), "", true) + '<main class="enter">' +
      (x ? '<div class="iss glass ' + x.sev + '"><span class="bar"></span><span class="ic">' + ic("alert", 22) + '</span><div class="tx"><b>' + h(x.title) + '</b><small>' + h(x.detail) + "</small>" + (x.cite ? '<span class="cite">' + ic("book", 13) + (x.cite.url ? '<a href="' + h(x.cite.url) + '" data-ext="1">' + h(x.cite.text) + "</a>" : h(x.cite.text)) + "</span>" : "") + "</div></div>" + hint(x) : "") +
      (v.docx ? '<div class="viewer doc">' + (v.text != null ? docText(v.text, x) : '<div style="height:300px;display:flex;align-items:center;justify-content:center"><span class="spin"></span></div>') + "</div>" :
      '<div class="viewer">' + (v.img ? '<img src="' + v.img.url + '" alt="Page ' + v.page + '">' + boxes : '<div style="height:420px;display:flex;align-items:center;justify-content:center"><span class="spin"></span></div>') + "</div>") +
      '<div class="row2 mt"><button class="btn2 glass" data-a="vpage" data-v="-1">' + ic("left", 18) + 'Previous</button><button class="btn2 glass" data-a="vpage" data-v="1">Next' + ic("right", 18) + "</button></div>" +
      (act ? '<button class="btn mt" data-a="vfix">' + ic("spark", 20, "#04140b", 2.4) + act + "</button>" : "") +
      (x ? '<button class="btn2 glass mt" data-a="vdismiss">' + ic("chk", 18) + "Mark as reviewed</button>" : "") + "</main>";
  }
  function docText(t, x) {
    var raws = (x && x.raws) || [], out = h(t);
    raws.filter(function (r, i) { return r && raws.indexOf(r) === i; }).sort(function (a, b) { return b.length - a.length; }).forEach(function (r) { out = out.split(h(r)).join('<mark class="hlm">' + h(r) + "</mark>"); });
    return '<div class="doctext">' + out.replace(/\n/g, "<br>") + "</div>";
  }
  function hint(x) {
    var t = { redact: "Redacting turns this page into an image with the marked areas blacked out, so the hidden text is truly gone. The rest of the page stays searchable.", ocr: "Reads the scanned pages on this device and adds an invisible text layer, so they become searchable and can be checked. Pages never leave the device. On the web the reading engine downloads once.", redactDocx: "Replaces each character of the number with X in the Word file, as many court rules describe. Formatting stays the same.", cleanDocx: "Accepts all tracked changes, deletes comments and hidden text, and clears the author and company names. Check the result in Word before sending.", review: "Check this by hand, fix it in the original document, then add the new version.", scrub: "Removes author names, comments, form fields, attached files and scripts.", flattenAll: "Converts each page to a high-resolution image with an invisible text layer, so no font is missing. Use only if the original cannot be re-saved with embedded fonts.", split: "Splits the file into parts under the size limit." }[x.fix];
    return t ? '<div class="note glass" style="margin-bottom:12px">' + h(t) + "</div>" : "";
  }
  function viewFiles() {
    var f = cur();
    if (!f || !f.files.length) return header("Files", "Your documents", "", false) + '<main class="enter">' + emptyBlock("No files yet", "Add the documents for this filing: the lead document first, then exhibits.") + "</main>";
    return header(f.name, f.files.length + " files \u00b7 order sets exhibit letters", '<button class="ib glass" data-a="compare" aria-label="Compare versions" style="margin-right:6px">' + ic("cmp", 22) + '</button><button class="ib glass" data-a="pick" aria-label="Add files">' + ic("plus", 22) + "</button>", false) + '<main class="enter">' + f.files.map(function (x, i) {
      var v = curV(x), lab = x.role === "main" ? "LEAD" : (S.ex.binder ? "TAB " : (S.ex.word || "Exhibit").toUpperCase() + " ") + E.label(S.ex.binder ? "1" : S.ex.style, f.files.filter(function (y) { return y.role !== "main"; }).indexOf(x));
      var isW = x.kind === "docx";
      if (isW) lab = "WORD";
      return '<div class="fl glass"><div class="top">' + (isW ? '<div class="mini" style="display:flex;align-items:center;justify-content:center;background:linear-gradient(160deg,#2b5797,#1e3f73);color:#fff">' + ic("word", 26, "#fff") + "</div>" : '<div class="mini" data-thumb="' + v.key + '"></div>') + '<div style="flex:1;min-width:0"><span class="badge2">' + h(lab) + '</span><b style="display:block;margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + h(x.label || x.name) + '</b><small class="mut">' + (isW ? v.pages + " section" + (v.pages === 1 ? "" : "s") : v.pages + " page" + (v.pages === 1 ? "" : "s")) + " \u00b7 " + mb(v.size) + (x.versions.length > 1 ? " · " + h(v.label) : "") + "</small></div></div>" +
        (isW ? "" : '<input class="inp mt" data-a="desc" data-v="' + x.id + '" placeholder="Description for the index (e.g. Lease agreement)" value="' + h(x.desc) + '">') +
        '<div class="acts">' + (isW ? "" : '<button class="mbtn" data-a="role" data-v="' + x.id + '">' + (x.role === "main" ? "Make exhibit" : "Make lead") + '</button><button class="mbtn" data-a="pages" data-v="' + x.id + '">' + ic("pages", 15) + "Pages</button>") + '<button class="mbtn" data-a="mv" data-v="' + x.id + '" data-d="-1" aria-label="Move up">' + ic("up", 15) + '</button><button class="mbtn" data-a="mv" data-v="' + x.id + '" data-d="1" aria-label="Move down">' + ic("down", 15) + "</button>" +
        (x.versions.length > 1 ? '<button class="mbtn" data-a="undo" data-v="' + x.id + '">' + ic("undo", 15) + "Undo</button>" : "") + '<button class="mbtn" data-a="sharefile" data-v="' + x.id + '">' + ic("share", 15) + '</button><button class="mbtn" data-a="rmfile" data-v="' + x.id + '" aria-label="Remove">' + ic("trash", 15) + "</button></div></div>";
    }).join("") + '<p class="disc">Originals are never changed. Every fix is saved as a new version you can undo. Word files are checked and cleaned here; save them as PDF to include them in a filing.</p></main>';
  }
  function emptyBlock(t, s) { return '<div class="empty"><div class="art"><div style="width:150px;height:150px;border-radius:40px;overflow:hidden;filter:drop-shadow(0 0 34px rgba(78,240,154,.5))">' + logo(150) + "</div></div><h2>" + h(t) + "</h2><p>" + h(s) + '</p><button class="btn" data-a="pick">' + ic("plus", 20, "#04140b", 2.6) + 'Add PDFs</button><div class="row2 mt"><button class="btn2 glass" data-a="demo" data-v="court">' + ic("scale", 18) + 'Court demo</button><button class="btn2 glass" data-a="demo" data-v="deal">' + ic("brief", 18) + "Deal demo</button></div></div>"; }
  function viewPages() {
    var f = cur(), x = f.files.filter(function (y) { return y.id === st.pagesFile; })[0]; if (!x) { st.screen = null; return viewFiles(); }
    var v = curV(x), sel = Object.keys(st.sel).map(Number).sort(function (a, b) { return a - b; });
    var cells = ""; for (var i = 1; i <= v.pages; i++) cells += '<button class="pgc' + (st.sel[i] ? " sel" : "") + '" data-a="sel" data-v="' + i + '"><img alt="" data-pg="' + v.key + ":" + i + '"><span>' + i + "</span></button>";
    return header(x.label || x.name, sel.length ? sel.length + " selected" : "Tap pages to select", "", true) + '<main class="enter"><div class="grid">' + cells + "</div>" +
      '<div class="qa mt2" style="position:sticky;bottom:96px">' + qa("rotL", "Turn left", "prot\" data-v=\"-90", "gP") + qa("rotR", "Turn right", "prot\" data-v=\"90", "gP") + qa("left", "Move up", "pmove\" data-v=\"-1", "gY") + qa("trash", "Delete", "pdel", "gO") + "</div></main>";
  }
  function viewBuild() {
    var f = cur(), p = prof(), ex = S.ex, b = S.bates;
    if (!f || !f.files.length) return header("Build", "Exhibits and binders", "", false) + '<main class="enter">' + emptyBlock("Nothing to build yet", "Add files, then build a court-ready filing or a closing binder here.") + "</main>";
    var pdfs = f.files.filter(function (x) { return x.kind !== "docx"; }), words = f.files.length - pdfs.length;
    var exs = pdfs.filter(function (x) { return x.role !== "main"; }), start = +b.start || 1, pages = 0;
    var cols = ["linear-gradient(145deg,#ffb08f,#ff6a3d)", "linear-gradient(145deg,#ffe08a,#ffb020)", "linear-gradient(145deg,#6ff5ac,#14b864)", "linear-gradient(145deg,#a3adff,#5b6cff)"];
    var thumbs = pdfs.map(function (x) {
      var v = curV(x), isEx = x.role !== "main", k = exs.indexOf(x), first = start + pages + (isEx && ex.covers ? 1 : 0);
      pages += v.pages + (isEx && ex.covers ? 1 : 0);
      return '<div class="th"><div class="thwrap"><div class="pg" data-thumb="' + v.key + '"></div>' + (isEx ? '<span class="badge" style="background:' + cols[k % 4] + '">' + h(E.label(ex.binder ? "1" : ex.style, k)) + "</span>" : '<span class="badge" style="background:var(--tx);color:var(--bg)">' + ic("file", 14) + "</span>") +
        (b.on ? '<span class="bn">' + h((b.prefix || initials(f.name)) + pad(first, b.digits)) + "</span>" : "") + "</div><b>" + h(isEx ? (ex.binder ? "Tab " : (ex.word || "Exhibit") + " ") + E.label(ex.binder ? "1" : ex.style, k) : x.label) + "</b><small>" + v.pages + " page" + (v.pages === 1 ? "" : "s") + "</small></div>";
    }).join("");
    function tgBox(key, t, s) { return '<div class="glass list mt">' + tg(key, t, s) + "</div>"; }
    function tg(key, t, s, obj) { obj = obj || "ex"; var on = S[obj][key]; return '<button class="li" data-a="tg" data-o="' + obj + '" data-v="' + key + '"><span class="tx"><b>' + t + "</b><small>" + s + '</small></span><span class="tg' + (on ? "" : " off") + '"></span></button>'; }
    var outs = (f.outputs || []).slice(0, 12).map(function (o) { var col = { filing: "gG", binder: "gP", report: "gO", packet: "gY", executed: "gG" }[o.kind] || "gG"; return '<div class="out glass"><span class="ic ' + col + '">' + ic(o.kind === "report" ? "rep" : o.kind === "packet" ? "sig" : o.kind === "executed" ? "chk" : o.kind === "binder" ? "binder" : "stack", 20, "#0b0d12") + '</span><div style="flex:1;min-width:0"><b style="display:block;font-size:.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + h(o.name) + '</b><small class="mut">' + mb(o.size) + (o.pages ? " · " + o.pages + " pages" : "") + " · " + when(o.at) + '</small></div><button class="ib glass" data-a="oshare" data-v="' + o.id + '" aria-label="Share">' + ic("share", 19) + '</button><button class="ib glass" data-a="osave" data-v="' + o.id + '" aria-label="Save">' + ic("dl", 19) + "</button></div>"; }).join("");
    return header(ex.binder ? "Closing binder" : "Build filing", f.name, '<button class="ib glass" data-a="rules" aria-label="Rules">' + ic("shield", 22) + "</button>", false) + '<main class="enter">' +
      '<div class="thumbs">' + thumbs + "</div>" + (words ? '<div class="note glass mt">' + ic("word", 15) + " " + words + " Word file" + (words > 1 ? "s are" : " is") + " checked but not built in. Save as PDF in Word to include " + (words > 1 ? "them" : "it") + ".</div>" : "") +
      (p.contracts ? '<div class="seg glass mt"><button class="' + (ex.binder ? "" : "on") + '" data-a="mode" data-v="filing">Court filing</button><button class="' + (ex.binder ? "on" : "") + '" data-a="mode" data-v="binder">Closing binder</button></div>' : "") +
      (ex.binder ? "" : '<div class="sec"><b>Exhibit style</b></div><div class="seg glass">' + [["A", "A, B, C"], ["1", "1, 2, 3"], ["I", "I, II, III"]].map(function (s) { return '<button class="' + (ex.style === s[0] ? "on" : "") + '" data-a="style" data-v="' + s[0] + '">' + s[1] + "</button>"; }).join("") + "</div>") +
      '<div class="sec"><b>Bates numbering</b><button class="tg' + (b.on ? "" : " off") + '" data-a="tg" data-o="bates" data-v="on" aria-label="Bates on or off"></button></div>' +
      (b.on ? '<div class="glass" style="border-radius:24px;padding:16px"><div class="flx"><div style="flex:1;min-width:0"><small class="mut xs">Prefix and start</small><div style="font:800 1.55rem ui-monospace,Menlo,monospace;letter-spacing:1px;margin-top:4px;background:linear-gradient(90deg,#ffe08a,#ff8a5b);-webkit-background-clip:text;background-clip:text;color:transparent">' + h((b.prefix || initials(f.name)) + pad(start, b.digits)) + "</div></div>" +
        "</div>" + '<div class="seg glass mt" style="padding:3px">' + ["left", "center", "right"].map(function (q) { return '<button class="' + (b.pos === q ? "on" : "") + '" data-a="bpos" data-v="' + q + '">' + q[0].toUpperCase() + q.slice(1) + "</button>"; }).join("") + "</div>" +
        '<div class="row2 mt"><input class="inp" data-a="bprefix" placeholder="Prefix (' + h(initials(f.name)) + ')" value="' + h(b.prefix) + '"><input class="inp" data-a="bstart" inputmode="numeric" placeholder="Start" value="' + h(b.start) + '"></div></div>' : "") +
      '<div class="glass list mt">' + (ex.binder ? tg("covers", "Tab divider pages", "A numbered divider before each document") : tg("covers", "Cover sheets", "“" + (ex.word || "Exhibit").toUpperCase() + " A” page before each exhibit") + tg("stamp", "Exhibit label on first page", "Small boxed label at the top right")) +
      tg("index", ex.binder ? "Closing index and bookmarks" : "Index page", ex.binder ? "Lists every document with its tab" : "Lists exhibits with page or Bates ranges") + tg("bookmarks", "Bookmarks", "Jump to each document in any PDF reader") + tg("scrub", "Scrub hidden data", "Author names, comments, attachments, scripts") +
      tg("split", "Split to size limit", p.maxMB ? "Parts under " + p.maxMB + " MB (" + h(p.packShort) + ")" : "Set a size limit in Settings first") + "</div>" +
      '<button class="btn mt2" data-a="build">' + ic("spark", 20, "#04140b", 2.4) + "Build " + pages + "-page " + (ex.binder ? "binder" : "filing") + "</button>" +
      (ex.binder ? tgBox("checklist", "Closing checklist page", "Adds the checklist after the index") : "") +
      (p.contracts ? '<div class="row2 mt"><button class="btn2 glass" data-a="' + (f.sig ? "sigview" : "packets") + '">' + ic("sig", 19) + (f.sig ? "Signatures" : "Signature packets") + '</button><button class="btn2 glass" data-a="checklist">' + ic("binder", 19) + "Checklist</button></div>" : "") +
      '<button class="btn2 glass mt" data-a="report">' + ic("rep", 19) + "Check report (PDF)</button>" +
      (outs ? '<div class="sec"><b>Ready to send</b></div>' + outs : "") + "</main>";
  }
  function viewBuilt() {
    var l = st.last || {}, f = cur(), o = f.outputs && f.outputs[0];
    return '<main class="enter"><div class="done"><div class="bigcheck" style="position:relative"><svg viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="#04140b" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>' +
      '<h2 style="font-size:1.9rem;letter-spacing:-1px;margin:0 0 8px">' + (S.ex.binder ? "Binder ready" : "Filing ready") + '</h2><p class="mut" style="margin:0 0 6px">' + (l.pages || 0) + " pages · " + (l.exhibits || 0) + (S.ex.binder ? " tabs" : " exhibits") + " · " + mb(l.size || 0) + "</p>" + (l.bates ? '<p class="xs mut" style="font-family:ui-monospace,monospace">' + h(l.bates) + "</p>" : "") + "</div>" +
      (o ? '<div class="row2"><button class="btn" data-a="oshare" data-v="' + o.id + '">' + ic("share", 20, "#04140b", 2.4) + 'Share</button><button class="btn2 glass" data-a="osave" data-v="' + o.id + '">' + ic("dl", 20) + "Save</button></div>" : "") +
      '<button class="btn2 glass mt" data-a="checkout">' + ic("eye", 19) + "Check the built file</button><button class=\"btn2 glass mt\" data-a=\"back\">Done</button></main>";
  }
  function viewReady() {
    return '<main class="enter"><div class="done"><div class="bigcheck" style="position:relative"><svg viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="#04140b" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><h2 style="font-size:1.9rem;letter-spacing:-1px;margin:0 0 8px">All clear</h2><p class="mut">Every check passed for ' + h(prof().packShort) + ".</p></div>" +
      '<button class="btn" data-a="tab" data-v="exhibits">' + ic("spark", 20, "#04140b", 2.4) + 'Build the filing</button><button class="btn2 glass mt" data-a="report">' + ic("rep", 19) + 'Share check report</button><button class="btn2 glass mt" data-a="back">Back</button></main>';
  }
  function viewPackets() {
    var f = cur(), sg = (f.sig && f.sig.signers) || [], tot = 0, got = 0;
    sg.forEach(function (s) { tot += s.items.length; if (s.signed) got += s.signed.map.filter(Boolean).length; });
    var pct = tot ? Math.round(100 * got / tot) : 0;
    var top = sg.length ? '<div class="hero glass sigsum"><div class="top">' + ringSvg(pct, 96).replace("READY", "SIGNED") + '<div style="min-width:0"><span class="pill">' + ic("sig", 14) + " " + sg.length + " signer" + (sg.length === 1 ? "" : "s") + '</span><h2>' + got + " of " + tot + ' pages back</h2><p class="mut sm" style="margin:2px 0 0">Send each packet, add the signed PDF when it comes back, then put the pages into the documents.</p></div></div></div>' : "";
    var rows = sg.map(function (s, i) {
      var o = (f.outputs || []).filter(function (x) { return x.id === s.out; })[0], n = s.signed ? s.signed.map.filter(Boolean).length : 0, full = s.signed && n === s.items.length;
      var map = s.signed ? '<div class="sigmap">' + s.items.map(function (it, k) { return '<label><span>' + h(it.doc) + " · p." + it.page + '</span><select class="inp" data-a="sigmap" data-s="' + i + '" data-k="' + k + '"><option value="0">Not signed</option>' + Array.apply(null, Array(s.signed.pages)).map(function (_, p) { return '<option value="' + (p + 1) + '"' + (s.signed.map[k] === p + 1 ? " selected" : "") + ">Signed page " + (p + 1) + "</option>"; }).join("") + "</select></label>"; }).join("") + "</div>" : "";
      return '<div class="sigcard glass' + (full ? " ok" : "") + '"><div class="out" style="border:0;background:none;padding:0;margin:0"><span class="ic ' + (full ? "gG" : "gY") + '">' + ic(full ? "chk" : "sig", 20, "#0b0d12") + '</span><div style="flex:1;min-width:0"><b style="display:block">' + h(s.name) + '</b><small class="mut">' + s.items.length + " page" + (s.items.length > 1 ? "s" : "") + " · " + h(uniq(s.items.map(function (x) { return x.doc; })).join(", ")) + "</small></div>" + (o ? '<button class="ib glass" data-a="oshare" data-v="' + o.id + '" aria-label="Send packet">' + ic("share", 19) + "</button>" : "") + "</div>" +
        '<div class="sigst"><span class="chip ' + (full ? "cg" : s.signed ? "cy" : "cm") + '">' + (full ? "All signed" : s.signed ? n + " of " + s.items.length + " signed" : "Waiting") + '</span><button class="lnk" data-a="sigadd" data-v="' + i + '">' + (s.signed ? "Replace signed PDF" : "Add signed PDF") + "</button></div>" + map + "</div>";
    }).join("");
    return header("Signature packets", sg.length + " signers", "", true) + '<main class="enter">' + (!sg.length ? '<div class="note glass">No signature pages found. FileReady looks for "IN WITNESS WHEREOF", "By: ____" and "Name:" lines.</div>' : top + rows +
      '<button class="btn mt2" data-a="assemble"' + (got ? "" : " disabled") + ">" + ic("spark", 20, "#04140b", 2.4) + "Put signed pages into documents</button>" +
      '<button class="btn2 glass mt" data-a="checklist">' + ic("binder", 19) + "Closing checklist</button>") +
      '<p class="disc">Each packet page carries a small FileReady footer so returned pages can be matched. Scans without readable text are matched by page order: check each match before updating. When several people sign the same page, each signed copy is included as a counterpart. Every update is a new version you can undo.</p></main>';
  }
  function viewChecklist() {
    var f = cur(); syncChecklist(f);
    var L = f.checklist, done = L.filter(function (c) { return c.status === "Done"; }).length, pct = L.length ? Math.round(100 * done / L.length) : 0;
    var rows = L.map(function (c, i) {
      var x = c.fileId ? byId(c.fileId) : null, sc = sigCount(f, c.fileId), tab = clTab(f, c), cls = c.status === "Done" ? "cg" : c.status === "Waiting" ? "cy" : "cm";
      return '<div class="clrow glass' + (c.status === "Done" ? " cdone" : "") + '"><span class="tabb">' + (tab ? h(tab) : ic(x && x.kind === "docx" ? "word" : "pen", 17)) + '</span><div class="tx"><b>' + h(x ? (x.label || x.name) : c.title) + '</b><button class="lnk sm" data-a="clwho" data-v="' + c.id + '">' + (c.who ? h(c.who) : "Add who is responsible") + "</button>" + (sc.total ? '<span class="chip ' + (sc.got === sc.total ? "cg" : "cy") + '" style="margin-left:6px">' + ic("sig", 12) + " " + sc.got + "/" + sc.total + "</span>" : "") + (!x ? ' <button class="lnk sm" data-a="cldel" data-v="' + c.id + '" style="color:var(--mut)">Remove</button>' : "") + '</div><button class="chip big ' + cls + '" data-a="clstat" data-v="' + c.id + '">' + c.status + "</button></div>";
    }).join("");
    return header("Closing checklist", f.name, '<button class="ib glass" data-a="clpdf" aria-label="Share checklist">' + ic("share", 21) + "</button>", true) + '<main class="enter">' +
      '<div class="hero glass"><div class="top">' + ringSvg(pct, 96).replace("READY", "DONE") + '<div style="min-width:0"><span class="pill">' + ic("binder", 14) + " Linked to the binder</span><h2>" + done + " of " + L.length + ' done</h2><p class="mut sm" style="margin:2px 0 0">Tabs match the closing binder. Signature counts update as signed pages come back.</p></div></div></div>' +
      '<div class="sec"><b>Items</b><button class="lnk" data-a="cladd">+ Add item</button></div>' + rows +
      '<button class="btn mt2" data-a="clbinder">' + ic("spark", 20, "#04140b", 2.4) + "Build binder with checklist</button>" +
      '<button class="btn2 glass mt" data-a="clpdf">' + ic("rep", 19) + "Share checklist PDF</button>" +
      ((f.sig && f.sig.signers.length) ? '<button class="btn2 glass mt" data-a="sigview">' + ic("sig", 19) + "Signature packets</button>" : "") + "</main>";
  }
  function viewCompare() {
    var f = cur(), c = st.cmp;
    if (!c) {
      var opts = f.files.map(function (x) { return '<option value="' + x.id + '">' + h((x.kind === "docx" ? "[Word] " : "") + (x.label || x.name)) + "</option>"; }).join("");
      return header("Compare versions", "Redline two drafts", "", true) + '<main class="enter"><div class="note glass">Pick the original and the revised draft. PDFs and Word files can be compared with each other. Everything runs on this device.</div>' +
        '<label class="f">Original</label><select class="inp" id="ca">' + opts + '</select><label class="f">Revised</label><select class="inp" id="cb">' + opts + "</select>" +
        '<button class="btn mt2" data-a="docompare">' + ic("cmp", 20, "#04140b", 2.4) + 'Compare</button><button class="btn2 glass mt" data-a="pick">' + ic("plus", 18) + "Add another draft</button></main>";
    }
    var r = c.res, body = r.paras.filter(function (p) { return st.cmpAll || p.some(function (x) { return x.t !== "="; }); }).map(function (p) {
      return '<p class="rl">' + p.map(function (x) { return x.t === "=" ? h(x.s) : x.t === "+" ? "<ins>" + h(x.s) + "</ins>" : "<del>" + h(x.s) + "</del>"; }).join("") + "</p>";
    }).join("") || '<p class="mut">The two versions have the same text.</p>';
    return header("Redline", c.a + " \u2192 " + c.b, "", true) + '<main class="enter"><div class="bento" style="grid-template-columns:1fr 1fr 1fr;grid-template-rows:auto"><div class="tile t3"><small>Added</small><b data-count="' + r.stats.ins + '" style="font-size:1.9rem">0</b></div><div class="tile" style="background:linear-gradient(150deg,#ffb08f,#ff6a3d)"><small>Removed</small><b data-count="' + r.stats.del + '" style="font-size:1.9rem">0</b></div><div class="tile t2"><small>Changed</small><b data-count="' + r.stats.changed + '" style="font-size:1.9rem">0</b></div></div>' +
      '<div class="seg glass mt"><button class="' + (st.cmpAll ? "" : "on") + '" data-a="cmpall" data-v="0">Changes only</button><button class="' + (st.cmpAll ? "on" : "") + '" data-a="cmpall" data-v="1">Full text</button></div>' +
      '<div class="viewer doc mt"><div class="doctext">' + body + "</div></div>" +
      '<button class="btn mt2" data-a="redline">' + ic("share", 20, "#04140b", 2.4) + 'Share redline PDF</button><button class="btn2 glass mt" data-a="newcompare">Compare different files</button></main>';
  }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
  function viewSearch() {
    var f = cur(), q = st.q.trim(), res = [], p = prof();
    if (q.length > 1 && f) f.files.forEach(function (x) {
      var a = st.an[curV(x).key + "|" + sig(p)]; if (!a) return;
      a.pages.forEach(function (pg) { var t = pg.text, i = t.toLowerCase().indexOf(q.toLowerCase()); if (i >= 0 && res.length < 60) res.push({ file: x, page: pg.n, snip: t.slice(Math.max(0, i - 50), i) + "<mark>" + h(t.substr(i, q.length)) + "</mark>" + h(t.slice(i + q.length, i + q.length + 70)), pre: Math.max(0, i - 50) }); });
    });
    return header("Search", f ? f.name : "", "", true) + '<main><input class="inp" id="q" data-a="q" placeholder="Name, number or phrase" value="' + h(st.q) + '" autofocus>' +
      '<p class="xs mut mt">' + (q.length > 1 ? res.length + " result" + (res.length === 1 ? "" : "s") : "Searches the text of every page in this filing, on this device.") + "</p>" +
      res.map(function (r) { return '<button class="res glass" data-a="sres" data-f="' + r.file.id + '" data-p="' + r.page + '"><b class="sm">' + h(r.file.label || r.file.name) + " · page " + r.page + '</b><div class="sm mut" style="margin-top:4px;line-height:1.5">' + (r.pre ? "…" : "") + h(r.snip.split("<mark>")[0]) + "<mark>" + r.snip.split("<mark>")[1] + "…</div></button>"; }).join("") + "</main>";
  }
  function viewRules() {
    var p = prof(), pk = p.pack, rr = pk.r || {};
    var LBL = { ssn: "Social Security number", tin: "Taxpayer ID", acct: "Financial account number", card: "Card number", dob: "Date of birth", minor: "Minor's name", dl: "Driver's license", passport: "Passport", anum: "A-number" };
    var rows = Object.keys(rr).map(function (k) { return '<div class="li"><span class="tx"><b>' + h(LBL[k] || k) + "</b><small>" + h(rr[k].how) + "</small></span>" + (rr[k].must ? '<span class="badge2" style="color:var(--o1)">REQUIRED</span>' : '<span class="badge2">OPTIONAL</span>') + "</div>"; }).join("");
    return header(p.packShort, "Rule pack", "", true) + '<main class="enter"><div class="hero glass"><span class="pill">' + ic("shield", 14, "currentColor", 2.4) + h(p.areaName) + '</span><h2 style="margin-top:12px">' + h(pk.cite || pk.name) + "</h2>" + (pk.url ? '<a class="sm" href="' + h(pk.url) + '" data-ext="1">' + ic("link", 14) + " Open the official rule</a>" : "") +
      (pk.note ? '<p class="sm mut" style="line-height:1.5">' + h(pk.note) + "</p>" : "") + '<p class="xs mut">Sources reviewed ' + h(p.verified) + "</p></div>" +
      (rows ? '<div class="sec"><b>What must be protected</b></div><div class="glass list">' + rows + "</div>" : "") +
      (p.region.law ? '<div class="sec"><b>Data protection</b></div><div class="glass list"><div class="li"><span class="tx"><b>' + h(p.regionName) + "</b><small>" + h(p.region.law) + " · personal data is flagged for review before sharing</small></span>" + (p.region.url ? '<a href="' + h(p.region.url) + '" data-ext="1">' + ic("link", 18) + "</a>" : "") + "</div></div>" : "") +
      '<div class="sec"><b>Filing format</b></div><div class="glass list"><div class="li"><span class="tx"><b>Size limit</b><small>' + (p.maxMB ? p.maxMB + " MB" : "Not set · add your court's limit in Settings") + '</small></span></div><div class="li"><span class="tx"><b>Page size</b><small>' + h(p.pageSize === "letterA4" ? "Letter or A4" : p.pageSize[0].toUpperCase() + p.pageSize.slice(1)) + '</small></span></div><div class="li"><span class="tx"><b>Text-searchable required</b><small>' + (p.requireText ? "Yes" : "Not set") + "</small></span></div></div>" +
      '<div class="note glass mt2">' + h(R.SOURCE_NOTE) + " FileReady is not legal advice.</div></main>";
  }
  function viewSettings() {
    var p = prof(), o = S.over;
    function li(act, t, s, right) { return '<button class="li" data-a="' + act + '"><span class="tx"><b>' + t + "</b><small>" + h(s) + "</small></span>" + (right || ic("chev", 18)) + "</button>"; }
    function tgl(act, on) { return '<span class="tg' + (on ? "" : " off") + '"></span>'; }
    return header("Settings", "FileReady " + V, "", false) + '<main class="enter">' +
      '<div class="sec"><b>Your practice</b></div><div class="glass list">' + li("sname", "Your name", S.name || "Used on reports") + li("sarea", "Practice area", p.areaName) + li("scourt", "Court", R.COURTS[S.court] + (S.court === "state" ? " · " + R.STATES[S.state].name : "")) + li("sregion", "Global data protection", p.regionName) + li("rules", "View rule pack", p.packName) + "</div>" +
      '<div class="sec"><b>Court format</b></div><div class="glass list">' + li("smax", "File size limit", o.maxMB != null ? o.maxMB + " MB" : p.maxMB ? p.maxMB + " MB (rule pack)" : "Not set") + li("spage", "Page size", { letter: "Letter", legal: "Legal", a4: "A4", letterA4: "Letter or A4" }[p.pageSize]) + li("sreq", "Require text-searchable pages", "", tgl("", p.requireText)) + li("sfonts", "Require embedded fonts", "", tgl("", p.fonts)) + "</div>" +
      '<div class="sec"><b>Redaction list</b></div><div class="glass" style="border-radius:24px;padding:14px"><textarea class="inp" id="custom" rows="3" placeholder="One per line: client names, project code names, prices">' + h((S.custom || []).join("\n")) + '</textarea><button class="btn2 glass mt" data-a="scustom">Save list</button></div>' +
      '<div class="sec"><b>Firm settings</b></div><div class="glass list">' + li("sexport", "Share firm settings file", "Practice, court, size limits, redaction list, exhibit and Bates style") + li("simport", "Load a firm settings file", "Use the same setup as your team") + "</div>" +
      '<div class="sec"><b>Online research (optional)</b></div><div class="glass list">' + ['courtlistener', 'uspto'].map(function (kk) { var r = rkey(kk), nm = kk === 'uspto' ? 'USPTO key' : 'CourtListener key'; return li('skey" data-v="' + kk, nm, r ? (r.own ? 'Your own key' : 'Built-in key') + ' · tap to use your own' : 'Not set · tap to add'); }).join('') + li('skeyhelp" data-v="courtlistener', 'Get a free CourtListener key', 'courtlistener.com') + li('skeyhelp" data-v="uspto', 'Get a USPTO key', 'Needs a USPTO.gov account with two-step login') + '</div>' +
      licRow() +
      '<div class="sec"><b>Research examples</b></div><div class="glass list">' + li('sexs', 'Show example prompts', 'Fictional examples on Review a filing and Similar cases', '<span class="tg' + (S.hideEx ? ' off' : '') + '"></span>') + '</div>' +
      '<div class="sec"><b>Labs</b></div><div class="glass list">' + li('slabs', 'Patent check (Labs)', 'Early tool for patent firms. Off by default.', '<span class="tg' + (S.labs ? '' : ' off') + '"></span>') + '</div>' +
      '<div class="sec"><b>Security and look</b></div><div class="glass list">' + li("spin", S.pin ? "Change PIN" : "Set a PIN lock", S.pin ? "Locks when opened and after 2 minutes away" : "Optional · recommended for client files") + (S.pin ? li("spinoff", "Remove PIN", "Open the app without a PIN (asks for your current PIN first)") : "") +
      li("sstyle", "Aurora style", "Animated glow look (dark mode)", tgl("", S.style !== "classic")) + li("stheme", "Light mode", "", tgl("", S.theme === "light")) + li("sbig", "Large text", "", tgl("", S.big)) + "</div>" +
      '<div class="sec"><b>Help</b></div><div class="glass list">' + li("guide", "Interactive guide", "Step-by-step walkthrough") + li("demo\" data-v=\"court", "Load court demo", "Fictional filing with common problems") + li("demo\" data-v=\"deal", "Load deal demo", "Fictional purchase agreement and signature pages") + li("site", "FileReady website", "") + li("reset", "Delete all data on this device", "Filings, files and settings") + "</div>" +
      '<p class="disc">Everything runs on this device. FileReady flags common filing and contract problems; it is not legal advice and does not guarantee a court will accept a filing. Built by Mark Joseph.</p></main>';
  }
  function paintDots() { var d = root.querySelectorAll(".dots i"); if (!d.length) return render(); [].forEach.call(d, function (x, i) { x.className = st.pin.length > i ? "f" : ""; }); }
  function viewLock() {
    var dots = ""; for (var i = 0; i < 4; i++) dots += "<i" + (st.pin.length > i ? ' class="f"' : "") + "></i>";
    var keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, "bio", 0, "del"].map(function (k) { return k === "bio" ? "<span></span>" : k === "del" ? '<button data-a="pdel1" aria-label="Delete">' + ic("back", 24) + "</button>" : '<button class="glass" data-a="pk" data-v="' + k + '">' + k + "</button>"; }).join("");
    return '<div class="lock enter"><div class="logo">' + logo(96) + '</div><h2 style="margin:0">FileReady</h2><p class="mut sm">' + (st.setPin === 3 ? "Enter your current PIN to remove it" : st.setPin ? (st.setPin === 1 ? "Choose a 4-digit PIN" : "Enter it again") : "Enter your PIN") + '</p><div class="dots">' + dots + '</div><div class="pad">' + keys + "</div>" + (st.setPin ? '<button class="mbtn mt2" data-a="pincancel">Cancel</button>' : '<button class="mbtn mt2" data-a="pinforgot">Forgot PIN?</button>') + "</div>";
  }
  var SLIDES = [
    ["Every filing,<br>court-ready.", "FileReady checks PDFs before you file or send them: hidden text under black boxes, Social Security numbers, blank and sideways pages, size limits and more.", "ring"],
    ["Private by design.", "Your documents never leave this device. No accounts, no uploads, no cloud. Add a PIN lock if you want one.", "lock"],
    ["Rules for all 50 states.", "Federal courts, every state and D.C., the USPTO, and data-protection checks for 8 regions, each linked to its source. Plus contract, binder and signature-packet tools for deal work.", "globe"]
  ];
  function viewOnb() {
    var i = st.onb;
    if (i < 3) {
      var s = SLIDES[i], art = s[2] === "ring" ? '<div style="position:relative">' + ringSvg(100, 230) + "</div>" : s[2] === "lock" ? '<div style="width:200px;height:200px;border-radius:56px;overflow:hidden;filter:drop-shadow(0 0 40px rgba(78,240,154,.5))">' + logo(200) + "</div>" :
        '<div class="bento" style="width:280px;grid-template-rows:90px 90px"><div class="tile t1"><small>States</small><b style="font-size:3.4rem">51</b></div><div class="tile t2"><small>Regions</small><b>8</b></div><div class="tile t3"><small>Practice areas</small><b>8</b></div></div>';
      return '<div class="onb enter"><div class="art">' + art + '</div><div class="prog3">' + [0, 1, 2].map(function (k) { return "<i" + (k === i ? ' class="on"' : "") + "></i>"; }).join("") + "</div><h1>" + s[0] + "</h1><p>" + h(s[1]) + '</p><button class="btn" data-a="onext">' + (i < 2 ? "Next" : "Set up FileReady") + '</button><button class="btn2 mt" data-a="oskip" style="color:var(--mut)">Skip</button></div>';
    }
    var areas = Object.keys(R.AREAS).map(function (k) { var a = R.AREAS[k]; return '<button class="glass' + (S.area === k ? " on" : "") + '" data-a="oarea" data-v="' + k + '"><span class="ci gG">' + ic(a.icon, 20, "#04140b") + "</span>" + h(a.name) + "</button>"; }).join("");
    return '<div class="onb enter" style="padding-top:40px"><h1 style="font-size:1.8rem">Set up your practice</h1><p>You can change these any time in Settings.</p>' +
      '<label class="f">Your name</label><input class="inp" id="oname" placeholder="Name for reports" value="' + h(S.name) + '">' +
      '<label class="f">Practice area</label><div class="choice">' + areas + "</div>" +
      '<label class="f">Where you file</label><select class="inp" id="ocourt">' + Object.keys(R.COURTS).map(function (k) { return '<option value="' + k + '"' + (S.court === k ? " selected" : "") + ">" + R.COURTS[k] + "</option>"; }).join("") + "</select>" +
      '<label class="f">State</label><select class="inp" id="ostate">' + Object.keys(R.STATES).sort(function (a, b) { return R.STATES[a].name < R.STATES[b].name ? -1 : 1; }).map(function (k) { return '<option value="' + k + '"' + (S.state === k ? " selected" : "") + ">" + R.STATES[k].name + "</option>"; }).join("") + "</select>" +
      '<label class="f">Global data protection</label><select class="inp" id="oregion">' + Object.keys(R.REGIONS).map(function (k) { return '<option value="' + k + '"' + ((S.region || "none") === k ? " selected" : "") + ">" + R.REGIONS[k].name + "</option>"; }).join("") + "</select>" +
      '<button class="btn mt2" data-a="ofinish">Start using FileReady</button><p class="disc">FileReady flags common problems. It is not legal advice.</p></div>';
  }

  /* ---------- sheets ---------- */
  function sheet(html) { closeSheet(); var b = document.createElement("div"); b.className = "sheetbg"; b.innerHTML = '<div class="sheet" role="dialog"><div class="grab"></div>' + html + "</div>"; b.addEventListener("click", function (e) { if (e.target === b) closeSheet(); }); document.body.appendChild(b); return b; }
  function closeSheet() { var s = document.querySelector(".sheetbg"); if (s) s.remove(); }
  function choiceSheet(title, items, cur, cb) {
    var b = sheet("<h3>" + h(title) + '</h3><div class="choice mt">' + items.map(function (it) { return '<button class="glass' + (it[0] === cur ? " on" : "") + '" data-k="' + h(it[0]) + '">' + (it[2] ? '<span class="ci gG">' + ic(it[2], 20, "#04140b") + "</span>" : "") + h(it[1]) + "</button>"; }).join("") + "</div>");
    b.querySelectorAll("[data-k]").forEach(function (el) { el.addEventListener("click", function () { closeSheet(); cb(el.getAttribute("data-k")); }); });
  }
  function inputSheet(title, val, ph, cb, mode) {
    var b = sheet("<h3>" + h(title) + '</h3><input class="inp mt" id="si" ' + (mode ? 'inputmode="' + mode + '" ' : "") + 'placeholder="' + h(ph || "") + '" value="' + h(val || "") + '"><button class="btn mt" id="sok">Save</button>');
    var inp = b.querySelector("#si"); setTimeout(function () { inp.focus(); }, 60);
    b.querySelector("#sok").addEventListener("click", function () { closeSheet(); cb(inp.value); });
  }
  function addSheet() {
    var f = cur();
    var b = sheet('<h3>Add</h3><p class="mut sm" style="margin:0 0 10px">' + (f ? "Adding to “" + h(f.name) + "”" : "Starts a new filing") + '</p><div class="choice"><button class="glass" data-k="pick"><span class="ci gG">' + ic("file", 20, "#04140b") + '</span>Add PDFs from this phone</button><button class="glass" data-k="new"><span class="ci gP">' + ic("plus", 20, "#04140b") + '</span>Start a new filing</button><button class="glass" data-k="court"><span class="ci gY">' + ic("scale", 20, "#04140b") + '</span>Court demo (fictional)</button><button class="glass" data-k="deal"><span class="ci gO">' + ic("brief", 20, "#04140b") + "</span>Deal demo (fictional)</button></div>");
    b.querySelectorAll("[data-k]").forEach(function (el) { el.addEventListener("click", async function () { var k = el.getAttribute("data-k"); closeSheet(); if (k === "pick") picker.click(); else if (k === "new") { await newFiling(); st.tab = "files"; render(); picker.click(); } else loadDemo(k); }); });
  }
  function renameSheet(file) { inputSheet("Rename file", file.label || file.name, "", async function (v) { if (!v.trim()) return; var f = cur(); file.label = v.trim(); file.name = clean(v) + ".pdf"; await saveF(f); await runCheck(true); }); }
  async function loadDemo(kind) {
    st.busy = "Making demo files"; render();
    var files = kind === "deal" ? await E.demoDeal() : await E.demo();
    var f = await newFiling(kind === "deal" ? "Northwind asset purchase (demo)" : "Sample v. Example (demo)");
    if (kind === "deal" && S.area !== "business") { S.area = "business"; if (S.court === "state") S.court = "none"; if (!S.region || S.region === "none") S.region = "all"; saveS(); toast("Switched to Business mode for the deal demo"); }
    await addFiles(files.map(function (x) { return { bytes: x.bytes, name: x.name, label: x.label || x.name.replace(/\.(pdf|docx)$/i, ""), role: x.role, desc: x.desc }; }));
    f.name = kind === "deal" ? "Northwind asset purchase (demo)" : "Sample v. Example (demo)"; await saveF(f); render(true);
  }

  /* ---------- viewer ---------- */
  async function openIssue(x) {
    var f = cur(), file = f.files.filter(function (y) { return y.id === x.file; })[0]; if (!file) return;
    st.view = { issue: x, fileId: file.id, page: x.page || 1, label: file.label || file.name, img: null, docx: file.kind === "docx" }; st.screen = "viewer"; render();
    loadView();
  }
  async function loadView() {
    var v = st.view, f = cur(), file = f.files.filter(function (y) { return y.id === v.fileId; })[0];
    if (file.kind === "docx") { var an = await analysisFor(file, prof()); if (st.view !== v) return; v.docx = true; v.count = an.pages.length; var pgx = an.pages[v.page - 1] || an.pages[0]; v.text = pgx.text; v.img = { docx: 1 }; if (v.issue && v.issue.page && v.issue.page !== v.page) v.issue = null; render(); return; }
    var img = await E.pageImage(await blob(curV(file).key), v.page, Math.min(1400, Math.round(window.innerWidth * (window.devicePixelRatio || 1) * 1.1)));
    if (st.view !== v) return; v.img = img; v.count = img.count; if (v.issue && v.issue.page && v.issue.page !== v.page) v.issue = null; render();
  }

  /* ---------- thumbnails ---------- */
  var thumbCache = {}, thumbQ = Promise.resolve();
  function thumbs() {
    [].forEach.call(document.querySelectorAll("[data-thumb]"), function (el) {
      var k = el.getAttribute("data-thumb");
      if (thumbCache[k]) { el.innerHTML = '<img alt="" src="' + thumbCache[k] + '">'; return; }
      thumbQ = thumbQ.then(async function () { if (!thumbCache[k]) { var b = await blob(k); if (b) thumbCache[k] = (await E.pageImage(b, 1, 260)).url; } if (el.isConnected && thumbCache[k]) el.innerHTML = '<img alt="" src="' + thumbCache[k] + '">'; }).catch(function () { /* ignore */ });
    });
    [].forEach.call(document.querySelectorAll("img[data-pg]"), function (el) {
      var kk = el.getAttribute("data-pg"), parts = kk.split(":");
      if (thumbCache[kk]) { el.src = thumbCache[kk]; return; }
      thumbQ = thumbQ.then(async function () { if (!el.isConnected) return; if (!thumbCache[kk]) { var b = await blob(parts[0]); thumbCache[kk] = (await E.pageImage(b, +parts[1], 300)).url; } el.src = thumbCache[kk]; }).catch(function () { /* ignore */ });
    });
  }

  /* ---------- render ---------- */
  document.addEventListener("pointermove", function (e) {
    if (!document.documentElement.classList.contains("aurora") || e.pointerType === "touch" && !e.isPrimary) return;
    var hh = e.target.closest && e.target.closest(".hero"); if (!hh) return;
    var r = hh.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    hh.style.transform = "perspective(900px) rotateX(" + (-y * 6).toFixed(2) + "deg) rotateY(" + (x * 7).toFixed(2) + "deg)";
  }, { passive: true });
  document.addEventListener("pointerout", function (e) { var hh = e.target.closest && e.target.closest(".hero"); if (hh && !hh.contains(e.relatedTarget)) hh.style.transform = ""; }, { passive: true });
  var lastKey = "";
  function render(animate) {
    var html;
    /* Animate only when the screen changes, not on every tap (stops the shaking on the PIN pad, toggles and lists). */
    var key = !S.onboarded ? "onb" + st.onb : (S.pin && !st.unlocked) || st.setPin ? "lock" + (st.setPin || 0) : st.busy ? "busy" : (st.screen || "") + "|" + st.tab + "|" + st.fid;
    var still = key === lastKey && !animate, showNav = false; lastKey = key;
    root.classList.toggle("still", still);
    if (!S.onboarded) html = viewOnb();
    else if ((S.pin && !st.unlocked) || st.setPin) html = viewLock();
    else if (st.busy) { html = busyView(); showNav = true; }
    else {
      var s = st.screen;
      html = (s === "issues" ? viewIssues() : s === "viewer" ? viewViewer() : s === "pages" ? viewPages() : s === "search" ? viewSearch() : s === "rules" ? viewRules() : s === "built" ? viewBuilt() : s === "ready" ? viewReady() : s === "packets" ? viewPackets() : s === "checklist" ? viewChecklist() : s === "research" ? viewResearch() : s === "rxpat" ? viewPatent() : s === "rxcase" ? viewCases() : s === "rxrev" ? viewReview() : s === "rxread" ? viewReader() : s === "compare" ? viewCompare() :
        st.tab === "files" ? viewFiles() : st.tab === "exhibits" ? viewBuild() : st.tab === "settings" ? viewSettings() : viewHome()); showNav = true;
    }
    if (IOS && !STANDALONE && !window.Capacitor && S.onboarded && !(S.pin && !st.unlocked) && !st.setPin && !st.screen && st.tab === "check" && !st.busy && !(function () { try { return localStorage.getItem("fr.iosTip"); } catch (e) { return 1; } })())
      html += '<div class="iostip glass"><span class="ic gG">' + ic("share", 18, "#04140b") + '</span><div><b>Install on your iPhone</b><small>Tap <b>Share</b> in Safari, then <b>Add to Home Screen</b>. FileReady then opens like an app and works offline.</small></div><button data-a="iostip" aria-label="Close">' + ic("x", 18) + "</button></div>";
    root.innerHTML = html;
    syncNav(showNav);
    requestAnimationFrame(function () {
      [].forEach.call(root.querySelectorAll(".arc"), function (a) { if (still) a.style.transition = "none"; a.style.strokeDashoffset = a.getAttribute("data-to"); });
      [].forEach.call(root.querySelectorAll("[data-count]"), function (el) {
        var to = +el.getAttribute("data-count"), t0 = performance.now(), d = 900;
        if (still) { el.textContent = to; return; }
        (function step(t) { var k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(to * e); if (k < 1) requestAnimationFrame(step); })(t0);
      });
    });
    thumbs();
    var q = document.getElementById("q"); if (q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
  }

  /* ---------- events ---------- */
  root.addEventListener("click", async function (e) {
    var ext = e.target.closest("a[data-ext]");
    if (ext) { e.preventDefault(); openUrl(ext.href); return; }
    var el = e.target.closest("[data-a]"); if (!el) return;
    var a = el.getAttribute("data-a"), v = el.getAttribute("data-v"), f = cur();
    if (["desc", "bprefix", "bstart", "q"].indexOf(a) >= 0) return;
    if (a === "iostip") { try { localStorage.setItem("fr.iosTip", "1"); } catch (e) { } render(); return; }
    if (a === "tab") { st.tab = v; st.screen = null; render(); return; }
    if (a === "back") { st.screen = st.screen === "viewer" && st.prev ? st.prev : st.screen === "rxread" ? (st.rx && st.rx.from) || "research" : /^rx/.test(st.screen || "") ? "research" : null; st.prev = null; render(); return; }
    if (a === "add") return addSheet();
    if (a === "pick") return picker.click();
    if (a === "demo") return loadDemo(v);
    if (a === "issues") { st.filter = v || "all"; st.screen = "issues"; render(); return; }
    if (a === "filter") { st.filter = v; render(); return; }
    if (a === "open" || a === "fix") {
      var x = f.result.issues[+el.getAttribute("data-i")]; st.prev = st.screen;
      if (a === "fix" && (SAFE[x.fix] || x.fix === "split" || x.fix === "flattenAll" || x.fix === "rename" || x.fix === "ocr")) { st.busy = "Fixing"; render(); await doFix(x); return; }
      return openIssue(x);
    }
    if (a === "vfix") { var vx = st.view.issue; st.busy = "Fixing"; render(); await doFix(vx); return; }
    if (a === "vdismiss") return dismiss(st.view.issue);
    if (a === "vpage") { var nv = st.view.page + +v; if (nv < 1 || (st.view.count && nv > st.view.count)) return; st.view.page = nv; st.view.img = null; if (st.view.issue && st.view.issue.page !== nv) st.view.issue = null; render(); loadView(); return; }
    if (a === "fixall") return fixAll();
    if (a === "scrubAll") { var hs = f && f.result ? f.result.issues.filter(function (i) { return i.fix === "scrub"; }) : []; if (!hs.length) return toast("No hidden data found"); st.busy = "Removing hidden data"; render(); for (var j = 0; j < hs.length; j++) await doFix(hs[j], { batch: true }); await saveF(f); buzz("ok"); toast("Hidden data removed"); return runCheck(true); }
    if (a === "report") return report();
    if (a === "compare") { if (!f || f.files.length < 2) return toast("Add two drafts to compare"); st.cmp = null; st.screen = "compare"; render(); var cb = document.getElementById("cb"); if (cb) cb.value = f.files[f.files.length - 1].id; return; }
    if (a === "docompare") return runCompare(document.getElementById("ca").value, document.getElementById("cb").value);
    if (a === "newcompare") { st.cmp = null; render(); return; }
    if (a === "cmpall") { st.cmpAll = v === "1"; render(); return; }
    if (a === "redline") return saveRedline();
    if (a === "sexport") return exportSettings();
    if (a === "simport") return setPicker.click();
    if (a === "slic") return inputSheet("License code", "", "Paste the code you received (starts with FR1.)", async function (nv) { nv = nv.trim(); if (!nv) return; try { var L = await verifyLicense(nv); S.license = nv; saveS(); st.lic = L; buzz("ok"); render(); toast(L.expired ? "This license has expired (" + L.until + ")" : "Licensed to " + L.firm + " until " + L.until); } catch (e) { toast(e.message || "This code is not valid"); } });
    if (a === "slicoff") { S.license = ""; st.lic = null; saveS(); render(); toast("License code removed"); return; }
    if (a === "sexs") { S.hideEx = !S.hideEx; saveS(); render(); return; }
    if (a === "slabs") { S.labs = !S.labs; saveS(); buzz(); render(); toast(S.labs ? "Patent check turned on under Research" : "Patent check hidden"); return; }
    if (a === "research") { st.screen = "research"; render(); return; }
    if (a === "rxpat" || a === "rxcase" || a === "rxrev") { if (st.screen === "rxrev" && a === "rxrev") return rxRead("rev"); st.rx = { side: "theirs" }; st.screen = a; render(); return; }
    if (a === "rxpread") return rxRead("pat");
    if (a === "rxcread") return rxRead("case");
    if (a === "rxside") { st.rx = st.rx || {}; var sf = document.getElementById("rxf"), stx = document.getElementById("rxt"); if (sf) st.rx.file = sf.value; if (stx) st.rx.text = stx.value; st.rx.side = v; render(); return; }
    if (a === "rxkw") { st.rx.pat.keys.splice(+v, 1); render(); return; }
    if (a === "rxpsearch") return rxPatSearch();
    if (a === "rxcsearch") return rxCaseSearch();
    if (a === "rxgp") { var ad = document.getElementById("rxadd"); if (ad && ad.value.trim()) st.rx.pat.keys.push(ad.value.trim()); return openUrl(X.googlePatentsUrl(st.rx.pat.keys)); }
    if (a === "rxcl") { var qq = document.getElementById("rxq"); if (qq) st.rx.cs.q = qq.value; return openUrl(X.courtListenerUrl(st.rx.cs.q, st.rx.court || "")); }
    if (a === "rxopen") return openUrl(v);
    if (a === "rxex") { var tx = document.getElementById("rxt"), fsel = document.getElementById("rxf"), ex = RX_EX[st.screen] && RX_EX[st.screen][+v]; if (!ex || !tx) return; st.rx = st.rx || {}; st.rx.text = ex[1]; st.rx.file = ""; if (fsel) fsel.value = ""; if (st.screen === "rxrev") st.rx.side = /^Our/.test(ex[0]) ? "ours" : "theirs"; render(); return; }
    if (a === "rxclear") { st.rx = st.rx || {}; st.rx.text = ""; var t2 = document.getElementById("rxt"); if (t2) { t2.value = ""; t2.focus(); } return; }
    if (a === "rxexhide" || a === "rxexshow") { var t3 = document.getElementById("rxt"), f3 = document.getElementById("rxf"); st.rx = st.rx || {}; if (t3) st.rx.text = t3.value; if (f3) st.rx.file = f3.value; S.hideEx = a === "rxexhide"; saveS(); render(); return; }
    if (a === "rxpread1") return rxOpenPatent(+v);
    if (a === "rxcread1") return rxOpenCase(+v);
    if (a === "rxcopy") { var cc = st.rx.doc.cite || ""; try { await navigator.clipboard.writeText(cc); toast("Citation copied"); } catch (e) { inputSheet("Citation", cc, "", function () { }); } return; }
    if (a === "rxfindin") return inputSheet("Find in text", st.rx.doc.find || "", "Word or phrase", function (nv) { st.rx.doc.find = nv.trim(); render(); var m = document.querySelector(".reader mark"); if (m) m.scrollIntoView({ block: "center" }); else if (nv.trim()) toast("Not found"); });
    if (a === "rxreset") { st.rx = { side: (st.rx || {}).side || "theirs" }; render(true); return; }
    if (a === "rxfind") { var fd = st.rx.rev.findings[+v]; st.rx = { cs: { issues: [], keys: fd.q.split(" "), q: fd.q, focus: fd.title + " " + fd.why + " " + fd.q } }; st.screen = "rxcase"; render(true); if (rkey("courtlistener")) rxCaseSearch(); return; }
    if (a === "skey") { var kk = v, names = { courtlistener: "CourtListener API token", uspto: "USPTO Open Data Portal API key" }; return inputSheet(names[kk], (S.keys || {})[kk] || "", "Leave empty to use the built-in key", function (nv) { S.keys = S.keys || {}; S.keys[kk] = nv.trim(); saveS(); render(); toast(nv.trim() ? "Your key is saved on this device" : "Using the built-in key"); }); }
    if (a === "skeyhelp") return openUrl(v === "uspto" ? "https://data.uspto.gov/apis/getting-started" : "https://www.courtlistener.com/help/api/rest/");
    if (a === "packets") return packets();
    if (a === "sigview") { st.screen = "packets"; render(); return; }
    if (a === "sigadd") { st.sigFor = +v; sigPicker.click(); return; }
    if (a === "assemble") return assemble();
    if (a === "checklist") { syncChecklist(f); await saveF(f); st.screen = "checklist"; render(); return; }
    if (a === "clstat") { var ci = f.checklist.filter(function (c) { return c.id === v; })[0]; ci.status = { "To do": "Waiting", "Waiting": "Done", "Done": "To do" }[ci.status] || "To do"; await saveF(f); buzz(); render(); return; }
    if (a === "clwho") { var cw = f.checklist.filter(function (c) { return c.id === v; })[0]; return inputSheet("Who is responsible?", cw.who || "", "Name, firm or side", async function (nv) { cw.who = nv.trim().slice(0, 40); await saveF(f); render(); }); }
    if (a === "cladd") return inputSheet("New checklist item", "", "e.g. Officer's certificate, wire confirmation", async function (nv) { if (!nv.trim()) return; f.checklist.push({ id: uid(), fileId: null, title: nv.trim().slice(0, 120), who: "", status: "To do" }); await saveF(f); render(); });
    if (a === "cldel") { f.checklist = f.checklist.filter(function (c) { return c.id !== v; }); await saveF(f); render(); return; }
    if (a === "clpdf") return checklistShare();
    if (a === "clbinder") { S.ex.binder = true; S.ex.checklist = true; saveS(); st.screen = null; st.tab = "exhibits"; render(); return build(); }
    if (a === "search") { st.screen = "search"; render(); return; }
    if (a === "sres") { var file = f.files.filter(function (y) { return y.id === el.getAttribute("data-f"); })[0]; st.prev = "search"; st.view = { issue: null, fileId: file.id, page: +el.getAttribute("data-p"), label: file.label || file.name, img: null }; st.screen = "viewer"; render(); loadView(); return; }
    if (a === "rules") { st.screen = "rules"; render(); return; }
    if (a === "rename") return inputSheet("Filing name", f.name, "", async function (nv2) { if (nv2.trim()) { f.name = nv2.trim(); await saveF(f); render(); } });
    if (a === "newfiling") { await newFiling(); st.tab = "files"; render(); return; }
    if (a === "pickfiling") { st.fid = v; st.screen = null; render(); if (cur() && !cur().result && cur().files.length) runCheck(); return; }
    if (a === "role") { var fr = byId(v); fr.role = fr.role === "main" ? "exhibit" : "main"; await saveF(f); render(); return; }
    if (a === "mv") { var fm = byId(v), i0 = f.files.indexOf(fm), i1 = i0 + +el.getAttribute("data-d"); if (i1 < 0 || i1 >= f.files.length) return; f.files.splice(i0, 1); f.files.splice(i1, 0, fm); await saveF(f); buzz(); render(); return; }
    if (a === "undo") return undo(byId(v));
    if (a === "rmfile") { var fx = byId(v); if (!confirmSheet) return; return confirmSheet("Remove “" + (fx.label || fx.name) + "” from this filing?", async function () { f.files.splice(f.files.indexOf(fx), 1); log(f, "Removed " + fx.name); await saveF(f); await runCheck(true); }); }
    if (a === "sharefile") { var fs = byId(v); return share(await blob(curV(fs).key), (fs.label || fs.name).replace(/\.(pdf|docx)$/i, "") + (fs.kind === "docx" ? ".docx" : ".pdf")); }
    if (a === "pages") { st.pagesFile = v; st.sel = {}; st.screen = "pages"; render(); return; }
    if (a === "sel") { if (st.sel[v]) delete st.sel[v]; else st.sel[v] = 1; buzz(); render(); return; }
    if (a === "prot" || a === "pdel" || a === "pmove") return pageAction(a, +v);
    if (a === "style") { S.ex.style = v; saveS(); render(); return; }
    if (a === "mode") { S.ex.binder = v === "binder"; saveS(); render(); return; }
    if (a === "tg") { var o = el.getAttribute("data-o"); S[o][v] = !S[o][v]; saveS(); buzz(); render(); return; }
    if (a === "bpos") { S.bates.pos = v; saveS(); render(); return; }
    if (a === "build") return build();
    if (a === "oshare" || a === "osave") { var out = (f.outputs || []).filter(function (x) { return x.id === v; })[0]; if (!out) return; var by = await blob(out.key); return a === "oshare" ? share(by, out.name) : saveFile(by, out.name); }
    if (a === "checkout") { var lo = f.outputs[0]; var g = await newFiling(lo.name.replace(/\.pdf$/i, "") + " (check)"); await addFiles([{ bytes: await blob(lo.key), name: lo.name, role: "main" }]); return; }
    // settings
    if (a === "sname") return inputSheet("Your name", S.name, "Name for reports", function (x) { S.name = x.trim(); saveS(); render(); });
    if (a === "sarea") return choiceSheet("Practice area", Object.keys(R.AREAS).map(function (k) { return [k, R.AREAS[k].name, R.AREAS[k].icon]; }), S.area, function (k) { S.area = k; saveS(); recheck(); });
    if (a === "scourt") return choiceSheet("Where you file", Object.keys(R.COURTS).map(function (k) { return [k, R.COURTS[k]]; }), S.court, function (k) { S.court = k; saveS(); if (k === "state") return stateSheet(); recheck(); });
    if (a === "sregion") return choiceSheet("Global data protection", Object.keys(R.REGIONS).map(function (k) { return [k, R.REGIONS[k].name + (R.REGIONS[k].law ? " · " + R.REGIONS[k].law : "")]; }), S.region || "none", function (k) { S.region = k; saveS(); recheck(); });
    if (a === "smax") return inputSheet("File size limit (MB)", S.over.maxMB != null ? S.over.maxMB : "", "Leave blank to use the rule pack", function (x) { if (x.trim() === "") delete S.over.maxMB; else S.over.maxMB = Math.max(1, parseFloat(x) || 25); saveS(); recheck(); }, "decimal");
    if (a === "spage") return choiceSheet("Page size", [["letter", "Letter (8.5 × 11 in)"], ["legal", "Legal (8.5 × 14 in)"], ["a4", "A4"], ["letterA4", "Letter or A4"]], prof().pageSize, function (k) { S.over.pageSize = k; saveS(); recheck(); });
    if (a === "sreq") { S.over.requireText = !prof().requireText; saveS(); recheck(); return; }
    if (a === "sfonts") { S.over.fonts = !prof().fonts; saveS(); recheck(); return; }
    if (a === "scustom") { S.custom = (document.getElementById("custom").value || "").split(/\n/).map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 60); saveS(); toast("Redaction list saved"); recheck(); return; }
    if (a === "spin") { st.setPin = 1; st.pin = ""; render(); return; }
    if (a === "spinoff") { st.setPin = 3; st.pin = ""; render(); return; }
    if (a === "pinforgot") return confirmSheet("Forgot your PIN? The only way back in is to erase FileReady on this device: every filing, file and setting. Erase it?", async function () { for (var s2 of ["filings", "blobs", "an"]) await tx(s2, "readwrite", function (o) { o.clear(); }); try { localStorage.removeItem("fr.settings"); localStorage.removeItem("fr.lock"); } catch (e) { } location.reload(); });
    if (a === "sstyle") { S.style = S.style === "classic" ? "aurora" : "classic"; saveS(); applyLook(); render(); return; }
    if (a === "stheme") { S.theme = S.theme === "light" ? "dark" : "light"; saveS(); applyLook(); render(); return; }
    if (a === "sbig") { S.big = !S.big; saveS(); applyLook(); render(); return; }
    if (a === "guide") return openUrl("guide.html");
    if (a === "site") return openUrl("https://quuxin2-a11y.github.io/fileready/site.html");
    if (a === "reset") return confirmSheet("Delete every filing, file and setting on this device?", async function () { for (var s of ["filings", "blobs", "an"]) await tx(s, "readwrite", function (x) { return x.clear(); }); localStorage.removeItem("fr.settings"); location.reload(); });
    // onboarding
    if (a === "onext") { st.onb++; render(); return; }
    if (a === "oskip") { st.onb = 3; render(); return; }
    if (a === "oarea") { S.area = v; [].forEach.call(root.querySelectorAll('[data-a="oarea"]'), function (b) { b.classList.toggle("on", b.getAttribute("data-v") === v); }); if (v === "business" && document.getElementById("ocourt").value === "state") { document.getElementById("ocourt").value = "none"; document.getElementById("oregion").value = "all"; } if (v === "ip") document.getElementById("ocourt").value = "uspto"; if (v === "bankruptcy") document.getElementById("ocourt").value = "federal"; return; }
    if (a === "ofinish") { S.name = document.getElementById("oname").value.trim(); S.court = document.getElementById("ocourt").value; S.state = document.getElementById("ostate").value; S.region = document.getElementById("oregion").value; S.onboarded = true; saveS(); st.unlocked = true; buzz("ok"); render(true); return; }
    // lock
    if (a === "pk") { if (st.pin.length < 4) { st.pin += v; buzz(); paintDots(); if (st.pin.length === 4) setTimeout(pinDone, 60); } return; }
    if (a === "pdel1") { st.pin = st.pin.slice(0, -1); paintDots(); return; }
    if (a === "pincancel") { st.setPin = 0; st.pin = ""; render(); return; }
  });
  root.addEventListener("input", function (e) {
    var el = e.target, a = el.getAttribute("data-a"), f = cur();
    if (a === "desc") { var x = byId(el.getAttribute("data-v")); x.desc = el.value; clearTimeout(el._t); el._t = setTimeout(function () { saveF(f); }, 400); }
    if (a === "bprefix") { S.bates.prefix = el.value.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 12).toUpperCase(); saveS(); }
    if (a === "bstart") { S.bates.start = Math.max(1, parseInt(el.value, 10) || 1); saveS(); }
    if (a === "q") { st.q = el.value; clearTimeout(el._t); el._t = setTimeout(render, 250); }
  });
  root.addEventListener("change", async function (e) {
    var el = e.target, a = el.getAttribute("data-a"); if (a === "bprefix" || a === "bstart") render();
    if (a === "sigmap") { var f = cur(), sg = f.sig.signers[+el.getAttribute("data-s")]; sg.signed.map[+el.getAttribute("data-k")] = +el.value; await saveF(f); render(); }
  });
  function byId(id) { return cur().files.filter(function (x) { return x.id === id; })[0]; }
  function confirmSheet(msg, cb) { var b = sheet("<h3>" + h(msg) + '</h3><div class="row2 mt2"><button class="btn2 glass" id="cno">Cancel</button><button class="btn" id="cyes" style="background:linear-gradient(145deg,#ffb08f,#ff6a3d);box-shadow:none">Yes</button></div>'); b.querySelector("#cno").onclick = closeSheet; b.querySelector("#cyes").onclick = function () { closeSheet(); cb(); }; }
  function stateSheet() { choiceSheet("State", Object.keys(R.STATES).sort(function (a, b) { return R.STATES[a].name < R.STATES[b].name ? -1 : 1; }).map(function (k) { return [k, R.STATES[k].name + " · " + R.STATES[k].cite]; }), S.state, function (k) { S.state = k; saveS(); recheck(); }); }
  function recheck() { st.an = {}; render(); if (cur() && cur().files.length) runCheck(true); }
  async function pageAction(a, v) {
    var f = cur(), file = byId(st.pagesFile), sel = Object.keys(st.sel).map(Number).sort(function (x, y) { return x - y; });
    if (!sel.length) return toast("Select pages first");
    var b = await blob(curV(file).key), out, label;
    st.busy = "Updating pages"; render();
    if (a === "prot") { out = await E.rotatePages(b, sel, v); label = "Turned page" + (sel.length > 1 ? "s " : " ") + sel.join(", "); }
    else if (a === "pdel") { if (sel.length >= curV(file).pages) { st.busy = ""; render(); return toast("Keep at least one page"); } out = await E.removePages(b, sel); label = "Deleted page" + (sel.length > 1 ? "s " : " ") + sel.join(", "); st.sel = {}; }
    else { if (sel.length !== 1 || sel[0] === 1) { st.busy = ""; render(); return toast("Select one page (not the first) to move up"); } out = await E.movePage(b, sel[0], sel[0] - 1); label = "Moved page " + sel[0] + " up"; st.sel = {}; st.sel[sel[0] - 1] = 1; }
    await newVersion(f, file, out, label); await saveF(f); buzz("ok"); toast(label); st.busy = ""; render(); runCheck(true).then(function () { st.screen = "pages"; render(); });
  }
  /* PIN: PBKDF2-SHA256 with a random salt, attempt limits and auto-lock. The PIN guards the app screen; files rely on the device's own encryption. */
  var PIN_ITER = 60000;
  function hex(u) { return [].map.call(u, function (x) { return ("0" + x.toString(16)).slice(-2); }).join(""); }
  function unhex(x) { var u = new Uint8Array(x.length / 2); for (var i = 0; i < u.length; i++) u[i] = parseInt(x.substr(i * 2, 2), 16); return u; }
  async function pbk(p, salt, it) { var k = await crypto.subtle.importKey("raw", new TextEncoder().encode(p), "PBKDF2", false, ["deriveBits"]); return hex(new Uint8Array(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: salt, iterations: it || PIN_ITER }, k, 256))); }
  async function pinHash(p) { var salt = crypto.getRandomValues(new Uint8Array(16)); return "p3$" + PIN_ITER + "$" + hex(salt) + "$" + (await pbk(p, salt, PIN_ITER)); }
  async function pinOk(p) {
    var a = S.pin.split("$"), ok;
    if (a[0] === "p3") ok = eqc(await pbk(p, unhex(a[2]), +a[1]), a[3]);
    else if (a[0] === "p2") ok = eqc(await pbk(p, unhex(a[1]), 210000), a[2]);
    else ok = eqc(hex(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode("fileready:" + p)))), S.pin);
    if (ok && (a[0] !== "p3" || +a[1] !== PIN_ITER)) { S.pin = await pinHash(p); saveS(); } /* upgrade older formats */
    return ok;
  }
  function eqc(a, b) { if (!a || !b || a.length !== b.length) return false; var r = 0; for (var i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }
  function lockState() { try { return JSON.parse(localStorage.getItem("fr.lock") || "{}"); } catch (e) { return {}; } }
  function setLockState(o) { try { localStorage.setItem("fr.lock", JSON.stringify(o)); } catch (e) { } }
  async function pinDone() {
    var p = st.pin; st.pin = "";
    if (!(window.crypto && crypto.subtle)) { toast("This browser cannot store a PIN safely. Use the Android app or a secure (https) page."); render(); return; }
    if (st.setPin === 3) { var Lr = lockState(); if (Lr.until && Date.now() < Lr.until) { toast("Too many tries. Wait " + Math.ceil((Lr.until - Date.now()) / 1000) + " seconds."); render(); return; } if (await pinOk(p)) { S.pin = ""; saveS(); setLockState({}); st.setPin = 0; buzz("ok"); toast("PIN removed"); } else { Lr.n = (Lr.n || 0) + 1; if (Lr.n >= 5) Lr.until = Date.now() + Math.min(3600, 30 * Math.pow(2, Lr.n - 5)) * 1000; setLockState(Lr); buzz(); toast("Wrong PIN"); } render(); return; }
    if (st.setPin === 1) { st.firstPin = p; st.setPin = 2; render(); return; }
    if (st.setPin === 2) { if (p === st.firstPin) { S.pin = await pinHash(p); st.firstPin = ""; saveS(); setLockState({}); st.setPin = 0; st.unlocked = true; buzz("ok"); toast("PIN set"); } else { st.setPin = 1; st.firstPin = ""; toast("PINs did not match. Try again."); } render(); return; }
    var L = lockState(), now = Date.now();
    if (L.until && now < L.until) { toast("Too many tries. Wait " + Math.ceil((L.until - now) / 1000) + " seconds."); render(); return; }
    if (await pinOk(p)) { setLockState({}); st.unlocked = true; buzz("ok"); render(true); return; }
    L.n = (L.n || 0) + 1; if (L.n >= 5) { L.until = now + Math.min(3600, 30 * Math.pow(2, L.n - 5)) * 1000; }
    setLockState(L); buzz(); toast(L.until && L.until > now ? "Wrong PIN. Locked for " + Math.round((L.until - now) / 1000) + " seconds." : "Wrong PIN (" + L.n + " of 5)"); render();
  }
  var hiddenAt = 0;
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { hiddenAt = Date.now(); return; }
    if (S.pin && st.unlocked && hiddenAt && Date.now() - hiddenAt > 120000) { st.unlocked = false; closeSheet(); render(); }
  });
  function openUrl(u) {
    var IAB = plug("InAppBrowser");
    if (/^https?:/.test(u) && IAB && IAB.openInWebView) {
      IAB.openInWebView({ url: u, options: { showURL: true, showToolbar: true, clearCache: false, clearSessionCache: false, mediaPlaybackRequiresUserAction: true, closeButtonText: "Back to FileReady", toolbarPosition: 0, showNavigationButtons: true, leftToRight: false, android: { allowZoom: true, hardwareBack: true, pauseMedia: true }, iOS: { allowOverScroll: true, enableViewportScale: true, allowInLineMediaPlayback: false, surpressIncrementalRendering: false, viewStyle: 1, animationEffect: 2, allowsBackForwardNavigationGestures: true } } }).catch(function () { var B2 = plug("Browser"); if (B2) B2.open({ url: u, presentationStyle: "popover" }); });
      return;
    }
    var B = plug("Browser");
    if (/^https?:/.test(u) && B) { B.open({ url: u }); return; }
    if (/^https?:/.test(u)) { window.open(u, "_blank", "noopener"); return; }
    location.href = u;
  }

  /* ---------- start ---------- */
  async function start() {
    applyLook();
    try { await idb(); } catch (e) { root.innerHTML = '<div class="empty"><h2>Storage is blocked</h2><p>FileReady needs on-device storage. Turn off private browsing and reload.</p></div>'; return; }
    await loadFilings();
    if (!window.pdfjsLib) await new Promise(function (r) { window.addEventListener("pdfjs-ready", r, { once: true }); setTimeout(r, 8000); });
    if (!window.pdfjsLib) { root.innerHTML = '<div class="empty"><h2>Could not load the PDF reader</h2><p>Reload the app. If this keeps happening, update your phone’s WebView.</p></div>'; return; }
    render(true);
    var f = cur(); if (f && f.files.length && !f.result) runCheck(true);
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) window.Capacitor.Plugins.App.addListener("backButton", function () { if (document.querySelector(".sheetbg")) return closeSheet(); if (st.screen) { st.screen = null; render(); } else if (st.tab !== "check") { st.tab = "check"; render(); } else window.Capacitor.Plugins.App.exitApp(); });
  }
  start();
})();
