const form = document.getElementById("request-form");
const dateIn = document.getElementById("date-in");
const dateOut = document.getElementById("date-out");
const today = new Date().toISOString().split("T")[0];
dateIn.min = today;
dateOut.min = today;
dateIn.addEventListener("change", () => { dateOut.min = dateIn.value || today; });

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  let firstBad = null;
  form.querySelectorAll("input[required]").forEach((input) => {
    let ok = input.checkValidity() && input.value.trim() !== "";
    if (input === dateOut && ok && dateIn.value && dateOut.value < dateIn.value) ok = false;
    input.parentElement.classList.toggle("invalid", !ok);
    if (!ok && !firstBad) firstBad = input;
  });
  if (firstBad) { firstBad.focus(); return; }

  const pet = document.getElementById("pet-name").value.trim();
  document.getElementById("fs-subject").value = `Stay request for ${pet}: ${dateIn.value} to ${dateOut.value}`;

  const btn = document.getElementById("send-btn");
  const sendError = document.getElementById("send-error");
  btn.disabled = true;
  btn.textContent = "Sending…";
  sendError.textContent = "";

  try {
    const res = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.errors ? data.errors.map((err) => err.message).join(" ") : "");
    }
    document.getElementById("form-body").style.display = "none";
    document.getElementById("form-sent").style.display = "block";
  } catch (err) {
    sendError.textContent = "Your request didn’t send. Check your connection and press Send request again." +
      (err.message ? " (" + err.message + ")" : "");
    btn.disabled = false;
    btn.textContent = "Send request";
  }
});

form.addEventListener("input", (e) => {
  if (e.target.parentElement.classList.contains("invalid") && e.target.checkValidity()) {
    e.target.parentElement.classList.remove("invalid");
  }
});
