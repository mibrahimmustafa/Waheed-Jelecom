/**
 * Main Application Script for Waheed Mohamed Eid's CV Portfolio
 * Handles Language Switcher, Dark/Light Theme, Scroll Animations, Metrics & Toasts
 */

document.addEventListener('DOMContentLoaded', () => {
  // State variables
  let currentLang = localStorage.getItem('waheed_cv_lang') || 'ar';
  let currentTheme = localStorage.getItem('waheed_cv_theme') || 'dark';

  // DOM Elements
  const langToggleBtn = document.getElementById('langToggleBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  const toastContainer = document.getElementById('toastContainer');
  const contactForm = document.getElementById('quickContactForm');

  // ==========================================
  // 1. Language Switcher Engine
  // ==========================================
  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('waheed_cv_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    const dict = translations[lang] || translations.ar;

    // Update text elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.innerHTML = dict[key];
      }
    });

    // Update placeholders with data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) {
        el.setAttribute('placeholder', dict[key]);
      }
    });

    // Update document title
    if (dict.siteTitle) {
      document.title = dict.siteTitle;
    }

    // Update lang button label
    if (langToggleBtn) {
      const langText = langToggleBtn.querySelector('.lang-label');
      if (langText) {
        langText.textContent = lang === 'ar' ? 'English' : 'العربية';
      }
    }

    // Refresh captcha canvas styling if instantiated
    if (window.captchaInstance) {
      window.captchaInstance.renderCanvas();
    }
  }

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const nextLang = currentLang === 'ar' ? 'en' : 'ar';
      applyLanguage(nextLang);
      showToast(nextLang === 'ar' ? 'تم تحويل اللغة إلى العربية' : 'Switched language to English', 'info');
    });
  }

  // ==========================================
  // 2. Dark / Light Theme Engine
  // ==========================================
  function applyTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('waheed_cv_theme', theme);

    if (theme === 'light') {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      if (themeToggleBtn) {
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggleBtn.setAttribute('title', 'الوضع الليلي / Dark Mode');
      }
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      if (themeToggleBtn) {
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        themeToggleBtn.setAttribute('title', 'الوضع المضيء / Light Mode');
      }
    }

    // Re-render captcha with new theme colors
    if (window.captchaInstance) {
      window.captchaInstance.renderCanvas();
    }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
    });
  }

  // ==========================================
  // 3. Mobile Navigation Menu
  // ==========================================
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close menu when clicking any nav link
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (navLinks && navLinks.classList.contains('active')) {
      if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        navLinks.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
      }
    }
  });

  // ==========================================
  // 4. Scroll Spy & Header Blur Effect
  // ==========================================
  const header = document.querySelector('.site-header');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    // Header sticky background blur
    if (header) {
      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // Scroll-to-top button visibility
    if (scrollTopBtn) {
      if (scrollY > 400) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }

    // Active link highlighting
    sections.forEach((current) => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const navItem = document.querySelector(`.nav-links a[href*="${sectionId}"]`);

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        if (navItem) navItem.classList.add('active');
      } else {
        if (navItem) navItem.classList.remove('active');
      }
    });
  });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ==========================================
  // 5. Stat Counter Animations
  // ==========================================
  const statsSection = document.querySelector('.stats-section');
  let animatedStats = false;

  function animateCounters() {
    const counters = document.querySelectorAll('.stat-count');
    counters.forEach((counter) => {
      const target = parseInt(counter.getAttribute('data-target'), 10);
      const prefix = counter.getAttribute('data-prefix') || '';
      const suffix = counter.getAttribute('data-suffix') || '';
      const duration = 1800;
      const stepTime = 20;
      const totalSteps = duration / stepTime;
      const stepVal = target / totalSteps;
      let currentVal = 0;

      const timer = setInterval(() => {
        currentVal += stepVal;
        if (currentVal >= target) {
          counter.innerText = prefix + target + suffix;
          clearInterval(timer);
        } else {
          counter.innerText = prefix + Math.floor(currentVal) + suffix;
        }
      }, stepTime);
    });
  }

  if (statsSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animatedStats) {
            animatedStats = true;
            animateCounters();
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(statsSection);
  }

  // ==========================================
  // 6. Copy to Clipboard Functionality
  // ==========================================
  const copyButtons = document.querySelectorAll('.copy-btn');
  copyButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          const dict = translations[currentLang] || translations.ar;
          showToast(dict.contactCopied || 'تم النسخ بنجاح!', 'success');
          
          const origHTML = btn.innerHTML;
          btn.innerHTML = '<i class="fas fa-check"></i>';
          setTimeout(() => {
            btn.innerHTML = origHTML;
          }, 1800);
        }).catch(() => {
          showToast('Failed to copy', 'error');
        });
      }
    });
  });

  // ==========================================
  // 7. Contact Form Handler (Mailto Direct)
  // ==========================================
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('formName').value.trim();
      const email = document.getElementById('formEmail').value.trim();
      const subject = document.getElementById('formSubject').value.trim();
      const message = document.getElementById('formMessage').value.trim();

      if (!name || !email || !message) {
        showToast(currentLang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة!' : 'Please fill all required fields!', 'error');
        return;
      }

      // Construct mailto link
      const emailRecipient = 'wm569183@gmail.com';
      const mailtoSubject = encodeURIComponent(`[CV Inquiry] ${subject || 'New Message'} from ${name}`);
      const mailtoBody = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);

      window.location.href = `mailto:${emailRecipient}?subject=${mailtoSubject}&body=${mailtoBody}`;

      showToast(
        currentLang === 'ar'
          ? 'جاري فتح برنامج البريد الإلكتروني لإرسال رسالتكم...'
          : 'Opening your email client to dispatch the message...',
        'success'
      );

      contactForm.reset();
    });
  }

  // ==========================================
  // 8. Toast Notification System
  // ==========================================
  window.showToast = function (message, type = 'info') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;

    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'error') iconClass = 'fa-exclamation-triangle';

    toast.innerHTML = `
      <i class="fas ${iconClass}"></i>
      <span class="toast-msg">${message}</span>
    `;

    toastContainer.appendChild(toast);

    // Fade in
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    // Fade out and remove
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 400);
    }, 3500);
  };

  // ==========================================
  // 9. Initial Execution
  // ==========================================
  applyTheme(currentTheme);
  applyLanguage(currentLang);
});
