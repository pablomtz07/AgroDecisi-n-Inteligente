(function () {
    const AUTH_KEY = "cosechaAuthSession";
    const LOGIN_PAGE = "login.html";
    const HOME_PAGE = "index.html";
    const DEMO_USER = "admin";
    const DEMO_PASSWORD = "cosecha2026";

    function currentPageName() {
        const page = window.location.pathname.split("/").pop();
        return (page || HOME_PAGE).toLowerCase();
    }

    function readStorageSession() {
        const session = safeParse(localStorage.getItem(AUTH_KEY)) || safeParse(sessionStorage.getItem(AUTH_KEY));
        return session && typeof session === "object" ? session : null;
    }

    function writeStorageSession(session, remember) {
        const payload = JSON.stringify(session);
        if (remember) {
            localStorage.setItem(AUTH_KEY, payload);
            sessionStorage.removeItem(AUTH_KEY);
            return;
        }

        sessionStorage.setItem(AUTH_KEY, payload);
        localStorage.removeItem(AUTH_KEY);
    }

    function clearStorageSession() {
        localStorage.removeItem(AUTH_KEY);
        sessionStorage.removeItem(AUTH_KEY);
    }

    function safeParse(raw) {
        if (!raw) {
            return null;
        }

        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }

    function getNextTarget() {
        const params = new URLSearchParams(window.location.search);
        return params.get("next") || HOME_PAGE;
    }

    function buildNextTarget() {
        const page = window.location.pathname.split("/").pop() || HOME_PAGE;
        return encodeURIComponent(`${page}${window.location.search}${window.location.hash}`);
    }

    function redirectToLogin() {
        window.location.replace(`${LOGIN_PAGE}?next=${buildNextTarget()}`);
    }

    function redirectToNext() {
        const destination = getNextTarget();
        window.location.replace(destination);
    }

    function isAuthenticated() {
        return Boolean(readStorageSession());
    }

    function requireAuth() {
        const page = currentPageName();

        if (page === LOGIN_PAGE) {
            if (isAuthenticated()) {
                redirectToNext();
            }
            return;
        }

        if (!isAuthenticated()) {
            redirectToLogin();
        }
    }

    function login({ username, password, remember = false, next = null }) {
        const cleanUser = String(username || "").trim();
        const cleanPassword = String(password || "").trim();

        if (!cleanUser || !cleanPassword) {
            return {
                ok: false,
                message: "Completá usuario y contraseña."
            };
        }

        if (cleanUser !== DEMO_USER || cleanPassword !== DEMO_PASSWORD) {
            return {
                ok: false,
                message: "Usuario o contraseña incorrectos."
            };
        }

        writeStorageSession(
            {
                username: cleanUser,
                loggedAt: new Date().toISOString(),
                remember: Boolean(remember)
            },
            remember
        );

        const destination = next || getNextTarget();
        window.location.replace(destination);
        return { ok: true };
    }

    function logout() {
        clearStorageSession();
        window.location.replace(LOGIN_PAGE);
    }

    function installLogoutHandler() {
        if (window.__cosechaLogoutHandlerInstalled) {
            return;
        }

        window.__cosechaLogoutHandlerInstalled = true;
        document.addEventListener("click", (event) => {
            const button = event.target?.closest?.("[data-logout]");
            if (!button) {
                return;
            }

            event.preventDefault();
            logout();
        });
    }

    function registerServiceWorker() {
        if (!("serviceWorker" in navigator) || window.location.protocol === "file:") {
            return;
        }

        window.addEventListener("load", () => {
            navigator.serviceWorker.register("/sw.js").catch(() => {
                // Si el SW falla, la app sigue funcionando normal.
            });
        });
    }

    window.CosechaAuth = {
        login,
        logout,
        isAuthenticated,
        getSession: readStorageSession,
        requireAuth,
        bindLogoutButtons: installLogoutHandler
    };

    requireAuth();
    installLogoutHandler();
    registerServiceWorker();
})();
