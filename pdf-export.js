/* Export presentation as professional PDF — one slide per page */
(function () {
  'use strict';

  let showToast = () => {};
  let printChrome = [];

  const SLIDE_HEIGHT_PX = 794; /* ~210mm at 96dpi */
  const FOOTER_HEIGHT = 36;
  const MOCKUP_ZOOM = 0.72;

  function setCounterFinalValues() {
    document.querySelectorAll('.ui-counter[data-count]').forEach((el) => {
      const target = parseFloat(el.dataset.count) || 0;
      const isDecimal = String(target).includes('.');
      el.textContent = isDecimal
        ? target.toFixed(1)
        : Math.floor(target).toLocaleString('en-IN');
    });

    document.querySelectorAll('.counter[data-count], .metric-count[data-count], .aging-count[data-count]').forEach((el) => {
      const target = parseFloat(el.dataset.count) || 0;
      const suffix = el.dataset.suffix || '';
      el.textContent = Math.floor(target).toLocaleString('en-IN') + suffix;
    });

    document.querySelectorAll('.kpi-card[data-count]').forEach((card) => {
      const target = parseFloat(card.dataset.count) || 0;
      const suffix = card.dataset.suffix || '';
      const valueEl = card.querySelector('.kpi-value');
      if (valueEl) {
        valueEl.textContent = Math.floor(target).toLocaleString('en-IN') + suffix;
      }
    });
  }

  function getTargetSlides(mode) {
    const all = document.querySelectorAll('.slide');
    if (mode === 'current') {
      return document.querySelector('.slide.active') ? [document.querySelector('.slide.active')] : [];
    }
    return Array.from(all);
  }

  function injectPrintChrome(slides) {
    printChrome = [];
    const total = slides.length;

    slides.forEach((slide, i) => {
      const num = String(i + 1).padStart(2, '0');
      const totalStr = String(total).padStart(2, '0');
      const title = slide.dataset.title || `Slide ${i + 1}`;

      if (slide.classList.contains('slide-mockup')) {
        if (slide.querySelector('.print-mockup-footer')) return;
        const footer = document.createElement('div');
        footer.className = 'print-mockup-footer';
        footer.innerHTML = `
          <span>FRS v1.0 · ${title}</span>
          <span class="print-slide-num">${num} / ${totalStr}</span>
          <span style="display:flex;align-items:center;gap:4px">
            <img src="assets/ind-emblem.png" alt="">
            <img src="assets/bank-logo.png" alt="">
          </span>
        `;
        slide.appendChild(footer);
        printChrome.push({ el: footer, slide });
        return;
      }

      const footer = slide.querySelector('.slide-footer');
      if (footer && !footer.querySelector('.print-slide-num')) {
        const existing = footer.querySelector('.footer-confidential');
        const numSpan = document.createElement('span');
        numSpan.className = 'print-slide-num';
        numSpan.textContent = `${num} / ${totalStr}`;
        if (existing) {
          existing.insertAdjacentElement('beforebegin', numSpan);
        } else {
          footer.insertBefore(numSpan, footer.firstChild);
        }
        printChrome.push({ el: numSpan, slide, type: 'num' });
      }
    });
  }

  function removePrintChrome() {
    printChrome.forEach((item) => {
      if (item.type === 'num') {
        item.el.remove();
      } else {
        item.el.remove();
      }
    });
    printChrome = [];
  }

  function fitSlidesToPage(slides) {
    slides.forEach((slide) => {
      const inner = slide.querySelector('.slide-inner, .slide-inner-mockup');
      if (!inner) return;

      inner.classList.remove('print-scaled');
      inner.style.transform = '';
      inner.style.width = '';
      inner.style.height = '';
      inner.style.marginLeft = '';
      slide.classList.remove('print-scaled-mockup');

      const mockup = slide.querySelector('.ui-mockup');
      if (mockup) {
        slide.classList.add('print-scaled-mockup');
        mockup.style.transform = `scale(${MOCKUP_ZOOM})`;
        mockup.style.transformOrigin = 'top left';
        mockup.style.width = `${100 / MOCKUP_ZOOM}%`;
        return;
      }

      const footer = slide.querySelector('.slide-footer, .print-mockup-footer');
      const footerH = footer ? FOOTER_HEIGHT : 0;
      const available = SLIDE_HEIGHT_PX - footerH - 8;

      /* Force reflow after print styles apply */
      const needed = inner.scrollHeight;
      if (needed > available && available > 100) {
        const scale = Math.max(0.62, available / needed);
        inner.classList.add('print-scaled');
        inner.style.transform = `scale(${scale})`;
        inner.style.transformOrigin = 'top center';
        inner.style.width = `${100 / scale}%`;
        inner.style.marginLeft = `${((100 - 100 / scale) / 2) * scale}%`;
      }
    });
  }

  function resetSlideFit(slides) {
    slides.forEach((slide) => {
      const inner = slide.querySelector('.slide-inner, .slide-inner-mockup');
      if (inner) {
        inner.classList.remove('print-scaled');
        inner.style.transform = '';
        inner.style.width = '';
        inner.style.height = '';
        inner.style.marginLeft = '';
      }
      slide.classList.remove('print-scaled-mockup');
      const mockup = slide.querySelector('.ui-mockup');
      if (mockup) {
        mockup.style.transform = '';
        mockup.style.width = '';
      }
    });
  }

  function preparePrint(mode) {
    document.documentElement.classList.add('printing-pdf');
    document.body.classList.add('printing-pdf');
    document.body.classList.toggle('print-all-slides', mode === 'all');
    document.body.classList.toggle('print-current-slide', mode === 'current');

    document.querySelectorAll('.anim-item').forEach((el) => {
      el.classList.add('anim-visible');
    });

    if (window.PlatformUI?.prepareForPrint) {
      PlatformUI.prepareForPrint();
    }

    setCounterFinalValues();

    const slides = getTargetSlides(mode);
    injectPrintChrome(document.querySelectorAll('.slide'));
    fitSlidesToPage(slides);
  }

  function cleanupPrint() {
    const slides = getTargetSlides(document.body.classList.contains('print-current-slide') ? 'current' : 'all');
    resetSlideFit(slides);
    removePrintChrome();
    document.documentElement.classList.remove('printing-pdf');
    document.body.classList.remove('printing-pdf', 'print-all-slides', 'print-current-slide');
  }

  function exportPdf(mode) {
    preparePrint(mode);

    showToast(
      'Save as PDF · Layout: Landscape · Margins: None · Background graphics: ON',
      6000
    );

    const onAfterPrint = () => {
      cleanupPrint();
      window.removeEventListener('afterprint', onAfterPrint);
    };
    window.addEventListener('afterprint', onAfterPrint);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          window.print();
          setTimeout(() => {
            if (document.body.classList.contains('printing-pdf')) cleanupPrint();
          }, 3000);
        }, 600);
      });
    });
  }

  function init(api) {
    showToast = api.showToast || showToast;
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-pdf]');
      if (!btn) return;
      e.stopPropagation();
      exportPdf(btn.dataset.pdf === 'current' ? 'current' : 'all');
    });
  }

  window.PdfExport = {
    init,
    exportAll: () => exportPdf('all'),
    exportCurrent: () => exportPdf('current')
  };
})();
