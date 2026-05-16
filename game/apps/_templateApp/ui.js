import { APP_TEMPLATE_CONFIG } from "../../config/apps.config.js";

function renderConfigList(appConfig) {
  const mergedKeys = [
    ...APP_TEMPLATE_CONFIG.placeholder.configurableFields,
    ...Object.keys(appConfig).filter((key) => !APP_TEMPLATE_CONFIG.placeholder.configurableFields.includes(key))
  ];

  return mergedKeys
    .map((key) => `<li><code>${key}</code></li>`)
    .join("");
}

export function createTemplateAppView(appConfig) {
  const wrapper = document.createElement("div");
  wrapper.className = "app-placeholder template-app-view";
  wrapper.innerHTML = `
    <div class="app-hero" style="--app-accent: ${appConfig.accent}">
      <img src="${appConfig.icon}" alt="" class="app-hero-icon" />
      <div>
        <p class="eyebrow">${appConfig.appType === "template" ? "Clone-ready app shell" : "Installed placeholder"}</p>
        <h2>${appConfig.name}</h2>
        <p>${appConfig.description}</p>
      </div>
    </div>

    <section class="template-grid">
      <article>
        <h3>Route</h3>
        <p><code>${APP_TEMPLATE_CONFIG.routing.routePattern.replace("{appSlug}", appConfig.slug)}</code></p>
        <p>Every app lives in <code>/game/apps/&lt;app&gt;/</code> for code and can be opened through a clean <code>/game/${appConfig.slug}/</code> route.</p>
      </article>
      <article>
        <h3>Config-first setup</h3>
        <p>Balance values, unlock rules, window size, economy knobs, and copy should be changed in config before custom systems are coded.</p>
      </article>
      <article>
        <h3>Configurable fields</h3>
        <ul class="config-list">${renderConfigList(appConfig)}</ul>
      </article>
    </section>
  `;

  return wrapper;
}
