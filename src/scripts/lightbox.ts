/* Accessible figure lightbox. <dialog> gives us focus containment, Escape,
   and ::backdrop for free; we add click-outside close and focus return. */

let opener: HTMLElement | null = null;

export function initLightbox(): void {
  const dialog = document.getElementById("figure-lightbox") as HTMLDialogElement | null;
  if (!dialog || typeof dialog.showModal !== "function") return;
  const img = dialog.querySelector("img");
  if (!img) return;

  document.querySelectorAll<HTMLAnchorElement>("[data-lightbox-trigger]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      opener = a;
      img.src = a.href;
      img.alt = a.dataset.alt ?? "";
      dialog.showModal();
    });
  });

  dialog.querySelector("[data-lightbox-close]")?.addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (e) => {
    // Backdrop click: the dialog element itself is the target.
    if (e.target === dialog) dialog.close();
  });

  dialog.addEventListener("close", () => {
    img.removeAttribute("src");
    opener?.focus();
    opener = null;
  });
}
