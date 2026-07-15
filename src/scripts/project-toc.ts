/* Tracks the section currently in view and reflects it in the sticky ToC —
   with a marker bar plus font weight, so state never depends on color alone. */

export function initProjectToc(): void {
  const links = [...document.querySelectorAll<HTMLAnchorElement>("[data-toc-link]")];
  if (links.length === 0) return;

  const sections = links
    .map((l) => document.getElementById(l.dataset.tocLink ?? ""))
    .filter((s): s is HTMLElement => !!s);

  const setCurrent = (id: string) => {
    links.forEach((l) =>
      l.dataset.tocLink === id
        ? l.setAttribute("aria-current", "true")
        : l.removeAttribute("aria-current"),
    );
  };

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]?.target.id) setCurrent(visible[0].target.id);
    },
    { rootMargin: "-15% 0px -70% 0px" },
  );
  sections.forEach((s) => io.observe(s));
}
