const header = document.querySelector('.site-header');
const backTop = document.querySelector('.back-top');
const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');
const navLinks = [...document.querySelectorAll('.main-nav a')];
const toast = document.querySelector('.toast');

const syncChrome = () => {
  const scrolled = window.scrollY > 24;
  header?.classList.toggle('scrolled', scrolled);
  backTop?.classList.toggle('visible', window.scrollY > 560);
};

syncChrome();
window.addEventListener('scroll', syncChrome, { passive: true });

navToggle?.addEventListener('click', () => {
  const open = navToggle.classList.toggle('open');
  mainNav?.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? '关闭导航' : '打开导航');
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    navToggle?.classList.remove('open');
    mainNav?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
    navToggle?.setAttribute('aria-label', '打开导航');
  });
});

backTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px' });

document.querySelectorAll('.reveal').forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 55}ms`;
  revealObserver.observe(element);
});

const navSections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const syncActiveNav = () => {
  const marker = window.scrollY + 180;
  let current = navSections[0];
  navSections.forEach((section) => {
    if (section.offsetTop <= marker) current = section;
  });
  navLinks.forEach((link) => {
    link.classList.toggle('active', current && link.getAttribute('href') === `#${current.id}`);
  });
};

syncActiveNav();
window.addEventListener('scroll', syncActiveNav, { passive: true });

const guideButtons = [...document.querySelectorAll('[data-guide]')];
const guidePanes = [...document.querySelectorAll('.guide-pane')];

guideButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.dataset.guide;
    guideButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
    });
    guidePanes.forEach((pane) => {
      const active = pane.id === `guide-${target}`;
      pane.classList.toggle('active', active);
      pane.hidden = !active;
    });
  });
});

let toastTimer;
const showToast = (message) => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 1800);
};

document.querySelectorAll('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    const value = button.dataset.copy || '';
    try {
      await navigator.clipboard.writeText(value);
      showToast('已复制转发地址');
    } catch {
      const input = document.createElement('textarea');
      input.value = value;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
      showToast('已复制转发地址');
    }
  });
});

document.querySelectorAll('.faq-list details').forEach((details) => {
  details.addEventListener('toggle', () => {
    if (!details.open) return;
    document.querySelectorAll('.faq-list details').forEach((item) => {
      if (item !== details) item.open = false;
    });
  });
});
