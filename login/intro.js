export function startMatrixRain() {
  const canvas = document.getElementById("matrixCanvas");
  const ctx = canvas.getContext("2d");

  let width = window.innerWidth;
  let height = window.innerHeight;
  let lowPower = document.body.dataset.performance === "low";
  let pixelRatio = Math.min(window.devicePixelRatio || 1, lowPower ? 1 : 1.5);
  let size = lowPower ? 22 : 15;
  let columns = 0;
  let drops = [];
  let lastFrame = 0;
  let frameInterval = lowPower ? 70 : 34;
  let resizeTimer;

  function configureCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    lowPower = document.body.dataset.performance === "low";
    pixelRatio = Math.min(window.devicePixelRatio || 1, lowPower ? 1 : 1.5);
    size = lowPower ? 22 : 15;
    frameInterval = lowPower ? 70 : 34;

    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    columns = Math.ceil(width / size);
    drops = Array.from({ length: columns }, () => Math.random() * -(height / size));
  }

  function resize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(configureCanvas, 120);
  }

  configureCanvas();
  window.addEventListener("resize", resize, { passive: true });

  function draw(timestamp = 0) {
    if (document.hidden || timestamp - lastFrame < frameInterval) {
      requestAnimationFrame(draw);
      return;
    }

    lastFrame = timestamp;
    if (drops.length !== columns) drops = Array.from({ length: columns }, () => Math.random() * -(height / size));

    ctx.fillStyle = lowPower ? "rgba(2, 6, 13, 0.34)" : "rgba(2, 6, 13, 0.24)";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = Math.random() > 0.94 ? "#ff4368" : "#73f7ff";
    ctx.font = `${size}px monospace`;
    const chars = lowPower ? "01 NATO AI" : "01◇△ NATO AI SATCOM DEFCON 2050";

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      const x = i * size;
      const y = drops[i] * size;
      ctx.fillText(text, x, y);
      if (y > height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

export async function runIntro() {
  const intro = document.getElementById("intro");
  const output = document.getElementById("introOutput");
  const lines = [
    "[NATO-BLACKLINE] waking orbital cyber command lattice...",
    "[SATCOM] syncing encrypted theater maps across contested zones...",
    "[AI-SENTINEL] validating operator biometrics against ghost ledger...",
    "[QUANTUM-FIREWALL] rotating cipher gates // hostile packets detected...",
    "[STRIKE-NET] routing access through Sector 204 blacksite relay...",
    "[CLEARANCE] strategic access window open // authenticate operator"
  ];

  for (const line of lines) {
    const row = document.createElement("span");
    row.className = "boot-line";

    const prefix = document.createElement("span");
    prefix.className = "boot-prefix";
    prefix.textContent = "> ";

    const text = document.createElement("span");
    text.className = "boot-text";
    text.textContent = line;

    row.append(prefix, text, document.createTextNode("\n"));
    output.appendChild(row);
    await new Promise((resolve) => setTimeout(resolve, 620));
  }

  await new Promise((resolve) => setTimeout(resolve, 700));
  intro.classList.add("hidden");
}
