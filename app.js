/* DetectNode landing page
   - EN is written inline in index.html and is the fallback for every key.
   - FR and SV are loaded lazily from lang/*.json.
   - The legal notice is a trial/quality warning: it never gates the download.
   - The footer Legal link opens a static legal dialog with publisher, hosting
     and privacy details.
   - The full licence text is separate, behind the footer License link, and is
     static English in index.html (not translated). */

(function () {
  'use strict';

  /* ------------------------------------------------------------------ Config */
  var STORE_KEY = 'detectnode.lang';
  var LEGAL_KEY = 'detectnode.legal';
  var TAGS = { en: 'EN', fr: 'FR', sv: 'SV' };
  var SUPPORTED = ['en', 'fr', 'sv'];

  var docEl = document.documentElement;
  var lang = document.getElementById('lang');
  var langBtn = document.getElementById('langBtn');
  var langCurrent = document.getElementById('langCurrent');
  var menuButtons = Array.prototype.slice.call(document.querySelectorAll('.lang-menu [data-lang]'));
  var nav = document.getElementById('nav');
  var menuBtn = document.getElementById('menuBtn');
  var contact = document.getElementById('contact');
  var contactBtn = document.getElementById('contactBtn');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a'));

  var i18nNodes = Array.prototype.slice.call(document.querySelectorAll('[data-i18n]'));
  var ariaNodes = Array.prototype.slice.call(document.querySelectorAll('[data-i18n-aria]'));
  var titleNodes = Array.prototype.slice.call(document.querySelectorAll('[data-i18n-title]'));

  var baseText = new Map();
  var baseAria = new Map();
  var baseTitle = new Map();
  i18nNodes.forEach(function (node) { baseText.set(node, node.textContent); });
  ariaNodes.forEach(function (node) { baseAria.set(node, node.getAttribute('aria-label') || ''); });
  titleNodes.forEach(function (node) { baseTitle.set(node, node.getAttribute('title') || ''); });

  var cache = { en: null };

  /* --------------------------------------------------------------- i18n core */
  function currentLang() {
    // A ?lang=fr / ?lang=sv link is shareable and overrides the saved choice.
    try {
      var requested = new URLSearchParams(window.location.search).get('lang');
      if (requested && SUPPORTED.indexOf(requested) !== -1) return requested;
    } catch (e) { /* URLSearchParams may be unavailable */ }

    try {
      var saved = localStorage.getItem(STORE_KEY);
      if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;
    } catch (e) { /* storage may be unavailable */ }
    return 'en';
  }

  function applyDictionary(dict) {
    i18nNodes.forEach(function (node) {
      var key = node.getAttribute('data-i18n');
      var value = dict && Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : null;
      node.textContent = value && value !== '' ? value : baseText.get(node);
    });

    ariaNodes.forEach(function (node) {
      var key = node.getAttribute('data-i18n-aria');
      var value = dict && Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : null;
      node.setAttribute('aria-label', value && value !== '' ? value : baseAria.get(node));
    });

    titleNodes.forEach(function (node) {
      var key = node.getAttribute('data-i18n-title');
      var value = dict && Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : null;
      node.setAttribute('title', value && value !== '' ? value : baseTitle.get(node));
    });

    if (dict) {
      if (dict['meta.title']) document.title = dict['meta.title'];
      var meta = document.querySelector('meta[name="description"]');
      if (meta && dict['meta.description']) meta.setAttribute('content', dict['meta.description']);
      var ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle && dict['meta.title']) ogTitle.setAttribute('content', dict['meta.title']);
      var ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc && dict['meta.description']) ogDesc.setAttribute('content', dict['meta.description']);
      if (langBtn && dict['lang.label']) {
        langBtn.setAttribute('title', dict['lang.label']);
        langBtn.setAttribute('aria-label', dict['lang.label']);
      }
      if (menuBtn && dict['nav.menu']) {
        menuBtn.setAttribute('aria-label', dict['nav.menu']);
        menuBtn.setAttribute('title', dict['nav.menu']);
      }
    }
  }

  function markActive(code) {
    if (langCurrent) langCurrent.textContent = TAGS[code] || 'EN';
    menuButtons.forEach(function (button) {
      button.setAttribute('aria-current', button.getAttribute('data-lang') === code ? 'true' : 'false');
    });
  }

  function fetchDict(code) {
    return fetch('lang/' + code + '.json', { cache: 'no-cache' }).then(function (response) {
      if (!response.ok) throw new Error('locale ' + code + ' ' + response.status);
      return response.json();
    });
  }

  function setLang(code, persist) {
    if (SUPPORTED.indexOf(code) === -1) code = 'en';
    docEl.lang = code;
    markActive(code);

    if (persist) {
      try { localStorage.setItem(STORE_KEY, code); } catch (e) { /* ignore */ }
      // Keep the shareable ?lang= parameter in sync with the chosen locale.
      try {
        var url = new URL(window.location.href);
        if (code === 'en') url.searchParams.delete('lang');
        else url.searchParams.set('lang', code);
        window.history.replaceState(null, '', url);
      } catch (e) { /* history may be unavailable */ }
    }

    if (cache[code]) {
      applyDictionary(cache[code]);
      return Promise.resolve();
    }

    return fetchDict(code).then(function (dict) {
      cache[code] = dict;
      applyDictionary(dict);
    }).catch(function () {
      // Keep the English inline text if the locale cannot be fetched.
      applyDictionary(cache[code] || null);
    });
  }

  /* ---------------------------------------------------------- Language menu */
  function closeLangMenu() {
    if (lang) lang.classList.remove('open');
    if (langBtn) langBtn.setAttribute('aria-expanded', 'false');
  }

  function toggleLangMenu() {
    if (!lang) return;
    var open = lang.classList.toggle('open');
    if (langBtn) langBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function closeContactMenu() {
    if (contact) contact.classList.remove('open');
    if (contactBtn) contactBtn.setAttribute('aria-expanded', 'false');
  }

  function toggleContactMenu() {
    if (!contact) return;
    var open = contact.classList.toggle('open');
    if (contactBtn) contactBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  if (langBtn) {
    langBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      closeMobileMenu();
      closeContactMenu();
      toggleLangMenu();
    });
  }

  if (contactBtn) {
    contactBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      closeLangMenu();
      closeMobileMenu();
      toggleContactMenu();
    });
  }

  if (contact) {
    Array.prototype.forEach.call(contact.querySelectorAll('.contact-menu a'), function (link) {
      link.addEventListener('click', closeContactMenu);
    });
  }

  menuButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      setLang(button.getAttribute('data-lang'), true);
      closeLangMenu();
    });
  });

  /* ------------------------------------------------------------ Mobile menu */
  function closeMobileMenu() {
    if (!nav) return;
    nav.classList.remove('open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      closeLangMenu();
      closeContactMenu();
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    navLinks.forEach(function (link) {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  document.addEventListener('click', function (event) {
    if (lang && !lang.contains(event.target)) closeLangMenu();
    if (contact && !contact.contains(event.target)) closeContactMenu();
    if (nav && menuBtn && nav.classList.contains('open') &&
        !nav.contains(event.target) && !menuBtn.contains(event.target)) {
      closeMobileMenu();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeLangMenu();
      closeContactMenu();
      closeMobileMenu();
    }
  });

  /* --------------------------------------------------------- Active nav link */
  var sectionLinks = new Map();
  navLinks.forEach(function (link) {
    var id = link.getAttribute('href').replace('#', '');
    var section = document.getElementById(id);
    if (section) sectionLinks.set(section, link);
  });
  var navSections = Array.from(sectionLinks.keys());

  var navTicking = false;
  function updateActiveNav() {
    navTicking = false;
    var offset = window.scrollY + 120;
    var current = null;
    navSections.forEach(function (section) {
      if (section.offsetTop <= offset) current = section;
    });
    navLinks.forEach(function (link) {
      link.classList.toggle('active', current !== null && sectionLinks.get(current) === link);
    });
  }
  function requestNavUpdate() {
    if (navTicking) return;
    navTicking = true;
    window.requestAnimationFrame(updateActiveNav);
  }
  window.addEventListener('scroll', requestNavUpdate, { passive: true });
  window.addEventListener('resize', requestNavUpdate);
  updateActiveNav();

  /* ---------------------------------------------------------- Legal notice */
  var legalNotice = document.getElementById('legalNotice');
  var legalDismiss = document.getElementById('legalDismiss');
  var legalAccept = document.getElementById('legalAccept');
  var footerLegal = document.getElementById('footerLegal');
  var footerLicense = document.getElementById('footerLicense');
  var licenseDialog = document.getElementById('licenseDialog');
  var licenseClose = document.getElementById('licenseClose');
  var licenseDone = document.getElementById('licenseDone');
  var legalDialog = document.getElementById('legalDialog');
  var legalDialogClose = document.getElementById('legalDialogClose');
  var legalDialogDone = document.getElementById('legalDialogDone');

  function legalAccepted() {
    try { return localStorage.getItem(LEGAL_KEY) === 'accepted'; } catch (e) { return false; }
  }

  function acceptLegal() {
    try { localStorage.setItem(LEGAL_KEY, 'accepted'); } catch (e) { /* ignore */ }
    if (legalNotice) legalNotice.hidden = true;
  }

  function openLegalDialog() {
    if (!legalDialog) return;
    if (typeof legalDialog.showModal === 'function') {
      if (!legalDialog.open) legalDialog.showModal();
    } else {
      legalDialog.setAttribute('open', '');
    }
  }

  function closeLegalDialog() {
    if (!legalDialog) return;
    if (typeof legalDialog.close === 'function') legalDialog.close();
    else legalDialog.removeAttribute('open');
  }

  function openLicense() {
    if (!licenseDialog) return;
    if (typeof licenseDialog.showModal === 'function') {
      if (!licenseDialog.open) licenseDialog.showModal();
    } else {
      licenseDialog.setAttribute('open', '');
    }
  }

  function closeLicense() {
    if (!licenseDialog) return;
    if (typeof licenseDialog.close === 'function') licenseDialog.close();
    else licenseDialog.removeAttribute('open');
  }

  if (legalAccepted() && legalNotice) legalNotice.hidden = true;

  if (legalDismiss) legalDismiss.addEventListener('click', acceptLegal);
  if (legalAccept) legalAccept.addEventListener('click', acceptLegal);
  if (footerLegal) footerLegal.addEventListener('click', openLegalDialog);
  if (footerLicense) footerLicense.addEventListener('click', openLicense);
  if (legalDialogClose) legalDialogClose.addEventListener('click', closeLegalDialog);
  if (legalDialogDone) legalDialogDone.addEventListener('click', closeLegalDialog);
  if (legalDialog) {
    legalDialog.addEventListener('click', function (event) {
      if (event.target === legalDialog) closeLegalDialog();
    });
  }
  if (licenseClose) licenseClose.addEventListener('click', closeLicense);
  if (licenseDone) licenseDone.addEventListener('click', closeLicense);
  if (licenseDialog) {
    licenseDialog.addEventListener('click', function (event) {
      if (event.target === licenseDialog) closeLicense();
    });
  }

  /* ----------------------------------------------------------------- Start */
  setLang(currentLang(), false);
})();
