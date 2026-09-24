/* =========================================================
   TeleGlobal - Company
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* Company logo preview */
    const logoInput = document.querySelector(
        'input[name="logo"]'
    );

    const logoPreview = document.querySelector(
        "#logoPreview"
    );

    if (logoInput && logoPreview) {

        logoInput.addEventListener("change", () => {

            const file = logoInput.files[0];

            if (!file) {
                return;
            }

            if (!file.type.startsWith("image/")) {
                alert("Please select a valid image file.");
                logoInput.value = "";
                return;
            }

            logoPreview.src =
                URL.createObjectURL(file);
        });
    }

    /* Website normalization */
    document.querySelectorAll(
        'input[name="website"]'
    ).forEach((input) => {

        input.addEventListener("blur", () => {

            const value = input.value.trim();

            if (
                value &&
                !value.startsWith("http://") &&
                !value.startsWith("https://")
            ) {
                input.value = "https://" + value;
            }
        });
    });
});


/* =========================================================
   Save Company
   ========================================================= */

async function saveCompany(form) {

    const formData = new FormData(form);

    try {

        const response = await fetch(
            "/admin/company",
            {
                method: "PUT",
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail ||
                "Unable to update company information."
            );
        }

        showCompanyMessage(
            "Company information updated successfully.",
            "success"
        );

        setTimeout(() => {
            window.location.href =
                "/admin/company";
        }, 1000);

    } catch (error) {

        showCompanyMessage(
            error.message,
            "error"
        );
    }
}


/* =========================================================
   Message
   ========================================================= */

function showCompanyMessage(message, type) {

    let element =
        document.querySelector("#companyMessage");

    if (!element) {
        element = document.createElement("div");
        element.id = "companyMessage";

        const form =
            document.querySelector("form");

        if (form) {
            form.parentNode.insertBefore(
                element,
                form
            );
        }
    }

    element.className =
        `alert alert-${type === "success"
            ? "success"
            : "danger"}`;

    element.textContent = message;
}