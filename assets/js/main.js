// assets/js/main.js
(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile nav toggle
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-nav-toggle]');
  const panel = document.querySelector('[data-nav-panel]');

  if (header && toggle && panel) {
    const closeMenu = () => {
      header.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', () => {
      const isOpen = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    panel.addEventListener('click', (e) => {
      if (e.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  // Reveal on scroll
  const revealEls = Array.from(document.querySelectorAll('[data-reveal]'));
  if (revealEls.length) {
    if (prefersReducedMotion) {
      revealEls.forEach((el) => el.classList.add('is-revealed'));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
              io.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.12 }
      );

      revealEls.forEach((el) => io.observe(el));
    }
  }

  
  // Home: spreadsheet motif animation (What we do card)
  const sheet = document.querySelector('[data-sheet]');
  if (sheet) {
    const track = sheet.querySelector('[data-sheet-track]');
    const rows = track ? Array.from(track.querySelectorAll('.sheet__row')) : [];
    const cols = 6;

    const randomRow = () => {
      const out = [];
      for (let i = 0; i < cols; i++) {
        const value = Math.floor(6000 + Math.random() * (76000 - 6000 + 1));
        out.push('$' + value.toLocaleString('en-US'));
      }
      return out;
    };

    const setRow = (rowEl, values, isLive = false) => {
      const cells = Array.from(rowEl.querySelectorAll('.sheet__cell'));
      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        cell.textContent = values ? (values[i] || '') : '';
        cell.classList.toggle('is-live', isLive && !!values);
      }
    };

    let history = [null, null, null]; // rows 1–3 (oldest → newest)
    let live = randomRow();

    const render = () => {
      for (let r = 0; r < rows.length; r++) {
        if (r === 0) setRow(rows[r], history[0], false);
        else if (r === 1) setRow(rows[r], history[1], false);
        else if (r === 2) setRow(rows[r], history[2], false);
        else if (r === 3) setRow(rows[r], live, true);
        else setRow(rows[r], null, false);
      }
    };

    render();

    // Respect reduced motion: keep a static grid
    if (!prefersReducedMotion && track && rows.length >= 7) {
      const rowHeight = parseFloat(getComputedStyle(sheet).getPropertyValue('--sheet-row')) || 18;
      const durationMs = 1400;
      const pauseMs = 220;

      const step = () => {
        track.style.transition = `transform ${durationMs}ms linear`;
        track.style.transform = `translateY(-${rowHeight}px)`;
      };

      const onEnd = (e) => {
        if (e.propertyName !== 'transform') return;

        // Rotate first row to bottom and reset transform for seamless looping
        track.style.transition = 'none';
        const first = rows.shift();
        if (first) {
          track.appendChild(first);
          rows.push(first);
        }
        track.style.transform = 'translateY(0)';

        // Shift ladder values up by one row and generate a new live row
        history = [history[1], history[2], live];
        live = randomRow();

        render();

        // Force reflow so the next transition starts cleanly
        track.getBoundingClientRect();
        window.setTimeout(step, pauseMs);
      };

      track.addEventListener('transitionend', onEnd);

      // Start the loop
      window.setTimeout(step, 650);
    }
  }


  // Smooth anchor scroll (for pages like About)
  if (!prefersReducedMotion) {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || href.length < 2) return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', href);
    });
  }

  // Contact form (placeholder submission handler)
  const contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    const status = contactForm.querySelector('[data-form-status]');

    const setError = (id, message) => {
      const input = contactForm.querySelector('#' + id);
      const errorEl = contactForm.querySelector(`[data-error-for="${id}"]`);

      if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
      if (errorEl) errorEl.textContent = message || '';

      const wrapper = input ? input.closest('.field') : null;
      if (wrapper) wrapper.classList.toggle('field--error', !!message);
    };

    const clearErrors = () => {
      contactForm.querySelectorAll('.field').forEach((f) => f.classList.remove('field--error'));
      contactForm.querySelectorAll('[data-error-for]').forEach((e) => (e.textContent = ''));
      contactForm.querySelectorAll('[aria-invalid]').forEach((i) => i.setAttribute('aria-invalid', 'false'));
    };

    const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors();

      const fullName = contactForm.querySelector('#fullName');
      const businessName = contactForm.querySelector('#businessName');
      const email = contactForm.querySelector('#email');

      let ok = true;

      if (!fullName || !fullName.value.trim()) {
        setError('fullName', 'Please enter your full name.');
        ok = false;
      }
      if (!businessName || !businessName.value.trim()) {
        setError('businessName', 'Please enter your business name.');
        ok = false;
      }
      if (!email || !email.value.trim()) {
        setError('email', 'Please enter your email.');
        ok = false;
      } else if (!isValidEmail(email.value)) {
        setError('email', 'Please enter a valid email address.');
        ok = false;
      }

      if (!ok) {
        if (status) status.textContent = 'Please fix the highlighted fields and try again.';
        return;
      }

      // TODO: Replace this placeholder with real submission logic (fetch/POST to your backend).
      if (status) status.textContent = "Thanks. We received your message and will follow up by email.";
      contactForm.reset();
    });
  }

  // Sample report widget (placeholder)
  const sampleForm = document.querySelector('[data-sample-report-form]');
  if (sampleForm) {
    const status = sampleForm.querySelector('[data-sample-status]');
    const emailInput = sampleForm.querySelector('input[type="email"]');

    const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

    sampleForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!emailInput) return;

      const value = emailInput.value.trim();

      if (!value) {
        emailInput.setAttribute('aria-invalid', 'true');
        if (status) status.textContent = 'Please enter your email to receive the sample.';
        return;
      }

      if (!isValidEmail(value)) {
        emailInput.setAttribute('aria-invalid', 'true');
        if (status) status.textContent = 'Please enter a valid email address.';
        return;
      }

      emailInput.setAttribute('aria-invalid', 'false');

      // TODO: Call your existing backend/email-delivery logic here.
      if (status) status.textContent = 'Thanks. Check your inbox for the sample PDF.';
      sampleForm.reset();
    });
  }
})();
