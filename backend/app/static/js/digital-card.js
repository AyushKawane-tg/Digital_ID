/* =========================================================
   TeleGlobal - Digital Card
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* Open card */
    const openCard =
        document.querySelector(
            "[data-open-card]"
        );

    if (openCard) {

        openCard.addEventListener(
            "click",
            () => {

                const url =
                    openCard.dataset.openCard;

                if (url) {
                    window.open(
                        url,
                        "_blank",
                        "noopener,noreferrer"
                    );
                }
            }
        );
    }

    /* Copy digital card URL */
    const copyButton =
        document.querySelector(
            "[data-copy-card]"
        );

    const cardUrl =
        document.querySelector(
            "[data-card-url]"
        );

    if (copyButton && cardUrl) {

        copyButton.addEventListener(
            "click",
            async () => {

                try {

                    await navigator.clipboard.writeText(
                        cardUrl.value ||
                        cardUrl.textContent
                    );

                    const original =
                        copyButton.textContent;

                    copyButton.textContent =
                        "Copied!";

                    setTimeout(() => {
                        copyButton.textContent =
                            original;
                    }, 1500);

                } catch {
                    alert(
                        "Unable to copy card URL."
                    );
                }
            }
        );
    }

    /* QR image click */
    const qr =
        document.querySelector(
            ".digital-card-qr"
        );

    if (qr) {

        qr.addEventListener(
            "click",
            () => {

                const src =
                    qr.getAttribute("src");

                if (src) {
                    window.open(
                        src,
                        "_blank",
                        "noopener,noreferrer"
                    );
                }
            }
        );
    }
});


/* =========================================================
   Share Digital Card
   ========================================================= */

async function shareDigitalCard(
    cardUrl,
    employeeName = "Digital Card"
) {

    if (!cardUrl) {
        return;
    }

    if (
        navigator.share &&
        window.isSecureContext
    ) {

        try {

            await navigator.share({
                title: employeeName,
                text:
                    `View ${employeeName}'s digital card`,
                url: cardUrl
            });

            return;

        } catch (error) {

            if (
                error &&
                error.name === "AbortError"
            ) {
                return;
            }
        }
    }

    try {

        await navigator.clipboard.writeText(
            cardUrl
        );

        alert(
            "Digital card URL copied."
        );

    } catch {

        alert(
            `Digital Card: ${cardUrl}`
        );
    }
}


/* =========================================================
   Print Digital Card
   ========================================================= */

function printDigitalCard() {
    window.print();
}