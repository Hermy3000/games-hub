const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const http = require("http");

const PORT = Number(process.env.PORT || 8700);
const SCORCH_PORT = Number(process.env.SCORCH_PORT || 3850);
const ASHEN_PORT = Number(process.env.ASHEN_PORT || 8090);
const SCORCH_DIR = process.env.SCORCH_DIR || "C:\\Users\\Beelink\\Scorched-Arena";
const ASHEN_DIR = process.env.ASHEN_DIR || "C:\\Users\\Beelink\\Ashen-Gate";

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function probe(port, timeoutMs = 1500) {
  return new Promise((resolve) => {
    const req = http.get({ host: "127.0.0.1", port, path: "/", timeout: timeoutMs }, (res) => {
      res.resume();
      resolve({ ok: res.statusCode >= 200 && res.statusCode < 500, status: res.statusCode });
    });
    req.on("timeout", () => {
      req.destroy();
      resolve({ ok: false, status: 0 });
    });
    req.on("error", () => resolve({ ok: false, status: 0 }));
  });
}

function publicHost(req) {
  const raw = (req.headers["x-forwarded-host"] || req.headers.host || "127.0.0.1").toString();
  return raw.split(",")[0].trim().split(":")[0] || "127.0.0.1";
}

app.get("/api/status", async (req, res) => {
  const host = publicHost(req);
  const [scorch, ashen] = await Promise.all([probe(SCORCH_PORT), probe(ASHEN_PORT)]);
  res.json({
    lanHost: host,
    scorch: { url: `http://${host}:${SCORCH_PORT}`, ...scorch },
    ashen: { url: `http://${host}:${ASHEN_PORT}`, ...ashen },
  });
});

function startGame(dir, scriptArgs) {
  const child = spawn("cmd.exe", ["/c", "npm", ...scriptArgs], {
    cwd: dir,
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });
  child.unref();
  return child.pid;
}

app.post("/api/start/:game", (req, res) => {
  const game = req.params.game;
  const host = publicHost(req);
  try {
    if (game === "scorch") {
      const pid = startGame(SCORCH_DIR, ["start"]);
      return res.json({ ok: true, pid, url: `http://${host}:${SCORCH_PORT}` });
    }
    if (game === "ashen") {
      const pid = startGame(ASHEN_DIR, ["run", "dev"]);
      return res.json({ ok: true, pid, url: `http://${host}:${ASHEN_PORT}` });
    }
    return res.status(404).json({ ok: false, error: "unknown game" });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err && err.message ? err.message : err) });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Games Hub http://localhost:${PORT}`);
  console.log(`LAN bind 0.0.0.0:${PORT}`);
});