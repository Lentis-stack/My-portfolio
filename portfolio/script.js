/*
  Vanilla JS for premium portfolio interactions.
  - Theme toggle (localStorage)
  - Loading screen fade
  - Smooth scrolling enhancements (native CSS already enabled)
  - Active nav highlight (IntersectionObserver)
  - Mobile hamburger menu animation
  - Typing animation
  - Scroll reveal animations
  - Counter animations
  - Progress bar animations
  - Button ripple effects
  - Back-to-top
*/

(function () {
  const root = document.documentElement;

  // -------------------- Theme toggle --------------------
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle?.querySelector('.icon');

  function applyTheme(theme) {
    if (!theme) return;
    root.setAttribute('data-theme', theme);
    const isDark = theme === 'dark';
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(!isDark ? false : true));
    }
    if (themeIcon) themeIcon.textContent = isDark ? '🌙' : '☀️';

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', isDark ? '#0F172A' : '#F5F7FB');
  }

  function initTheme() {
    const saved = localStorage.getItem('portfolio-theme');
    if (saved === 'light' || saved === 'dark') {
      applyTheme(saved);
      return;
    }
    // default: dark (premium background)
    applyTheme('dark');
  }

  themeToggle?.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('portfolio-theme', next);
  });

  initTheme();

  // -------------------- Loading screen --------------------
  window.addEventListener('load', () => {
    const loading = document.querySelector('.loading');
    if (!loading) return;
    setTimeout(() => loading.classList.add('is-hidden'), 250);
    setTimeout(() => {
      loading.remove();
    }, 900);
  });

  // -------------------- Back to top --------------------
  const toTop = document.querySelector('.to-top');
  const onScroll = () => {
    if (!toTop) return;
    const y = window.scrollY || document.documentElement.scrollTop;
    if (y > 700) toTop.classList.add('is-visible');
    else toTop.classList.remove('is-visible');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // -------------------- Mobile hamburger menu --------------------
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  function setMenuOpen(open) {
    if (!mobileMenu) return;
    hamburger?.setAttribute('aria-expanded', String(open));
    if (open) {
      mobileMenu.hidden = false;
      mobileMenu.classList.add('is-open');
    } else {
      mobileMenu.classList.remove('is-open');
      setTimeout(() => {
        if (mobileMenu && !mobileMenu.classList.contains('is-open')) mobileMenu.hidden = true;
      }, 200);
    }
  }

  hamburger?.addEventListener('click', () => {
    const open = mobileMenu?.classList.contains('is-open');
    setMenuOpen(!open);
  });

  // Close on link click (mobile)
  mobileMenu?.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link) setMenuOpen(false);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!mobileMenu || mobileMenu.hidden) return;
    const panel = mobileMenu.querySelector('.mobile-menu__panel');
    if (!panel) return;
    if (e.target === mobileMenu || mobileMenu.contains(e.target) && !panel.contains(e.target)) {
      setMenuOpen(false);
    }
  });

  // -------------------- Typing animation --------------------
  // Requirements: cycles through:
  // Software Engineer
  // Frontend Developer
  // JavaScript Developer
  // Problem Solver
  const subtitleLabel = document.querySelector('.hero__subtitle-label');
  const typingParent = document.querySelector('.hero__typing');
  const typingCaret = document.querySelector('.hero__typing-caret');

  if (subtitleLabel && typingParent) {
    const phrases = [
      'Software Engineer',
      'Frontend Developer',
      'JavaScript Developer',
      'Problem Solver'
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const typeSpeed = 45;
    const deleteSpeed = 25;
    const pauseAfterType = 900;

    function tick() {
      const current = phrases[phraseIndex];
      if (!deleting) {
        charIndex++;
        subtitleLabel.textContent = current.slice(0, charIndex);
        if (charIndex >= current.length) {
          deleting = true;
          setTimeout(tick, pauseAfterType);
          return;
        }
        setTimeout(tick, typeSpeed);
      } else {
        charIndex--;
        subtitleLabel.textContent = current.slice(0, charIndex);
        if (charIndex <= 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          setTimeout(tick, 250);
          return;
        }
        setTimeout(tick, deleteSpeed);
      }
    }

    // Start after layout
    setTimeout(() => {
      subtitleLabel.textContent = phrases[0].slice(0, 0);
      tick();
    }, 500);

    // Respect reduced motion
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce && typingCaret) typingCaret.style.display = 'none';
  }

  // -------------------- Reveal animations + active nav + viewport animations --------------------
  const revealEls = Array.from(document.querySelectorAll('.reveal'));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  // Active navigation highlight
  const navLinks = Array.from(document.querySelectorAll('.nav__link[data-nav]'));
  const sections = ['home', 'about', 'skills', 'projects', 'experience', 'education', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const navObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];

      if (!visible) return;
      const id = visible.target.id;
      navLinks.forEach((a) => a.classList.toggle('is-active', a.dataset.nav === id));
    },
    { threshold: [0.2, 0.35, 0.5], rootMargin: '-20% 0px -65% 0px' }
  );
  sections.forEach((s) => navObserver.observe(s));

  // Counters (animate when visible)
  const counters = Array.from(document.querySelectorAll('[data-count]'));
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        animateCounter(el, Number(el.getAttribute('data-count')) || 0);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.3 }
  );
  counters.forEach((c) => counterObserver.observe(c));

  function animateCounter(el, target) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      el.textContent = String(target);
      return;
    }

    const duration = 900 + Math.min(800, target * 3);
    const start = performance.now();

    const fmt = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(target * eased);
      el.textContent = fmt.format(value);
      if (t < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  // Progress bars (animate fill width)
  const progressEls = Array.from(document.querySelectorAll('.progress[data-progress]'));
  const progressObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const percent = Number(el.getAttribute('data-progress')) || 0;
        const fill = el.querySelector('.progress__fill');
        if (fill) fill.style.width = percent + '%';
        progressObserver.unobserve(el);
      });
    },
    { threshold: 0.35 }
  );
  progressEls.forEach((p) => progressObserver.observe(p));

  // -------------------- Button ripple effect --------------------
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;

    const ripple = btn.querySelector('.btn__ripple');
    if (!ripple) return;

    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.opacity = '1';
    ripple.style.transform = 'translate(-50%,-50%) scale(1)';

    // reset quickly
    clearTimeout(btn.__rippleTimer);
    btn.__rippleTimer = setTimeout(() => {
      ripple.style.opacity = '0';
      ripple.style.transform = 'translate(-50%,-50%) scale(0)';
    }, 420);
  });

  // -------------------- Contact form (demo handling) --------------------
  const form = document.getElementById('contactForm');
  const status = form?.querySelector('.form__status');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!status) return;

    status.textContent = 'Sending message…';

    // No backend required for this portfolio.
    // Simulate success and provide a helpful message.
    setTimeout(() => {
      status.textContent = 'Message ready! Replace the mailto links / connect a backend to send for real.';
      form.reset();
    }, 650);
  });

})();

