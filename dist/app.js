(() => {
  'use strict';
  const pages = [...document.querySelectorAll('.leaflet-page')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const heart = document.querySelector('.heart');
  const pageLabels = ['Meet Business Club', 'Business Club projects', 'People, recruitment and contact'];
  let current = 1;
  let turning = false;
  let replayTimer;

  function assembleHeart() {
    clearTimeout(replayTimer);
    heart.classList.remove('assembling');
    if (reducedMotion.matches) return;
    void heart.offsetWidth;
    heart.classList.add('assembling');
    replayTimer = setTimeout(() => heart.classList.remove('assembling'), 1600);
  }
  heart.addEventListener('click', assembleHeart);
  const heartObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      assembleHeart();
      heartObserver.unobserve(heart);
    }
  }, { threshold: .45 });
  heartObserver.observe(heart);

  // Native scrolling keeps touch gestures direct and lets the browser handle
  // momentum. Three identical sets make the visible transition loop seamlessly.
  document.querySelectorAll('[data-carousel]').forEach((row, rowIndex) => {
    const viewport = row.querySelector('.carousel-viewport');
    const track = row.querySelector('.carousel-track');
    const slides = [...track.children];
    const count = slides.length;
    const dots = [...row.querySelectorAll('[data-slide]')];
    const pauseButton = row.querySelector('.carousel-pause');
    const title = row.querySelector('h4').textContent;
    let index = 0;
    let stride = 0;
    let ready = false;
    let visible = false;
    let hovering = false;
    let focused = false;
    let interacting = false;
    let paused = false;
    let timer;
    let settleTimer;
    let drag;

    function cloneSet() {
      const fragment = document.createDocumentFragment();
      slides.forEach(slide => {
        const clone = slide.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.removeAttribute('role');
        clone.removeAttribute('aria-roledescription');
        clone.removeAttribute('aria-label');
        fragment.append(clone);
      });
      return fragment;
    }
    track.prepend(cloneSet());
    track.append(cloneSet());

    function stopTimer() { clearTimeout(timer); }
    function schedule() {
      stopTimer();
      if (!ready || !visible || hovering || focused || interacting || paused || reducedMotion.matches || document.hidden) return;
      timer = setTimeout(() => move(1), 4400 + rowIndex * 500);
    }
    function update() {
      dots.forEach((dot, n) => {
        if (n === index) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      row.querySelector('.carousel-counter').textContent = `${String(index + 1).padStart(2, '0')} / ${String(count).padStart(2, '0')}`;
    }
    function settle() {
      if (!ready || interacting) return;
      const position = Math.round(viewport.scrollLeft / stride);
      index = ((position - count) % count + count) % count;
      // Reposition an identical set only after the scroll is over, so no jump
      // can be seen while a visitor is swiping or an animation is in progress.
      if (position < count || position >= count * 2) {
        viewport.scrollTo({ left: (count + index) * stride, behavior: 'instant' });
      }
      update();
      schedule();
    }
    function move(direction) {
      if (!ready || interacting) return;
      stopTimer();
      const position = Math.round(viewport.scrollLeft / stride);
      viewport.scrollTo({ left: (position + direction) * stride, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    }
    const resizeObserver = new ResizeObserver(() => {
      if (!viewport.clientWidth) return;
      const gap = parseFloat(getComputedStyle(track).columnGap);
      const nextStride = parseFloat(getComputedStyle(slides[0]).width) + gap;
      if (Math.abs(stride - nextStride) < .25 && ready) return;
      stride = nextStride;
      ready = true;
      viewport.scrollTo({ left: (count + index) * stride, behavior: 'instant' });
      schedule();
    });
    resizeObserver.observe(viewport);
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      schedule();
    }, { threshold: .3 }).observe(row);
    viewport.addEventListener('scroll', () => {
      stopTimer();
      clearTimeout(settleTimer);
      settleTimer = setTimeout(settle, 180);
    }, { passive: true });
    row.querySelectorAll('[data-direction]').forEach(button => {
      button.addEventListener('click', () => move(+button.dataset.direction));
    });
    dots.forEach(dot => dot.addEventListener('click', () => {
      if (!ready) return;
      stopTimer();
      viewport.scrollTo({ left: (count + +dot.dataset.slide) * stride, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    }));
    pauseButton.addEventListener('click', () => {
      paused = !paused;
      pauseButton.textContent = paused ? '▷' : 'Ⅱ';
      pauseButton.setAttribute('aria-pressed', String(paused));
      pauseButton.setAttribute('aria-label', `${paused ? 'Play' : 'Pause'} ${title} slideshow`);
      schedule();
    });
    row.addEventListener('mouseenter', event => {
      if (!matchMedia('(hover: hover)').matches) return;
      hovering = true;
      stopTimer();
    });
    row.addEventListener('mouseleave', () => { hovering = false; schedule(); });
    row.addEventListener('focusin', () => { focused = true; stopTimer(); });
    row.addEventListener('focusout', event => {
      if (!row.contains(event.relatedTarget)) { focused = false; schedule(); }
    });
    viewport.addEventListener('keydown', event => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      event.stopPropagation();
      move(event.key === 'ArrowRight' ? 1 : -1);
    });
    viewport.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      interacting = true;
      stopTimer();
      if (event.pointerType !== 'mouse') return;
      drag = { x: event.clientX, left: viewport.scrollLeft };
      viewport.setPointerCapture(event.pointerId);
      viewport.classList.add('dragging');
    });
    viewport.addEventListener('pointermove', event => {
      if (!drag) return;
      viewport.scrollLeft = drag.left - (event.clientX - drag.x);
    });
    function endInteraction() {
      interacting = false;
      if (drag) {
        drag = null;
        viewport.classList.remove('dragging');
        viewport.scrollTo({ left: Math.round(viewport.scrollLeft / stride) * stride, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
      }
      clearTimeout(settleTimer);
      settleTimer = setTimeout(settle, 180);
    }
    viewport.addEventListener('pointerup', endInteraction);
    viewport.addEventListener('pointercancel', endInteraction);
    document.addEventListener('visibilitychange', schedule);
    reducedMotion.addEventListener('change', schedule);
    update();
  });

  function syncNavigation() {
    document.querySelectorAll('[data-page]').forEach(button => {
      if (+button.dataset.page === current) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    document.querySelector('#previous-page').disabled = current === 1;
    document.querySelector('#next-page').disabled = current === pages.length;
    document.querySelector('#page-counter').textContent = `0${current} / 0${pages.length}`;
    document.querySelector('.nav-caption').textContent = ['MEET BUSINESS CLUB', 'EXPLORE BUSINESS CLUB', 'JOIN BUSINESS CLUB'][current - 1];
  }
  async function goToPage(target, options = {}) {
    if (turning || target === current || target < 1 || target > pages.length) return;
    turning = true;
    const previous = pages[current - 1];
    const next = pages[target - 1];
    const forwards = target > current;
    previous.classList.remove('enter-left', 'enter-right');
    previous.classList.add(forwards ? 'leave-left' : 'leave-right');
    if (!reducedMotion.matches) await new Promise(resolve => setTimeout(resolve, 240));
    previous.hidden = true;
    previous.classList.remove('active', 'leave-left', 'leave-right');
    next.hidden = false;
    next.classList.add('active', forwards ? 'enter-right' : 'enter-left');
    current = target;
    if (!options.fromHistory) history.pushState({ page: target }, '', `#page-${target}`);
    window.scrollTo({ top: 0, behavior: 'instant' });
    syncNavigation();
    document.querySelector('.page-announcer').textContent = `Page ${target} of ${pages.length}: ${pageLabels[target - 1]}`;
    document.querySelector('#leaflet').focus({ preventScroll: true });
    if (target === 1) heartObserver.observe(heart);
    if (!reducedMotion.matches) await new Promise(resolve => setTimeout(resolve, 600));
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
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input,textarea,select,[data-carousel],a,button,[contenteditable]')) return;
    if (event.key === 'ArrowRight') goToPage(current + 1);
    if (event.key === 'ArrowLeft') goToPage(current - 1);
  });
  let touchOrigin = null;
  const main = document.querySelector('main');
  main.addEventListener('touchstart', event => {
    if (event.touches.length !== 1 || event.target.closest('a,button,[data-carousel]')) { touchOrigin = null; return; }
    touchOrigin = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });
  main.addEventListener('touchend', event => {
    if (!touchOrigin || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchOrigin.x;
    const dy = event.changedTouches[0].clientY - touchOrigin.y;
    touchOrigin = null;
    if (Math.abs(dx) > 85 && Math.abs(dx) > Math.abs(dy) * 1.8) goToPage(current + (dx < 0 ? 1 : -1));
  }, { passive: true });
  main.addEventListener('touchcancel', () => { touchOrigin = null; }, { passive: true });
  function hashPage() {
    const target = Number(location.hash.match(/^#page-([1-3])$/)?.[1]);
    return target || 1;
  }
  window.addEventListener('popstate', () => goToPage(hashPage(), { fromHistory: true }));
  current = hashPage();
  pages.forEach((page, i) => {
    page.hidden = i !== current - 1;
    page.classList.toggle('active', i === current - 1);
  });
  syncNavigation();
})();
