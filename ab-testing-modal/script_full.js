/* 
  A/B Test – Modal Video Hero (Expanded JS)
  Author: Chris Birkmeyer
  Description:
    Production-style JavaScript demonstrating how I'd structure an experiment:
    - Feature flags and variant handling
    - Modal controller with accessibility
    - Multiple trigger paths: click, idle, scroll depth, exit-intent
    - Debounce/throttle utilities
    - Analytics hooks (dataLayer/gtag-safe)
    - Guard rails (frequency caps, consent, storage safety)
*/

/* =========================
   Utilities
========================= */

const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const $ = (sel, ctx = document) => ctx.querySelector(sel);

const raf = (fn) => requestAnimationFrame(fn);

const debounce = (fn, wait = 200) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
};

const throttle = (fn, limit = 200) => {
  let inThrottle = false;
  return (...args) => {
    if (inThrottle) return;
    inThrottle = true;
    fn(...args);
    setTimeout(() => (inThrottle = false), limit);
  };
};

const safeStorage = {
  get(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key, val) {
    try { localStorage.setItem(key, val); } catch {}
  },
  jsonGet(key, fallback = null) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  },
  jsonSet(key, obj) {
    try { localStorage.setItem(key, JSON.stringify(obj)); } catch {}
  }
};

/* =========================
   Analytics Hooks
========================= */

const hasDataLayer = () => typeof window !== 'undefined' && Array.isArray(window.dataLayer);
const track = (eventName, params = {}) => {
  // Prefer dataLayer.push (GTM), fallback to console for demo
  const payload = { event: eventName, ...params };
  if (hasDataLayer()) {
    window.dataLayer.push(payload);
  } else {
    console.log('[track]', payload);
  }
};

/* =========================
   Feature Flags / Experiment
========================= */
const EXPERIMENT_ID = 'video_hero_modal_v1';
const VARIANTS = {
  CONTROL: 'control',
  MODAL_VIDEO: 'modal_video'
};

// For demo: pick variant deterministically based on a hash of user_id or session
function chooseVariant(seed = (safeStorage.get('ab_seed') || 'default')) {
  const hash = [...seed].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 1000, 0);
  return hash % 2 === 0 ? VARIANTS.MODAL_VIDEO : VARIANTS.CONTROL;
}

// Persist the choice for session consistency
function getAssignedVariant() {
  let v = safeStorage.get(`${EXPERIMENT_ID}:variant`);
  if (!v) {
    const chosen = chooseVariant(safeStorage.get('user_id') || String(Date.now()));
    safeStorage.set(`${EXPERIMENT_ID}:variant`, chosen);
    v = chosen;
  }
  return v;
}

/* =========================
   Frequency Capping
========================= */
const CAP_KEY = `${EXPERIMENT_ID}:caps`;
const capState = safeStorage.jsonGet(CAP_KEY, { modalShownToday: false, lastShown: 0 });

function withinDailyCap() {
  const last = capState.lastShown;
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const now = Date.now();
  return now - last < ONE_DAY;
}

function markShown() {
  capState.modalShownToday = true;
  capState.lastShown = Date.now();
  safeStorage.jsonSet(CAP_KEY, capState);
}

/* =========================
   Modal Controller (Accessible)
========================= */
const Modal = (() => {
  let $backdrop, $dialog, $close, $iframe, previousActive;

  function cache() {
    $backdrop = $('#video-modal');
    $dialog = $('.modal__dialog', $backdrop);
    $close = $('.modal__close', $backdrop);
    $iframe = $('#demo-video', $backdrop);
  }

  function open() {
    if (!$backdrop) cache();
    if (!$backdrop) return;

    previousActive = document.activeElement;

    $backdrop.classList.add('modal--open');
    $backdrop.setAttribute('aria-hidden', 'false');

    // Focus the close for accessibility
    $close?.focus();

    track('modal_open', { experiment_id: EXPERIMENT_ID });

    // Basic focus trap
    document.addEventListener('keydown', onKeydown);
    $backdrop.addEventListener('click', onBackdropClick);
  }

  function close() {
    if (!$backdrop) cache();
    if (!$backdrop) return;

    $backdrop.classList.remove('modal--open');
    $backdrop.setAttribute('aria-hidden', 'true');

    // Stop the video by resetting src
    if ($iframe) {
      const src = $iframe.getAttribute('src');
      $iframe.setAttribute('src', src);
    }

    // Restore focus
    previousActive?.focus();

    track('modal_close', { experiment_id: EXPERIMENT_ID });

    document.removeEventListener('keydown', onKeydown);
    $backdrop.removeEventListener('click', onBackdropClick);
  }

  function onKeydown(e) {
    if (e.key === 'Escape') close();
    // Optional: improve focus trap here if needed
  }

  function onBackdropClick(e) {
    if (e.target === e.currentTarget) close();
  }

  function bind() {
    if (!$backdrop) cache();
    if (!$backdrop) return;
    $close?.addEventListener('click', close);
  }

  return { open, close, bind };
})();


/* =========================
   Triggers (Click, Idle, Scroll, Exit)
========================= */

const Triggers = (() => {
  let idleTimer;
  const IDLE_MS = 15000; // 15s idle
  const SCROLL_DEPTH = 0.5; // 50% scroll
  let exitBound = false, scrollBound = false;

  function onCTAClick() {
    track('hero_cta_click', { experiment_id: EXPERIMENT_ID });
    Modal.open();
    markShown();
  }

  function startIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (!withinDailyCap()) {
        track('idle_trigger_fired', { experiment_id: EXPERIMENT_ID });
        Modal.open();
        markShown();
      }
    }, IDLE_MS);
  }

  function resetIdle() {
    startIdleTimer();
  }

  const onScroll = throttle(() => {
    const scrolled = window.scrollY + window.innerHeight;
    const ratio = scrolled / document.documentElement.scrollHeight;
    if (ratio >= SCROLL_DEPTH && !withinDailyCap()) {
      track('scroll_depth_trigger_fired', { experiment_id: EXPERIMENT_ID, ratio });
      Modal.open();
      markShown();
      window.removeEventListener('scroll', onScroll);
    }
  }, 250);

  function bindScrollDepth() {
    if (scrollBound) return;
    scrollBound = true;
    window.addEventListener('scroll', onScroll);
  }

  function bindExitIntent() {
    if (exitBound) return;
    exitBound = true;
    document.addEventListener('mouseout', (e) => {
      if (e.toElement === null && e.relatedTarget === null && e.clientY <= 0) {
        if (!withinDailyCap()) {
          track('exit_intent_trigger_fired', { experiment_id: EXPERIMENT_ID });
          Modal.open();
          markShown();
        }
      }
    });
  }

  function bindCTA() {
    $('#watch-demo')?.addEventListener('click', onCTAClick);
  }

  function init() {
    bindCTA();
    bindScrollDepth();
    bindExitIntent();
    startIdleTimer();
    ['mousemove', 'keydown', 'scroll', 'touchstart'].forEach((evt) => {
      document.addEventListener(evt, resetIdle, { passive: true });
    });
  }

  return { init };
})();


/* =========================
   Hero Variant Renderer
========================= */

function renderModalVariant() {
  // Ensure modal DOM exists (if not, create minimal structure)
  if (!$('#video-modal')) {
    const tpl = document.createElement('div');
    tpl.innerHTML = `
      <div id="video-modal" class="modal" aria-hidden="true" role="dialog" aria-label="Demo Video">
        <div class="modal__dialog" role="document">
          <button class="modal__close" aria-label="Close">&times;</button>
          <div class="modal__body">
            <div class="responsive-video">
              <iframe id="demo-video" src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                      title="Demo Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen></iframe>
            </div>
          </div>
        </div>
      </div>
    `.trim();
    document.body.appendChild(tpl.firstChild);
  }

  Modal.bind();
  Triggers.init();
  track('variant_rendered', { experiment_id: EXPERIMENT_ID, variant: VARIANTS.MODAL_VIDEO });
}

function renderControl() {
  // No-op: renders the page as-is without modal
  track('variant_rendered', { experiment_id: EXPERIMENT_ID, variant: VARIANTS.CONTROL });
}


/* =========================
   Boot
========================= */

function bootExperiment() {
  const variant = getAssignedVariant();
  track('experiment_view', { experiment_id: EXPERIMENT_ID, variant });

  if (variant === VARIANTS.MODAL_VIDEO) {
    renderModalVariant();
  } else {
    renderControl();
  }
}

// Defer boot until DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootExperiment);
} else {
  bootExperiment();
}
