/* =========================================================
   TeleGlobal - Employee Excel Import
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const fileInput =
        document.querySelector("#employeeFile");

    const uploadForm =
        document.querySelector("#importForm");

    const fileName =
        document.querySelector("#fileName");

    const uploadZone =
        document.querySelector("#uploadZone");

    /* File selection */
    if (fileInput) {

        fileInput.addEventListener("change", () => {

            const file =
                fileInput.files[0];

            if (!file) {
                return;
            }

            if (
                !file.name.endsWith(".xlsx") &&
                !file.name.endsWith(".xls")
            ) {
                alert(
                    "Please select an Excel file."
                );

                fileInput.value = "";
                return;
            }

            if (fileName) {
                fileName.textContent =
                    file.name;
            }
        });
    }

    /* Drag & Drop */
    if (uploadZone && fileInput) {

        uploadZone.addEventListener(
            "dragover",
            (event) => {
                event.preventDefault();
                uploadZone.classList.add("dragover");
            }
        );

        uploadZone.addEventListener(
            "dragleave",
            () => {
                uploadZone.classList.remove(
                    "dragover"
                );
            }
        );

        uploadZone.addEventListener(
            "drop",
            (event) => {

                event.preventDefault();

                uploadZone.classList.remove(
                    "dragover"
                );

                const files =
                    event.dataTransfer.files;

                if (files.length) {
                    fileInput.files = files;

                    if (fileName) {
                        fileName.textContent =
                            files[0].name;
                    }
                }
            }
        );
    }

    /* Submit import */
    if (uploadForm) {

        uploadForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();

                if (
                    !fileInput ||
                    !fileInput.files.length
                ) {
                    alert(
                        "Please select an Excel file."
                    );
                    return;
                }

                await importEmployees(
                    uploadForm
                );
            }
        );
    }
});


/* =========================================================
   Import Employees
   ========================================================= */

async function importEmployees(form) {

    const formData =
        new FormData(form);

    const button =
        form.querySelector(
            'button[type="submit"]'
        );

    const originalText =
        button ? button.textContent : "";

    try {

        if (button) {
            button.disabled = true;
            button.textContent =
                "Importing...";
        }

        const response =
            await fetch(
                "/api/admin/import/employees",
                {
                    method: "POST",
                    body: formData
                }
            );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail ||
                "Employee import failed."
            );
        }

        showImportResult(data);

    } catch (error) {

        showImportError(
            error.message
        );

    } finally {

        if (button) {
            button.disabled = false;
            button.textContent =
                originalText;
        }
    }
}


/* =========================================================
   Import Result
   ========================================================= */

function showImportResult(data) {

    const result =
        document.querySelector(
            "#importResult"
        );

    if (!result) {
        alert(
            data.message ||
            "Employee import completed."
        );
        return;
    }

    result.style.display = "block";

    result.innerHTML = `
        <div class="import-summary">
            <div class="import-summary-item">
                <div class="import-summary-label">
                    Total Rows
                </div>
                <div class="import-summary-value">
                    ${data.total_rows ?? 0}
                </div>
            </div>

            <div class="import-summary-item">
                <div class="import-summary-label">
                    Successful
                </div>
                <div class="import-summary-value">
                    ${data.successful_rows ?? 0}
                </div>
            </div>

            <div class="import-summary-item">
                <div class="import-summary-label">
                    Failed
                </div>
                <div class="import-summary-value">
                    ${data.failed_rows ?? 0}
                </div>
            </div>
        </div>
    `;
}


function showImportError(message) {

    const result =
        document.querySelector(
            "#importResult"
        );

    if (!result) {
        alert(message);
        return;
    }

    result.style.display = "block";

    result.innerHTML = `
        <div class="import-errors">
            ${escapeHtml(message)}
        </div>
    `;
}


function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}