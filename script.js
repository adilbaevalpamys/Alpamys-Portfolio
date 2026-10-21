// Alpamys Adilbaev — Portfolio v3
(() => {
  const root = document.documentElement;
  const body = document.body;
  const header = document.getElementById('header');
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  /* ---------- Mobile menu ---------- */
  const setMenu = (open) => {
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  burger.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  // Close the overlay if the screen is resized/rotated to desktop width
  matchMedia('(min-width: 900px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* ---------- Theme toggle ---------- */
  document.getElementById('themeToggle').addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    document.querySelector('meta[name="theme-color"]').content = next === 'light' ? '#f4f2ec' : '#0c0c0e';
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  /* ---------- Header border on scroll ---------- */
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }
  // Safety net: never leave content hidden (e.g. anchor jumps, old browsers)
  setTimeout(() => revealEls.forEach((el) => {
    if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-visible');
  }), 1500);

  /* ---------- Active nav link ---------- */
  const links = [...document.querySelectorAll('.nav__link')];
  const sections = links.map((l) => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Languages (EN · KO · RU · KK · UZ) ---------- */
  const DICT = window.I18N || {};
  const LANGS = ['en', 'ko', 'ru', 'kk', 'uz'];
  const LABEL = { en: 'EN', ko: 'KO', ru: 'RU', kk: 'KZ', uz: 'UZ' };
  const i18nEls = document.querySelectorAll('[data-i18n]');
  const metaDesc = document.querySelector('meta[name="description"]');
  // English lives in the HTML — remember it so we can switch back
  const EN = { _title: document.title, _desc: metaDesc.content, _toast: 'Email copied ✓' };
  i18nEls.forEach((el) => { EN[el.dataset.i18n] ??= el.innerHTML; });
  DICT.en = EN;

  const langWrap = document.getElementById('lang');
  const langBtn = document.getElementById('langBtn');
  const langCurrent = document.getElementById('langCurrent');
  const langOptions = langWrap.querySelectorAll('[data-lang]');
  let currentLang = 'en';

  const t = (key) => (DICT[currentLang] && DICT[currentLang][key]) ?? EN[key];

  const applyLang = (lang) => {
    if (!LANGS.includes(lang)) lang = 'en';
    currentLang = lang;
    i18nEls.forEach((el) => { el.innerHTML = t(el.dataset.i18n); });
    root.lang = lang;
    document.title = t('_title');
    metaDesc.content = t('_desc');
    langCurrent.textContent = LABEL[lang];
    langOptions.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.lang === lang)));
    try { localStorage.setItem('lang', lang); } catch (e) {}
  };

  const setLangMenu = (open) => {
    langWrap.classList.toggle('is-open', open);
    langBtn.setAttribute('aria-expanded', String(open));
  };
  langBtn.addEventListener('click', (e) => { e.stopPropagation(); setLangMenu(!langWrap.classList.contains('is-open')); });
  langOptions.forEach((b) => b.addEventListener('click', () => { applyLang(b.dataset.lang); setLangMenu(false); setMenu(false); }));
  document.addEventListener('click', (e) => { if (!langWrap.contains(e.target)) setLangMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setLangMenu(false); });

  // Initial language: ?lang=xx in URL → saved choice → browser language → English
  const detect = () => {
    const fromUrl = new URLSearchParams(location.search).get('lang');
    if (LANGS.includes(fromUrl)) return fromUrl;
    try { const saved = localStorage.getItem('lang'); if (LANGS.includes(saved)) return saved; } catch (e) {}
    const nav = (navigator.languages || [navigator.language || 'en']).map((l) => l.slice(0, 2).toLowerCase());
    return nav.find((l) => LANGS.includes(l)) || 'en';
  };
  applyLang(detect());

  /* ---------- Copy email ---------- */
  const toast = document.getElementById('toast');
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast.t);
    showToast.t = setTimeout(() => toast.classList.remove('show'), 2200);
  };
  const copyBtn = document.getElementById('copyEmail');
  copyBtn.addEventListener('click', async () => {
    const email = copyBtn.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      showToast(t('_toast'));
    } catch {
      window.location.href = 'mailto:' + email;
    }
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
