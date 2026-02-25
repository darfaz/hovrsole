/* ============================================
   HOVRSOLE — App JavaScript
   ============================================ */

const CONFIG = {
  STRIPE_PK: '',
  GA_ID: '',
  PIXEL_ID: '',
  API_BASE: '',
};

// Nav scroll
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

// Mobile menu
const mobileMenu = document.getElementById('mobile-menu');
const mobileNav = document.getElementById('mobile-nav');
const mobileClose = document.getElementById('mobile-nav-close');
if (mobileMenu && mobileNav) {
  mobileMenu.addEventListener('click', () => mobileNav.classList.add('open'));
  if (mobileClose) mobileClose.addEventListener('click', () => mobileNav.classList.remove('open'));
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileNav.classList.remove('open'));
  });
}

// Scroll animations
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

// FAQ
document.querySelectorAll('.faq-question').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.parentElement;
    document.querySelectorAll('.faq-item.active').forEach(i => {
      if (i !== item) i.classList.remove('active');
    });
    item.classList.toggle('active');
  });
});

// Stripe checkout
window.handleCheckout = async function() {
  const btn = document.getElementById('checkout-btn');
  if (!btn) return;
  btn.disabled = true;
  btn.textContent = 'Processing...';

  try {
    if (CONFIG.API_BASE) {
      const res = await fetch(`${CONFIG.API_BASE}/api/checkout`, { method: 'POST' });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
    }
    alert('🚀 Reservations open soon! We\'ll notify you when live.');
    btn.disabled = false;
    btn.textContent = 'Reserve My Pair →';
  } catch (err) {
    alert('🚀 Reservations open soon! We\'ll notify you when live.');
    btn.disabled = false;
    btn.textContent = 'Reserve My Pair →';
  }
};

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

console.log('🚀 HOVRSOLE loaded');
