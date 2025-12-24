$(document).ready(() => {
    const upi = "8346051322@yesg";
    const name = "JAVED IQBAL";
    const totalImages = 15;
    const bgImages = Array.from(
        { length: totalImages },
        (_, i) => `bg${i + 1}.png`
    );

    let currentIdx = -1;

    const qr = new QRCodeStyling({
        width: 280,
        height: 280,
        type: "svg",
        data: `upi://pay?pa=${upi}&pn=${name}`,
        dotsOptions: { color: "#000000", type: "dots" },
        cornersSquareOptions: { type: "extra-rounded", color: "#000000" },
        cornersDotOptions: { type: "dot", color: "#000000" },
        backgroundOptions: { color: "#ffffff" }
    });

    qr.append(document.getElementById("qr"));

    const openModal = () =>
        $("#modal").fadeIn(200).css("display", "flex").addClass("active");

    const closeModal = () =>
        $("#modal").fadeOut(200, () => $("#modal").removeClass("active"));

    const changeBg = () => {
        let newIdx;
        do {
            newIdx = Math.floor(Math.random() * bgImages.length);
        } while (newIdx === currentIdx && bgImages.length > 1);

        currentIdx = newIdx;
        const newBg = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url('images/${bgImages[currentIdx]}') center/cover no-repeat`;
        $("#capture-area, #modal").css("background", newBg);
    };

    const updateQR = () => {
        const amt = $("#amount").val();
        const note = $("#note").val();
        qr.update({
            data: `upi://pay?pa=${upi}&pn=${name}${amt ? "&am=" + amt : ""}${
                note ? "&tn=" + note : ""
            }`
        });
        closeModal();
    };

    const shareAsImage = async () => {
        const element = document.getElementById("capture-area");
        try {
            const canvas = await html2canvas(element, {
                useCORS: true,
                scale: 3,
                backgroundColor: null,
                width: window.innerWidth,
                height: window.innerHeight
            });

            canvas.toBlob(async blob => {
                const file = new File([blob], "payment-qr.png", {
                    type: "image/png"
                });
                if (
                    navigator.canShare &&
                    navigator.canShare({ files: [file] })
                ) {
                    await navigator.share({
                        files: [file],
                        title: "UPI Payment QR"
                    });
                } else {
                    const link = document.createElement("a");
                    link.download = "payment-qr.png";
                    link.href = canvas.toDataURL();
                    link.click();
                }
            });
        } catch (error) {
            console.error(error);
        }
    };

    changeBg();

    $("#btn-modal").on("click", openModal);
    $("#btn-close").on("click", closeModal);
    $("#btn-apply").on("click", updateQR);
    $("#btn-bg").on("click", changeBg);
    $("#btn-share").on("click", shareAsImage);

    $("#modal").on("click", e => {
        if (e.target.id === "modal") closeModal();
    });

    $(".modal-content").on("click", e => e.stopPropagation());

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker
            .register("./sw.js")
            .catch(err => console.log(err));
    }

    let deferredPrompt;
    window.addEventListener("beforeinstallprompt", e => {
        e.preventDefault();
        deferredPrompt = e;
        $("#install").show();
    });

    $("#install").on("click", () => {
        $("#install").hide();
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(() => {
            deferredPrompt = null;
        });
    });
});
