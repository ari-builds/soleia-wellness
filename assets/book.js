/* Soleia Wellness - interactive booking.
   Client-side: service -> calendar -> slot -> details -> saved request.
   No backend yet; requests persist in localStorage and can be exported as .ics. */
(function () {
  "use strict";

  var SERVICES = [
    "Red Light Therapy",
    "Infrared Sauna",
    "Cold Plunge",
    "IV Hydration",
    "Oxygen Bar",
    "Massage Therapy",
    "Not sure yet",
  ];

  var SLOT_TIMES = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM",
    "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM",
  ];

  var MONTHS = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
  var DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  var state = {
    service: null,
    month: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    day: null,
    time: null,
  };

  var shell = document.getElementById("bookShell");
  if (!shell) return;

  var $ = function (id) { return document.getElementById(id); };
  var chipsEl = $("chipsServices");
  var calGrid = $("calGrid");
  var calMonth = $("calMonth");
  var slotsEl = $("slots");

  function fmtLong(d) {
    return " " + MONTHS[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
  }

  function save() {
    if (!state.service || !state.day || !state.time) return;
    var name = ($("fName") && $("fName").value.trim()) || "Guest";
    var phone = ($("fPhone") && $("fPhone").value.trim()) || "Not provided";
    var req = {
      service: state.service,
      date: fmtLong(state.day).trim(),
      time: state.time,
      name: name,
      phone: phone,
      notes: ($("fNotes") && $("fNotes").value.trim()) || "",
      ts: new Date().toISOString(),
    };
    var all = [];
    try { all = JSON.parse(localStorage.getItem("soleia-requests") || "[]"); } catch (e) {}
    all.push(req);
    localStorage.setItem("soleia-requests", JSON.stringify(all));
    $("sService").textContent = req.service;
    $("sDate").textContent = req.date;
    $("sTime").textContent = req.time;
    $("sName").textContent = req.name;
    $("sPhone").textContent = req.phone;
    window.__soleiaReq = req;
  }

  /* ---- step navigation ---- */
  function show(stepId) {
    ["stepServices", "stepCalendar", "stepDetails", "stepDone"].forEach(function (s) {
      $(s).hidden = s !== stepId;
    });
    $("bookShell").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---- services ---- */
  function renderServices() {
    chipsEl.innerHTML = "";
    SERVICES.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (state.service === s ? " on" : "");
      b.textContent = s;
      b.addEventListener("click", function () {
        state.service = s;
        renderServices();
        $("sumEmpty").hidden = true;
        $("sumFilled").hidden = false;
        $("sService").textContent = s;
        var d = state.day || new Date();
        if (d.getTime() < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime()) {
          state.day = null;
          state.month = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        }
        renderCalendar();
        show("stepCalendar");
      });
      chipsEl.appendChild(b);
    });
  }

  /* ---- calendar ---- */
  function renderCalendar() {
    var y = state.month.getFullYear();
    var m = state.month.getMonth();
    calMonth.textContent = MONTHS[m] + " " + y;
    calGrid.innerHTML = "";
    DOW.forEach(function (d) {
      var s = document.createElement("span");
      s.className = "dow";
      s.textContent = d;
      calGrid.appendChild(s);
    });
    var first = new Date(y, m, 1).getDay();
    var days = new Date(y, m + 1, 0).getDate();
    var today = new Date();
    var todayKey = today.getFullYear() + "-" + today.getMonth() + "-" + today.getDate();
    var now = today.getTime();

    for (var i = 0; i < first; i++) {
      var blank = document.createElement("span");
      blank.className = "blank";
      calGrid.appendChild(blank);
    }
    for (var d = 1; d <= days; d++) {
      var cell = document.createElement("button");
      cell.type = "button";
      cell.className = "day";
      cell.textContent = d;
      var key = y + "-" + m + "-" + d;
      var dateObj = new Date(y, m, d);
      var datestr = fmtLong(dateObj).trim();
      if (dateObj.getTime() < now) cell.classList.add("off");
      if (key === todayKey) cell.classList.add("today");
      if (state.day && fmtLong(state.day).trim() === datestr) cell.classList.add("on");
      cell.addEventListener("click", function () {
        if (this.classList.contains("off")) return;
        var dd = parseInt(this.textContent, 10);
        state.day = new Date(y, m, dd);
        $("sDate").textContent = fmtLong(state.day).trim();
        renderCalendar();
        renderSlots();
      });
      calGrid.appendChild(cell);
    }
    $("calPrev").disabled = state.month <= new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  }

  function renderSlots() {
    slotsEl.innerHTML = "";
    if (!state.day) return;
    SLOT_TIMES.forEach(function (t, idx) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "slot" + (state.time === t ? " on" : "");
      b.textContent = t;
      b.addEventListener("click", function () {
        state.time = t;
        renderSlots();
        $("sTime").textContent = t;
        show("stepDetails");
      });
      slotsEl.appendChild(b);
    });
  }

  /* ---- nav ---- */
  $("calPrev").addEventListener("click", function () {
    state.month = new Date(state.month.getFullYear(), state.month.getMonth() - 1, 1);
    renderCalendar();
  });
  $("calNext").addEventListener("click", function () {
    state.month = new Date(state.month.getFullYear(), state.month.getMonth() + 1, 1);
    renderCalendar();
  });

  /* ---- details form ---- */
  $("bookForm").addEventListener("submit", function (e) {
    e.preventDefault();
    save();
    show("stepDone");
  });

  /* ---- done actions ---- */
  $("bookAgain").addEventListener("click", function () {
    state.service = null;
    state.day = null;
    state.time = null;
    $("bookForm").reset();
    $("sumEmpty").hidden = false;
    $("sumFilled").hidden = true;
    renderServices();
    renderCalendar();
    show("stepServices");
  });

  $("dlIcs").addEventListener("click", function () {
    var r = window.__soleiaReq;
    if (!r) return;
    var parts = r.date.replace(",", "").split(" ");
    var mon = MONTHS.indexOf(parts[0]);
    var day = parseInt(parts[1], 10);
    var year = parseInt(parts[2], 10);
    var hm = r.time.replace(/AM|PM/, "").split(":");
    var h = parseInt(hm[0], 10);
    if (/PM/.test(r.time) && h < 12) h += 12;
    if (/AM/.test(r.time) && h === 12) h = 0;
    var start = new Date(year, mon, day, h, 0);
    var end = new Date(start.getTime() + 60 * 60 * 1000);
    function fmt(d) {
      return d.toISOString().replace(/[-:]|\.\d{3}/g, "");
    }
    var summary = "Soleia Wellness - " + r.service;
    var desc = r.service + " at Soleia Wellness.\nRequested by " + r.name + " (" + r.phone + ").\nBookings opening soon; we will confirm this time.";
    var ics =
      "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Soleia//Booker//EN\nBEGIN:VEVENT\n" +
      "UID:" + Date.now() + "@soleia\nDTSTAMP:" + fmt(new Date()) + "\n" +
      "DTSTART:" + fmt(start) + "\nDTEND:" + fmt(end) + "\n" +
      "SUMMARY:" + summary.replace(/\n/g, "\\n") + "\n" +
      "DESCRIPTION:" + desc.replace(/\n/g, "\\n") + "\nEND:VEVENT\nEND:VCALENDAR\n";
    var blob = new Blob([ics], { type: "text/calendar" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "soleia-booking.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  });

  /* ---- toast ---- */
  var toastTimer = null;
  function toast() {
    var t = $("toast");
    t.hidden = false;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      t.classList.remove("show");
      setTimeout(function () { t.hidden = true; }, 300);
    }, 2200);
  }
  $("dlIcs").addEventListener("click", function () { toast(); });

  /* ---- boot ---- */
  renderServices();
  renderCalendar();

  var topbar = $("topbar");
  function onScroll() {
    topbar.classList.toggle("scrolled", window.scrollY > 10);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".fade").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".fade").forEach(function (el) { el.classList.add("in"); });
  }
})();