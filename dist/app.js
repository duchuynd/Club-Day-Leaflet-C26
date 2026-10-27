(() => {
  'use strict';
  const pages = [...document.querySelectorAll('.leaflet-page')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const heart = document.querySelector('.heart');
  let current = 1;
  let turning = false;
  let replayTimer;

  function assembleHeart() {
    clearTimeout(replayTimer);
    heart.classList.remove('assembling');
    if (reducedMotion.matches) return;
    void heart.offsetWidth;
    heart.classList.add('assembling');
    replayTimer = setTimeout(() => heart.classList.remove('assembling'), 1900);
  }
  heart.addEventListener('click', assembleHeart);
  const heartObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      assembleHeart();
      heartObserver.unobserve(heart);
    }
  }, { threshold: .45 });
  heartObserver.observe(heart);

  function syncNavigation() {
    document.querySelectorAll('[data-page]').forEach(button => {
      if (+button.dataset.page === current) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    document.querySelector('#previous-page').disabled = current === 1;
    document.querySelector('#next-page').disabled = current === 2;
    document.querySelector('#page-counter').textContent = `0${current} / 02`;
    document.querySelector('.nav-caption').textContent = current === 1 ? 'MEET BUSINESS CLUB' : 'EXPLORE BUSINESS CLUB';
  }

  async function goToPage(target, options = {}) {
    if (turning || target === current || ![1, 2].includes(target)) return;
    turning = true;
    const previous = pages[current - 1];
    const next = pages[target - 1];
    const forwards = target > current;
    previous.classList.remove('enter-left', 'enter-right');
    previous.classList.add(forwards ? 'leave-left' : 'leave-right');
    if (!reducedMotion.matches) await new Promise(resolve => setTimeout(resolve, 260));
    previous.hidden = true;
    previous.classList.remove('active', 'leave-left', 'leave-right');
    next.hidden = false;
    next.classList.add('active', forwards ? 'enter-right' : 'enter-left');
    current = target;
    if (!options.fromHistory) history.pushState({ page: target }, '', `#page-${target}`);
    window.scrollTo({ top: 0, behavior: 'instant' });
    syncNavigation();
    document.querySelector('.page-announcer').textContent = target === 1 ? 'Page 1 of 2: Meet Business Club' : 'Page 2 of 2: Projects, people and recruitment';
    document.querySelector('#leaflet').focus({ preventScroll: true });
    if (target === 1) heartObserver.observe(heart);
    if (!reducedMotion.matches) await new Promise(resolve => setTimeout(resolve, 720));
    next.classList.remove('enter-left', 'enter-right');
    turning = false;
  }

  document.querySelectorAll('[data-page]').forEach(button => button.addEventListener('click', () => goToPage(+button.dataset.page)));
  document.querySelector('.brand').addEventListener('click', event => {
    event.preventDefault();
    if (current === 1) window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    else goToPage(1);
  });
  document.querySelector('#previous-page').addEventListener('click', () => goToPage(current - 1));
  document.querySelector('#next-page').addEventListener('click', () => goToPage(current + 1));
  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    if (event.key === 'ArrowRight') goToPage(current + 1);
    if (event.key === 'ArrowLeft') goToPage(current - 1);
  });
  let touchOrigin = null;
  document.querySelector('main').addEventListener('touchstart', event => {
    if (event.touches.length !== 1 || event.target.closest('a,button')) { touchOrigin = null; return; }
    touchOrigin = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });
  document.querySelector('main').addEventListener('touchend', event => {
    if (!touchOrigin || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchOrigin.x;
    const dy = event.changedTouches[0].clientY - touchOrigin.y;
    touchOrigin = null;
    if (Math.abs(dx) > 85 && Math.abs(dx) > Math.abs(dy) * 1.8) goToPage(current + (dx < 0 ? 1 : -1));
  }, { passive: true });
  document.querySelector('main').addEventListener('touchcancel', () => { touchOrigin = null; }, { passive: true });
  window.addEventListener('popstate', () => goToPage(location.hash === '#page-2' ? 2 : 1, { fromHistory: true }));
  if (location.hash === '#page-2') {
    pages[0].hidden = true;
    pages[0].classList.remove('active');
    pages[1].hidden = false;
    pages[1].classList.add('active');
    current = 2;
  }
  syncNavigation();
})();
