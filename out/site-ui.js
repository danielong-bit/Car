// Shared customer controls for the showroom and dedicated Audi experience.
(() => {
  document.documentElement.classList.add('js-enabled');
  function init() {
    const menu = document.querySelector('.menu-toggle');
    const nav = document.getElementById('primaryNav');
    const closeMenu = () => {
      nav?.classList.remove('is-open');
      menu?.setAttribute('aria-expanded', 'false');
      if (menu) menu.textContent = 'Menu';
    };
    menu?.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      menu.textContent = open ? 'Close' : 'Menu';
      nav.classList.toggle('is-open', open);
    });
    nav?.addEventListener('click', e => {
      if (e.target.closest('a') || (e.target.closest('button') && !e.target.closest('#themeSwitcherWrap'))) closeMenu();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); }
    });
    window.matchMedia('(min-width: 821px)').addEventListener('change', closeMenu);

    const dialogs = [...document.querySelectorAll('dialog')];
    const syncDialogScroll = () => document.body.classList.toggle('dialog-open', dialogs.some(dialog => dialog.open));
    dialogs.forEach(dialog => {
      new MutationObserver(syncDialogScroll).observe(dialog, {attributes: true, attributeFilter: ['open']});
      dialog.addEventListener('close', syncDialogScroll);
    });

    const dedicated = !!document.getElementById('mediaPlane');
    const video = document.getElementById(dedicated ? 'viewerVideo' : 'showroomVideo');
    const media = document.getElementById(dedicated ? 'mediaPlane' : 'showroomMedia');
    const tools = document.querySelector('.viewer-tools');
    if (video && tools) {
      const features = () => dedicated ? viewerConfig : audiViewerConfig;
      const current = () => dedicated ? state : showroomViewerState;
      const restore = () => dedicated ? finishReturnToOverview() : finishShowroomReturnToOverview();
      const select = item => dedicated ? selectHotspot(item) : selectShowroomHotspot(item);
      const zoom = () => dedicated ? expZoomState : zoomState;
      const featureTray = tools.querySelector('[data-feature-shortcuts]');
      const back = tools.querySelector('[data-viewer-back]');
      const zoomValue = tools.querySelector('[data-zoom-value]');
      const feedback = tools.querySelector('[data-media-status]');
      const feedbackText = feedback.querySelector('span');
      const retry = feedback.querySelector('[data-media-retry]');
      let failure = false;
      const showFeedback = (text = '', failed = false) => {
        failure = failed;
        feedback.hidden = !text;
        feedbackText.textContent = text;
        feedback.classList.toggle('is-loading', !!text && !failed);
        retry.hidden = !failed || !current().activeItem?.forwardVideo;
        media.setAttribute('aria-busy', String(!!text && !failed));
      };
      const panel = dedicated ? document.getElementById('tourPanel') : null;
      const keepPhotoVisible = () => {
        const rect = media.getBoundingClientRect();
        if (rect.top < 0 || rect.bottom > innerHeight) media.scrollIntoView({block: 'start', behavior: 'instant'});
      };
      const sync = () => {
        if (panel) panel.hidden = current().mode === 'normal';
        const active = current().activeItem;
        featureTray.hidden = !dedicated && vehicles[showroomIndex].id !== 'audi-s5';
        featureTray.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.featureId === active?.id)));
        back.disabled = current().mode === 'normal';
        zoomValue.textContent = zoom().scale.toFixed(1) + '×';
        tools.querySelector('[data-zoom="out"]').disabled = zoom().scale <= 1;
        tools.querySelector('[data-zoom="in"]').disabled = zoom().scale >= 4;
      };
      const choose = (item, trigger) => {
        restore();
        trigger?.focus({preventScroll: true});
        showFeedback();
        if (dedicated) selectHotspot(item, trigger); else select(item);
        sync();
        keepPhotoVisible();
      };
      const renderFeatures = () => {
        featureTray.replaceChildren();
        features().forEach(item => {
          const button = document.createElement('button');
          button.type = 'button';
          const labels = {interior: 'Cabin', boot: 'Boot', wheel: 'Wheel & brakes', audio: 'Audio', climate: 'Rear climate'};
          button.textContent = labels[item.id] || item.label;
          button.dataset.featureId = item.id;
          button.setAttribute('aria-pressed', 'false');
          button.addEventListener('click', () => choose(item, button));
          featureTray.appendChild(button);
        });
        sync();
      };
      renderFeatures();
      document.addEventListener('viewerconfigchange', renderFeatures);
      document.addEventListener('viewerstatechange', sync);
      back.addEventListener('click', () => {
        dedicated ? handleBack() : handleShowroomBack();
        if (current().mode === 'normal') showFeedback();
        sync();
        keepPhotoVisible();
      });
      tools.querySelectorAll('[data-zoom]').forEach(button => button.addEventListener('click', () => {
        if (button.dataset.zoom === 'reset') {
          dedicated ? resetExperienceZoom(true) : resetShowroomZoom(true);
        } else {
          const z = zoom();
          z.scale = Math.min(4, Math.max(1, z.scale + (button.dataset.zoom === 'in' ? .5 : -.5)));
          dedicated ? clampExpPan() : clampPan();
          dedicated ? updateExpZoomTransform(true) : updateZoomTransform(true);
        }
        sync();
      }));
      retry.addEventListener('click', () => {
        const item = features().find(item => item.id === current().activeItem?.id);
        if (item) choose(item, retry);
      });
      ['loadstart', 'waiting', 'stalled'].forEach(event => video.addEventListener(event, () => {
        if (video.getAttribute('src') && ['video', 'reverse'].includes(current().mode)) showFeedback('Loading video… You can return to the car at any time.');
        sync();
      }));
      ['playing', 'ended', 'emptied'].forEach(event => video.addEventListener(event, () => {
        if (!failure || current().mode === 'normal') showFeedback();
        sync();
      }));
      document.addEventListener('viewermediaerror', e => { showFeedback(e.detail, true); sync(); });
      const detail = document.getElementById(dedicated ? 'detailImage' : 'showroomDetailImage');
      detail.addEventListener('load', sync);
      detail.addEventListener('error', () => {
        if (detail.getAttribute('src')) showFeedback('This photo could not load. Try another feature or return to the car.', true);
      });
      media.addEventListener('click', () => requestAnimationFrame(sync));
      ['wheel', 'touchend'].forEach(event => media.addEventListener(event, () => requestAnimationFrame(sync), {passive: true}));
      document.addEventListener('keydown', () => requestAnimationFrame(sync));
    }

    // Photo navigation respects the current gallery filter.
    const lightbox = document.getElementById('lightbox');
    const image = document.getElementById('lightboxImg');
    if (lightbox && image) {
      const controls = document.createElement('div');
      controls.className = 'lightbox-controls';
      controls.innerHTML = '<button id="previousPhoto" type="button" aria-label="Previous photo">←</button><span class="lightbox-caption" id="photoCaption"></span><button id="nextPhoto" type="button" aria-label="Next photo">→</button>';
      lightbox.querySelector('.light').appendChild(controls);
      const gallery = () => [...document.querySelectorAll('.tile')].filter(tile => tile.style.display !== 'none' && !tile.classList.contains('missing')).map(tile => tile.querySelector('img'));
      const syncCaption = () => {
        const images = gallery();
        const i = images.findIndex(item => item.src === image.src);
        controls.querySelector('#photoCaption').textContent = `${image.alt} · ${i + 1} / ${images.length}`;
      };
      const step = amount => {
        const images = gallery();
        if (!images.length) return;
        const i = images.findIndex(item => item.src === image.src);
        const next = images[(i + amount + images.length) % images.length];
        image.src = next.src;
        image.alt = next.alt;
        syncCaption();
      };
      controls.querySelector('#previousPhoto').addEventListener('click', () => step(-1));
      controls.querySelector('#nextPhoto').addEventListener('click', () => step(1));
      image.addEventListener('load', syncCaption);
      document.addEventListener('keydown', e => {
        if (lightbox.open && ['ArrowLeft', 'ArrowRight'].includes(e.key)) { e.preventDefault(); step(e.key === 'ArrowRight' ? 1 : -1); }
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
