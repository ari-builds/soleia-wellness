/* Soleia Wellness - shared header, menu, footer and mobile CTA.
   Injected from the page shell (#site-head / #site-foot). */
(function () {
  "use strict";

  var page = document.body.getAttribute("data-page") || "";
  var OPEN_MONTH = "December 2026";

  var services = [
    ["Red Light Therapy", "red-light-therapy.html"],
    ["Infrared Sauna", "infrared-sauna.html"],
    ["Cold Plunge", "cold-plunge.html"],
    ["IV Hydration", "iv-hydration.html"],
    ["Oxygen Bar & Hyperbaric", "oxygen-bar.html"],
    ["Massage Therapy", "massage.html"],
  ];

  function isActive(h) {
    if (h.indexOf("#") !== -1) return false;
    if (h === "index.html") return page === "index";
    return page === h.replace(".html", "");
  }

  function link(h, label, cls) {
    var a = document.createElement("a");
    a.href = h;
    a.textContent = label;
    if (cls) a.className = cls;
    if (isActive(h)) a.className = (a.className ? a.className + " " : "") + "on";
    return a;
  }

  function headHTML() {
    var s = services.map(function (sv) {
      return '<a href="' + sv[1] + '"><span>' + sv[0] + "</span></a>";
    }).join("");
    return (
      '<div class="announce">' +
        '<div class="inner">' +
          '<a href="pre-book.html">Opening in ' + OPEN_MONTH + " in North Carolina" +
          ' <b>Pre-book your spot today &rarr;</b></a>' +
        "</div>" +
      "</div>" +
      '<header class="top" id="topbar">' +
        '<div class="inner top-inner">' +
          '<a class="brand" href="index.html" aria-label="Soleia Wellness home">' +
            '<img class="logo-img" src="assets/logo.png" alt="Soleia Wellness">' +
          "</a>" +
          '<button class="burger" id="menuBtn" aria-label="Open menu" aria-controls="menu" aria-expanded="false">' +
            '<span></span><span></span><span></span>' +
          "</button>" +
        "</div>" +
      "</header>" +
      '<nav class="menu" id="menu" aria-hidden="true">' +
        '<div class="menu-inner">' +
          '<div class="menu-top">' +
            '<img class="logo-img" src="assets/logo.png" alt="Soleia Wellness">' +
            '<button class="menu-x" id="menuClose" aria-label="Close menu">&#10005;</button>' +
          "</div>" +
          '<div class="menu-groups">' +
            '<div class="mgroup">' +
              "<h4>Start here</h4>" +
              link("index.html", "Soleia Wellness") +
              link("pre-book.html", "Pre-book before grand opening") +
            "</div>" +
            '<div class="mgroup">' +
              "<h4>Services</h4>" + s +
            "</div>" +
            '<div class="mgroup">' +
              "<h4>Visit</h4>" +
              link("index.html#book", "Book a visit") +
              link("index.html#inside", "Inside Soleia") +
              link("index.html#faq", "FAQ") +
              link("about.html", "About") +
              link("contact.html", "Contact") +
            "</div>" +
          "</div>" +
          '<div class="menu-cta">' +
            '<a class="btn btn-cta" href="pre-book.html">Reserve your spot</a>' +
            '<p class="menu-note">Opening ' + OPEN_MONTH + " &middot; North Carolina</p>" +
          "</div>" +
        "</div>" +
      "</nav>"
    );
  }

  function footHTML() {
    var s = services.map(function (sv) {
      return '<a href="' + sv[1] + '">' + sv[0] + "</a>";
    }).join("");
    return (
      "<footer>" +
        '<div class="inner">' +
          '<div class="foot-grid">' +
            '<div class="foot-brand">' +
              '<img class="logo-img" src="assets/logo.png" alt="Soleia Wellness">' +
              "<p>Recover. Restore. Renew.<br>" +
              '<span class="foot-loc"><b>Where:</b> North Carolina</span> ' +
              '<span class="foot-loc"><b>Opens:</b> ' + OPEN_MONTH + "</span></p>" +
            "</div>" +
            "<div>" +
              "<h4>Services</h4>" +
              '<div class="links">' + s + "</div>" +
            "</div>" +
            "<div>" +
              "<h4>Visit</h4>" +
              '<div class="links">' +
                '<a href="pre-book.html">Pre-book your spot</a>' +
                '<a href="index.html#book">Book a visit</a>' +
                '<a href="index.html#inside">Inside Soleia</a>' +
                '<a href="about.html">About</a>' +
                '<a href="contact.html">Contact</a>' +
              "</div>" +
            "</div>" +
          "</div>" +
          '<p class="copy">&copy; <span id="year"></span> Soleia Wellness &middot; North Carolina &middot; Recover. Restore. Renew.</p>' +
        "</div>" +
      "</footer>"
    );
  }

  function mount() {
    var head = document.getElementById("site-head");
    var foot = document.getElementById("site-foot");
    if (head) head.innerHTML = headHTML();
    if (foot) foot.innerHTML = footHTML();
    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function menuLogic() {
    var menu = document.getElementById("menu");
    var btn = document.getElementById("menuBtn");
    if (!menu || !btn) return;
    function set(open) {
      menu.classList.toggle("open", open);
      menu.setAttribute("aria-hidden", String(!open));
      btn.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("menu-open", open);
    }
    btn.addEventListener("click", function () { set(!menu.classList.contains("open")); });
    var close = document.getElementById("menuClose");
    if (close) close.addEventListener("click", function () { set(false); });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { set(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") set(false);
    });
  }

  function scrollShadow() {
    var topbar = document.getElementById("topbar");
    if (!topbar) return;
    function onScroll() {
      topbar.classList.toggle("scrolled", window.scrollY > 10);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function mobileCta() {
    var slot = document.getElementById("site-cta");
    if (!slot) return;
    var bar = document.createElement("a");
    bar.className = "cta-bar";
    bar.href = "pre-book.html";
    bar.setAttribute("aria-label", "Pre-book your spot");
    bar.innerHTML = "Reserve your spot before our grand opening <b>&rarr;</b>";
    slot.appendChild(bar);
    var shown = false;
    function maybe() {
      if (window.scrollY > 220 && !shown) {
        shown = true;
        bar.classList.add("in");
      }
    }
    window.addEventListener("scroll", maybe, { passive: true });
    setTimeout(maybe, 2600);
  }

  mount();
  menuLogic();
  scrollShadow();
  mobileCta();
})();