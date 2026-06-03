const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const searchModal = document.querySelector('.search-modal');
const cursorHalo = document.querySelector('.cursor-halo');
const toast = document.querySelector('.toast');
const starfield = document.querySelector('.starfield');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const SERVER_IP = 'play.shadowvale.net:7777';

navToggle?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks?.addEventListener('click', (event) => {
  if (event.target.matches('a')) {
    navLinks.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }
});

document.querySelector('.motion-toggle')?.addEventListener('click', (event) => {
  const pressed = event.currentTarget.getAttribute('aria-pressed') === 'true';
  event.currentTarget.setAttribute('aria-pressed', String(!pressed));
  document.body.classList.toggle('calm', !pressed);
});

document.querySelectorAll('[data-open-search]').forEach((button) => {
  button.addEventListener('click', () => {
    searchModal.classList.add('open');
    searchModal.setAttribute('aria-hidden', 'false');
    searchModal.querySelector('input')?.focus();
  });
});

function closeSearch() {
  searchModal.classList.remove('open');
  searchModal.setAttribute('aria-hidden', 'true');
}

document.querySelector('.modal-close')?.addEventListener('click', closeSearch);
searchModal?.addEventListener('click', (event) => {
  if (event.target === searchModal) closeSearch();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && searchModal.classList.contains('open')) closeSearch();
  if (event.key === 'Escape' && composerModal?.classList.contains('open')) closeComposer();
});

const composerModal = document.querySelector('.composer-modal');
const threadCategory = document.querySelector('#thread-category');

function openComposer(category) {
  if (category && threadCategory) threadCategory.value = category;
  composerModal.classList.add('open');
  composerModal.setAttribute('aria-hidden', 'false');
  composerModal.querySelector('input')?.focus();
}

function closeComposer() {
  composerModal.classList.remove('open');
  composerModal.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('[data-open-composer]').forEach((button) => {
  button.addEventListener('click', () => openComposer(button.dataset.category));
});

document.querySelector('.composer-close')?.addEventListener('click', closeComposer);
composerModal?.addEventListener('click', (event) => {
  if (event.target === composerModal) closeComposer();
});


function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2200);
}

document.querySelectorAll('[data-copy-ip]').forEach((button) => {
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(SERVER_IP);
      showToast(`Copied ${SERVER_IP}`);
    } catch {
      showToast(SERVER_IP);
    }
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

document.querySelectorAll('[data-tilt]').forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    if (reduceMotion.matches || document.body.classList.contains('calm')) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(1100px) rotateX(${y * -10}deg) rotateY(${x * 12}deg) translateY(-6px)`;
  });

  card.addEventListener('pointerleave', () => {
    card.style.transform = '';
  });
});

window.addEventListener('pointermove', (event) => {
  if (!cursorHalo) return;
  cursorHalo.style.left = `${event.clientX}px`;
  cursorHalo.style.top = `${event.clientY}px`;
});

document.querySelectorAll('.dock-actions button').forEach((chip) => {
  chip.addEventListener('click', () => {
    document.querySelector('.dock-actions button.active')?.classList.remove('active');
    chip.classList.add('active');
  });
});

function animateCounters() {
  document.querySelectorAll('[data-count]').forEach((counter) => {
    const target = Number(counter.dataset.count);
    const duration = 1200;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = Math.floor(target * eased).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function setupStarfield() {
  if (!starfield || reduceMotion.matches) return;
  const context = starfield.getContext('2d');
  const stars = Array.from({ length: 110 }, () => ({ x: Math.random(), y: Math.random(), z: Math.random() * 0.8 + 0.2 }));

  function resize() {
    starfield.width = window.innerWidth * window.devicePixelRatio;
    starfield.height = window.innerHeight * window.devicePixelRatio;
  }

  function draw() {
    context.clearRect(0, 0, starfield.width, starfield.height);
    stars.forEach((star) => {
      star.y += 0.0007 * star.z;
      if (star.y > 1) star.y = 0;
      const x = star.x * starfield.width;
      const y = star.y * starfield.height;
      const size = star.z * 2.4;
      context.beginPath();
      context.arc(x, y, size, 0, Math.PI * 2);
      context.fillStyle = `rgba(160, 235, 255, ${0.22 + star.z * 0.55})`;
      context.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
}

animateCounters();
setupStarfield();
