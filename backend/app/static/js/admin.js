/* =========================================================
   TeleGlobal - Authentication
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const passwordInput = document.querySelector("#password");
    const togglePassword = document.querySelector("#togglePassword");
    const loginForm = document.querySelector("#loginForm");

    /* Password visibility */
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", () => {
            const isPassword = passwordInput.type === "password";

            passwordInput.type = isPassword ? "text" : "password";
            togglePassword.textContent = isPassword ? "Hide" : "Show";
        });
    }

    /* Login validation */
    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            const email = loginForm.querySelector(
                'input[name="email"]'
            );

            if (!email || !passwordInput) {
                return;
            }

            if (!email.value.trim() || !passwordInput.value.trim()) {
                event.preventDefault();

                showAuthMessage(
                    "Please enter your email and password."
                );
            }
        });
    }
});

function showAuthMessage(message) {
    let errorBox = document.querySelector(".auth-error");

    if (!errorBox) {
        errorBox = document.createElement("div");
        errorBox.className = "auth-error";

        const form = document.querySelector(".auth-form");

        if (form) {
            form.prepend(errorBox);
        }
    }

    errorBox.textContent = message;
}