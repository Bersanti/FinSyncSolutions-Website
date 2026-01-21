/* FinSync Solutions — main JS
   - Mobile navigation (hamburger)
   - Back-to-top button
   - Active nav link highlighting
   - Lead form (Formspree) with validation + loading/success/error states
*/

// Read config from assets/js/config.js
const CONFIG = (window && window.FINSYNC) ? window.FINSYNC : {};
const FORMSPREE_ENDPOINT = CONFIG.formspreeEndpoint || "https://formspree.io/f/YOUR_FORM_ID";
const BUSINESS_EMAIL = CONFIG.businessEmail || "curtis@finsyncsolutions.org";


const SELECTORS = {
  navToggle: "[data-nav-toggle]",
  mobileNav: "[data-mobile-nav]",
  backToTop: "[data-back-to-top]",
  leadForm: ".js-lead-form",
};

function isGitHubPagesProject() {
  return location.hostname.endsWith("github.io") && location.pathname.split("/").filter(Boolean).length >= 1;
}

function getRepoNameIfGitHubProject() {
  if (!location.hostname.endsWith("github.io")) return "";
  const parts = location.pathname.split("/").filter(Boolean);
  // On project pages: /repoName/...
  // On user/org pages: / (no repoName)
  return parts.length >= 1 ? parts[0] : "";
}

function normalizePathname(pathname) {
  // Normalize:
  // - Remove repoName prefix for GitHub project pages
  // - Ensure trailing slash
  let p = pathname;

  if (location.hostname.endsWith("github.io")) {
    const repo = getRepoNameIfGitHubProject();
    if (repo && p.startsWith("/" + repo)) {
      p = p.slice(("/" + repo).length);
      if (!p.startsWith("/")) p = "/" + p;
    }
  }

  if (!p.endsWith("/")) p += "/";
  return p;
}

function setActiveNavLink() {
  const current = normalizePathname(location.pathname);
  const links = document.querySelectorAll(".nav-link, .mobile-nav__panel a");

  links.forEach((a) => {
    const url = new URL(a.href);
    const target = normalizePathname(url.pathname);

    // Home link: consider "/" active on home
    const isHome = current === "/" && (target === "/" || target === "//");
    const active = isHome || current === target;

    a.classList.toggle("is-active", active);
  });
}

function initMobileNav() {
  const btn = document.querySelector(SELECTORS.navToggle);
  const overlay = document.querySelector(SELECTORS.mobileNav);
  if (!btn || !overlay) return;

  overlay.setAttribute("aria-hidden", "true");

  const close = () => {
    document.body.classList.remove("nav-open");
    btn.setAttribute("aria-expanded", "false");
    overlay.setAttribute("aria-hidden", "true");
  };

  const open = () => {
    document.body.classList.add("nav-open");
    btn.setAttribute("aria-expanded", "true");
    overlay.setAttribute("aria-hidden", "false");
  };

  btn.addEventListener("click", () => {
    const expanded = btn.getAttribute("aria-expanded") === "true";
    expanded ? close() : open();
  });

  // Close when clicking the dimmed overlay
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  // Close when clicking any nav link in the panel
  overlay.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => close());
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

function initBackToTop() {
  const btn = document.querySelector(SELECTORS.backToTop);
  if (!btn) return;

  const onScroll = () => {
    const visible = window.scrollY > 700;
    btn.classList.toggle("is-visible", visible);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function setFooterYear() {
  const el = document.querySelector("[data-year]");
  if (el) el.textContent = String(new Date().getFullYear());
}

function isValidEmail(value) {
  // Friendly (not perfect) email validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function isValidPhone(value) {
  const v = String(value).trim();
  if (!v) return true; // optional
  // Allow digits, spaces, plus, parentheses, hyphen
  return /^[0-9+\-\s().]{7,}$/.test(v);
}

function setFieldError(fieldEl, message) {
  fieldEl.classList.add("is-error");
  const errorEl = fieldEl.querySelector(".error");
  if (errorEl) errorEl.textContent = message;
}

function clearFieldError(fieldEl) {
  fieldEl.classList.remove("is-error");
  const errorEl = fieldEl.querySelector(".error");
  if (errorEl) errorEl.textContent = "";
}

function setFormStatus(form, state, message) {
  const status = form.querySelector("[data-form-status]");
  if (!status) return;

  status.classList.remove("is-success", "is-error");
  if (state === "success") status.classList.add("is-success");
  if (state === "error") status.classList.add("is-error");

  status.textContent = message;
}

async function submitToFormspree(form) {
  const endpoint = FORMSPREE_ENDPOINT;
  const hasRealEndpoint = endpoint && !endpoint.includes("YOUR_FORM_ID");

  const formData = new FormData(form);

  // Honeypot (spam trap)
  const honey = formData.get("website");
  if (honey && String(honey).trim().length > 0) {
    // Pretend success (quietly drop)
    return { ok: true };
  }

  // Always attach context
  formData.append("source_url", location.href);
  formData.append("source_page", normalizePathname(location.pathname));
  formData.append("submitted_at", new Date().toISOString());

  if (!hasRealEndpoint) {
    // No endpoint yet — fall back to mailto for now so the form still "works".
    // This will open the user's email client; for automatic emails, configure Formspree.
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const company = String(formData.get("company") || "").trim();
    const notes = String(formData.get("notes") || "").trim();

    const subject = encodeURIComponent("New lead — FinSync Solutions");
    const bodyLines = [
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : "",
      company ? `Company: ${company}` : "",
      "",
      "Notes:",
      notes || "(none)",
      "",
      `Page: ${location.href}`,
    ].filter(Boolean);

    const body = encodeURIComponent(bodyLines.join("\n"));
    window.location.href = `mailto:${BUSINESS_EMAIL}?subject=${subject}&body=${body}`;

    // Consider it successful from a UI perspective.
    return { ok: true, usedMailto: true };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
    },
  });

  if (response.ok) return { ok: true };

  // Try to extract Formspree error (if any)
  let errorMsg = "Something went wrong. Please try again.";
  try {
    const data = await response.json();
    if (data && data.errors && data.errors.length) {
      errorMsg = data.errors.map((e) => e.message).join(" ");
    }
  } catch (_) {}
  return { ok: false, errorMsg };
}

function initLeadForms() {
  const forms = document.querySelectorAll(SELECTORS.leadForm);
  if (!forms.length) return;

  forms.forEach((form) => {
    const submitBtn = form.querySelector("button[type='submit']");
    const nameInput = form.querySelector("[name='name']");
    const emailInput = form.querySelector("[name='email']");
    const phoneInput = form.querySelector("[name='phone']");

    const fieldEls = {
      name: nameInput ? nameInput.closest(".field") : null,
      email: emailInput ? emailInput.closest(".field") : null,
      phone: phoneInput ? phoneInput.closest(".field") : null,
    };

    // Clear error on input
    ["name", "email", "phone", "company", "notes"].forEach((n) => {
      const el = form.querySelector(`[name='${n}']`);
      if (!el) return;
      const wrapper = el.closest(".field");
      el.addEventListener("input", () => {
        if (wrapper) clearFieldError(wrapper);
      });
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Validate
      let firstInvalid = null;

      if (fieldEls.name) clearFieldError(fieldEls.name);
      if (fieldEls.email) clearFieldError(fieldEls.email);
      if (fieldEls.phone) clearFieldError(fieldEls.phone);

      const nameVal = nameInput ? String(nameInput.value).trim() : "";
      const emailVal = emailInput ? String(emailInput.value).trim() : "";
      const phoneVal = phoneInput ? String(phoneInput.value).trim() : "";
      if (!emailVal || !isValidEmail(emailVal)) {
        if (fieldEls.email) setFieldError(fieldEls.email, "Please enter a valid email address.");
        firstInvalid = firstInvalid || emailInput;
      }
      if (phoneInput && !isValidPhone(phoneVal)) {
        if (fieldEls.phone) setFieldError(fieldEls.phone, "Please enter a valid phone number (or leave it blank).");
        firstInvalid = firstInvalid || phoneInput;
      }

      if (firstInvalid) {
        firstInvalid.focus();
        setFormStatus(form, "error", "Please fix the highlighted fields and try again.");
        return;
      }

      // Loading UI
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add("is-loading");
      }
      setFormStatus(form, "neutral", "Sending…");

      try {
        const result = await submitToFormspree(form);

        if (result.ok) {
          form.reset();
          setFormStatus(
            form,
            "success",
            result.usedMailto
              ? "Thanks — your email draft is ready to send. Once you set up Formspree, messages will send automatically."
              : "Thanks! We received your message and will follow up shortly."
          );
          return;
        }

        setFormStatus(form, "error", result.errorMsg || "Something went wrong. Please try again.");

      } catch (err) {
        setFormStatus(form, "error", "Network error. Please try again, or email " + BUSINESS_EMAIL + ".");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove("is-loading");
        }
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setActiveNavLink();
  initMobileNav();
  initBackToTop();
  initLeadForms();
  setFooterYear();
});
