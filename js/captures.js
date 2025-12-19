const API_BASE = "https://undeservedly-hammerheaded-lindsay.ngrok-free.dev";

function toApiImgUrl(src) {
  // Si ya es absoluto, no lo tocamos
  if (src.startsWith("http://") || src.startsWith("https://")) return src;

  // Normaliza: si viene "img/..." lo vuelve "/img/..."
  if (!src.startsWith("/")) src = `/${src}`;

  // "/img/captures/c1.png" -> "captures/c1.png"
  const clean = src.replace(/^\/img\//, "");

  return `${API_BASE}/api/img/${clean}`;
}

export function initCaptures(captures) {
  const track = document.getElementById("capturesTrack");
  if (!track || !captures?.images?.length) return;

  track.innerHTML = "";

  for (const src of captures.images) {
    const img = document.createElement("img");
    img.alt = "Captura Xaimua";
    img.loading = "lazy";
    img.decoding = "async";
    img.src = toApiImgUrl(src);

    img.onerror = () => console.warn("❌ No cargó:", img.src);

    track.appendChild(img);
  }
}
