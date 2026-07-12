const C = "grana-v1";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Rede primeiro (para pegar atualizações), cache como plano B (offline).
// Nunca intercepta Firebase/Google (auth e sync precisam de rede real).
self.addEventListener("fetch", e => {
  const u = e.request.url;
  if (e.request.method !== "GET" || u.includes("googleapis") || u.includes("gstatic.com/firebasejs") || u.includes("firestore")) return;
  e.respondWith(
    fetch(e.request).then(r => {
      const cp = r.clone();
      caches.open(C).then(c => c.put(e.request, cp));
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
