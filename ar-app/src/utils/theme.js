export function initThemeToggle(buttonId = 'toggle-theme') {
  const setup = () => {
    const root = document.documentElement;
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') root.classList.add('dark');

    const btn = document.getElementById(buttonId);
    if (!btn) return;

    btn.addEventListener('click', () => {
      const dark = root.classList.toggle('dark');
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
}
