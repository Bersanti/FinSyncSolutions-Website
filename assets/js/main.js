/* FinSync Solutions — main JS
   - Mobile navigation (hamburger)
   - Back-to-top button
   - Active nav link highlighting
   - Lead form (Formspree) with validation + loading/success/error states
   - Sample download modal with email delivery (Google Apps Script)
*/

// Read config from assets/js/config.js
const CONFIG = (window && window.FINSYNC) ? window.FINSYNC : {};
const FORMSPREE_ENDPOINT = CONFIG.formspreeEndpoint || "https://formspree.io/f/YOUR_FORM_ID";
const SAMPLE_EMAIL_ENDPOINT = CONFIG.sampleEmailEndpoint || "";
const BUSINESS_EMAIL = CONFIG.businessEmail || "curtis@finsyncsolutions.org";


const SELECTORS = {
  navToggle: "[data-nav-toggle]",
  mobileNav: "[data-mobile-nav]",
  backToTop: "[data-back-to-top]",
  leadForm: ".js-lead-form",
  downloadTrigger: "[data-download-trigger]",
  downloadModal: "#download-modal",
  downloadForm: "#download-form",
  modalClose: "[data-modal-close]",
};

function isGitHubPagesProject() {
  return location.hostname.endsWith("github.io") && location.pathname.split("/").filter(Boolean).length >= 1;
}

function getRepoNameIfGitHubProject() {
  if (!location.hostname.endsWith("github.io")) return "";
  const parts = location.pathname.split("/").filter(Boolean);
  return parts.length >= 1 ? parts[0] : "";
}

function normalizePathname(pathname) {
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

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  overlay.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => close());
  });

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
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function isValidPhone(value) {
  const v = String(value).trim();
  if (!v) return true;
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

  const honey = formData.get("website");
  if (honey && String(honey).trim().length > 0) {
    return { ok: true };
  }

  formData.append("source_url", location.href);
  formData.append("source_page", normalizePathname(location.pathname));
  formData.append("submitted_at", new Date().toISOString());

  if (!hasRealEndpoint) {
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

      let firstInvalid = null;

      if (fieldEls.name) clearFieldError(fieldEls.name);
      if (fieldEls.email) clearFieldError(fieldEls.email);
      if (fieldEls.phone) clearFieldError(fieldEls.phone);

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


/* ============================================
   SAMPLE DOWNLOAD MODAL - EMAIL DELIVERY
   ============================================ */

function initDownloadModal() {
  const triggers = document.querySelectorAll(SELECTORS.downloadTrigger);
  const modal = document.querySelector(SELECTORS.downloadModal);
  const form = document.querySelector(SELECTORS.downloadForm);
  const closeButtons = document.querySelectorAll(SELECTORS.modalClose);
  
  if (!modal || !form) return;
  
  const modalForm = modal.querySelector(".modal__form");
  const modalSuccess = modal.querySelector(".modal__success");
  const modalError = modal.querySelector(".modal__error");
  const emailInput = form.querySelector("[name='email']");
  const emailField = emailInput ? emailInput.closest(".field") : null;
  const submitBtn = form.querySelector("button[type='submit']");
  
  // Open modal
  function openModal() {
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    
    // Reset state
    form.reset();
    if (emailField) clearFieldError(emailField);
    if (modalForm) modalForm.style.display = "block";
    if (modalSuccess) modalSuccess.style.display = "none";
    if (modalError) modalError.style.display = "none";
    
    setTimeout(() => {
      if (emailInput) emailInput.focus();
    }, 250);
  }
  
  // Close modal
  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }
  
  // Show success state
  function showSuccess(email) {
    if (modalForm) modalForm.style.display = "none";
    if (modalError) modalError.style.display = "none";
    if (modalSuccess) modalSuccess.style.display = "block";
    
    // Update the email display in success message
    const emailDisplay = modalSuccess.querySelector("[data-user-email]");
    if (emailDisplay) emailDisplay.textContent = email;
    
    console.log("=== SAMPLE REQUESTED ===");
    console.log("Email:", email);
    console.log("Timestamp:", new Date().toISOString());
    console.log("Email will be sent from Curtis");
    console.log("========================");
  }
  
  // Show error state
  function showError(message) {
    if (modalForm) modalForm.style.display = "none";
    if (modalSuccess) modalSuccess.style.display = "none";
    if (modalError) {
      modalError.style.display = "block";
      const errorMsg = modalError.querySelector("[data-error-message]");
      if (errorMsg) errorMsg.textContent = message;
    }
  }
  
  // Submit to Google Apps Script (sends email with PDF)
  async function submitForEmailDelivery(email) {
    const endpoint = SAMPLE_EMAIL_ENDPOINT;
    const hasEndpoint = endpoint && endpoint.includes("script.google.com");
    
    const data = {
      email: email,
      source: "sample_download",
      source_url: location.href,
      submitted_at: new Date().toISOString(),
    };
    
    console.log("Submitting for email delivery:", data);
    
    if (!hasEndpoint) {
      console.warn("Sample email endpoint not configured. Email delivery will not work.");
      console.log("Configure 'sampleEmailEndpoint' in config.js");
      return { 
        ok: false, 
        message: "Email delivery is not configured. Please contact curtis@finsyncsolutions.org directly." 
      };
    }
    
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      console.log("Email delivery response:", result);
      
      if (result.success) {
        return { ok: true };
      } else {
        return { ok: false, message: result.message || "Failed to send email" };
      }
      
    } catch (err) {
      console.error("Email delivery error:", err);
      return { 
        ok: false, 
        message: "Network error. Please try again or contact curtis@finsyncsolutions.org directly." 
      };
    }
  }
  
  // Attach trigger listeners
  triggers.forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  });
  
  // Attach close listeners
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });
  
  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") {
      closeModal();
    }
  });
  
  // Form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = emailInput ? String(emailInput.value).trim() : "";
    
    // Honeypot check
    const honey = form.querySelector("[name='website']");
    if (honey && String(honey.value).trim().length > 0) {
      showSuccess("bot@detected.com");
      return;
    }
    
    // Validate email
    if (!email || !isValidEmail(email)) {
      if (emailField) setFieldError(emailField, "Please enter a valid email address.");
      if (emailInput) emailInput.focus();
      return;
    }
    
    if (emailField) clearFieldError(emailField);
    
    // Loading state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add("is-loading");
    }
    
    try {
      const result = await submitForEmailDelivery(email);
      
      if (result.ok) {
        showSuccess(email);
      } else {
        showError(result.message || "Something went wrong. Please try again.");
      }
      
    } catch (err) {
      console.error("Form submission error:", err);
      showError("Something went wrong. Please try again or contact us directly.");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove("is-loading");
      }
    }
  });
  
  // Clear error on input
  if (emailInput && emailField) {
    emailInput.addEventListener("input", () => {
      clearFieldError(emailField);
    });
  }
  
  // Retry button in error state
  const retryBtn = modal.querySelector("[data-retry]");
  if (retryBtn) {
    retryBtn.addEventListener("click", () => {
      if (modalError) modalError.style.display = "none";
      if (modalForm) modalForm.style.display = "block";
      if (emailInput) emailInput.focus();
    });
  }
}


/* ============================================
   INITIALIZATION
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  setActiveNavLink();
  initMobileNav();
  initBackToTop();
  initLeadForms();
  initDownloadModal();
  setFooterYear();
});