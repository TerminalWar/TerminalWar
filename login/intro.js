export function startMatrixRain() {
  const canvas = document.getElementById("matrixCanvas");
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const chars = "01";
  const size = 16;
  let columns = Math.floor(canvas.width / size);
  let drops = Array.from({ length: columns }, () => Math.random() * -canvas.height);

  function draw() {
    columns = Math.floor(canvas.width / size);
    if (drops.length !== columns) drops = Array.from({ length: columns }, () => Math.random() * -canvas.height);

    ctx.fillStyle = "rgba(2, 7, 6, 0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#59ffc5";
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
    "[SECTOR_204] connecting to shadow relay...",
    "injecting spoofed biometric signature...",
    "breaching node firewall...",
    "access granted // welcome to sector 204"
  ];

  for (const line of lines) {
    output.textContent += `> ${line}\n`;
    await new Promise((resolve) => setTimeout(resolve, 700));
  }

  await new Promise((resolve) => setTimeout(resolve, 500));
  intro.classList.add("hidden");
}
