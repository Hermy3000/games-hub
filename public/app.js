const scorchBadge = document.getElementById("scorch-badge");
const ashenBadge = document.getElementById("ashen-badge");
const scorchPlay = document.getElementById("scorch-play");
const ashenPlay = document.getElementById("ashen-play");
const hint = document.getElementById("hint");

function gameHost() {
  const h = location.hostname;
  if (!h || h === "localhost") return "127.0.0.1";
  return h;
}

function setPlayLinks() {
  const host = gameHost();
  scorchPlay.href = `http://${host}:3850/`;
  ashenPlay.href = `http://${host}:8090/`;
}

function setBadge(el, online) {
  el.textContent = online ? "online" : "offline";
  el.classList.toggle("online", online);
  el.classList.toggle("offline", !online);
}

async function refresh() {
  setPlayLinks();
  try {
    const res = await fetch("/api/status", { cache: "no-store" });
    const data = await res.json();
    setBadge(scorchBadge, data.scorch.ok);
    setBadge(ashenBadge, data.ashen.ok);
  } catch {
    setBadge(scorchBadge, false);
    setBadge(ashenBadge, false);
  }
}

document.querySelectorAll("[data-start]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const game = btn.getAttribute("data-start");
    btn.disabled = true;
    hint.textContent = `Starting ${game}…`;
    try {
      const res = await fetch(`/api/start/${game}`, { method: "POST" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "start failed");
      hint.textContent = `Started ${game}. Waiting for it to come online…`;
      for (let i = 0; i < 24; i++) {
        await new Promise((r) => setTimeout(r, 1500));
        await refresh();
        const online = game === "scorch"
          ? scorchBadge.classList.contains("online")
          : ashenBadge.classList.contains("online");
        if (online) {
          hint.textContent = `${game} is ready.`;
          break;
        }
      }
    } catch (err) {
      hint.textContent = String(err.message || err);
    } finally {
      btn.disabled = false;
    }
  });
});

setPlayLinks();
refresh();
setInterval(refresh, 4000);

const host = gameHost();
hint.textContent = host === "127.0.0.1"
  ? "On this PC: localhost. From the LAN use this machine’s IP on the same ports."
  : `LAN mode: games open on ${host}.`;