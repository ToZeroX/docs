(() => {
  const THEMES = {
    ink:       { label: '深墨',   primary: '11 15 31',    light: '58 65 86',    dark: '5 6 9',       swatch: '#0b0f1f' },
    cobalt:    { label: 'Cobalt', primary: '31 50 214',   light: '58 77 234',   dark: '26 41 181',   swatch: '#1f32d6' },
    parchment: { label: '薄暮靛', primary: '67 56 202',   light: '99 102 241',  dark: '55 48 163',   swatch: '#4338ca' },
    mint:      { label: 'Mint',   primary: '4 120 87',    light: '16 185 129',  dark: '6 95 70',     swatch: '#047857' },
    mono:      { label: 'Mono',   primary: '10 10 10',    light: '64 64 64',    dark: '0 0 0',       swatch: '#0a0a0a' },
  };

  const LOGOS = {
    compact:    { label: 'Compact',    src: '/logo/lockup-compact.svg' },
    horizontal: { label: 'Horizontal', src: '/logo/lockup-horizontal.svg' },
    wordmark:   { label: 'Wordmark',   src: '/logo/wordmark-only.svg' },
  };

  const DEFAULT_THEME = 'ink';
  const DEFAULT_LOGO = 'compact';
  const DEFAULT_BG = 'halo';

  const state = {
    theme: localStorage.getItem('nusd_theme') || DEFAULT_THEME,
    logo:  localStorage.getItem('nusd_logo')  || DEFAULT_LOGO,
    bg:    localStorage.getItem('nusd_bg')    || DEFAULT_BG,
  };

  function applyTheme(key) {
    const t = THEMES[key] || THEMES[DEFAULT_THEME];
    const root = document.documentElement;
    root.style.setProperty('--primary',       t.primary);
    root.style.setProperty('--primary-light', t.light);
    root.style.setProperty('--primary-dark',  t.dark);
    state.theme = key;
    localStorage.setItem('nusd_theme', key);
  }

  function applyLogo(key) {
    const logo = LOGOS[key] || LOGOS[DEFAULT_LOGO];
    document.querySelectorAll('img.nav-logo').forEach(img => { img.src = logo.src; });
    state.logo = key;
    localStorage.setItem('nusd_logo', key);
  }

  function applyBg(key) {
    document.documentElement.setAttribute('data-nusd-bg', key);
    state.bg = key;
    localStorage.setItem('nusd_bg', key);
  }

  function applyAll() { applyTheme(state.theme); applyLogo(state.logo); applyBg(state.bg); }

  function render() {
    if (document.getElementById('nusd-switcher')) return;
    const root = document.createElement('div');
    root.id = 'nusd-switcher';
    root.innerHTML = `
      <div class="panel" role="dialog" aria-label="Theme preview">
        <div class="section">配色</div>
        <div class="row">
          ${Object.entries(THEMES).map(([k, v]) => `
            <div class="swatch" data-theme="${k}" title="${v.label}" style="background:${v.swatch}"></div>
          `).join('')}
        </div>
        <div class="section">Logo</div>
        <div class="logo-row">
          ${Object.entries(LOGOS).map(([k, v]) => `
            <div class="logo-opt" data-logo="${k}">${v.label}</div>
          `).join('')}
        </div>
        <div class="section">Background</div>
        <div class="bg-row">
          <div class="bg-opt" data-bg="plain">Plain</div>
          <div class="bg-opt" data-bg="halo">Halo</div>
        </div>
      </div>
      <div class="toggle" role="button" aria-label="Open theme preview">
        <span class="dot"></span>
        <span>Theme</span>
      </div>
    `;
    document.body.appendChild(root);

    const toggle = root.querySelector('.toggle');
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      root.setAttribute('data-open', root.getAttribute('data-open') === 'true' ? 'false' : 'true');
    });
    document.addEventListener('click', (e) => {
      if (!root.contains(e.target)) root.setAttribute('data-open', 'false');
    });

    root.querySelectorAll('.swatch').forEach(el => {
      el.addEventListener('click', () => { applyTheme(el.dataset.theme); syncActive(); });
    });
    root.querySelectorAll('.logo-opt').forEach(el => {
      el.addEventListener('click', () => { applyLogo(el.dataset.logo); syncActive(); });
    });
    root.querySelectorAll('.bg-opt').forEach(el => {
      el.addEventListener('click', () => { applyBg(el.dataset.bg); syncActive(); });
    });

    syncActive();
  }

  function syncActive() {
    const root = document.getElementById('nusd-switcher');
    if (!root) return;
    root.querySelectorAll('[data-theme]').forEach(el =>
      el.setAttribute('data-active', el.dataset.theme === state.theme ? 'true' : 'false'));
    root.querySelectorAll('[data-logo]').forEach(el =>
      el.setAttribute('data-active', el.dataset.logo === state.logo ? 'true' : 'false'));
    root.querySelectorAll('[data-bg]').forEach(el =>
      el.setAttribute('data-active', el.dataset.bg === state.bg ? 'true' : 'false'));
  }

  function init() {
    applyAll();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-apply theme and re-mount widget on SPA navigations
  const observer = new MutationObserver(() => {
    applyAll();
    if (!document.getElementById('nusd-switcher')) render();
  });
  observer.observe(document.body || document.documentElement, { childList: true, subtree: false });
})();
