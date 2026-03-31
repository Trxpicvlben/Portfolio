/* ===== PORTFOLIO SCRIPT — ===== */

// ── THEME ──
const THEME_KEY = 'fns-theme';
const body = document.body;
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');

function applyTheme(theme) {
  if (theme === 'light') {
    body.classList.add('light');
    themeIcon.textContent = '☀';
  } else {
    body.classList.remove('light');
    themeIcon.textContent = '◐';
  }
}

const saved = localStorage.getItem(THEME_KEY);
if (saved) {
  applyTheme(saved);
} else {
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  applyTheme(prefersLight ? 'light' : 'dark');
}

themeBtn?.addEventListener('click', () => {
  const isLight = body.classList.contains('light');
  const next = isLight ? 'dark' : 'light';
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
});

// ── MOBILE MENU ──
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const mobileOverlay = document.getElementById('mobileOverlay');
const mobileClose = document.getElementById('mobileClose');
const mobileLinks = document.querySelectorAll('.mobile-link');

function openMenu() {
  mobileMenu.classList.add('active');
  mobileOverlay.classList.add('active');
  body.style.overflow = 'hidden';
}
function closeMenu() {
  mobileMenu.classList.remove('active');
  mobileOverlay.classList.remove('active');
  body.style.overflow = '';
}

menuBtn?.addEventListener('click', openMenu);
mobileClose?.addEventListener('click', closeMenu);
mobileOverlay?.addEventListener('click', closeMenu);
mobileLinks.forEach(l => l.addEventListener('click', closeMenu));

// ── HEADER SCROLL ──
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ── ACTIVE NAV LINK ──
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.section === entry.target.id);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => observer.observe(s));

// ── CURSOR ──
const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
let mx = 0, my = 0;
let cx = 0, cy = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursorDot.style.left = mx + 'px';
  cursorDot.style.top  = my + 'px';
}, { passive: true });

function animateCursor() {
  cx += (mx - cx) * 0.12;
  cy += (my - cy) * 0.12;
  cursor.style.left = cx + 'px';
  cursor.style.top  = cy + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a, button, .tech-pill, .filter-btn, .project-card, .cert-card[data-link]').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.width = '48px';
    cursor.style.height = '48px';
    cursor.style.borderColor = 'var(--neon)';
    cursor.style.background = 'rgba(0,245,255,0.05)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.width = '32px';
    cursor.style.height = '32px';
    cursor.style.background = 'transparent';
  });
});

document.querySelectorAll('.cert-card[data-link]').forEach(card => {
  const openLink = () => {
    const url = card.dataset.link;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  card.addEventListener('click', openLink);
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLink();
    }
  });
});

// ── REVEAL ON SCROLL ──
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => {
        entry.target.classList.add('visible');
        // Animate skill bars
        const fills = entry.target.querySelectorAll('.bar-fill');
        fills.forEach(fill => {
          fill.style.width = fill.dataset.w + '%';
        });
      }, delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach((el, i) => {
  el.dataset.delay = (i % 4) * 80;
  revealObserver.observe(el);
});

function animateStatCounters() {
  const statEls = document.querySelectorAll('.num-value');
  statEls.forEach(el => {
    const target = parseInt(el.dataset.target, 10) || 0;
    if (target <= 0 || el.dataset.animated === 'true') return;
    el.dataset.animated = 'true';

    let current = 0;
    const interval = 200;
    const duration = 4000;
    const step = Math.max(1, Math.ceil(target / (duration / interval)));

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = current;
      }
    }, interval);
  });
}

const aboutStats = document.querySelector('.about-stats');
if (aboutStats) {
  const statsObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      animateStatCounters();
      statsObserver.unobserve(entries[0].target);
    }
  }, { threshold: 0.25 });
  statsObserver.observe(aboutStats);
}

// Also trigger skill bars when skill section is in view
const skillSection = document.getElementById('skills');
const skillObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    document.querySelectorAll('.bar-fill').forEach(fill => {
      fill.style.width = fill.dataset.w + '%';
    });
  }
}, { threshold: 0.1 });
if (skillSection) skillObserver.observe(skillSection);

// ── TYPED TEXT ──
const typedEl = document.getElementById('typedText');
const words = ['Data Scientist', 'ML Engineer', 'Data Analyst', 'BI Developer', 'Python Expert'];
let wi = 0, ci = 0, deleting = false, pausing = false;

function typeLoop() {
  if (!typedEl) return;
  const word = words[wi];
  if (pausing) {
    pausing = false;
    setTimeout(typeLoop, 1400);
    return;
  }
  if (!deleting) {
    typedEl.textContent = word.slice(0, ++ci);
    if (ci === word.length) { pausing = true; deleting = true; }
    setTimeout(typeLoop, 90);
  } else {
    typedEl.textContent = word.slice(0, --ci);
    if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; }
    setTimeout(typeLoop, pausing ? 1200 : 50);
  }
}
setTimeout(typeLoop, 1000);

// ── GRID CANVAS ──
const canvas = document.getElementById('gridCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H;

  function resizeCanvas() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  function drawGrid() {
    ctx.clearRect(0, 0, W, H);
    const gap = 50;
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 0.4;
    for (let x = 0; x < W; x += gap) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += gap) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }
  drawGrid();
  window.addEventListener('resize', drawGrid, { passive: true });
}

// ── PROJECT FILTER ──
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    projectCards.forEach(card => {
      const match = filter === 'all' || card.dataset.cat === filter;
      card.style.display = match ? '' : 'none';
      if (match) {
        card.style.animation = 'fadeIn 0.3s ease forwards';
      }
    });
  });
});

// ── CONTACT FORM ──
const contactForm = document.getElementById('contactForm');

if (window.emailjs) {
  emailjs.init('YOUR_EMAILJS_PUBLIC_KEY');
}

contactForm?.addEventListener('submit', e => {
  e.preventDefault();
  const btn = contactForm.querySelector('button[type="submit"]');
  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = 'Sending...';

  if (window.emailjs) {
    emailjs.sendForm('YOUR_EMAILJS_SERVICE_ID', 'YOUR_EMAILJS_TEMPLATE_ID', contactForm)
      .then(() => {
        btn.textContent = '✓ Message sent!';
        btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        contactForm.reset();
      }, () => {
        btn.textContent = 'Send failed. Retry';
        btn.style.background = 'linear-gradient(135deg, #f97316, #dc2626)';
      })
      .finally(() => {
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = originalText;
          btn.style.background = '';
        }, 3000);
      });
  } else {
    btn.textContent = 'EmailJS not loaded';
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = originalText;
    }, 3000);
  }
});

// ── SMOOTH SCROLL ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});


// ══ LIQUID GLASS BOTTOM NAV ══
// Apple iOS 26 Design Language
//
// Logique :
//   • 4 tabs visibles en permanence dans le conteneur
//   • La BULLE (.lg-bubble) se déplace entre les 4 slots (position 0–3)
//     via `left` en CSS — transition spring (morphing)
//   • Le ROW (.lg-tabs) se translate pour révéler tabs 5-7 quand nécessaire
//   • Pendant le drag : bulle suit le doigt en temps réel (no transition)
//     + row scroll si on pousse vers les bords
//   • Au relâchement : snap spring vers le tab le plus proche
//
// Formules clés :
//   TW = wrap.width / 4         (largeur d'un tab)
//   viewStart = premier index visible (0 par défaut)
//   bubbleSlot = activeIdx - viewStart  (0..3, slot visuel de la bulle)
//   bubbleLeft = bubbleSlot * TW + PADD
//   tabsTranslateX = -viewStart * TW

(function () {
  const nav    = document.getElementById('lgNav');
  const glass  = document.getElementById('lgGlass');
  const bubble = document.getElementById('lgBubble');
  const tabRow = document.getElementById('lgTabs');
  if (!nav || !glass || !bubble || !tabRow) return;

  const tabs    = Array.from(tabRow.querySelectorAll('.lg-tab[data-section]'));
  const N       = tabs.length;   // 7
  const VISIBLE = 4;
  const PADD    = 4;             // padding intérieur de la bulle

  function TW() { return glass.offsetWidth / VISIBLE; }

  let activeIdx  = 1;   // tab actuellement actif au démarrage : About
  let viewStart  = 0;   // premier tab visible dans le conteneur

  /* ── Active class ── */
  function setActive(i) {
    activeIdx = Math.max(0, Math.min(N - 1, Math.round(i)));
    tabs.forEach((t, j) => t.classList.toggle('active', j === activeIdx));
    // Fade droit : masquer si dernier tab visible
    glass.classList.toggle('at-end', viewStart + VISIBLE >= N);
  }

  function showSection(idx, instant = false) {
    const href = tabs[idx]?.getAttribute('href');
    const sec = href ? document.querySelector(href) : null;
    if (!sec) return;
    sec.scrollIntoView({ behavior: instant ? 'auto' : 'smooth' });
  }

  /* ── Calcule viewStart optimal pour un activeIdx donné ──
     La bulle doit rester dans les slots 0..3.
     On essaie de garder viewStart stable, on l'ajuste seulement
     si le tab actif sort de la vue.
  ── */
  function computeViewStart(idx, currentVS) {
    let vs = currentVS;
    if (idx < vs)                vs = idx;
    if (idx > vs + VISIBLE - 1)  vs = idx - (VISIBLE - 1);
    return Math.max(0, Math.min(N - VISIBLE, vs));
  }

  /* ── Rendu complet (bubble + row) ──
     floatIdx : index flottant (actif ou intermédiaire pendant drag)
     floatVS  : viewStart flottant
     animated : activer la transition spring (faux pendant drag)
  ── */
  function render(floatIdx, floatVS, animated) {
    const tw   = TW();
    // Slot visuel de la bulle = distance entre le tab et le bord gauche du conteneur
    const slot = floatIdx - floatVS;

    // Bulle
    if (animated) {
      bubble.classList.remove('dragging');
    } else {
      bubble.classList.add('dragging');
    }
    bubble.style.left  = (slot * tw + PADD) + 'px';
    bubble.style.width = (tw - PADD * 2) + 'px';

    // Row des tabs
    tabRow.style.transition = animated
      ? 'transform .38s cubic-bezier(.4,0,.2,1)'
      : 'none';
    tabRow.style.transform = `translateX(${-floatVS * tw}px)`;
  }

  /* ── Snap : finalise sur un index précis avec animation ── */
  function snapTo(floatIdx, animated) {
    const idx = Math.max(0, Math.min(N - 1, Math.round(floatIdx)));
    viewStart = computeViewStart(idx, viewStart);
    setActive(idx);
    render(idx, viewStart, animated);

    // Navigation vers la section
    if (animated) {
      const href = tabs[idx].getAttribute('href');
      const sec  = document.querySelector(href);
      if (sec) sec.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /* ════ GESTION DU DRAG ════ */
  let tx0 = 0, ty0 = 0;
  let ai0 = 0, vs0 = 0;
  let isDragging = false, isLocked = false;

  function dragStart(cx, cy) {
    tx0 = cx; ty0 = cy;
    ai0 = activeIdx; vs0 = viewStart;
    isDragging = false; isLocked = false;
    // Couper immédiatement les transitions pour le drag
    bubble.classList.add('dragging');
    tabRow.style.transition = 'none';
  }

  function dragMove(cx, cy) {
    const dx = cx - tx0;
    const dy = cy - ty0;

    // Détecter si c'est un scroll vertical (laisser la page scroller)
    if (!isDragging && !isLocked) {
      if (Math.abs(dy) > Math.abs(dx) + 6) { isLocked = true; return false; }
      if (Math.abs(dx) > 3) isDragging = true;
    }
    if (isLocked || !isDragging) return false;

    // floatIdx : index flottant du tab "actif" en temps réel
    // swipe droite (dx > 0) → tabs suivants → floatIdx monte
    const raw       = ai0 + dx / TW();
    const floatIdx  = Math.max(0, Math.min(N - 1, raw));
    const liveIdx   = Math.round(floatIdx);

    // viewStart s'adapte si on pousse aux extrémités
    const floatVS   = computeViewStart(liveIdx, vs0);
    viewStart = floatVS;

    render(floatIdx, floatVS, false);
    if (liveIdx !== activeIdx) {
      setActive(liveIdx);
      showSection(liveIdx, true);
    }
    return true;
  }

  function dragEnd(cx) {
    // Déverrouiller
    isLocked = false;

    if (!isDragging) {
      // Tap simple → naviguer vers le tab touché
      const el = document.elementFromPoint(cx, ty0)
                          ?.closest('.lg-tab[data-section]');
      if (el) {
        const i = tabs.indexOf(el);
        if (i !== -1) snapTo(i, true);
      }
      return;
    }

    isDragging = false;
    const dx = cx - tx0;
    // Snap vers le tab le plus proche
    const floatIdx = ai0 + dx / TW();
    snapTo(floatIdx, true);
  }

  /* ── Touch events — sur le NAV entier pour capturer partout ── */
  nav.addEventListener('touchstart',
    e => dragStart(e.touches[0].clientX, e.touches[0].clientY),
    { passive: true });

  nav.addEventListener('touchmove', e => {
    const captured = dragMove(e.touches[0].clientX, e.touches[0].clientY);
    if (captured) e.preventDefault();
  }, { passive: false });

  nav.addEventListener('touchend',
    e => dragEnd(e.changedTouches[0].clientX),
    { passive: true });

  /* ── Mouse events ── */
  let mouseHeld = false;
  nav.addEventListener('mousedown', e => {
    mouseHeld = true;
    dragStart(e.clientX, e.clientY);
    e.preventDefault();
  });
  window.addEventListener('mousemove', e => {
    if (mouseHeld) dragMove(e.clientX, e.clientY);
  });
  window.addEventListener('mouseup', e => {
    if (!mouseHeld) return;
    mouseHeld = false;
    dragEnd(e.clientX);
  });

  /* ── Synchronisation avec le scroll de la page ── */
  document.querySelectorAll('section[id]').forEach(sec => {
    new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      const i = tabs.findIndex(t => t.dataset.section === sec.id);
      if (i !== -1 && i !== activeIdx) snapTo(i, true);
    }, { rootMargin: '-38% 0px -58% 0px' }).observe(sec);
  });

  /* ── Resize ── */
  window.addEventListener('resize', () => snapTo(activeIdx, false), { passive: true });

  /* ── Keyboard avoidance ── */
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      const shrunk = window.visualViewport.height < window.innerHeight * 0.72;
      nav.classList.toggle('kb-hidden', shrunk);
    });
  }

  /* ── Init : init sans animation, bulle sur About au démarrage ── */
  requestAnimationFrame(() => {
    const initialVS = computeViewStart(activeIdx, viewStart);
    viewStart = initialVS;
    render(activeIdx, initialVS, false);
    setActive(activeIdx);
    showSection(activeIdx, true);
  });

})();
