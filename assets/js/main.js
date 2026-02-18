// Sticky nav
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40), { passive: true });

    // Mobile menu
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    toggle.addEventListener('click', () => { toggle.classList.toggle('open'); links.classList.toggle('open'); });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { toggle.classList.remove('open'); links.classList.remove('open'); }));

    // Scroll reveal — hide first, then animate in on scroll
    const revealEls = document.querySelectorAll('.reveal');
    revealEls.forEach(el => el.classList.add('hidden'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.remove('hidden'); e.target.classList.add('visible'); observer.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    revealEls.forEach(el => observer.observe(el));

    // FAQ
    document.querySelectorAll('.faq-q').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.parentElement;
        const open = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        document.querySelectorAll('.faq-q').forEach(b => b.setAttribute('aria-expanded', 'false'));
        if (!open) { item.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
      });
    });

    // Lead form — connected to Formspree
    // REPLACE xdaldnwl below with your Formspree ID (e.g., xABCDEFG)
    // Get yours free at https://formspree.io
    document.getElementById('formSubmit').addEventListener('click', async function() {
      var n = document.getElementById('lead-name').value.trim();
      var e = document.getElementById('lead-email').value.trim();
      var c = document.getElementById('lead-company').value.trim();
      if (!n || !e) { alert('Please enter your name and email.'); return; }
      try {
        await fetch('https://formspree.io/f/xdaldnwl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: n, email: e, company: c })
        });
        document.getElementById('formFields').classList.add('hidden');
        document.getElementById('formSuccess').classList.add('show');
      } catch (err) {
        alert('Something went wrong. Please try again.');
      }
    });

    // Smooth scroll with nav offset
    document.querySelectorAll('a[href^="#"]').forEach(function(a) {
      a.addEventListener('click', function(e) {
        var t = document.querySelector(this.getAttribute('href'));
        if (t) { e.preventDefault(); window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 76, behavior: 'smooth' }); }
      });
    });