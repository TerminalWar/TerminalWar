export async function runIntro() {
  const intro = document.getElementById("intro");
  const output = document.getElementById("introOutput");

  const lines = ["connecting...", "authorizing credentials...", "access granted"];

  for (const line of lines) {
    output.textContent += `> ${line}\n`;
    await new Promise((resolve) => setTimeout(resolve, 550));
  }

  await new Promise((resolve) => setTimeout(resolve, 350));
  intro.classList.add("hidden");
}
