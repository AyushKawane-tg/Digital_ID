/* =========================================================
   TeleGlobal - Employee
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* Profile picture preview */
    const photoInput = document.querySelector(
        'input[name="picture"]'
    );

    const photoPreview = document.querySelector(
        "#photoPreview"
    );

    if (photoInput && photoPreview) {
        photoInput.addEventListener("change", () => {
            const file = photoInput.files[0];

            if (!file) {
                return;
            }

            if (!file.type.startsWith("image/")) {
                alert("Please select a valid image file.");
                photoInput.value = "";
                return;
            }

            photoPreview.src = URL.createObjectURL(file);
        });
    }

    /* Phone number validation */
    document.querySelectorAll(
        'input[name="contact_number"], input[name="emergency_contact"]'
    ).forEach((input) => {
        input.addEventListener("input", () => {
            input.value = input.value.replace(/[^\d+\-\s()]/g, "");
        });
    });

    /* LinkedIn URL validation */
    const linkedinInput = document.querySelector(
        'input[name="linkedin_url"]'
    );

    if (linkedinInput) {
        linkedinInput.addEventListener("blur", () => {
            if (
                linkedinInput.value &&
                !linkedinInput.value.startsWith("http")
            ) {
                linkedinInput.value =
                    "https://" + linkedinInput.value;
            }
        });
    }
});


/* =========================================================
   Update Employee Profile
   ========================================================= */

async function updateEmployeeProfile(form) {

    const message =
        document.querySelector("#message");

    try {

        const formData = new FormData(form);

        const response = await fetch(
            "/api/employee/profile",
            {
                method: "PUT",
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail ||
                "Unable to update employee profile."
            );
        }

        if (message) {
            message.className = "message success";
            message.textContent =
                "Profile updated successfully.";
            message.style.display = "block";
        }

        setTimeout(() => {
            window.location.href =
                "/employee/profile";
        }, 900);

    } catch (error) {

        if (message) {
            message.className = "message error";
            message.textContent = error.message;
            message.style.display = "block";
        } else {
            alert(error.message);
        }
    }
}