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

  // Inquiry form -> WhatsApp
  var form = document.getElementById('inquiry-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('f-name').value.trim();
      var company = document.getElementById('f-company').value.trim();
      var email = document.getElementById('f-email').value.trim();
      var interest = document.getElementById('f-interest').value;
      var msg = document.getElementById('f-msg').value.trim();
      var text =
        'Hello HerbChina Extracts,\n\n' +
        'Name: ' + name + '\n' +
        (company ? 'Company: ' + company + '\n' : '') +
        'Email: ' + email + '\n' +
        'Interest: ' + interest + '\n\n' +
        'Inquiry:\n' + msg;
      window.open('https://wa.me/8613572927148?text=' + encodeURIComponent(text), '_blank');
    });
  }
})();
