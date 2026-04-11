/* ══════════════════════════════════════════════
   YOLYSSE — script.js  v2.0
   All fixes: sidebar theme switch, search bar,
   cart overlay, testimonial slider, contact form
══════════════════════════════════════════════ */

(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;

  /* ─── ELEMENT REFS ─── */
  const navbar            = document.getElementById('navbar');
  const hamburger         = document.getElementById('hamburger');
  const mobileMenu        = document.getElementById('mobileMenu');
  const menuOverlay       = document.getElementById('menuOverlay');
  const closeMenuBtn      = document.getElementById('closeMenu');

  const sidebarThemeToggle = document.getElementById('sidebarThemeToggle');

  const searchToggleBtn   = document.getElementById('searchToggleBtn');
  const searchBarWrap     = document.getElementById('searchBarWrap');
  const searchBackdrop    = document.getElementById('searchBackdrop');
  const searchInput       = document.getElementById('searchInput');
  const searchCloseBtn    = document.getElementById('searchCloseBtn');

  const cartIconBtn       = document.getElementById('cartIconBtn');
  const cartCountEl       = document.querySelector('.cart-count');
  const cartOverlay       = document.getElementById('cartOverlay');
  const cartBackdrop      = document.getElementById('cartBackdrop');
  const cartOverlayClose  = document.getElementById('cartOverlayClose');
  const cartItemsList     = document.getElementById('cartItemsList');
  const cartEmptyState    = document.getElementById('cartEmptyState');
  const cartOverlayCount  = document.getElementById('cartOverlayCount');
  const cartTotalPrice    = document.getElementById('cartTotalPrice');

  const emailInput        = document.getElementById('emailInput');
  const backToTop         = document.getElementById('backToTop');
  const cartToast         = document.getElementById('cartToast');
  const toastMsg          = document.getElementById('toastMsg');

  /* ─── STATE ─── */
  let cartItems = []; // [{ name, price, qty }]

  /* ═══════════════════════════════════════════
     1. THEME — Sidebar switch only
  ═══════════════════════════════════════════ */
  function applyTheme(theme) {
    const resolved = theme === 'dark' ? 'dark' : 'light';
    root.setAttribute('data-theme', resolved);
    localStorage.setItem('yolysse-theme', resolved);
    if (sidebarThemeToggle) {
      sidebarThemeToggle.checked = (resolved === 'dark');
    }
  }

  function initTheme() {
    const saved = localStorage.getItem('yolysse-theme') || 'dark';
    applyTheme(saved);

    if (sidebarThemeToggle) {
      sidebarThemeToggle.addEventListener('change', () => {
        applyTheme(sidebarThemeToggle.checked ? 'dark' : 'light');
      });
    }
  }

  /* ═══════════════════════════════════════════
     2. NAVBAR SCROLL
  ═══════════════════════════════════════════ */
  function handleScroll() {
    const scrollY = window.scrollY || 0;
    if (navbar) {
      navbar.classList.toggle('scrolled', scrollY > 80);
    }
    if (backToTop) {
      backToTop.classList.toggle('visible', scrollY > 400);
    }
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ═══════════════════════════════════════════
     3. SEARCH BAR — slide in/out below navbar
  ═══════════════════════════════════════════ */
  let searchOpen = false;

  function openSearch() {
    if (!searchBarWrap || !searchBackdrop) return;
    searchOpen = true;
    searchBarWrap.classList.add('open');
    searchBackdrop.classList.add('show');
    setTimeout(() => { if (searchInput) searchInput.focus(); }, 60);
  }

  function closeSearch() {
    if (!searchBarWrap || !searchBackdrop) return;
    searchOpen = false;
    searchBarWrap.classList.remove('open');
    searchBackdrop.classList.remove('show');
    if (searchInput) searchInput.blur();
  }

  if (searchToggleBtn) {
    searchToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      searchOpen ? closeSearch() : openSearch();
    });
  }
  if (searchCloseBtn) searchCloseBtn.addEventListener('click', closeSearch);
  if (searchBackdrop) searchBackdrop.addEventListener('click', closeSearch);
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSearch();
    });
  }

  /* ═══════════════════════════════════════════
     4. MOBILE MENU
  ═══════════════════════════════════════════ */
  function openMenu() {
    if (!mobileMenu || !menuOverlay) return;
    mobileMenu.classList.add('open');
    menuOverlay.classList.add('show');
    body.style.overflow = 'hidden';
  }
  function closeMenu() {
    if (!mobileMenu || !menuOverlay) return;
    mobileMenu.classList.remove('open');
    menuOverlay.classList.remove('show');
    body.style.overflow = '';
  }

  if (hamburger) hamburger.addEventListener('click', openMenu);
  if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
  if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);
  document.querySelectorAll('.mobile-menu nav a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMenu();
  });

  /* ═══════════════════════════════════════════
     5. CART SYSTEM — overlay with items
  ═══════════════════════════════════════════ */
  function formatPrice(n) {
    return '₹' + n.toLocaleString('en-IN');
  }

  function getCartTotal() {
    return cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  }

  function getTotalQty() {
    return cartItems.reduce((acc, item) => acc + item.qty, 0);
  }

  function renderCartItems() {
    if (!cartItemsList) return;

    // Clear non-empty-state children
    Array.from(cartItemsList.children).forEach(child => {
      if (child.id !== 'cartEmptyState') child.remove();
    });

    if (cartItems.length === 0) {
      if (cartEmptyState) cartEmptyState.style.display = 'flex';
      return;
    }

    if (cartEmptyState) cartEmptyState.style.display = 'none';

    cartItems.forEach((item, idx) => {
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <div class="cart-item-img">◈</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
        </div>
        <div class="cart-item-qty">
          <button data-action="dec" data-idx="${idx}">−</button>
          <span>${item.qty}</span>
          <button data-action="inc" data-idx="${idx}">+</button>
        </div>
      `;
      cartItemsList.appendChild(el);
    });

    // Qty buttons
    cartItemsList.querySelectorAll('.cart-item-qty button').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        if (btn.dataset.action === 'inc') {
          cartItems[idx].qty += 1;
        } else {
          cartItems[idx].qty -= 1;
          if (cartItems[idx].qty <= 0) cartItems.splice(idx, 1);
        }
        updateCartUI();
        renderCartItems();
      });
    });
  }

  function updateCartUI() {
    const totalQty = getTotalQty();
    const total = getCartTotal();

    if (cartCountEl) {
      cartCountEl.textContent = String(totalQty);
      cartCountEl.style.transform = 'scale(1.35)';
      setTimeout(() => { cartCountEl.style.transform = ''; }, 250);
    }
    if (cartOverlayCount) {
      cartOverlayCount.textContent = `(${totalQty} item${totalQty !== 1 ? 's' : ''})`;
    }
    if (cartTotalPrice) {
      cartTotalPrice.textContent = formatPrice(total);
    }
  }

  function openCart() {
    if (!cartOverlay || !cartBackdrop) return;
    cartOverlay.classList.add('open');
    cartBackdrop.classList.add('show');
    body.style.overflow = 'hidden';
    renderCartItems();
  }
  function closeCart() {
    if (!cartOverlay || !cartBackdrop) return;
    cartOverlay.classList.remove('open');
    cartBackdrop.classList.remove('show');
    body.style.overflow = '';
  }

  if (cartIconBtn) cartIconBtn.addEventListener('click', openCart);
  if (cartOverlayClose) cartOverlayClose.addEventListener('click', closeCart);
  if (cartBackdrop) cartBackdrop.addEventListener('click', closeCart);

  // Global addToCart used by HTML onclick
  window.addToCart = function addToCart(btn) {
    const name  = btn?.dataset?.name  || 'Item';
    const price = parseInt(btn?.dataset?.price || '0', 10);

    const existing = cartItems.find(i => i.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      cartItems.push({ name, price, qty: 1 });
    }

    updateCartUI();
    showToast(`${name} added to cart!`);
  };

  /* ═══════════════════════════════════════════
     6. TOAST
  ═══════════════════════════════════════════ */
  function showToast(msg) {
    if (!cartToast || !toastMsg) return;
    toastMsg.textContent = msg;
    cartToast.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      cartToast.classList.remove('show');
    }, 3000);
  }

  /* ═══════════════════════════════════════════
     7. TESTIMONIALS SLIDER
  ═══════════════════════════════════════════ */
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots   = document.querySelectorAll('.t-dot');
  const prevBtn = document.getElementById('testimonialPrev');
  const nextBtn = document.getElementById('testimonialNext');
  let currentSlide = 0;
  let autoSlideTimer = null;

  function goToSlide(idx) {
    if (!slides.length) return;
    slides[currentSlide].classList.remove('active');
    dots[currentSlide]?.classList.remove('active');
    currentSlide = (idx + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    dots[currentSlide]?.classList.add('active');
  }

  function startAutoSlide() {
    clearInterval(autoSlideTimer);
    autoSlideTimer = setInterval(() => goToSlide(currentSlide + 1), 5000);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { goToSlide(currentSlide - 1); startAutoSlide(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goToSlide(currentSlide + 1); startAutoSlide(); });
  dots.forEach(dot => {
    dot.addEventListener('click', () => { goToSlide(parseInt(dot.dataset.index)); startAutoSlide(); });
  });
  if (slides.length > 0) startAutoSlide();

  /* ═══════════════════════════════════════════
     8. NEWSLETTER
  ═══════════════════════════════════════════ */
  window.subscribeEmail = function subscribeEmail() {
    if (!emailInput) return;
    const email = emailInput.value.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValid) {
      emailInput.style.borderColor = 'rgba(255,80,80,0.55)';
      emailInput.placeholder = 'Please enter a valid email';
      setTimeout(() => {
        emailInput.style.borderColor = '';
        emailInput.placeholder = 'Your email address';
      }, 2500);
      return;
    }

    showToast('Welcome to YOLYSSE! ✦');
    emailInput.value = '';
    emailInput.placeholder = "You're subscribed! ✦";
    setTimeout(() => { emailInput.placeholder = 'Your email address'; }, 4000);
  };

  if (emailInput) {
    emailInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') window.subscribeEmail();
    });
  }

  /* ═══════════════════════════════════════════
     9. CONTACT FORM — Resend via serverless
  ═══════════════════════════════════════════ */
  window.submitContact = async function submitContact() {
    const nameEl    = document.getElementById('contactName');
    const emailEl   = document.getElementById('contactEmail');
    const subjectEl = document.getElementById('contactSubject');
    const msgEl     = document.getElementById('contactMsg');
    const submitBtn = document.getElementById('contactSubmitBtn');
    const btnText   = document.getElementById('contactBtnText');
    const btnLoader = document.getElementById('contactBtnLoader');
    const formEl    = document.getElementById('contactForm');
    const successEl = document.getElementById('contactSuccess');

    if (!nameEl || !emailEl || !msgEl) return;

    const name    = nameEl.value.trim();
    const email   = emailEl.value.trim();
    const subject = subjectEl?.value.trim() || 'New message from YOLYSSE contact form';
    const message = msgEl.value.trim();

    if (!name || !email || !message) {
      showToast('Please fill in all required fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address.');
      return;
    }

    // Loading state
    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.style.display = 'none';
    if (btnLoader) btnLoader.style.display = 'inline';

    try {
      /* 
        Send to your Vercel serverless function at /api/contact
        which handles Resend email API call server-side.
        See api/contact.js below for the implementation.
      */
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (res.ok) {
        // Show success
        if (formEl) formEl.style.display = 'none';
        if (successEl) successEl.classList.add('show');
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || 'Something went wrong. Please try again.');
        if (submitBtn) submitBtn.disabled = false;
        if (btnText) btnText.style.display = 'inline';
        if (btnLoader) btnLoader.style.display = 'none';
      }
    } catch (err) {
      showToast('Could not send message. Please try again later.');
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.style.display = 'inline';
      if (btnLoader) btnLoader.style.display = 'none';
    }
  };

  /* ═══════════════════════════════════════════
     10. WISHLIST TOGGLE
  ═══════════════════════════════════════════ */
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const active = btn.dataset.active === 'true';
      btn.dataset.active = String(!active);
      btn.textContent = active ? '♡' : '♥';
      btn.style.color = active ? '' : 'var(--gold)';
    });
  });

  /* ═══════════════════════════════════════════
     11. SCROLL REVEAL (lightweight, no stagger overload)
  ═══════════════════════════════════════════ */
  if ('IntersectionObserver' in window) {
    const revealEls = document.querySelectorAll(
      '.pillar, .product-card, .testimonial-card, .about-inner, .feature-split-content, .lifestyle-img, .newsletter-inner, .contact-form-wrap, .contact-info'
    );
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    revealEls.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(22px)';
      // Capped stagger so it doesn't feel sluggish
      const delay = Math.min(i % 3, 2) * 0.1;
      el.style.transition = `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`;
      revealObserver.observe(el);
    });
  }

  /* ═══════════════════════════════════════════
     12. SMOOTH ANCHOR SCROLL
  ═══════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ═══════════════════════════════════════════
     13. ANNOUNCEMENT BAR DUPLICATION
  ═══════════════════════════════════════════ */
  (function() {
    const bar = document.querySelector('.announcement-bar span');
    if (bar && !bar.dataset.duplicated) {
      bar.dataset.duplicated = 'true';
      bar.innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + bar.innerHTML;
    }
  })();

  /* ═══════════════════════════════════════════
     14. LOGO HOVER TILT
  ═══════════════════════════════════════════ */
  const logoImg = document.querySelector('.logo-img');
  if (logoImg) {
    logoImg.addEventListener('mousemove', (e) => {
      const rect = logoImg.getBoundingClientRect();
      const dx = ((e.clientX - rect.left - rect.width / 2) / rect.width) * 10;
      const dy = ((e.clientY - rect.top - rect.height / 2) / rect.height) * 10;
      logoImg.style.transform = `rotate(${dx}deg) translateY(${-dy * 0.12}px) scale(1.05)`;
    });
    logoImg.addEventListener('mouseleave', () => { logoImg.style.transform = ''; });
  }

  /* ═══════════════════════════════════════════
     INIT
  ═══════════════════════════════════════════ */
  initTheme();

})();
