$(document).ready(() => {
    const totalImages = 25;

    let upi = localStorage.getItem("upi_id") || "";
    let name = localStorage.getItem("user_name") || "";
    let currentIdx = parseInt(localStorage.getItem("bg_index")) || 1;

    $(".user-name").text(name);
    $(".user-upi").text(upi);
    $("#input-name").val(name);
    $("#input-upi").val(upi);

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

    const setBg = index => {
        const newBg = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url('images/bg${index}.png') center/cover no-repeat`;
        $("#capture-area, #modal").css("background", newBg);
        localStorage.setItem("bg_index", index);
    };

    const nextBg = () => {
        currentIdx = (currentIdx % totalImages) + 1;
        setBg(currentIdx);
    };

    const updateData = () => {
        name = $("#input-name").val().trim() || "User";
        upi = $("#input-upi").val().trim();
        const amt = $("#amount").val();
        const note = $("#note").val();

        localStorage.setItem("user_name", name);
        localStorage.setItem("upi_id", upi);

        $(".user-name").text(name);
        $(".user-upi").text(upi);

        qr.update({
            data: `upi://pay?pa=${upi}&pn=${name}${amt ? "&am=" + amt : ""}${note ? "&tn=" + note : ""}`
        });
        $("#modal").fadeOut(200);
    };

    const shareAsImage = async () => {
        const $shareBtn = $("#btn-share");
        const element = document.getElementById("capture-area");

        $shareBtn.removeClass("fa-brands fa-whatsapp").addClass("fa-solid fa-spinner fa-spin");
        $shareBtn.css("pointer-events", "none");

        try {
            await new Promise(r => setTimeout(r, 100));

            const canvas = await html2canvas(element, {
                useCORS: true,
                scale: 4,
                backgroundColor: "#000000",
                width: element.offsetWidth,
                height: element.offsetHeight
            });

            const resetUI = () => {
                $shareBtn.removeClass("fa-solid fa-spinner fa-spin").addClass("fa-brands fa-whatsapp");
                $shareBtn.css("pointer-events", "auto");
            };

            canvas.toBlob(async blob => {
                const file = new File([blob], "payment-qr.png", { type: "image/png" });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({ files: [file], title: "UPI Payment QR" });
                        resetUI();
                    } catch (shareErr) {
                        resetUI();
                    }
                } else {
                    const link = document.createElement("a");
                    link.download = "payment-qr.png";
                    link.href = canvas.toDataURL("image/png", 1.0);
                    link.click();
                    resetUI();
                }
            }, "image/png", 1.0);
        } catch (error) {
            console.error(error);
            $shareBtn.removeClass("fa-solid fa-spinner fa-spin").addClass("fa-brands fa-whatsapp");
            $shareBtn.css("pointer-events", "auto");
        }
    };

    setBg(currentIdx);

    $("#btn-modal").on("click", () => $("#modal").fadeIn(200).css("display", "flex"));
    $("#btn-close").on("click", () => $("#modal").fadeOut(200));
    $("#btn-apply").on("click", updateData);
    $("#btn-bg").on("click", nextBg);
    $("#btn-share").on("click", shareAsImage);

    $("#modal").on("click", e => { if (e.target.id === "modal") $("#modal").fadeOut(200); });
    $(".modal-content").on("click", e => e.stopPropagation());

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("./sw.js").catch(err => console.log(err));
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
        deferredPrompt.userChoice.then(() => { deferredPrompt = null; });
    });
});
