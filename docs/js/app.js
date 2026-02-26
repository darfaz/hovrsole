/* ============================================
   HOVRSOLE — App JavaScript + Analytics
   ============================================ */

const CONFIG = {
  STRIPE_PK: '',
  GA_ID: 'G-XXXXXXXXXX',  // TODO: Dar to create GA4 property
  PIXEL_ID: '1049909752851124',
  API_BASE: '',
};

// ===== NAV SCROLL =====
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

// ===== MOBILE MENU =====
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

// ===== SCROLL ANIMATIONS =====
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

// ===== FAQ TOGGLE =====
document.querySelectorAll('.faq-question').forEach(q => {
  q.addEventListener('click', () => {
    const item = q.parentElement;
    document.querySelectorAll('.faq-item.active').forEach(i => {
      if (i !== item) i.classList.remove('active');
    });
    item.classList.toggle('active');

    // Track FAQ opens
    if (item.classList.contains('active')) {
      trackEvent('faq_open', { question: q.textContent.replace('+', '').trim().slice(0, 60) });
    }
  });
});

// ===== STRIPE CHECKOUT =====
window.handleCheckout = async function() {
  const btn = document.getElementById('checkout-btn');
  if (!btn) return;
  btn.disabled = true;
  btn.textContent = 'Processing...';

  trackEvent('begin_checkout', { value: 1.00, currency: 'USD' });
  if (typeof fbq === 'function') fbq('track', 'InitiateCheckout', { value: 1.00, currency: 'USD' });

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

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ===== ANALYTICS HELPERS =====
function trackEvent(name, params = {}) {
  if (typeof gtag === 'function') gtag('event', name, params);
}

// ===== CTA CLICK TRACKING =====
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const label = btn.textContent.trim().slice(0, 40);
    const section = btn.closest('section');
    const sectionId = section ? (section.id || section.className.split(' ')[0]) : 'unknown';
    trackEvent('cta_click', { button_text: label, section: sectionId });
    if (typeof fbq === 'function' && label.toLowerCase().includes('reserve')) {
      fbq('track', 'Lead');
    }
  });
});

// ===== SCROLL DEPTH TRACKING =====
const scrollMilestones = [25, 50, 75, 90];
const milestonesFired = new Set();
window.addEventListener('scroll', () => {
  const scrollPct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
  scrollMilestones.forEach(m => {
    if (scrollPct >= m && !milestonesFired.has(m)) {
      milestonesFired.add(m);
      trackEvent('scroll_depth', { percent: m });
    }
  });
}, { passive: true });

// ===== SECTION VISIBILITY TRACKING =====
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      trackEvent('section_view', { section: entry.target.id || entry.target.className.split(' ')[0] });
      sectionObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

// ===== TIME ON PAGE =====
const pageLoadTime = Date.now();
window.addEventListener('beforeunload', () => {
  const timeOnPage = Math.round((Date.now() - pageLoadTime) / 1000);
  trackEvent('time_on_page', { seconds: timeOnPage });
});

// ===== UTM PARAMETER CAPTURE =====
const urlParams = new URLSearchParams(window.location.search);
const utmParams = {};
['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(key => {
  const val = urlParams.get(key);
  if (val) utmParams[key] = val;
});
if (Object.keys(utmParams).length > 0) {
  trackEvent('campaign_hit', utmParams);
  // Store for checkout attribution
  try { sessionStorage.setItem('hovrsole_utm', JSON.stringify(utmParams)); } catch(e) {}
}

// ===== GOOGLE ANALYTICS =====
if (CONFIG.GA_ID && CONFIG.GA_ID !== 'G-XXXXXXXXXX') {
  const gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.GA_ID}`;
  document.head.appendChild(gaScript);
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', CONFIG.GA_ID);
}

// ===== META PIXEL =====
if (CONFIG.PIXEL_ID) {
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
  (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', CONFIG.PIXEL_ID);
  fbq('track', 'PageView');
}

console.log('🚀 HOVRSOLE loaded — tracking active');
