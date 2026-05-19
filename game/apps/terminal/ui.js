import { createElement } from "../../../shared/dom.js";
import { TERMINAL_COMMAND_PREVIEW } from "./commands.js";
import { createTemplateAppView } from "../_templateApp/ui.js";

export function createTerminalView(appConfig) {
  const shell = createTemplateAppView(appConfig);
  const commandRows = TERMINAL_COMMAND_PREVIEW.map((item) => createElement("div", {}, [
    createElement("code", { text: item.command }),
    createElement("span", { text: item.output })
  ]));
  shell.append(createElement("section", { className: "terminal-preview", ariaLabel: "Future terminal command preview" }, [
    createElement("div", { className: "terminal-line" }, [
      createElement("span", { text: "root@gov-relic" }),
      ":",
      createElement("b", { text: "~" }),
      "$ help"
    ]),
    commandRows
  ]));
  return shell;
}
