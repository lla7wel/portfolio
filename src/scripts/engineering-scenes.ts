const initialized = new WeakSet<HTMLElement>();

function supportsAcceleratedWebGL() {
  const probe = document.createElement("canvas");
  const attributes: WebGLContextAttributes = {
    alpha: true,
    antialias: true,
    failIfMajorPerformanceCaveat: true,
    powerPreference: "high-performance",
  };

  try {
    const context =
      probe.getContext("webgl2", attributes) ??
      probe.getContext("webgl", attributes);
    if (!context) return false;
    const rendererInfo = context.getExtension("WEBGL_debug_renderer_info");
    const rendererName = rendererInfo
      ? String(context.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL))
      : "";
    context.getExtension("WEBGL_lose_context")?.loseContext();
    return !/swiftshader|llvmpipe|software rasterizer/i.test(rendererName);
  } catch {
    return false;
  }
}

function showStaticFallback(root: HTMLElement) {
  root.dataset.ready = "fallback";
  const state = root.querySelector<HTMLElement>("[data-scene-state]");
  const toggle = root.querySelector<HTMLButtonElement>("[data-scene-toggle]");
  if (state) {
    state.textContent =
      document.documentElement.lang === "ar" ? "تصور ثابت للنظام" : "Static system visualization";
  }
  toggle?.setAttribute("aria-pressed", "false");
  toggle?.setAttribute("hidden", "");
}

async function loadRuntime(root: HTMLElement) {
  const { mountEngineeringScene } = await import("./engineering-scene-runtime");
  await mountEngineeringScene(root);
}

function prepareManualActivation(root: HTMLElement) {
  showStaticFallback(root);
  root.dataset.ready = "manual";
  const locale = document.documentElement.lang === "ar" ? "ar" : "en";
  const state = root.querySelector<HTMLElement>("[data-scene-state]");
  const toggle = root.querySelector<HTMLButtonElement>("[data-scene-toggle]");
  const pausedLabel = toggle?.querySelector<HTMLElement>("[data-label-paused]");
  if (!toggle || !pausedLabel) return;

  if (state) {
    state.textContent =
      locale === "ar" ? "معاينة ثابتة · التصور الثلاثي اختياري" : "Static preview · optional 3D";
  }
  pausedLabel.textContent =
    locale === "ar" ? "تشغيل التصور الثلاثي" : "Load interactive 3D";
  toggle.removeAttribute("hidden");

  toggle.addEventListener(
    "click",
    async () => {
      toggle.disabled = true;
      toggle.setAttribute("hidden", "");
      pausedLabel.textContent = locale === "ar" ? "تشغيل الحركة" : "Play motion";
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      try {
        await loadRuntime(root);
        toggle.disabled = false;
        toggle.removeAttribute("hidden");
      } catch {
        showStaticFallback(root);
      }
    },
    { once: true },
  );
}

async function mount(root: HTMLElement) {
  if (initialized.has(root)) return;
  initialized.add(root);

  try {
    if (!supportsAcceleratedWebGL()) {
      showStaticFallback(root);
      return;
    }
    if (matchMedia("(max-width: 600px)").matches) {
      prepareManualActivation(root);
      return;
    }
    await loadRuntime(root);
  } catch {
    showStaticFallback(root);
  }
}

export function initEngineeringScenes() {
  document.querySelectorAll<HTMLElement>("[data-engineering-scene]").forEach((root) => {
    if (initialized.has(root)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        void mount(root);
      },
      { rootMargin: "260px 0px" },
    );
    observer.observe(root);
  });
}
