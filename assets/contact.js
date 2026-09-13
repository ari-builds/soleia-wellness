/* Soleia Wellness - contact message form.
   Client-side only; messages persist in localStorage and are answered manually. */
(function () {
  "use strict";

  var form = document.getElementById("msgForm");
  var done = document.getElementById("msgDone");
  if (!form || !done) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = (document.getElementById("mName").value || "").trim();
    var phone = (document.getElementById("mPhone").value || "").trim();
    var body = (document.getElementById("mBody").value || "").trim();
    if (!name || !phone || !body) return;

    var all = [];
    try { all = JSON.parse(localStorage.getItem("soleia-messages") || "[]"); } catch (err) {}
    all.push({ name: name, phone: phone, body: body, ts: new Date().toISOString() });
    localStorage.setItem("soleia-messages", JSON.stringify(all));

    form.hidden = true;
    done.hidden = false;
  });
})();