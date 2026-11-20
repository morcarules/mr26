// Morcar Rules — salva l'app per l'uso senza rete.
// La pagina viene presa sempre fresca dalla rete quando c'è (così gli aggiornamenti arrivano subito);
// senza rete si usa la copia salvata. Cambiare VERSIONE a ogni aggiornamento.
const VERSIONE = "morcar-v30";
const FILE = ["./", "./index.html", "./manifest.json", "./icon-180.png", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSIONE)
    .then(c => Promise.all(FILE.map(f => fetch(new Request(f, { cache: "reload" })).then(r => c.put(f, r)))))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== VERSIONE).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const pagina = e.request.mode === "navigate";
  if (pagina) {
    // rete prima, copia salvata se offline
    e.respondWith(fetch(e.request, { cache: "no-store" }).then(r => {
      const copia = r.clone(); caches.open(VERSIONE).then(c => c.put("./index.html", copia)); return r;
    }).catch(() => caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request)));
});
