/*
===========================================
ROSA MYSTICA.M - PORTFOLIO WEBSITE SCRIPTS
===========================================

Interactive Functionality:
- Smooth scrolling navigation with active state management
- Mobile navigation toggle with accessibility support
- Scroll-triggered animations and section reveals
- Skills progress bar animations with intersection observer
- Contact form validation with comprehensive error handling
- Navbar background transition on scroll
- Performance-optimized event handling

Technical Implementation:
- Vanilla JavaScript (no external dependencies)
- Modern ES6+ features with fallbacks
- Intersection Observer API for performance
- Debounced scroll events to prevent performance issues
- Comprehensive accessibility support (ARIA, keyboard navigation)
- Cross-browser compatibility considerations
*/

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Debounce function to limit the rate of function execution
 * Improves performance for scroll and resize events
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately on first call
 * @returns {Function} Debounced function
 */
function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };
}

/**
 * Smooth scroll to target element with offset for fixed navbar
 * @param {string} targetId - ID of target element
 * @param {number} offset - Offset in pixels (default: 80px for navbar)
 */
function smoothScrollTo(targetId, offset = 80) {
  const targetElement = document.getElementById(targetId);
  if (!targetElement) return;

  const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;

  // Use native smooth scrolling if supported, otherwise use custom implementation
  if ('scrollBehavior' in document.documentElement.style) {
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  } else {
    // Fallback for browsers that don't support smooth scrolling
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 800;
    let start = null;

    function animation(currentTime) {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const run = ease(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    // Easing function for smooth animation
    function ease(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t + b;
      t--;
      return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
  }
}

/**
 * Check if element is in viewport
 * @param {Element} element - Element to check
 * @param {number} threshold - Percentage of element that should be visible (0-1)
 * @returns {boolean} True if element is in viewport
 */
function isInViewport(element, threshold = 0.1) {
  const rect = element.getBoundingClientRect();
  const elementHeight = rect.bottom - rect.top;
  const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
  return visibleHeight / elementHeight >= threshold;
}

// ===========================================
// NAVIGATION FUNCTIONALITY
// ===========================================

class Navigation {
  constructor() {
    this.navbar = document.querySelector('.navbar');
    this.navToggle = document.querySelector('.nav-toggle');
    this.navMenu = document.querySelector('.nav-menu');
    this.navLinks = document.querySelectorAll('.nav-menu a');
    this.isMenuOpen = false;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupScrollEffect();
    this.setupActiveNavigation();
  }

  setupEventListeners() {
    // Mobile menu toggle
    if (this.navToggle) {
      this.navToggle.addEventListener('click', () => this.toggleMobileMenu());

      // Keyboard support for mobile menu toggle
      this.navToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleMobileMenu();
        }
      });
    }

    // Navigation link clicks
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => this.handleNavClick(e));

      // Keyboard support for navigation links
      link.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.handleNavClick(e);
        }
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isMenuOpen && !this.navbar.contains(e.target)) {
        this.closeMobileMenu();
      }
    });

    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMobileMenu();
        this.navToggle.focus(); // Return focus to toggle button
      }
    });

    // Handle window resize
    window.addEventListener('resize', debounce(() => {
      if (window.innerWidth > 768 && this.isMenuOpen) {
        this.closeMobileMenu();
      }
    }, 250));
  }

  toggleMobileMenu() {
    this.isMenuOpen = !this.isMenuOpen;

    this.navMenu.classList.toggle('active');
    this.navToggle.classList.toggle('active');

    // Update ARIA attributes for accessibility
    this.navToggle.setAttribute('aria-expanded', this.isMenuOpen);

    // Prevent body scroll when menu is open
    document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';

    // Focus management
    if (this.isMenuOpen) {
      // Focus first menu item when menu opens
      const firstLink = this.navMenu.querySelector('a');
      if (firstLink) {
        setTimeout(() => firstLink.focus(), 100);
      }
    }
  }

  closeMobileMenu() {
    this.isMenuOpen = false;
    this.navMenu.classList.remove('active');
    this.navToggle.classList.remove('active');
    this.navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  handleNavClick(e) {
    const href = e.target.getAttribute('href');

    // Only handle internal links (starting with #)
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.substring(1);

      // Close mobile menu if open
      if (this.isMenuOpen) {
        this.closeMobileMenu();
      }

      // Smooth scroll to target
      smoothScrollTo(targetId);

      // Update URL without triggering scroll
      if (history.pushState) {
        history.pushState(null, null, href);
      }
    }
  }

  setupScrollEffect() {
    const scrollHandler = debounce(() => {
      const scrolled = window.pageYOffset > 50;
      this.navbar.classList.toggle('scrolled', scrolled);
    }, 10);

    window.addEventListener('scroll', scrollHandler);

    // Initial check
    scrollHandler();
  }

  setupActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');

    const updateActiveNav = debounce(() => {
      const scrollPosition = window.pageYOffset + 100; // Offset for navbar

      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-menu a[href="#${sectionId}"]`);

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          // Remove active class from all nav links
          this.navLinks.forEach(link => link.classList.remove('active'));

          // Add active class to current section's nav link
          if (navLink) {
            navLink.classList.add('active');
          }
        }
      });
    }, 50);

    window.addEventListener('scroll', updateActiveNav);

    // Initial check
    updateActiveNav();
  }
}

// ===========================================
// SCROLL ANIMATIONS
// ===========================================

class ScrollAnimations {
  constructor() {
    this.animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
    this.skillBars = document.querySelectorAll('.skill-progress');
    this.observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    this.init();
  }

  init() {
    // Use Intersection Observer for better performance
    if ('IntersectionObserver' in window) {
      this.setupIntersectionObserver();
    } else {
      // Fallback for older browsers
      this.setupScrollListener();
    }

    this.setupSkillAnimations();
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');

          // Unobserve element after animation to improve performance
          observer.unobserve(entry.target);
        }
      });
    }, this.observerOptions);

    this.animatedElements.forEach(element => {
      observer.observe(element);
    });
  }

  setupScrollListener() {
    const checkVisibility = debounce(() => {
      this.animatedElements.forEach(element => {
        if (!element.classList.contains('visible') && isInViewport(element)) {
          element.classList.add('visible');
        }
      });
    }, 50);

    window.addEventListener('scroll', checkVisibility);

    // Initial check
    checkVisibility();
  }

  setupSkillAnimations() {
    const animateSkills = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const skillBar = entry.target;
          const targetWidth = skillBar.getAttribute('data-width');

          // Animate skill bar with delay for staggered effect
          setTimeout(() => {
            skillBar.style.width = targetWidth;
          }, 200);

          // Unobserve after animation
          skillObserver.unobserve(skillBar);
        }
      });
    };

    if ('IntersectionObserver' in window) {
      const skillObserver = new IntersectionObserver(animateSkills, {
        threshold: 0.5
      });

      this.skillBars.forEach(skillBar => {
        skillObserver.observe(skillBar);
      });
    } else {
      // Fallback for older browsers
      const checkSkills = debounce(() => {
        this.skillBars.forEach(skillBar => {
          if (isInViewport(skillBar, 0.5) && skillBar.style.width === '0%') {
            const targetWidth = skillBar.getAttribute('data-width');
            skillBar.style.width = targetWidth;
          }
        });
      }, 100);

      window.addEventListener('scroll', checkSkills);
    }
  }
}

// ===========================================
// CONTACT FORM FUNCTIONALITY
// ===========================================

class ContactForm {
  constructor() {
    this.form = document.getElementById('contactForm');
    this.fields = {
      name: document.getElementById('name'),
      email: document.getElementById('email'),
      subject: document.getElementById('subject'),
      message: document.getElementById('message')
    };

    this.init();
  }

  init() {
    if (!this.form) return;

    this.setupEventListeners();
    this.setupRealTimeValidation();
  }

  setupEventListeners() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Add input event listeners for real-time validation
    Object.values(this.fields).forEach(field => {
      if (field) {
        field.addEventListener('blur', () => this.validateField(field));
        field.addEventListener('input', () => this.clearFieldError(field));
      }
    });
  }

  setupRealTimeValidation() {
    // Email field specific validation
    if (this.fields.email) {
      this.fields.email.addEventListener('input', debounce(() => {
        if (this.fields.email.value) {
          this.validateEmail(this.fields.email.value)
            ? this.clearFieldError(this.fields.email)
            : this.showFieldError(this.fields.email, 'Please enter a valid email address');
        }
      }, 500));
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    // Validate all fields
    const isValid = this.validateForm();

    if (isValid) {
      this.submitForm();
    } else {
      // Focus on first error field
      const firstErrorField = this.form.querySelector('.form-group.error input, .form-group.error textarea');
      if (firstErrorField) {
        firstErrorField.focus();
      }
    }
  }

  validateForm() {
    let isValid = true;

    // Clear previous errors
    this.clearAllErrors();

    // Validate each field
    Object.entries(this.fields).forEach(([fieldName, field]) => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  validateField(field) {
    if (!field) return true;

    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';

    // Required field validation
    if (!value) {
      errorMessage = `${this.getFieldLabel(fieldName)} is required`;
      isValid = false;
    } else {
      // Field-specific validation
      switch (fieldName) {
        case 'name':
          if (value.length < 2) {
            errorMessage = 'Name must be at least 2 characters long';
            isValid = false;
          } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
            errorMessage = 'Name can only contain letters, spaces, hyphens, and apostrophes';
            isValid = false;
          }
          break;

        case 'email':
          if (!this.validateEmail(value)) {
            errorMessage = 'Please enter a valid email address';
            isValid = false;
          }
          break;

        case 'subject':
          if (value.length < 5) {
            errorMessage = 'Subject must be at least 5 characters long';
            isValid = false;
          } else if (value.length > 100) {
            errorMessage = 'Subject must be less than 100 characters';
            isValid = false;
          }
          break;

        case 'message':
          if (value.length < 10) {
            errorMessage = 'Message must be at least 10 characters long';
            isValid = false;
          } else if (value.length > 1000) {
            errorMessage = 'Message must be less than 1000 characters';
            isValid = false;
          }
          break;
      }
    }

    if (!isValid) {
      this.showFieldError(field, errorMessage);
    } else {
      this.clearFieldError(field);
    }

    return isValid;
  }

  validateEmail(email) {
    // Comprehensive email validation regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  }

  showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    const errorElement = formGroup.querySelector('.error-message');

    formGroup.classList.add('error');
    errorElement.textContent = message;
    errorElement.classList.add('show');

    // Add ARIA attributes for accessibility
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', errorElement.id);
  }

  clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    const errorElement = formGroup.querySelector('.error-message');

    formGroup.classList.remove('error');
    errorElement.textContent = '';
    errorElement.classList.remove('show');

    // Remove ARIA attributes
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
  }

  clearAllErrors() {
    const errorGroups = this.form.querySelectorAll('.form-group.error');
    errorGroups.forEach(group => {
      group.classList.remove('error');
      const errorElement = group.querySelector('.error-message');
      errorElement.textContent = '';
      errorElement.classList.remove('show');
    });

    // Clear ARIA attributes
    Object.values(this.fields).forEach(field => {
      if (field) {
        field.removeAttribute('aria-invalid');
        field.removeAttribute('aria-describedby');
      }
    });
  }

  getFieldLabel(fieldName) {
    const labels = {
      name: 'Name',
      email: 'Email',
      subject: 'Subject',
      message: 'Message'
    };
    return labels[fieldName] || fieldName;
  }

  async submitForm() {
    const submitButton = this.form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    try {
      // Show loading state
      submitButton.textContent = 'Sending...';
      submitButton.disabled = true;

      // Collect form data
      const formData = new FormData(this.form);
      const data = Object.fromEntries(formData.entries());

      // Simulate form submission (replace with actual endpoint)
      await this.simulateFormSubmission(data);

      // Show success message
      this.showSuccessMessage();

      // Reset form
      this.form.reset();

    } catch (error) {
      console.error('Form submission error:', error);
      this.showErrorMessage('There was an error sending your message. Please try again.');
    } finally {
      // Restore button state
      submitButton.textContent = originalText;
      submitButton.disabled = false;
    }
  }

  async simulateFormSubmission(data) {
    // Simulate API call delay
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate success (90% success rate for demo)
        if (Math.random() > 0.1) {
          console.log('Form submitted successfully:', data);
          resolve(data);
        } else {
          reject(new Error('Simulated server error'));
        }
      }, 2000);
    });
  }

  showSuccessMessage() {
    // Create and show success notification
    const notification = this.createNotification(
      'Message sent successfully! I\'ll get back to you soon.',
      'success'
    );
    this.showNotification(notification);
  }

  showErrorMessage(message) {
    // Create and show error notification
    const notification = this.createNotification(message, 'error');
    this.showNotification(notification);
  }

  createNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${type === 'success' ? '✅' : '❌'}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close" aria-label="Close notification">&times;</button>
      </div>
    `;

    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      background: ${type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      backdrop-filter: blur(10px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      transform: translateX(100%);
      transition: transform 0.3s ease-in-out;
      max-width: 400px;
    `;

    // Close button functionality
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
      this.hideNotification(notification);
    });

    return notification;
  }

  showNotification(notification) {
    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideNotification(notification);
    }, 5000);
  }

  hideNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }
}

// ===========================================
// PERFORMANCE OPTIMIZATIONS
// ===========================================

class PerformanceOptimizer {
  constructor() {
    this.init();
  }

  init() {
    this.optimizeImages();
    this.preloadCriticalResources();
    this.setupServiceWorker();
  }

  optimizeImages() {
    // Lazy load images that are not immediately visible
    const images = document.querySelectorAll('img[loading="lazy"]');

    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    }
  }

  preloadCriticalResources() {
    // Preload critical fonts and resources
    const criticalResources = [
      // Add any critical resources here
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.type) link.type = resource.type;
      document.head.appendChild(link);
    });
  }

  setupServiceWorker() {
    // Register service worker for caching (if available)
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }
}

// ===========================================
// ACCESSIBILITY ENHANCEMENTS
// ===========================================

class AccessibilityEnhancer {
  constructor() {
    this.init();
  }

  init() {
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupScreenReaderSupport();
    this.setupReducedMotionSupport();
  }

  setupKeyboardNavigation() {
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: var(--color-primary);
      color: white;
      padding: 8px;
      text-decoration: none;
      border-radius: 4px;
      z-index: 10000;
      transition: top 0.3s;
    `;

    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);

    // Keyboard navigation for interactive elements
    document.addEventListener('keydown', (e) => {
      // Handle escape key for closing modals/menus
      if (e.key === 'Escape') {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.blur) {
          activeElement.blur();
        }
      }
    });
  }

  setupFocusManagement() {
    // Ensure focus is visible for keyboard users
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });

    // Add CSS for keyboard navigation
    const style = document.createElement('style');
    style.textContent = `
      .keyboard-navigation *:focus {
        outline: 2px solid var(--color-primary) !important;
        outline-offset: 2px !important;
      }
    `;
    document.head.appendChild(style);
  }

  setupScreenReaderSupport() {
    // Add live region for dynamic content updates
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
    document.body.appendChild(liveRegion);

    // Function to announce messages to screen readers
    window.announceToScreenReader = (message) => {
      liveRegion.textContent = message;
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    };
  }

  setupReducedMotionSupport() {
    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (prefersReducedMotion.matches) {
      document.body.classList.add('reduced-motion');
    }

    prefersReducedMotion.addEventListener('change', (e) => {
      if (e.matches) {
        document.body.classList.add('reduced-motion');
      } else {
        document.body.classList.remove('reduced-motion');
      }
    });
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const skillBars = document.querySelectorAll(".skill-progress");

  skillBars.forEach(bar => {
    const targetWidth = bar.getAttribute("data-width"); // e.g. 90%
    bar.style.transition = "width 2s ease-in-out"; // smooth animation
    setTimeout(() => {
      bar.style.width = targetWidth; // slowly reach target
    }, 300); // small delay
  });
});



// ===========================================
// INITIALIZATION
// ===========================================

/**
 * Initialize all functionality when DOM is ready
 * Uses modern event handling with fallbacks for older browsers
 */
function initializePortfolio() {
  try {
    // Initialize core functionality
    new Navigation();
    new ScrollAnimations();
    new ContactForm();
    new PerformanceOptimizer();
    new AccessibilityEnhancer();

    // Add any additional initialization here
    console.log('Portfolio website initialized successfully');

    // Announce to screen readers that the page is ready
    if (window.announceToScreenReader) {
      setTimeout(() => {
        window.announceToScreenReader('Portfolio website loaded and ready for navigation');
      }, 1000);
    }

  } catch (error) {
    console.error('Error initializing portfolio:', error);

    // Fallback for critical functionality
    setupBasicNavigation();
  }
}

/**
 * Fallback navigation for when main initialization fails
 * Provides basic smooth scrolling functionality
 */
function setupBasicNavigation() {
  const navLinks = document.querySelectorAll('a[href^="#"]');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// ===========================================
// EVENT LISTENERS FOR INITIALIZATION
// ===========================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePortfolio);
} else {
  // DOM is already ready
  initializePortfolio();
}

// Handle page visibility changes for performance optimization
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Page is hidden, pause non-critical animations
    document.body.classList.add('page-hidden');
  } else {
    // Page is visible, resume animations
    document.body.classList.remove('page-hidden');
  }
});

// Handle online/offline status
window.addEventListener('online', () => {
  console.log('Connection restored');
  if (window.announceToScreenReader) {
    window.announceToScreenReader('Internet connection restored');
  }
});

window.addEventListener('offline', () => {
  console.log('Connection lost');
  if (window.announceToScreenReader) {
    window.announceToScreenReader('Internet connection lost');
  }
});

// ===========================================
// ERROR HANDLING AND DEBUGGING
// ===========================================

// Global error handler for debugging
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);

  // In production, you might want to send errors to a logging service
  // logErrorToService(e.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);

  // Prevent the default browser behavior
  e.preventDefault();
});

// ===========================================
// EXPORT FOR TESTING (if needed)
// ===========================================

// Export classes for testing purposes (uncomment if needed)
/*
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Navigation,
    ScrollAnimations,
    ContactForm,
    PerformanceOptimizer,
    AccessibilityEnhancer
  };
}
*/