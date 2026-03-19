/* ============================================================
   BRITE SMILE – script.js
   ============================================================ */

(function () {
  'use strict';

  /* ── Navbar: scroll class ───────────────── */
  const navbar = document.getElementById('navbar');

  function handleScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ── Mobile nav toggle ──────────────────── */
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Close on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      navLinks.classList.remove('open');
    }
  });

  /* ── Smooth scroll (anchor links) ──────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = navbar.offsetHeight + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ── Scroll fade-in animations ──────────── */
  const fadeEls = document.querySelectorAll('.fade-in');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // stagger children of grids
          const delay = entry.target.closest('.services-grid, .gallery-grid, .testimonials-grid, .contact-grid')
            ? Array.from(entry.target.parentElement.children).indexOf(entry.target) * 80
            : 0;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  fadeEls.forEach(el => observer.observe(el));

  /* ── Active nav link highlight ──────────── */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navAnchors.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { threshold: 0.35 }
  );

  sections.forEach(s => sectionObserver.observe(s));

  /* ── Gallery lightbox (simple) ─────────── */
  const galleryItems = document.querySelectorAll('.gallery-item');

  // Build overlay
  const lightbox = document.createElement('div');
  lightbox.id = 'lightbox';
  lightbox.innerHTML = `
    <div class="lb-backdrop"></div>
    <div class="lb-content">
      <button class="lb-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
      <img src="" alt="Gallery image" />
      <p class="lb-caption"></p>
    </div>
  `;
  Object.assign(lightbox.style, {
    position: 'fixed', inset: '0', zIndex: '9999',
    display: 'none', alignItems: 'center', justifyContent: 'center'
  });
  document.body.appendChild(lightbox);

  // Add CSS via JS
  const lbStyle = document.createElement('style');
  lbStyle.textContent = `
    #lightbox { background: rgba(8,20,46,.92); }
    .lb-backdrop { position: absolute; inset: 0; }
    .lb-content {
      position: relative; z-index: 1;
      max-width: min(90vw, 900px);
      border-radius: 16px; overflow: hidden;
      box-shadow: 0 30px 80px rgba(0,0,0,.5);
    }
    .lb-content img { width: 100%; max-height: 80vh; object-fit: contain; background: #000; }
    .lb-caption {
      background: #fff; color: #0a2540;
      padding: 12px 20px; font-size: .85rem; font-weight: 500;
    }
    .lb-close {
      position: absolute; top: 14px; right: 14px;
      width: 38px; height: 38px;
      background: rgba(255,255,255,.15); color: #fff;
      border: none; border-radius: 50%; cursor: pointer;
      font-size: 1rem; display: grid; place-items: center;
      transition: background .2s;
      z-index: 2;
    }
    .lb-close:hover { background: rgba(255,255,255,.3); }
  `;
  document.head.appendChild(lbStyle);

  const lbImg     = lightbox.querySelector('img');
  const lbCaption = lightbox.querySelector('.lb-caption');
  const lbClose   = lightbox.querySelector('.lb-close');
  const lbBd      = lightbox.querySelector('.lb-backdrop');

  function openLightbox(item) {
    const img = item.querySelector('img');
    const caption = item.querySelector('.gallery-overlay span');
    lbImg.src = img.src;
    lbCaption.textContent = caption ? caption.textContent : '';
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      lightbox.style.opacity = '0';
      lightbox.style.transition = 'opacity .25s ease';
      requestAnimationFrame(() => { lightbox.style.opacity = '1'; });
    });
  }

  function closeLightbox() {
    lightbox.style.opacity = '0';
    setTimeout(() => {
      lightbox.style.display = 'none';
      document.body.style.overflow = '';
    }, 250);
  }

  galleryItems.forEach(item => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => openLightbox(item));
  });

  lbClose.addEventListener('click', closeLightbox);
  lbBd.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

  /* ── Scroll-to-top on logo click ─────── */
  document.querySelectorAll('.nav-logo').forEach(logo => {
    logo.addEventListener('click', e => {
      if (logo.getAttribute('href') === '#hero') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  /* ── Counter animation on about stats ── */
  // (re-uses hero stats in viewport)
  function animateCount(el, target, suffix = '') {
    let current = 0;
    const step = Math.ceil(target / 50);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = current + suffix;
    }, 30);
  }

  const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat strong').forEach(el => {
          const raw = el.textContent.replace(/[^0-9]/g, '');
          const suffix = el.textContent.replace(/[0-9]/g, '');
          if (raw) animateCount(el, parseInt(raw), suffix);
        });
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) statsObserver.observe(heroStats);

  /* ── WhatsApp float pulse ─────────────── */
  const waFloat = document.querySelector('.wa-float');
  if (waFloat) {
    const pulse = document.createElement('span');
    pulse.style.cssText = `
      position:absolute; inset:-6px; border-radius:50%;
      border:2px solid rgba(37,211,102,.5);
      animation:waPulse 2s infinite;
      pointer-events:none;
    `;
    const pStyle = document.createElement('style');
    pStyle.textContent = `
      .wa-float { position: relative; }
      @keyframes waPulse {
        0%   { transform: scale(1);   opacity: .8; }
        70%  { transform: scale(1.4); opacity: 0; }
        100% { transform: scale(1.4); opacity: 0; }
      }
    `;
    document.head.appendChild(pStyle);
    waFloat.appendChild(pulse);
  }

})();
