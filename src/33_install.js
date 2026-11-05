'use strict';
/* ============ تثبيت التطبيق (PWA) ============ */
const Install = (() => {
  let ev = null;
  const standalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  const web = /^https?:$/.test(location.protocol);
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const listeners = [];
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); ev = e; listeners.forEach(f => f()); });
  window.addEventListener('appinstalled', () => { ev = null; try { D().installed = true; Store.save(); } catch (e) { } listeners.forEach(f => f()); toast('تم تثبيت فِكْر زُون ✓'); });
  return {
    standalone, web, ios,
    can: () => !!ev,
    on: f => listeners.push(f),
    async prompt() { if (!ev) return false; ev.prompt(); const r = await ev.userChoice; ev = null; listeners.forEach(f => f()); return r.outcome === 'accepted'; },
    /* نص الإرشاد بحسب البيئة */
    help() {
      if (standalone()) return 'التطبيق مثبّت ويعمل الآن بشاشة كاملة.';
      if (!web) return 'للتثبيت افتح فِكْر زُون عبر رابط الموقع (https) في المتصفح، فالتثبيت لا يعمل من ملف محفوظ على الجهاز.';
      if (ios) return 'على iPhone/iPad: اضغط زر المشاركة ⬆︎ في Safari ثم «إضافة إلى الشاشة الرئيسية».';
      return 'من قائمة المتصفح (⋮) اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».';
    },
  };
})();
MV.Install = Install;

function installPanel() {
  const box = h('section', { class: 'panel', id: 'install-panel' });
  function draw() {
    mount(box, h('h3', null, 'تثبيت التطبيق'),
      h('p', { class: 'muted' }, 'ثبّته كتطبيق على جهازك: أيقونة على الشاشة الرئيسية، شاشة كاملة، ويعمل بدون إنترنت.'),
      h('p', { class: 'small' }, Install.help()),
      !Install.standalone() && Install.can() ? h('div', { class: 'actions', style: 'margin:0' }, h('button', { class: 'btn primary', id: 'btn-install', onClick: () => Install.prompt() }, 'تثبيت فِكْر زُون')) : null);
  }
  draw(); Install.on(() => { if (box.isConnected) draw(); });
  return box;
}
