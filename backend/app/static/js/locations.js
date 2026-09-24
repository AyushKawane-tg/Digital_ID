/* =========================================================
   TeleGlobal - Locations
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* Search locations */
    const search =
        document.querySelector("#locationSearch");

    const cards =
        document.querySelectorAll(".location-card");

    if (search && cards.length) {

        search.addEventListener("input", () => {

            const query =
                search.value.toLowerCase().trim();

            cards.forEach((card) => {

                const text =
                    card.textContent.toLowerCase();

                card.style.display =
                    text.includes(query)
                        ? ""
                        : "none";
            });
        });
    }

    /* Delete location */
    document.querySelectorAll(
        "[data-delete-location]"
    ).forEach((button) => {

        button.addEventListener("click", async () => {

            const id =
                button.dataset.deleteLocation;

            if (!id) {
                return;
            }

            if (
                !confirm(
                    "Are you sure you want to delete this location?"
                )
            ) {
                return;
            }

            try {

                const response =
                    await fetch(
                        `/admin/locations/${id}`,
                        {
                            method: "DELETE"
                        }
                    );

                if (!response.ok) {
                    throw new Error(
                        "Unable to delete location."
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
   Location Form
   ========================================================= */

async function saveLocation(form, locationId = null) {

    const formData =
        new FormData(form);

    const url = locationId
        ? `/admin/locations/${locationId}`
        : "/admin/locations";

    const method =
        locationId ? "PUT" : "POST";

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
                "Unable to save location."
            );
        }

        window.location.href =
            "/admin/locations";

    } catch (error) {
        alert(error.message);
    }
}