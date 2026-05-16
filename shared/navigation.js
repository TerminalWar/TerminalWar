const ROUTES = {
  game: "/game/",
  login: "/login/"
};

function buildRoute(path, search = "") {
  const url = new URL(path, window.location.origin);
  url.search = search;
  return url.href;
}

export function goToGame() {
  window.location.assign(buildRoute(ROUTES.game));
}

export function goToLogin(search = "") {
  window.location.assign(buildRoute(ROUTES.login, search));
}

export function replaceLoginUrl() {
  window.history.replaceState({}, "", ROUTES.login);
}
