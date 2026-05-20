export function startMatrixRain() {
  const canvas = document.getElementById("matrixCanvas");
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const chars = "01◇△ NATO AI SATCOM DEFCON 2050";
  const size = 15;
  let columns = Math.floor(canvas.width / size);
  let drops = Array.from({ length: columns }, () => Math.random() * -canvas.height);

  function draw() {
    columns = Math.floor(canvas.width / size);
    if (drops.length !== columns) drops = Array.from({ length: columns }, () => Math.random() * -canvas.height);

    ctx.fillStyle = "rgba(2, 6, 13, 0.24)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = Math.random() > 0.94 ? "#ff4368" : "#73f7ff";
    ctx.font = `${size}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      const x = i * size;
      const y = drops[i] * size;
      ctx.fillText(text, x, y);
      if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
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
