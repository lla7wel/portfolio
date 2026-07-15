/* Theme switch: pre-paint init lives inline in Base.astro; this module wires
   the buttons and keeps their accessible state true to the actual theme. */

function currentIsDark(): boolean {
  const stored = document.documentElement.dataset.theme;
  if (stored === "dark") return true;
  if (stored === "light") return false;
  return matchMedia("(prefers-color-scheme: dark)").matches;
}

function sync(): void {
  const dark = currentIsDark();
  document
    .querySelectorAll<HTMLButtonElement>("[data-theme-switch]")
    .forEach((btn) => btn.setAttribute("aria-pressed", String(dark)));
  const meta = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]:not([media])',
  );
  if (meta) meta.content = dark ? "#090d0f" : "#f4f2ec";
}

export function initTheme(): void {
  sync();
  document
    .querySelectorAll<HTMLButtonElement>("[data-theme-switch]")
    .forEach((btn) =>
      btn.addEventListener("click", () => {
        const next = currentIsDark() ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem("theme", next);
        } catch {
          /* private mode */
        }
        sync();
        const live = document.getElementById("a11y-announcer");
        if (live) {
          live.textContent =
            next === "dark"
              ? (live.dataset.dark ?? "Dark theme on")
              : (live.dataset.light ?? "Dark theme off");
        }
      }),
    );
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", sync);
}
