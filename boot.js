/* FileReady boot: Content Security Policy for the web version, then service worker. */
(function () {
  var inApp = location.hostname === "localhost" && !location.port && location.protocol === "https:"; /* Android app (Capacitor) */
  if (!inApp) {
    var m = document.createElement("meta"); m.httpEquiv = "Content-Security-Policy";
    m.content = "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net 'wasm-unsafe-eval'; worker-src 'self' blob:; connect-src 'self' https://cdn.jsdelivr.net https://www.courtlistener.com https://api.uspto.gov blob: data:; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; media-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'";
    document.head.appendChild(m);
  }
  window.addEventListener("load", function () { if ("serviceWorker" in navigator && location.protocol === "https:" && !window.Capacitor) navigator.serviceWorker.register("sw.js").catch(function () { }); });
})();
