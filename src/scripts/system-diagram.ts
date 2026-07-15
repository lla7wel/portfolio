/* Shared behavior for interactive stage explainers.

   Markup contract (per explainer root, [data-stage-explainer]):
   - stage controls:  button[data-stage="<id>"]  (keyboard+touch for free)
   - detail panels:   [data-stage-panel="<id>"]
   - diagram parts:   [data-segment~="<id>"]  (SVG or HTML; may serve many ids)

   Without JS every panel stays visible (the complete static sequence).
   No auto-cycling; reduced motion gets instant state via CSS. */

export function initStageExplainers(): void {
  document.querySelectorAll<HTMLElement>("[data-stage-explainer]").forEach((root) => {
    // Diagram segments may live outside the shell (e.g. an exploded stack
    // beside it) — an ancestor may widen the scope with data-explainer-scope.
    const scope = root.closest<HTMLElement>("[data-explainer-scope]") ?? root;
    const buttons = [...root.querySelectorAll<HTMLButtonElement>("button[data-stage]")];
    const panels = [...root.querySelectorAll<HTMLElement>("[data-stage-panel]")];
    const segments = [...scope.querySelectorAll<Element>("[data-segment]")];
    if (buttons.length === 0) return;

    const select = (id: string, focus = false) => {
      buttons.forEach((b) => {
        const current = b.dataset.stage === id;
        b.setAttribute("aria-current", current ? "step" : "false");
        b.tabIndex = current ? 0 : -1;
        if (current && focus) b.focus();
      });
      panels.forEach((p) => {
        p.hidden = p.dataset.stagePanel !== id;
      });
      segments.forEach((s) => {
        const ids = (s as HTMLElement).getAttribute("data-segment")?.split(" ") ?? [];
        s.classList.toggle("is-active", ids.includes(id));
      });
    };

    buttons.forEach((b, i) => {
      b.addEventListener("click", () => select(b.dataset.stage!));
      // Roving arrows along the stepper.
      b.addEventListener("keydown", (e) => {
        const dirNext = ["ArrowRight", "ArrowDown"].includes(e.key);
        const dirPrev = ["ArrowLeft", "ArrowUp"].includes(e.key);
        if (!dirNext && !dirPrev) return;
        e.preventDefault();
        const rtl = root.closest("[dir]")?.getAttribute("dir") === "rtl" || document.dir === "rtl";
        const horizontal = e.key === "ArrowRight" || e.key === "ArrowLeft";
        const forward = horizontal && rtl ? dirPrev : dirNext;
        const target = buttons[(i + (forward ? 1 : buttons.length - 1)) % buttons.length];
        select(target.dataset.stage!, true);
      });
    });

    root.dataset.enhanced = "true";
    select(buttons[0].dataset.stage!);
  });
}
