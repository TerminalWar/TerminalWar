import { TERMINAL_COMMAND_PREVIEW } from "./commands.js";
import { createTemplateAppView } from "../_templateApp/ui.js";

export function createTerminalView(appConfig) {
  const shell = createTemplateAppView(appConfig);
  const commandRows = TERMINAL_COMMAND_PREVIEW.map(
    (item) => `<div><code>${item.command}</code><span>${item.output}</span></div>`
  ).join("");

  shell.insertAdjacentHTML(
    "beforeend",
    `<section class="terminal-preview" aria-label="Future terminal command preview">
      <div class="terminal-line"><span>root@gov-relic</span>:<b>~</b>$ help</div>
      ${commandRows}
    </section>`
  );

  return shell;
}
