/* Soleia Wellness - pre-booking form.
   Client-side only for now; requests persist in localStorage (same store as book.js)
   and are confirmed manually when real booking opens. */
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

  var chipsEl = document.getElementById("preChips");
  var form = document.getElementById("preForm");
  var stepForm = document.getElementById("preStepForm");
  var stepDone = document.getElementById("preStepDone");
  if (!chipsEl || !form) return;

  var picked = {};

  function renderChips() {
    chipsEl.innerHTML = "";
    SERVICES.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (picked[s] ? " on" : "");
      b.textContent = s;
      b.addEventListener("click", function () {
        picked[s] = !picked[s];
        renderChips();
      });
      chipsEl.appendChild(b);
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = (document.getElementById("pName").value || "").trim();
    var phone = (document.getElementById("pPhone").value || "").trim();
    var notes = (document.getElementById("pNotes").value || "").trim();
    if (!name || !phone) return;

    var chosen = SERVICES.filter(function (s) { return picked[s]; });
    var req = {
      service: chosen.length ? chosen.join(", ") : "Not sure yet",
      date: "Pre-book request",
      time: "To be scheduled",
      name: name,
      phone: phone,
      notes: notes,
      ts: new Date().toISOString(),
    };
    var all = [];
    try { all = JSON.parse(localStorage.getItem("soleia-requests") || "[]"); } catch (err) {}
    all.push(req);
    localStorage.setItem("soleia-requests", JSON.stringify(all));

    stepForm.hidden = true;
    stepDone.hidden = false;
  });

  renderChips();
})();