export type Locale = "en" | "ar";
export const locales: Locale[] = ["en", "ar"];
export const defaultLocale: Locale = "en";

export const dirFor = (l: Locale) => (l === "ar" ? "rtl" : "ltr");
export const langNameFor = (l: Locale) => (l === "ar" ? "العربية" : "English");

/** UI strings. Arabic reviewed status: DRAFT — pending native review by Mohamed. */
export const ui = {
  en: {
    "site.title": "Mohamed Elbahlool — Computer Engineer",
    "site.description":
      "Computer Engineer building complete systems — from microcontroller firmware to a production retail platform in Arabic.",
    "nav.home": "Home",
    "nav.work": "Work",
    "nav.about": "About",
    "nav.notes": "Notes",
    "nav.contact": "Contact",
    "nav.skip": "Skip to main content",
    "nav.switchLocale": "العربية",
    "hero.name": "Mohamed Khalid Elbahlool",
    "hero.line":
      "Computer Engineer building complete systems — from low-level embedded systems and FPGA logic to self-hosted platforms used by real businesses.",
    "hero.proof":
      "Most recently: a released Raspberry Pi Pico arcade game debugged on real hardware, a hand-wired voice terminal with custom PIO audio capture, and a self-hosted platform answering customers for English Home Libya in Arabic.",
    "hero.sub": "Computer Engineering senior · Florida International University · Miami",
    "hero.langs": "English · العربية · Türkçe",
    "work.selected": "Selected work",
    "work.all": "All projects",
    "work.flagship": "Flagship",
    "work.supporting": "More projects",
    "work.archive": "Earlier work",
    "work.viewCase": "Read the case study",
    "status.production": "In production",
    "status.released": "Released",
    "status.team": "Team project",
    "status.live": "Live",
    "status.coursework": "Coursework, extended",
    "cta.contact": "Get in touch",
    "cta.github": "GitHub",
    "cs.role": "Role",
    "cs.timeframe": "Timeframe",
    "cs.stack": "Stack",
    "cs.links": "Links",
    "cs.evidence": "Evidence",
    "contact.title": "Contact",
    "contact.primary": "Open to engineering internships and entry-level roles.",
    "contact.secondary": "Also open to collaboration and selected projects.",
    "contact.open":
      "Open to engineering internships, entry-level engineering roles, open-source collaboration, research or technical collaboration, and selected freelance engineering work.",
    "footer.rights": "All project claims link to their evidence.",
    "notes.title": "Engineering notes",
    "about.title": "About",
    "notFound.title": "Page not found",
    "notFound.body": "The page you were looking for doesn't exist in this language or has moved.",
    "notFound.home": "Back to home",
  },
  ar: {
    "site.title": "محمد الباهلول — مهندس حاسوب",
    "site.description":
      "مهندس حاسوب يبني أنظمة متكاملة — من برمجيات المتحكمات الدقيقة إلى منصة تجزئة إنتاجية تعمل بالعربية.",
    "nav.home": "الرئيسية",
    "nav.work": "الأعمال",
    "nav.about": "نبذة",
    "nav.notes": "مقالات",
    "nav.contact": "تواصل",
    "nav.skip": "تجاوز إلى المحتوى الرئيسي",
    "nav.switchLocale": "English",
    "hero.name": "محمد خالد الباهلول",
    "hero.line":
      "مهندس حاسوب يبني أنظمة متكاملة — من الأنظمة المدمجة منخفضة المستوى ومنطق FPGA إلى منصات مستضافة ذاتيًا تستخدمها أعمال تجارية حقيقية.",
    "hero.proof":
      "من أحدث الأعمال: لعبة أركيد منشورة على Raspberry Pi Pico عولج خللها على العتاد الحقيقي، وجهاز صوتي موصول يدويًا بالتقاط صوت مخصص عبر PIO، ومنصة مستضافة ذاتيًا تجيب عملاء English Home Libya بالعربية.",
    "hero.sub": "طالب سنة رابعة في هندسة الحاسوب · جامعة فلوريدا الدولية · ميامي",
    "hero.langs": "العربية · English · Türkçe",
    "work.selected": "أعمال مختارة",
    "work.all": "كل المشاريع",
    "work.flagship": "مشاريع رئيسية",
    "work.supporting": "مشاريع أخرى",
    "work.archive": "أعمال سابقة",
    "work.viewCase": "اقرأ دراسة الحالة",
    "status.production": "قيد التشغيل الفعلي",
    "status.released": "إصدار منشور",
    "status.team": "مشروع جماعي",
    "status.live": "موقع مباشر",
    "status.coursework": "مقرر دراسي موسَّع",
    "cta.contact": "تواصل معي",
    "cta.github": "GitHub",
    "cs.role": "الدور",
    "cs.timeframe": "الفترة",
    "cs.stack": "التقنيات",
    "cs.links": "روابط",
    "cs.evidence": "الأدلة",
    "contact.title": "تواصل",
    "contact.primary": "متاح لفرص التدريب الهندسي والوظائف المبتدئة.",
    "contact.secondary": "ومنفتح أيضًا على التعاون والمشاريع المختارة.",
    "contact.open":
      "متاح لفرص التدريب الهندسي، والوظائف الهندسية المبتدئة، والتعاون في المصادر المفتوحة، والتعاون البحثي أو التقني، وأعمال هندسية مستقلة مختارة.",
    "footer.rights": "كل ادعاء في المشاريع مرتبط بدليله.",
    "notes.title": "مقالات هندسية",
    "about.title": "نبذة",
    "notFound.title": "الصفحة غير موجودة",
    "notFound.body": "الصفحة التي تبحث عنها غير متوفرة بهذه اللغة أو تم نقلها.",
    "notFound.home": "العودة إلى الرئيسية",
  },
} as const;

export type UiKey = keyof (typeof ui)["en"];

export function t(locale: Locale, key: UiKey): string {
  return ui[locale][key] ?? ui.en[key];
}

/** Path helpers. Keeps Latin slugs in both locales (plan §25). */
export function localePath(locale: Locale, path: string): string {
  const clean = path.replace(/^\/+/, "");
  return `/${locale}/${clean}`.replace(/\/+$/, "/") || `/${locale}/`;
}

export function switchLocalePath(current: Locale, pathname: string): string {
  const other: Locale = current === "ar" ? "en" : "ar";
  const rest = pathname.replace(/^\/(en|ar)(\/|$)/, "/");
  return `/${other}${rest}`.replace(/\/{2,}/g, "/");
}
