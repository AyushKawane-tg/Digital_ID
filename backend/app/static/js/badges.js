/* =========================================================
   TeleGlobal - Badges
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* Badge image preview */
    const imageInput =
        document.querySelector(
            'input[name="image"]'
        );

    const imagePreview =
        document.querySelector(
            "#badgePreview"
        );

    if (imageInput && imagePreview) {

        imageInput.addEventListener("change", () => {

            const file =
                imageInput.files[0];

            if (!file) {
                return;
            }

            if (!file.type.startsWith("image/")) {
                alert(
                    "Please select a valid badge image."
                );

                imageInput.value = "";
                return;
            }

            imagePreview.src =
                URL.createObjectURL(file);

            imagePreview.style.display =
                "block";
        });
    }

    /* Delete badge */
    document.querySelectorAll(
        "[data-delete-badge]"
    ).forEach((button) => {

        button.addEventListener("click", async () => {

            const id =
                button.dataset.deleteBadge;

            if (!id) {
                return;
            }

            if (
                !confirm(
                    "Are you sure you want to delete this badge?"
                )
            ) {
                return;
            }

            try {

                const response =
                    await fetch(
                        `/admin/badges/${id}`,
                        {
                            method: "DELETE"
                        }
                    );

                if (!response.ok) {
                    throw new Error(
                        "Unable to delete badge."
                    );
                }

                window.location.reload();

            } catch (error) {
                alert(error.message);
            }
        });
    });
});


/* =========================================================
   Save Badge
   ========================================================= */

async function saveBadge(form, badgeId = null) {

    const formData =
        new FormData(form);

    const url = badgeId
        ? `/admin/badges/${badgeId}`
        : "/admin/badges";

    const method =
        badgeId ? "PUT" : "POST";

    try {

        const response =
            await fetch(url, {
                method,
                body: formData
            });

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail ||
                "Unable to save badge."
            );
        }

        window.location.href =
            "/admin/badges";

    } catch (error) {
        alert(error.message);
    }
}