/* Vanity Furrr — interactions: mobile menu, scroll-spy, counters, tabs,
   accordion, compare slider, lightbox, booking form. No frameworks. */
(function () {
  "use strict";
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile menu (opens instantly — no transition) ---------- */
  var toggle = document.querySelector("[data-menu-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");
  function closeMenu() {
    if (!mobileMenu || !toggle) return;
    mobileMenu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }
  if (toggle && mobileMenu) {
    toggle.addEventListener("click", function () {
      var open = mobileMenu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ---------- Scroll-spy ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-nav-link]"));
  var spySections = ["grooming", "calm", "prices", "gallery", "reviews", "visit"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  if ("IntersectionObserver" in window && spySections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (link) {
          link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    spySections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Animated counters (verified numbers only) ---------- */
  var counters = document.querySelectorAll(".count");
  function setFinal(el) {
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var target = parseFloat(el.getAttribute("data-count"));
    el.textContent = target.toFixed(decimals);
  }
  function animateCount(el) {
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var target = parseFloat(el.getAttribute("data-count"));
    if (prefersReduced) { setFinal(el); return; }
    var start = null, dur = 800;
    // Fallback timer forces the verified final value even if rAF stalls
    // (e.g. headless/virtual-time captures) — a counter must never show a wrong number.
    setTimeout(function () { setFinal(el); }, dur + 100);
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(tick); else setFinal(el);
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window && counters.length) {
    var counterObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animateCount(entry.target); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { counterObs.observe(c); });
  } else {
    counters.forEach(setFinal);
  }

  /* ---------- Services tabs ---------- */
  var tabBtns = Array.prototype.slice.call(document.querySelectorAll(".tab-btn"));
  function activateTab(btn, focus) {
    tabBtns.forEach(function (b) {
      var active = b === btn;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", String(active));
      b.tabIndex = active ? 0 : -1;
      var panel = document.getElementById(b.getAttribute("data-tab"));
      if (panel) {
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
      }
    });
    if (focus) btn.focus();
  }
  tabBtns.forEach(function (btn, i) {
    btn.addEventListener("click", function () { activateTab(btn, false); });
    btn.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight") next = tabBtns[(i + 1) % tabBtns.length];
      if (e.key === "ArrowLeft") next = tabBtns[(i - 1 + tabBtns.length) % tabBtns.length];
      if (next) { e.preventDefault(); activateTab(next, true); }
    });
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".accordion-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      if (panel) panel.hidden = open;
    });
  });

  /* ---------- Compare slider ---------- */
  var range = document.getElementById("compare-range");
  var before = document.getElementById("compare-before");
  var handle = document.getElementById("compare-handle");
  function setCompare(val) {
    if (!before || !handle) return;
    before.style.width = val + "%";
    handle.style.left = val + "%";
  }
  if (range) {
    range.addEventListener("input", function () { setCompare(range.value); });
    setCompare(range.value);
  }
  if (handle && range) {
    handle.addEventListener("click", function () { range.focus(); });
  }

  /* ---------- Lightbox ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll(".gallery-item"));
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lightbox-img");
  var lbCaption = document.getElementById("lightbox-caption");
  var current = 0, lastFocus = null;
  function showLb(i) {
    current = (i + items.length) % items.length;
    var item = items[current];
    lbImg.src = item.getAttribute("data-full");
    lbImg.alt = item.getAttribute("data-alt") || "";
    lbCaption.textContent = item.getAttribute("data-alt") || "";
  }
  function openLb(i) {
    lastFocus = document.activeElement;
    showLb(i);
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    document.getElementById("lightbox-close").focus();
  }
  function closeLb() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (items.length && lightbox) {
    items.forEach(function (item, i) {
      item.addEventListener("click", function () { openLb(i); });
    });
    document.getElementById("lightbox-close").addEventListener("click", closeLb);
    document.getElementById("lightbox-prev").addEventListener("click", function () { showLb(current - 1); });
    document.getElementById("lightbox-next").addEventListener("click", function () { showLb(current + 1); });
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") showLb(current - 1);
      if (e.key === "ArrowRight") showLb(current + 1);
    });
  }

  /* ---------- Booking form: opens WhatsApp or email ---------- */
  var form = document.getElementById("booking-form");
  var sendVia = "whatsapp";
  if (form) {
    form.querySelectorAll("[data-send]").forEach(function (btn) {
      btn.addEventListener("click", function () { sendVia = btn.getAttribute("data-send"); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("f-name").value.trim();
      var pet = document.getElementById("f-pet").value.trim();
      var err = document.getElementById("form-error");
      if (!name || !pet) { err.hidden = false; return; }
      err.hidden = true;
      var type = document.getElementById("f-type").value;
      var service = document.getElementById("f-service").value;
      var day = document.getElementById("f-day").value;
      var notes = document.getElementById("f-notes").value.trim();
      var lines = [
        "Hi Vanity Furrr, I'd like to book a groom.",
        "Name: " + name,
        "Pet: " + pet + " (" + type + ")",
        "Service: " + service,
        "Preferred day: " + day
      ];
      if (notes) lines.push("Notes: " + notes);
      var text = lines.join("\n");
      if (sendVia === "email") {
        var subject = "Grooming booking request — " + pet + " (" + type + ")";
        window.location.href = "mailto:vanityfurrr@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
      } else {
        window.open("https://wa.me/447515703290?text=" + encodeURIComponent(text), "_blank", "noopener");
      }
    });
  }
})();
