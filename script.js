const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const form = document.querySelector(".contact-form");
const serviceSelect = form?.querySelector('select[name="service"]');
const quoteButtons = document.querySelectorAll(".btn-quote[data-service], .pack-btn--primary[data-service]");
const feedback = document.querySelector(".form-feedback");
const revealTargets = document.querySelectorAll(
  ".stats article, .card, .step, .benefit-card, .contact-form, .section-tag"
);
const titleTargets = document.querySelectorAll(
  "h1, .section h2, .card h3, .step h3, .benefit-card h3"
);

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => navLinks.classList.remove("open"));
  });
}

quoteButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const service = button.getAttribute("data-service");
    if (!serviceSelect || !service) {
      return;
    }

    const option = Array.from(serviceSelect.options).find(
      (entry) => entry.value === service || entry.textContent === service
    );

    if (option) {
      serviceSelect.value = option.value;
    }

    if (navLinks) {
      navLinks.classList.remove("open");
    }

    serviceSelect.focus({ preventScroll: true });
  });
});

if (form && feedback) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());

    feedback.textContent = "Envoi en cours...";

    try {
      const response = await fetch("/api/devis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Erreur lors de l'envoi.");
      }

      feedback.textContent =
        "Merci " +
        payload.name +
        ", votre demande est envoyée. Je vous rappelle rapidement.";
      form.reset();
    } catch (error) {
      feedback.textContent =
        "Impossible d'envoyer la demande pour le moment. Réessayez dans un instant.";
    }
  });
}

revealTargets.forEach((element, index) => {
  element.classList.add("reveal");
  element.classList.add("reveal-delay-" + (index % 4));
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealTargets.forEach((element) => revealObserver.observe(element));

titleTargets.forEach((element, index) => {
  element.classList.add("title-animate");
  element.style.setProperty("--title-delay", (index % 5) * 70 + "ms");
});

const titleObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("title-in");
        titleObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.28 }
);

titleTargets.forEach((element) => titleObserver.observe(element));

const doorModal = document.getElementById("door-urgency-modal");
const doorHeadingEl = document.getElementById("door-urgency-modal-heading");

function openDoorModal(headingText) {
  if (!doorModal || !doorHeadingEl) {
    return;
  }
  doorHeadingEl.textContent = headingText;
  doorModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  doorModal.querySelector(".door-urgency-modal__close")?.focus();
}

function closeDoorModal() {
  if (!doorModal) {
    return;
  }
  doorModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.querySelectorAll(".card--door-urgency").forEach((card) => {
  card.addEventListener("click", (e) => {
    if (e.target.closest && e.target.closest("a")) {
      return;
    }
    const heading = card.getAttribute("data-urgency-heading");
    if (heading) {
      openDoorModal(heading);
    }
  });

  card.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") {
      return;
    }
    if (e.target.closest && e.target.closest("a")) {
      return;
    }
    e.preventDefault();
    const heading = card.getAttribute("data-urgency-heading");
    if (heading) {
      openDoorModal(heading);
    }
  });
});

doorModal?.querySelectorAll("[data-close-door-modal]").forEach((el) => {
  el.addEventListener("click", () => closeDoorModal());
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape" || doorModal?.getAttribute("aria-hidden") !== "false") {
    return;
  }
  closeDoorModal();
});

const emergencyCallBtn = document.createElement("a");
emergencyCallBtn.href = "tel:+33781812075";
emergencyCallBtn.className = "floating-call";
emergencyCallBtn.setAttribute("aria-label", "Appeler en urgence");
emergencyCallBtn.innerHTML =
  '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.11.37 2.3.56 3.51.56a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.85 21 3 13.15 3 3.5a1 1 0 0 1 1-1H7.5a1 1 0 0 1 1 1c0 1.21.19 2.4.56 3.51a1 1 0 0 1-.24 1.01l-2.2 2.27Z"/></svg><span>Urgence</span>';
document.body.appendChild(emergencyCallBtn);
