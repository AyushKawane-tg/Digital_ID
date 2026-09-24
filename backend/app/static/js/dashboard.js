/* =========================================================
   TeleGlobal - Dashboard
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* Employee search */
    const searchInput = document.querySelector("#employeeSearch");
    const tableRows = document.querySelectorAll(
        "#employeeTable tbody tr"
    );

    if (searchInput && tableRows.length) {
        searchInput.addEventListener("input", () => {
            const query = searchInput.value
                .trim()
                .toLowerCase();

            tableRows.forEach((row) => {
                const text = row.textContent.toLowerCase();

                row.style.display =
                    text.includes(query) ? "" : "none";
            });
        });
    }

    /* Auto refresh dashboard if explicitly enabled */
    const refreshElement =
        document.querySelector("[data-dashboard-refresh]");

    if (refreshElement) {
        const interval = Number(
            refreshElement.dataset.dashboardRefresh
        );

        if (interval > 0) {
            setInterval(() => {
                window.location.reload();
            }, interval);
        }
    }
});