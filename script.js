const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Photos that the wind sweeps open.
document.querySelectorAll('.hero-media, .svc-media img, .band img').forEach(el => el.classList.add('reveal'));

// Headlines: wrap each word so it can blow in on its own.
document.querySelectorAll('.blow').forEach(h => {
  const words = h.textContent.split(' ');
  h.setAttribute('aria-label', h.textContent);
  h.textContent = '';
  words.forEach((w, i) => {
    const span = document.createElement('span');
    span.className = 'w'; span.textContent = w; span.style.setProperty('--d', i);
    span.setAttribute('aria-hidden', 'true');
    h.append(span, i < words.length - 1 ? ' ' : '');
  });
});

// Wind: particles follow a slowly changing flow field and leave fading trails.
// They swerve around the pointer, like air around a hand.
function wind(canvas) {
  const ctx = canvas.getContext('2d');
  const light = canvas.classList.contains('wind--light');
  const rgb = light ? '250,249,245' : '26,111,196';
  const host = canvas.parentElement;
  let w, h, dpr, parts = [], t = 0, running = false, raf;
  const mouse = { x: -9999, y: -9999 };

  const spawn = (p, anywhere) => {
    p.x = anywhere ? Math.random() * w : -20 - Math.random() * 80;
    p.y = Math.random() * h;
    p.age = 0; p.life = 220 + Math.random() * 260;
    p.speed = 1.6 + Math.random() * 2.4;
    p.width = Math.random() < .2 ? 1.8 : 1.1;
    return p;
  };
  const size = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = host.clientWidth; h = host.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(110, (w * h) / 11000));
    parts = Array.from({ length: n }, () => spawn({}, true));
  };
  const angle = (x, y) =>
    Math.sin(y * 0.005 + t * 0.004) * 0.22 +
    Math.sin(x * 0.003 - t * 0.003) * 0.18 +
    Math.cos((x + y) * 0.002 + t * 0.002) * 0.1;

  const frame = () => {
    t++;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,.035)';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
    for (const p of parts) {
      const a = angle(p.x, p.y);
      let vx = Math.cos(a) * p.speed, vy = Math.sin(a) * p.speed;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
      if (d2 < 22000) { const f = (1 - d2 / 22000) * 3; vx += dx / Math.sqrt(d2 + 1) * f; vy += dy / Math.sqrt(d2 + 1) * f; }
      const nx = p.x + vx, ny = p.y + vy;
      const alpha = Math.sin(Math.PI * p.age / p.life) * (light ? .45 : .7);
      ctx.strokeStyle = `rgba(${rgb},${alpha.toFixed(3)})`;
      ctx.lineWidth = p.width;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny); ctx.stroke();
      p.x = nx; p.y = ny; p.age++;
      if (p.age > p.life || p.x > w + 20 || p.y < -20 || p.y > h + 20) spawn(p, false);
    }
    raf = requestAnimationFrame(frame);
  };
  host.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  host.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
  new ResizeObserver(size).observe(host);
  size();
  // only animate while it is on screen
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) { running = true; raf = requestAnimationFrame(frame); }
    else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
  }).observe(canvas);
}
if (!reduce) document.querySelectorAll('canvas.wind').forEach(wind);

// Gusts blow only while visible.
const gustIO = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('in', e.isIntersecting)));
document.querySelectorAll('.gust').forEach(g => gustIO.observe(g));

// Count the facts up once.
const countIO = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  countIO.unobserve(e.target);
  const el = e.target, end = +el.dataset.count, t0 = performance.now();
  if (reduce) return;
  const step = now => {
    const k = Math.min(1, (now - t0) / 1400);
    el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}));
document.querySelectorAll('[data-count]').forEach(el => countIO.observe(el));

// Header tightens after scrolling; hero photo drifts slower than the page.
const bar = document.getElementById('bar');
const heroImg = document.querySelector('.hero-media img');
let ticking = false;
addEventListener('scroll', () => {
  if (ticking) return; ticking = true;
  requestAnimationFrame(() => {
    bar.classList.toggle('scrolled', scrollY > 40);
    if (!reduce && heroImg && scrollY < innerHeight * 1.5) heroImg.style.setProperty('--py', (scrollY * 0.08).toFixed(1) + 'px');
    ticking = false;
  });
}, { passive: true });

(() => {
  const els = document.querySelectorAll('.rise, .blow, .reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  requestAnimationFrame(() => els.forEach(e => {
    if (e.getBoundingClientRect().top < innerHeight) e.classList.add('in'); else io.observe(e);
  }));
  // never leave content hidden if the observer is throttled
  setTimeout(() => els.forEach(e => { if (e.getBoundingClientRect().top < innerHeight) e.classList.add('in'); }), 1500);
})();

// Contact form: build the email and open it in the visitor's mail app.
(() => {
  const f = document.getElementById('cform'), err = document.getElementById('err');
  f.addEventListener('submit', e => {
    e.preventDefault();
    if (!f.email.value.trim() && !f.phone.value.trim()) {
      err.hidden = false; f.email.setAttribute('aria-invalid', 'true'); f.email.focus(); return;
    }
    err.hidden = true; f.email.removeAttribute('aria-invalid');
    const company = f.company.value.trim();
    const subject = 'Website enquiry' + (company ? ': ' + company : '');
    const body = [
      f.message.value.trim(), '',
      'Company: ' + company, 'Name: ' + f.name.value.trim(),
      'Email: ' + f.email.value.trim(), 'Phone: ' + f.phone.value.trim()
    ].join('\n');
    location.href = 'mailto:info@streamair.com.au?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
})();

// Project list: pointing at a school shows its photo beside the cursor.
(() => {
  const peek = document.querySelector('.peek');
  if (!peek || !matchMedia('(hover:hover)').matches) return;
  let x = 0, y = 0, raf;
  const place = () => { peek.style.left = x + 'px'; peek.style.top = y + 'px'; raf = null; };
  document.querySelectorAll('.roll li[data-img]').forEach(li => {
    li.addEventListener('pointerenter', () => { peek.src = li.dataset.img; peek.classList.add('on'); });
    li.addEventListener('pointerleave', () => peek.classList.remove('on'));
    li.addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(place); });
  });
})();
