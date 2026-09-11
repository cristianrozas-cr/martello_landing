/* =========================================================
   MARTELLO | Diseño & Construcción
   Script principal — JS vanilla, sin dependencias
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileNav();
  initFadeInAnimations();
  initCounters();
  initContactForm();
  initFooterYear();
});

/* ---------------------------------------------------------
   Header: sombra al hacer scroll
--------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  const toggleShadow = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  };

  toggleShadow();
  window.addEventListener('scroll', toggleShadow);
}

/* ---------------------------------------------------------
   Menú móvil (hamburguesa)
--------------------------------------------------------- */
function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  if (!hamburger || !nav) return;

  hamburger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    hamburger.classList.toggle('is-active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Cierra el menú al seleccionar un link
  nav.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      hamburger.classList.remove('is-active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------------------------------------------------------
   Animaciones fade-in al hacer scroll (Intersection Observer)
--------------------------------------------------------- */
function initFadeInAnimations() {
  const targets = document.querySelectorAll('.fade-in');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------
   Contadores animados (años de experiencia, proyectos, clientes)
--------------------------------------------------------- */
function initCounters() {
  const counters = document.querySelectorAll('.stat-card__number');
  if (!counters.length) return;

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    const duration = 1500;
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = value;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    };

    requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------
   Formulario de contacto: validación básica + envío a Formspree
--------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  if (!form || !feedback) return;

  const requiredFields = ['name', 'phone', 'email', 'service'];
  const submitBtn = form.querySelector('button[type="submit"]');
  const submitBtnDefaultText = submitBtn ? submitBtn.textContent : '';

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    let isValid = true;

    requiredFields.forEach((fieldName) => {
      const field = form.elements[fieldName];
      const errorEl = document.getElementById(`${fieldName}-error`);
      const value = field.value.trim();

      if (!value) {
        isValid = false;
        field.classList.add('is-invalid');
        if (errorEl) errorEl.textContent = 'Este campo es obligatorio.';
      } else if (fieldName === 'email' && !isValidEmail(value)) {
        isValid = false;
        field.classList.add('is-invalid');
        if (errorEl) errorEl.textContent = 'Ingresa un email válido.';
      } else {
        field.classList.remove('is-invalid');
        if (errorEl) errorEl.textContent = '';
      }
    });

    feedback.classList.remove('is-success', 'is-error');

    if (!isValid) {
      feedback.textContent = 'Por favor completa los campos obligatorios correctamente.';
      feedback.classList.add('is-error');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';
    }
    feedback.textContent = '';

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: {
        Accept: 'application/json',
      },
    })
      .then((response) => {
        if (response.ok) {
          feedback.textContent = '¡Gracias por tu mensaje! Te contactaremos a la brevedad.';
          feedback.classList.add('is-success');
          form.reset();
        } else {
          feedback.textContent = 'No pudimos enviar tu mensaje. Por favor intenta nuevamente o escríbenos por WhatsApp.';
          feedback.classList.add('is-error');
        }
      })
      .catch(() => {
        feedback.textContent = 'Hubo un problema de conexión. Por favor intenta nuevamente en unos minutos.';
        feedback.classList.add('is-error');
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtnDefaultText;
        }
      });
  });

  // Limpia el estado de error apenas el usuario corrige el campo
  requiredFields.forEach((fieldName) => {
    const field = form.elements[fieldName];
    if (!field) return;
    field.addEventListener('input', () => {
      field.classList.remove('is-invalid');
      const errorEl = document.getElementById(`${fieldName}-error`);
      if (errorEl) errorEl.textContent = '';
    });
  });
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/* ---------------------------------------------------------
   Año actual en el footer
--------------------------------------------------------- */
function initFooterYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}
