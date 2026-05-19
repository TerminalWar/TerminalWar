import { createElement, createIcon } from "../../../shared/dom.js";
import { APP_TEMPLATE_CONFIG } from "../../config/apps.config.js";

function getConfigKeys(appConfig) {
  return [
    ...APP_TEMPLATE_CONFIG.placeholder.configurableFields,
    ...Object.keys(appConfig).filter((key) => !APP_TEMPLATE_CONFIG.placeholder.configurableFields.includes(key))
  ];
}

function createConfigList(appConfig) {
  return createElement("ul", { className: "config-list" }, getConfigKeys(appConfig).map((key) => createElement("li", {}, [createElement("code", { text: key })])));
}

export function createTemplateAppView(appConfig) {
  const wrapper = createElement("div", { className: "app-placeholder template-app-view" });
  const hero = createElement("div", { className: "app-hero", style: { "--app-accent": appConfig.accent } }, [
    createIcon(appConfig.icon, ""),
    createElement("div", {}, [
      createElement("p", { className: "eyebrow", text: appConfig.appType === "template" ? "Clone-ready app shell" : "Installed placeholder" }),
      createElement("h2", { text: appConfig.name }),
      createElement("p", { text: appConfig.description })
    ])
  ]);
  hero.querySelector("img").className = "app-hero-icon";

  const routeCode = APP_TEMPLATE_CONFIG.routing.routePattern.replace("{appSlug}", appConfig.slug);
  const grid = createElement("section", { className: "template-grid" }, [
    createElement("article", {}, [
      createElement("h3", { text: "Route" }),
      createElement("p", {}, [createElement("code", { text: routeCode })]),
      createElement("p", {}, [
        "Every app lives in ",
        createElement("code", { text: "/game/apps/<app>/" }),
        " for code and can be opened through a clean ",
        createElement("code", { text: `/game/${appConfig.slug}/` }),
        " route."
      ])
    ]),
    createElement("article", {}, [
      createElement("h3", { text: "Config-first setup" }),
      createElement("p", { text: "Balance values, unlock rules, window size, economy knobs, and copy should be changed in config before custom systems are coded." })
    ]),
    createElement("article", {}, [
      createElement("h3", { text: "Configurable fields" }),
      createConfigList(appConfig)
    ])
  ]);

  wrapper.append(hero, grid);
  return wrapper;
}
