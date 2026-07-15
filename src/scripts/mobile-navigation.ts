/* Disclosure mobile navigation: real panel, Escape closes, focus returns to
   the trigger. No focus trap (it is a disclosure, not a modal) and no scroll
   lock beyond the panel itself. */

export function initMobileNavigation(): void {
  const toggle = document.querySelector<HTMLButtonElement>("[data-nav-toggle]");
  const panel = document.getElementById("mobile-nav-panel");
  if (!toggle || !panel) return;

  const close = (returnFocus: boolean) => {
    if (toggle.getAttribute("aria-expanded") !== "true") return;
    toggle.setAttribute("aria-expanded", "false");
    panel.hidden = true;
    document.documentElement.removeAttribute("data-nav-open");
    if (returnFocus) toggle.focus();
  };

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    if (open) {
      close(false);
    } else {
      toggle.setAttribute("aria-expanded", "true");
      panel.hidden = false;
      document.documentElement.setAttribute("data-nav-open", "");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close(true);
  });

  // Clicking outside the header closes the panel.
  document.addEventListener("click", (e) => {
    if (
      toggle.getAttribute("aria-expanded") === "true" &&
      e.target instanceof Node &&
      !panel.contains(e.target) &&
      !toggle.contains(e.target)
    ) {
      close(false);
    }
  });

  // Reset state when leaving the mobile breakpoint.
  matchMedia("(min-width: 64em)").addEventListener("change", (mq) => {
    if (mq.matches) close(false);
  });
}
