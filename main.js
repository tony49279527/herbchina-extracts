// HerbChina Extracts — site interactions
(function () {
  // Mobile nav
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') nav.classList.remove('open');
    });
  }

  // Scroll reveal
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // Footer year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Inquiry form -> POSTs to /api/inquire; falls back to copy-to-WeChat
  // if the backend is unreachable or not configured. Honest by design.
  var form = document.getElementById('inquiry-form');
  if (form) {
    // Prefill product from ?product= (product pages link here with it).
    try {
      var qp = new URLSearchParams(window.location.search).get('product');
      var pf = document.getElementById('f-product');
      if (qp && pf && !pf.value) pf.value = qp;
    } catch (e) {}
    var buildText = function () {
      var name = document.getElementById('f-name').value.trim();
      var company = document.getElementById('f-company').value.trim();
      var email = document.getElementById('f-email').value.trim();
      var country = document.getElementById('f-country').value.trim();
      var product = document.getElementById('f-product').value.trim();
      var interest = document.getElementById('f-interest').value;
      var msg = document.getElementById('f-msg').value.trim();
      return 'Hello HerbChina Extracts,\n\n' +
        'Name: ' + name + '\n' +
        (company ? 'Company: ' + company + '\n' : '') +
        'Email: ' + email + '\n' +
        (country ? 'Country: ' + country + '\n' : '') +
        (product ? 'Product: ' + product + '\n' : '') +
        'Interest: ' + interest + '\n\n' +
        'Inquiry:\n' + msg;
    };
    var showCopyFallback = function () {
      var ready = document.getElementById('inquiry-ready');
      var out = document.getElementById('inquiry-text');
      if (ready && out) {
        out.value = buildText();
        ready.hidden = false;
        ready.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = document.getElementById('inquiry-submit');
      var status = document.getElementById('inquiry-status');
      var payload = {
        name: document.getElementById('f-name').value.trim(),
        company: document.getElementById('f-company').value.trim(),
        email: document.getElementById('f-email').value.trim(),
        country: document.getElementById('f-country').value.trim(),
        product: document.getElementById('f-product').value.trim(),
        interest: document.getElementById('f-interest').value,
        message: document.getElementById('f-msg').value.trim(),
        website: document.getElementById('f-website').value
      };
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      fetch('/api/inquire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (r) { return r.json().then(function (d) { return { s: r.status, d: d }; }); })
      .then(function (rr) {
        if (rr.s === 200 && rr.d && rr.d.ok) {
          var ok = document.getElementById('inquiry-success');
          if (ok) { ok.hidden = false; ok.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
          if (status) { status.hidden = true; }
          try { if (typeof gtag === 'function') gtag('event', 'generate_lead', { method: 'inquiry_form' }); } catch (e2) {}
          form.reset();
        } else {
          if (status) { status.hidden = false; status.textContent = (rr.d && rr.d.error) || 'Send failed — please use WeChat below instead.'; }
          showCopyFallback();
        }
      })
      .catch(function () {
        if (status) { status.hidden = false; status.textContent = 'Could not reach our server — please copy your inquiry and send it via WeChat below.'; }
        showCopyFallback();
      })
      .then(function () {
        if (btn) { btn.disabled = false; btn.textContent = 'Send Inquiry'; }
      });
    });
    var copyBtn = document.getElementById('copy-inquiry');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var out = document.getElementById('inquiry-text');
        var done = function () {
          copyBtn.textContent = 'Copied \u2713';
          setTimeout(function () { copyBtn.textContent = 'Copy Text'; }, 2000);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(out.value).then(done, function () {
            out.select(); document.execCommand('copy'); done();
          });
        } else {
          out.select(); document.execCommand('copy'); done();
        }
      });
    }
  }
})();
