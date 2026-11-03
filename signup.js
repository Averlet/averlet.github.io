"use strict";

// Apps Script web app URL ending in /exec. Leave empty until it's deployed.
const SIGNUP_ENDPOINT = "https://script.google.com/macros/s/AKfycbzJ2CHnpEkK45hOgelNDtX5ZyThul_C95XOa7hBoDkXMdWB_jTG1unXEnz6qajFvz0g/exec";

const form = document.querySelector("#signup");
const signupStatus = document.querySelector("#signup-status");
const button = form.querySelector("button");

// Never claim an address was saved before the signup service confirms it.
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!SIGNUP_ENDPOINT) {
    signupStatus.textContent = "Email signup isn’t available yet. Please check back soon.";
    return;
  }

  button.disabled = true;
  signupStatus.textContent = "Saving…";

  try {
    // URLSearchParams keeps this a simple CORS request: no preflight, and
    // Apps Script's redirected response stays readable.
    const response = await fetch(SIGNUP_ENDPOINT, {
      method: "POST",
      body: signupData(),
    });
    const result = await response.json();

    signupStatus.textContent = result.message || "Couldn’t save your email. Please try again.";
    if (result.ok) {
      form.reset();
    }
  } catch {
    signupStatus.textContent = "Couldn’t save your email. Please try again.";
  } finally {
    button.disabled = false;
  }
});

// Context the browser already knows, collected without any permission prompt.
function signupData() {
  const data = new URLSearchParams(new FormData(form));
  const page = new URLSearchParams(location.search);

  data.set("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone || "");
  data.set("language", navigator.language || "");
  data.set("referrer", document.referrer);
  for (const key of ["utm_source", "utm_medium", "utm_campaign"]) {
    data.set(key, page.get(key) || "");
  }
  return data;
}

button.disabled = false;
