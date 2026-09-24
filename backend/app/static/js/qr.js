/* =========================================================
   TeleGlobal - QR Code
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* -------------------------------------------------
           Copy Card URL
        ------------------------------------------------- */

        const copyButton =
            document.querySelector(
                "#copyCardUrl"
            );

        const cardUrl =
            document.querySelector(
                "#cardUrl"
            );


        if (
            copyButton &&
            cardUrl
        ) {

            copyButton.addEventListener(
                "click",
                async () => {

                    try {

                        await navigator.clipboard.writeText(
                            cardUrl.value ||
                            cardUrl.textContent
                        );

                        const originalText =
                            copyButton.textContent;

                        copyButton.textContent =
                            "Copied!";


                        setTimeout(
                            () => {

                                copyButton.textContent =
                                    originalText;

                            },
                            1500
                        );

                    } catch (error) {

                        /* Fallback for older browsers */

                        cardUrl.select();

                        document.execCommand(
                            "copy"
                        );

                        copyButton.textContent =
                            "Copied!";

                        setTimeout(
                            () => {

                                copyButton.textContent =
                                    "Copy URL";

                            },
                            1500
                        );
                    }
                }
            );
        }


        /* -------------------------------------------------
           Download QR
        ------------------------------------------------- */

        const downloadButton =
            document.querySelector(
                "#downloadQr"
            );


        if (downloadButton) {

            downloadButton.addEventListener(
                "click",
                () => {

                    const image =
                        document.querySelector(
                            ".qr-image"
                        );


                    if (!image) {
                        return;
                    }


                    const link =
                        document.createElement(
                            "a"
                        );


                    link.href =
                        image.src;

                    link.download =
                        "teleglobal-qr-code.png";


                    document.body.appendChild(
                        link
                    );

                    link.click();

                    link.remove();
                }
            );
        }

    }
);