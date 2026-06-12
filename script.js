(function () {
  'use strict';

  const slides = document.querySelectorAll('.slide');
  const totalSlidesEl = document.getElementById('totalSlides');
  const currentSlideEl = document.getElementById('currentSlide');
  const progressFill = document.getElementById('progressFill');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const overviewToggle = document.getElementById('overviewToggle');
  const overviewPanel = document.getElementById('overviewPanel');
  const keyboardHint = document.getElementById('keyboardHint');
  const toolbarTitle = document.getElementById('toolbarTitle');
  const sidebar = document.getElementById('sidebar');
  const sidebarNav = document.getElementById('sidebarNav');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const menuBtn = document.getElementById('menuBtn');
  const sidebarClose = document.getElementById('sidebarClose');
  const slideDots = document.getElementById('slideDots');
  const detailModal = document.getElementById('detailModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalClose = document.getElementById('modalClose');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalIcon = document.getElementById('modalIcon');
  const modalLogo = document.getElementById('modalLogo');
  const toastContainer = document.getElementById('toastContainer');
  const autoplayBtn = document.getElementById('autoplayBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const particleCanvas = document.getElementById('particleCanvas');

  let currentIndex = 0;
  let direction = 1;
  let isAnimating = false;
  let autoplayInterval = null;
  let autoplayActive = false;
  const total = slides.length;
  const AUTOPLAY_DELAY = 8000;

  const ANIM_SELECTORS = [
    '.section-tag', 'h2', 'h3.sub-heading', '.lead-text', '.purpose-text',
    '.content-block', '.agenda-item', '.info-card', '.objective-list li',
    '.scope-item', '.out-scope-item', '.stakeholder-level', '.kpi-card',
    '.compact-list li', '.tag', '.interactive-metric', '.failure-grid span',
    '.module-box', '.pipeline-step', '.aging-item', '.hierarchy-level',
    '.exec-grid span', '.report-group', '.role-card', '.outcome-card',
    '.meta-card', '.title-badge', '.main-title', '.scheme-name',
    '.note-banner', '.interactive-chip', '.security-grid span',
    '.search-demo', '.tab-bar', '.hierarchy-breadcrumb', '.end-content > *',
    '.slide-brand-header', '.slide-heading-block', '.slide-footer'
  ];

  totalSlidesEl.textContent = total;

  /* ── Brand header & footer on every slide ── */
  function setupSlideBranding() {
    slides.forEach((slide) => {
      const inner = slide.querySelector('.slide-inner');
      if (!inner || inner.querySelector('.slide-brand-header')) return;

      const isDark = slide.classList.contains('slide-title') || slide.classList.contains('slide-end');
      const header = createBrandHeader(isDark);
      inner.insertBefore(header, inner.firstChild);

      const sectionTag = inner.querySelector(':scope > .section-tag');
      const h2 = inner.querySelector(':scope > h2:not(.end-content h2)');
      if (sectionTag || (h2 && !slide.classList.contains('slide-end'))) {
        const headingBlock = document.createElement('div');
        headingBlock.className = 'slide-heading-block';
        if (sectionTag) headingBlock.appendChild(sectionTag);
        if (h2 && !slide.classList.contains('slide-end')) headingBlock.appendChild(h2);
        header.insertAdjacentElement('afterend', headingBlock);
      }

      ensureSlideFooter(slide, isDark);
    });

    document.querySelectorAll('.logo-btn[data-modal-title]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openModal(
          btn.dataset.modalTitle,
          btn.dataset.modalBody,
          btn.dataset.modalIcon || '🏛️',
          btn.querySelector('img')?.src
        );
      });
    });
  }

  function createBrandHeader(isDark) {
    const header = document.createElement('header');
    header.className = 'slide-brand-header anim-item' + (isDark ? ' slide-brand-header-dark' : '');

    header.innerHTML = `
      <div class="brand-logos brand-logos-left">
        <button type="button" class="logo-btn interactive-logo" title="Government of India"
          data-modal-title="Government of India"
          data-modal-body="The National Emblem of India represents the authority of the Government of India. This scheme operates under the cooperative framework of the Indian federal system."
          data-modal-icon="🇮🇳">
          <img src="assets/ind-emblem.png" alt="Government of India Emblem" class="brand-logo brand-logo-ind">
        </button>
        <button type="button" class="logo-btn interactive-logo" title="Government of Maharashtra"
          data-modal-title="Government of Maharashtra"
          data-modal-body="Department of Cooperation, Government of Maharashtra — the implementing authority for the पुण्यश्लोक अहिल्यादेवी होळकर शेतकरी कर्जमुक्ती योजना – 2026 farmer loan waiver scheme."
          data-modal-icon="🦁">
          <img src="assets/maha-emblem.png" alt="Government of Maharashtra Seal" class="brand-logo brand-logo-maha">
        </button>
      </div>
      <div class="brand-center">
        <p class="brand-govt-hi">महाराष्ट्र शासन</p>
        <p class="brand-govt">Government of Maharashtra</p>
        <p class="brand-dept">Department of Cooperation</p>
        <div class="brand-divider" aria-hidden="true"></div>
        <p class="brand-scheme">पुण्यश्लोक अहिल्यादेवी होळकर शेतकरी कर्जमुक्ती योजना – 2026</p>
      </div>
      <div class="brand-logos brand-logos-right">
        <button type="button" class="logo-btn interactive-logo" title="Bank of Maharashtra"
          data-modal-title="Bank of Maharashtra"
          data-modal-body="A Government of India undertaking. Prepared this Functional Requirement Specification for the SNA Monitoring, Beneficiary Transaction Tracking, Reconciliation & MIS Platform. One Family · One Bank."
          data-modal-icon="🏦">
          <img src="assets/bank-logo.png" alt="Bank of Maharashtra — A Government of India Undertaking" class="brand-logo brand-logo-bank">
        </button>
      </div>
    `;

    return header;
  }

  function ensureSlideFooter(slide, isDark) {
    let footer = slide.querySelector('.slide-footer');
    if (!footer) {
      footer = document.createElement('div');
      footer.className = 'slide-footer' + (isDark ? ' slide-footer-dark' : '');
      slide.appendChild(footer);
    } else {
      footer.classList.add(isDark ? 'slide-footer-dark' : '');
    }

    footer.innerHTML = `
      <div class="footer-left">
        <img src="assets/ind-emblem.png" alt="" class="footer-logo" aria-hidden="true">
        <img src="assets/maha-emblem.png" alt="" class="footer-logo" aria-hidden="true">
        <span class="footer-text">FRS v1.0 · June 2026</span>
      </div>
      <span class="footer-confidential">Confidential</span>
      <div class="footer-right">
        <img src="assets/bank-logo.png" alt="Bank of Maharashtra" class="footer-logo footer-logo-bank">
      </div>
    `;
  }

  /* ── Init UI (continued) ── */
  function init() {
    setupSlideBranding();
    setupAnimItems();
    buildOverview();
    buildSidebar();
    buildSlideDots();
    setupRipples();
    setupFlipCards();
    setupTiltCards();
    setupAccordion();
    setupTabs();
    setupInteractiveNavigation();
    setupTags();
    setupMetrics();
    setupHierarchy();
    setupModals();
    setupParticles();
    updateUI(false);
    requestAnimationFrame(() => triggerSlideAnimations());
    setTimeout(() => showToast('Presentation ready — use arrow keys or click cards to explore', 3500), 800);
  }

  function setupAnimItems() {
    slides.forEach((slide) => {
      let delayIndex = 0;
      ANIM_SELECTORS.forEach((sel) => {
        slide.querySelectorAll(sel).forEach((el) => {
          if (el.closest('.flip-inner')) return;
          el.classList.add('anim-item');
          el.style.setProperty('--anim-delay', `${delayIndex * 0.05}s`);
          delayIndex += 1;
        });
      });
    });
  }

  function buildOverview() {
    slides.forEach((slide, i) => {
      const thumb = document.createElement('button');
      thumb.type = 'button';
      thumb.className = 'overview-thumb';
      thumb.innerHTML = `
        <span class="overview-thumb-num">${String(i + 1).padStart(2, '0')}</span>
        <span class="overview-thumb-title">${slide.dataset.title || `Slide ${i + 1}`}</span>
      `;
      thumb.addEventListener('click', () => {
        goToSlide(i);
        closeOverview();
      });
      overviewPanel.appendChild(thumb);
    });
  }

  function buildSidebar() {
    slides.forEach((slide, i) => {
      const link = document.createElement('button');
      link.type = 'button';
      link.className = 'sidebar-link';
      link.innerHTML = `<span class="sidebar-num">${String(i + 1).padStart(2, '0')}</span>${slide.dataset.title || `Slide ${i + 1}`}`;
      link.addEventListener('click', () => {
        goToSlide(i);
        closeSidebar();
      });
      sidebarNav.appendChild(link);
    });
  }

  function buildSlideDots() {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'slide-dot';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      slideDots.appendChild(dot);
    });
  }

  /* ── Slide navigation ── */
  function updateUI(animate = true) {
    slides.forEach((slide, i) => {
      slide.classList.remove('active', 'prev', 'enter-right', 'enter-left');
      if (i === currentIndex) {
        slide.classList.add('active');
        slide.classList.add(direction >= 0 ? 'enter-right' : 'enter-left');
      } else if (i < currentIndex) {
        slide.classList.add('prev');
      }
    });

    currentSlideEl.textContent = currentIndex + 1;
    progressFill.style.width = `${((currentIndex + 1) / total) * 100}%`;
    toolbarTitle.textContent = slides[currentIndex].dataset.title || `Slide ${currentIndex + 1}`;

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === total - 1;

    document.querySelectorAll('.overview-thumb').forEach((thumb, i) => {
      thumb.classList.toggle('current', i === currentIndex);
    });

    document.querySelectorAll('.sidebar-link').forEach((link, i) => {
      link.classList.toggle('active', i === currentIndex);
    });

    document.querySelectorAll('.slide-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });

    particleCanvas.classList.toggle('visible', currentIndex === 0 || currentIndex === total - 1);

    if (animate) {
      triggerSlideAnimations();
    }
  }

  function triggerSlideAnimations() {
    const active = slides[currentIndex];
    active.querySelectorAll('.anim-item').forEach((el) => {
      el.classList.remove('anim-visible');
      void el.offsetWidth;
      el.classList.add('anim-visible');
    });

    runSlideSpecificAnimations(active);
  }

  function runSlideSpecificAnimations(slide) {
    const title = slide.dataset.title;

    if (title === 'SNA Monitoring') {
      animateKpiCards(slide);
    }
    if (title === 'Success & Failure') {
      animateCounters(slide.querySelectorAll('.counter, .metric-count'));
    }
    if (title === 'Exception Management') {
      animateAgingBars(slide);
      animateCounters(slide.querySelectorAll('.aging-count'));
    }
    if (title === 'Reconciliation') {
      animatePipeline(slide);
    }
  }

  function goToSlide(index) {
    if (index < 0 || index >= total || index === currentIndex || isAnimating) return;
    direction = index > currentIndex ? 1 : -1;
    isAnimating = true;
    currentIndex = index;
    updateUI(true);
    setTimeout(() => { isAnimating = false; }, 550);
  }

  function nextSlide() { goToSlide(currentIndex + 1); }
  function prevSlide() { goToSlide(currentIndex - 1); }

  /* ── Counter animations ── */
  function animateValue(el, target, duration = 1200) {
    const start = performance.now();
    const suffix = el.dataset.suffix || '';
    const isDecimal = String(target).includes('.');

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = isDecimal
        ? value.toFixed(1) + suffix
        : Math.floor(value).toLocaleString('en-IN') + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function animateCounters(elements) {
    elements.forEach((el, i) => {
      const target = parseFloat(el.dataset.count) || 0;
      setTimeout(() => animateValue(el, target), i * 80);
    });
  }

  function animateKpiCards(slide) {
    slide.querySelectorAll('.kpi-card').forEach((card, i) => {
      const valueEl = card.querySelector('.kpi-value');
      const target = parseFloat(card.dataset.count) || 0;
      const suffix = card.dataset.suffix || '';
      setTimeout(() => {
        const start = performance.now();
        function frame(now) {
          const progress = Math.min((now - start) / 1400, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          valueEl.textContent = Math.floor(target * eased).toLocaleString('en-IN') + suffix;
          if (progress < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
        card.classList.add('kpi-pulse');
        setTimeout(() => card.classList.remove('kpi-pulse'), 600);
      }, i * 100);
    });
  }

  function animateAgingBars(slide) {
    slide.querySelectorAll('.aging-fill').forEach((fill, i) => {
      const width = fill.dataset.width + '%';
      fill.style.width = '0%';
      setTimeout(() => { fill.style.width = width; }, 200 + i * 150);
    });
  }

  function animatePipeline(slide) {
    slide.querySelectorAll('.pipeline-step').forEach((step, i) => {
      step.classList.remove('step-active');
      setTimeout(() => step.classList.add('step-active'), 300 + i * 350);
    });
  }

  /* ── Particles ── */
  function setupParticles() {
    const ctx = particleCanvas.getContext('2d');
    let particles = [];
    let animId;
    let w, h;

    function resize() {
      w = particleCanvas.width = window.innerWidth;
      h = particleCanvas.height = window.innerHeight;
    }

    function createParticles() {
      particles = Array.from({ length: 60 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 0.5,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.4 + 0.1,
        color: Math.random() > 0.5 ? '#0073C1' : '#005DA4'
      }));
    }

    function draw() {
      if (!particleCanvas.classList.contains('visible')) {
        animId = requestAnimationFrame(draw);
        return;
      }
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > w) p.dx *= -1;
        if (p.y < 0 || p.y > h) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();
    window.addEventListener('resize', () => { resize(); createParticles(); });
  }

  /* ── Ripple effect ── */
  function setupRipples() {
    document.querySelectorAll('.nav-btn, .toolbar-btn, .overview-toggle, button.interactive-card, button.scope-item, button.agenda-item, button.role-card, button.tag, button.interactive-metric, button.interactive-chip, button.hierarchy-level, button.logo-btn').forEach((btn) => {
      btn.addEventListener('click', createRipple);
    });
  }

  function createRipple(e) {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    btn.style.position = btn.style.position || 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }

  /* ── Flip cards ── */
  function setupFlipCards() {
    document.querySelectorAll('.flip-card').forEach((card) => {
      card.addEventListener('click', () => card.classList.toggle('flipped'));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.classList.toggle('flipped');
        }
      });
    });
  }

  /* ── 3D tilt ── */
  function setupTiltCards() {
    document.querySelectorAll('.tilt-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale(1.02)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ── Accordion ── */
  function setupAccordion() {
    document.querySelectorAll('.accordion-trigger').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.accordion-item');
        const wasExpanded = item.classList.contains('expanded');
        document.querySelectorAll('.accordion-item').forEach((i) => i.classList.remove('expanded'));
        if (!wasExpanded) item.classList.add('expanded');
      });
    });
  }

  /* ── Tabs ── */
  function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        const slide = btn.closest('.slide');
        slide.querySelectorAll('.tab-btn').forEach((b) => {
          b.classList.toggle('active', b === btn);
          b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
        });
        slide.querySelectorAll('.tab-panel').forEach((panel) => {
          const isActive = panel.dataset.panel === tab;
          panel.classList.toggle('active', isActive);
          if (isActive) {
            panel.querySelectorAll('.anim-item').forEach((el) => {
              el.classList.remove('anim-visible');
              void el.offsetWidth;
              el.classList.add('anim-visible');
            });
          }
        });
        showToast(`Showing ${tab === 'beneficiary' ? 'Beneficiary' : 'PFMS'} reconciliation`, 2000);
      });
    });
  }

  /* ── Navigation from cards ── */
  function setupInteractiveNavigation() {
    document.querySelectorAll('[data-goto]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(el.dataset.goto, 10);
        goToSlide(index);
        showToast(`Navigating to: ${slides[index].dataset.title}`, 2000);
      });
    });
  }

  /* ── Search tags ── */
  function setupTags() {
    const demoValue = document.getElementById('searchDemoValue');
    document.querySelectorAll('.interactive-tag').forEach((tag) => {
      tag.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.interactive-tag').forEach((t) => t.classList.remove('active'));
        tag.classList.add('active');
        demoValue.textContent = tag.textContent;
        demoValue.classList.add('flash');
        setTimeout(() => demoValue.classList.remove('flash'), 600);
      });
    });
  }

  /* ── Metrics filter ── */
  function setupMetrics() {
    const failureGrid = document.getElementById('failureGrid');
    document.querySelectorAll('.interactive-metric').forEach((metric) => {
      metric.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.interactive-metric').forEach((m) => m.classList.remove('active'));
        metric.classList.add('active');
        const filter = metric.dataset.filter;
        failureGrid.querySelectorAll('span').forEach((span) => {
          const type = span.dataset.type;
          span.classList.toggle('dimmed', filter !== 'success' && type !== filter && filter !== 'reversed');
          span.classList.toggle('highlighted', type === filter);
        });
      });
    });
  }

  /* ── Hierarchy drill-down ── */
  function setupHierarchy() {
    const breadcrumb = document.getElementById('hierarchyBreadcrumb');
    const levels = ['State', 'Division', 'District', 'Taluka', 'Village', 'Beneficiary'];
    const samples = {
      State: 'Maharashtra',
      Division: 'Pune Division',
      District: 'Pune District',
      Taluka: 'Haveli Taluka',
      Village: 'Sample Village',
      Beneficiary: 'Individual Beneficiary Record'
    };

    document.querySelectorAll('.interactive-level').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.interactive-level').forEach((l) => l.classList.remove('active-level'));
        btn.classList.add('active-level');
        const level = btn.dataset.level;
        const idx = levels.indexOf(level);
        const path = levels.slice(0, idx + 1).map((l) => samples[l]).join(' → ');
        breadcrumb.textContent = path;
        breadcrumb.classList.add('flash');
        setTimeout(() => breadcrumb.classList.remove('flash'), 600);
      });
    });
  }

  /* ── Modal ── */
  function setupModals() {
    document.querySelectorAll('[data-modal-title]').forEach((el) => {
      if (el.classList.contains('flip-card') || el.classList.contains('logo-btn')) return;
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        openModal(el.dataset.modalTitle, el.dataset.modalBody, el.dataset.modalIcon);
      });
    });

    modalClose.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);
  }

  function openModal(title, body, icon, logoSrc) {
    modalTitle.textContent = title;
    modalBody.textContent = body;
    if (logoSrc) {
      modalLogo.src = logoSrc;
      modalLogo.classList.remove('hidden');
      modalIcon.classList.add('hidden');
    } else {
      modalLogo.classList.add('hidden');
      modalIcon.classList.remove('hidden');
      modalIcon.textContent = icon || '📋';
    }
    detailModal.classList.add('open');
    detailModal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    detailModal.classList.remove('open');
    detailModal.setAttribute('aria-hidden', 'true');
  }

  /* ── Toast ── */
  function showToast(message, duration = 2500) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  /* ── Sidebar / Overview ── */
  function openSidebar() { sidebar.classList.add('open'); sidebarOverlay.classList.add('open'); }
  function closeSidebar() { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('open'); }
  function toggleOverview() { overviewPanel.classList.toggle('active'); }
  function closeOverview() { overviewPanel.classList.remove('active'); }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  }

  function toggleAutoplay() {
    autoplayActive = !autoplayActive;
    autoplayBtn.classList.toggle('playing', autoplayActive);
    autoplayBtn.querySelector('.icon-play').classList.toggle('hidden', autoplayActive);
    autoplayBtn.querySelector('.icon-pause').classList.toggle('hidden', !autoplayActive);

    if (autoplayActive) {
      showToast('Autoplay enabled (8s per slide)', 2000);
      autoplayInterval = setInterval(() => {
        if (currentIndex < total - 1) nextSlide();
        else { toggleAutoplay(); showToast('End of presentation', 2000); }
      }, AUTOPLAY_DELAY);
    } else {
      clearInterval(autoplayInterval);
    }
  }

  /* ── Event listeners ── */
  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);
  overviewToggle.addEventListener('click', toggleOverview);
  menuBtn.addEventListener('click', openSidebar);
  sidebarClose.addEventListener('click', closeSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);
  fullscreenBtn.addEventListener('click', toggleFullscreen);
  autoplayBtn.addEventListener('click', toggleAutoplay);

  document.addEventListener('keydown', (e) => {
    if (detailModal.classList.contains('open')) {
      if (e.key === 'Escape') closeModal();
      return;
    }
    if (sidebar.classList.contains('open')) {
      if (e.key === 'Escape') closeSidebar();
      return;
    }
    if (overviewPanel.classList.contains('active')) {
      if (e.key === 'Escape') closeOverview();
      return;
    }

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        prevSlide();
        break;
      case ' ':
        e.preventDefault();
        nextSlide();
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(total - 1);
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 'Escape':
        if (document.fullscreenElement) document.exitFullscreen();
        break;
      case 'o':
      case 'O':
        toggleOverview();
        break;
      case 'm':
      case 'M':
        sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
        break;
      case 'p':
      case 'P':
        toggleAutoplay();
        break;
    }
  });

  document.getElementById('slidesContainer').addEventListener('click', (e) => {
    if (e.target.closest('button, a, input, .flip-card, .accordion-item, .interactive-card, .tab-btn, .detail-modal, .logo-btn, .interactive-logo')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x > rect.width * 0.7) nextSlide();
    else if (x < rect.width * 0.3) prevSlide();
  });

  let touchStartX = 0;
  let touchStartY = 0;
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const diffX = e.changedTouches[0].screenX - touchStartX;
    const diffY = e.changedTouches[0].screenY - touchStartY;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX < 0) nextSlide();
      else prevSlide();
    }
  }, { passive: true });

  let hintHidden = false;
  function hideHint() {
    if (!hintHidden && keyboardHint) {
      keyboardHint.style.opacity = '0';
      keyboardHint.style.transition = 'opacity 0.5s';
      setTimeout(() => { keyboardHint.style.display = 'none'; }, 500);
      hintHidden = true;
    }
  }
  document.addEventListener('keydown', hideHint, { once: true });
  document.addEventListener('click', hideHint, { once: true });

  init();
})();
