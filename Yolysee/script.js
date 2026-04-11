/* ══════════════════════════════════════════════
   YOLYSSE — script.js
   Light mode native + dark mode toggle
══════════════════════════════════════════════ */

(() => {
  'use strict';
  
  const root = document.documentElement;
  const body = document.body;
  
  const cartCountEl = document.querySelector('.cart-count');
  const cartIcon = document.querySelector('.cart-icon');
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const menuOverlay = document.getElementById('menuOverlay');
  const closeMenu = document.getElementById('closeMenu');
  const testimonialsTrack = document.getElementById('testimonialsTrack');
  const emailInput = document.getElementById('emailInput');
  const backToTop = document.getElementById('backToTop');
  const cartToast = document.getElementById('cartToast');
  const toastMsg = document.getElementById('toastMsg');
  const navRight = document.querySelector('.nav-right');
  
  let cartCount = 0;
  
  /* ─── THEME ─────────────────────────────── */
  function ensureThemeToggle() {
    if (!navRight || document.getElementById('themeToggle')) return;
    
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-icon theme-toggle';
    btn.id = 'themeToggle';
    btn.setAttribute('aria-label', 'Toggle theme');
    btn.innerHTML = '<span class="theme-icon" aria-hidden="true">☾</span>';
    
    const hamburgerBtn = document.getElementById('hamburger');
    if (hamburgerBtn) {
      navRight.insertBefore(btn, hamburgerBtn);
    } else {
      navRight.appendChild(btn);
    }
  }
  
  function applyTheme(theme) {
    const resolved = theme === 'dark' ? 'dark' : 'light';
    root.setAttribute('data-theme', resolved);
    localStorage.setItem('yolysse-theme', resolved);
    
    const icon = document.querySelector('#themeToggle .theme-icon');
    if (icon) {
      icon.textContent = resolved === 'dark' ? '☀' : '☾';
    }
  }
  
  function initTheme() {
    ensureThemeToggle();
    
    const saved = localStorage.getItem('yolysse-theme') || 'light';
    applyTheme(saved);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const current = root.getAttribute('data-theme') || 'light';
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    }
  }
  
  /* ─── CART ─────────────────────────────── */
  function showToast(msg) {
    if (!cartToast || !toastMsg) return;
    toastMsg.textContent = msg;
    cartToast.classList.add('show');
    window.clearTimeout(showToast._timer);
    showToast._timer = window.setTimeout(() => {
      cartToast.classList.remove('show');
    }, 3000);
  }
  
  window.addToCart = function addToCart(btn) {
    const name = btn?.dataset?.name || 'Item';
    cartCount += 1;
    
    if (cartCountEl) cartCountEl.textContent = String(cartCount);
    
    if (cartIcon) {
      cartIcon.style.transform = 'scale(1.18)';
      window.setTimeout(() => {
        cartIcon.style.transform = 'scale(1)';
      }, 250);
    }
    
    showToast(`${name} added to cart!`);
  };
  
  /* ─── NAVBAR SCROLL ─────────────────────── */
  function handleScroll() {
    const scrollY = window.scrollY || 0;
    
    if (navbar) {
      if (scrollY > 80) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    }
    
    if (backToTop) {
      if (scrollY > 400) backToTop.classList.add('visible');
      else backToTop.classList.remove('visible');
    }
  }
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
  
  /* ─── MOBILE MENU ───────────────────────── */
  function openMenu() {
    if (!mobileMenu || !menuOverlay) return;
    mobileMenu.classList.add('open');
    menuOverlay.classList.add('show');
    body.style.overflow = 'hidden';
  }
  
  function closeMenuFn() {
    if (!mobileMenu || !menuOverlay) return;
    mobileMenu.classList.remove('open');
    menuOverlay.classList.remove('show');
    body.style.overflow = '';
  }
  
  if (hamburger) hamburger.addEventListener('click', openMenu);
  if (closeMenu) closeMenu.addEventListener('click', closeMenuFn);
  if (menuOverlay) menuOverlay.addEventListener('click', closeMenuFn);
  
  document.querySelectorAll('.mobile-menu nav a').forEach(link => {
    link.addEventListener('click', closeMenuFn);
  });
  
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMenuFn();
  });
  
  /* ─── TESTIMONIALS ──────────────────────── */
  window.scrollTestimonials = function scrollTestimonials(dir) {
    if (!testimonialsTrack) return;
    testimonialsTrack.scrollBy({ left: dir * 380, behavior: 'smooth' });
  };
  
  /* ─── NEWSLETTER ────────────────────────── */
  window.subscribeEmail = function subscribeEmail() {
    if (!emailInput) return;
    
    const email = emailInput.value.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
    if (!isValid) {
      emailInput.style.borderColor = 'rgba(255,80,80,0.55)';
      emailInput.placeholder = 'Please enter a valid email';
      
      window.setTimeout(() => {
        emailInput.style.borderColor = '';
        emailInput.placeholder = 'Your email address';
      }, 2500);
      
      return;
    }
    
    showToast('Welcome to YOLYSSE! ✦');
    emailInput.value = '';
    emailInput.placeholder = "You're subscribed! ✦";
    
    window.setTimeout(() => {
      emailInput.placeholder = 'Your email address';
    }, 4000);
  };
  
  if (emailInput) {
    emailInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') window.subscribeEmail();
    });
  }
  
  /* ─── WISHLIST TOGGLE ───────────────────── */
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const active = btn.dataset.active === 'true';
      btn.dataset.active = String(!active);
      btn.textContent = active ? '♡' : '♥';
      btn.style.color = active ? '' : 'var(--gold)';
    });
  });
  
  /* ─── SCROLL REVEAL ─────────────────────── */
  const revealEls = document.querySelectorAll(
    '.pillar, .product-card, .testimonial-card, .about-inner, .feature-split-content, .lifestyle-img, .newsletter-inner'
  );
  
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    
    revealEls.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = `opacity 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${(i % 4) * 0.1}s, transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${(i % 4) * 0.1}s`;
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }
  
  /* ─── SMOOTH ANCHOR SCROLL ──────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 100;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
  
  /* ─── ANNOUNCEMENT BAR DUPLICATION ──────── */
  (function duplicateAnnouncementText() {
    const bar = document.querySelector('.announcement-bar span');
    if (bar && !bar.dataset.duplicated) {
      bar.dataset.duplicated = 'true';
      bar.innerHTML = `${bar.innerHTML}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${bar.innerHTML}`;
    }
  })();
  
  /* ─── LOGO HOVER TILT ───────────────────── */
  const logoImg = document.querySelector('.logo-img');
  if (logoImg) {
    logoImg.addEventListener('mousemove', (e) => {
      const rect = logoImg.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = ((e.clientX - cx) / rect.width) * 12;
      const dy = ((e.clientY - cy) / rect.height) * 12;
      logoImg.style.transform = `rotate(${dx}deg) translateY(${-dy * 0.15}px) scale(1.06)`;
    });
    
    logoImg.addEventListener('mouseleave', () => {
      logoImg.style.transform = '';
    });
  }
  
  /* ─── INIT ─────────────────────────────── */
  initTheme();
})();