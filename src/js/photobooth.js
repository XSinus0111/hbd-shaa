const downloadFileName = "hbd-myluvvv.png";


// =====================================================
// ELEMENT
// =====================================================

const video = document.getElementById("video");
const countdown = document.getElementById("countdown");
const flash = document.getElementById("flash");

const startBtn = document.getElementById("startBtn");
const downloadBtn = document.getElementById("downloadBtn");
const statusText = document.getElementById("status");

const photostripWrapper =
    document.querySelector(".photostrip-wrapper");

const photostripCard =
    document.getElementById("photostrip-card");

const resultCanvas =
    document.getElementById("resultCanvas");

const resultCtx =
    resultCanvas.getContext("2d");


// =====================================================
// TEMPLATE
// =====================================================

const template = new Image();

template.crossOrigin = "anonymous";

template.src =
    "https://res.cloudinary.com/kw8tf77h/image/upload/v1790260631/template.png";

let templateLoaded = false;


template.onload = () => {

    templateLoaded = true;

    console.log(
        "Template loaded:",
        template.naturalWidth,
        "x",
        template.naturalHeight
    );

    statusText.textContent =
        "Kamera siap. Tekan Take A Photo.";
};


template.onerror = () => {

    console.error(
        "Template gagal dimuat."
    );

    statusText.textContent =
        "Template photostrip tidak dapat dimuat.";
};


// =====================================================
// FOTO
// =====================================================

let photos = [];


// =====================================================
// GREEN SCREEN SETTINGS
// =====================================================

const GREEN_MIN = 70;

const GREEN_DOMINANCE = 1.15;


// =====================================================
// HELPER
// =====================================================

function sleep(ms) {

    return new Promise(
        resolve => setTimeout(resolve, ms)
    );

}


// =====================================================
// STATUS
// =====================================================

function setStatus(message) {

    statusText.textContent = message;

}


// =====================================================
// CAMERA
// =====================================================

async function startCamera() {

    if (!navigator.mediaDevices?.getUserMedia) {

        setStatus(
            "Browser ini tidak mendukung kamera."
        );

        return;

    }


    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({

                video: {
                    facingMode: "user"
                },

                audio: false

            });


        video.srcObject = stream;

        await video.play();


        setStatus(
            "Kamera siap. Tekan Take A Photo."
        );

    }

    catch (error) {

        console.error(
            "Camera error:",
            error
        );

        setStatus(
            "Kamera tidak dapat diakses. Izinkan kamera lalu reload halaman."
        );

    }

}


// =====================================================
// COUNTDOWN
// =====================================================

async function showCountdown(seconds = 3) {

    countdown.classList.add("is-visible");


    for (
        let i = seconds;
        i > 0;
        i--
    ) {

        countdown.textContent = i;

        await sleep(1000);

    }


    countdown.textContent = "📸";

    await sleep(400);


    countdown.classList.remove(
        "is-visible"
    );

}


// =====================================================
// FLASH
// =====================================================

async function cameraFlash() {

    flash.classList.add(
        "is-visible"
    );


    await sleep(120);


    flash.classList.remove(
        "is-visible"
    );

}


// =====================================================
// CAPTURE PHOTO
// =====================================================

function capturePhoto() {

    const canvas =
        document.createElement("canvas");


    canvas.width =
        video.videoWidth;

    canvas.height =
        video.videoHeight;


    const ctx =
        canvas.getContext("2d");


    /*
        Mirror foto supaya hasilnya
        sama seperti tampilan kamera.
    */

    ctx.save();


    ctx.translate(
        canvas.width,
        0
    );


    ctx.scale(
        -1,
        1
    );


    ctx.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.restore();


    return canvas;

}


// =====================================================
// CEK HIJAU
// =====================================================

function isGreen(
    r,
    g,
    b
) {

    return (

        g >= GREEN_MIN &&

        g >
        r * GREEN_DOMINANCE &&

        g >
        b * GREEN_DOMINANCE

    );

}


// =====================================================
// FIND GREEN AREAS
// =====================================================

function findGreenAreas(imageData) {

    const width =
        imageData.width;

    const height =
        imageData.height;

    const data =
        imageData.data;


    const visited =
        new Uint8Array(
            width * height
        );


    const areas = [];


    for (
        let y = 0;
        y < height;
        y++
    ) {

        for (
            let x = 0;
            x < width;
            x++
        ) {

            const index =
                y * width + x;


            if (
                visited[index]
            ) {

                continue;

            }


            visited[index] = 1;


            const pixelIndex =
                index * 4;


            const r =
                data[pixelIndex];

            const g =
                data[pixelIndex + 1];

            const b =
                data[pixelIndex + 2];


            if (
                !isGreen(
                    r,
                    g,
                    b
                )
            ) {

                continue;

            }


            const area =
                floodFill(
                    x,
                    y,
                    width,
                    height,
                    data,
                    visited
                );


            if (
                area.area > 500
            ) {

                areas.push(area);

            }

        }

    }


    return areas;

}


// =====================================================
// FLOOD FILL
// =====================================================

function floodFill(
    startX,
    startY,
    width,
    height,
    data,
    visited
) {

    const queue = [

        {
            x: startX,
            y: startY
        }

    ];


    let minX = startX;
    let maxX = startX;

    let minY = startY;
    let maxY = startY;

    let pixelCount = 0;


    while (
        queue.length > 0
    ) {

        const current =
            queue.pop();


        const x =
            current.x;

        const y =
            current.y;


        pixelCount++;


        minX =
            Math.min(
                minX,
                x
            );


        maxX =
            Math.max(
                maxX,
                x
            );


        minY =
            Math.min(
                minY,
                y
            );


        maxY =
            Math.max(
                maxY,
                y
            );


        const neighbors = [

            {
                x: x + 1,
                y: y
            },

            {
                x: x - 1,
                y: y
            },

            {
                x: x,
                y: y + 1
            },

            {
                x: x,
                y: y - 1
            }

        ];


        for (
            const neighbor of neighbors
        ) {

            const nx =
                neighbor.x;

            const ny =
                neighbor.y;


            if (

                nx < 0 ||
                nx >= width ||
                ny < 0 ||
                ny >= height

            ) {

                continue;

            }


            const index =
                ny * width + nx;


            if (
                visited[index]
            ) {

                continue;

            }


            visited[index] = 1;


            const pixelIndex =
                index * 4;


            const r =
                data[pixelIndex];

            const g =
                data[pixelIndex + 1];

            const b =
                data[pixelIndex + 2];


            if (
                isGreen(
                    r,
                    g,
                    b
                )
            ) {

                queue.push({

                    x: nx,
                    y: ny

                });

            }

        }

    }


    return {

        x: minX,

        y: minY,

        w:
            maxX -
            minX +
            1,

        h:
            maxY -
            minY +
            1,

        area:
            pixelCount

    };

}


// =====================================================
// DRAW PHOTO INTO SLOT
// =====================================================

function drawPhotoCover(
    ctx,
    photo,
    slot
) {

    const photoRatio =
        photo.width /
        photo.height;


    const slotRatio =
        slot.w /
        slot.h;


    let drawWidth;
    let drawHeight;


    /*
        Cover mode.

        Foto akan memenuhi seluruh
        area green screen.
    */

    if (
        photoRatio >
        slotRatio
    ) {

        drawHeight =
            slot.h;

        drawWidth =
            drawHeight *
            photoRatio;

    }

    else {

        drawWidth =
            slot.w;

        drawHeight =
            drawWidth /
            photoRatio;

    }


    const drawX =
        slot.x +
        (
            slot.w -
            drawWidth
        ) / 2;


    const drawY =
        slot.y +
        (
            slot.h -
            drawHeight
        ) / 2;


    ctx.save();


    /*
        Potong foto sesuai
        ukuran green screen.
    */

    ctx.beginPath();

    ctx.rect(
        slot.x,
        slot.y,
        slot.w,
        slot.h
    );

    ctx.clip();


    ctx.drawImage(
        photo,
        drawX,
        drawY,
        drawWidth,
        drawHeight
    );


    ctx.restore();

}


// =====================================================
// CREATE PHOTO STRIP
// =====================================================

function createPhotostrip() {

    if (
        photos.length !== 3
    ) {

        throw new Error(
            "Jumlah foto bukan 3."
        );

    }


    const width =
        template.naturalWidth;

    const height =
        template.naturalHeight;


    /*
        Canvas hasil mengikuti
        ukuran asli template.
    */

    resultCanvas.width =
        width;

    resultCanvas.height =
        height;


    resultCtx.clearRect(
        0,
        0,
        width,
        height
    );


    // =================================================
    // TEMPLATE CANVAS
    // =================================================

    const templateCanvas =
        document.createElement("canvas");


    templateCanvas.width =
        width;

    templateCanvas.height =
        height;


    const templateCtx =
        templateCanvas.getContext(
            "2d",
            {
                willReadFrequently: true
            }
        );


    templateCtx.drawImage(
        template,
        0,
        0
    );


    // =================================================
    // BACA PIXEL TEMPLATE
    // =================================================

    const templateData =
        templateCtx.getImageData(
            0,
            0,
            width,
            height
        );


    // =================================================
    // CARI GREEN SCREEN
    // =================================================

    setStatus(
        "Mencari area foto..."
    );


    const greenAreas =
        findGreenAreas(
            templateData
        );


    console.log(
        "Green areas:",
        greenAreas
    );


    if (
        greenAreas.length < 3
    ) {

        throw new Error(
            `Hanya ditemukan ${greenAreas.length} area hijau.`
        );

    }


    /*
        Ambil 3 area terbesar.
    */

    const slots =
        greenAreas
            .sort(
                (a, b) =>
                    b.area -
                    a.area
            )
            .slice(
                0,
                3
            );


    /*
        Urutkan dari atas
        ke bawah.

        Foto 1 -> atas
        Foto 2 -> tengah
        Foto 3 -> bawah
    */

    slots.sort(
        (a, b) =>
            a.y -
            b.y
    );


    console.log(
        "Final slots:",
        slots
    );


    // =================================================
    // PHOTO LAYER
    // =================================================

    const photoLayer =
        document.createElement("canvas");


    photoLayer.width =
        width;

    photoLayer.height =
        height;


    const photoCtx =
        photoLayer.getContext(
            "2d",
            {
                willReadFrequently: true
            }
        );


    // =================================================
    // MASUKKAN 3 FOTO
    // =================================================

    for (
        let i = 0;
        i < 3;
        i++
    ) {

        drawPhotoCover(
            photoCtx,
            photos[i],
            slots[i]
        );

    }


    // =================================================
    // AMBIL PIXEL FOTO
    // =================================================

    const photoData =
        photoCtx.getImageData(
            0,
            0,
            width,
            height
        );


    // =================================================
    // REPLACE GREEN
    // =================================================

    replaceGreenAreas(
        templateData,
        photoData
    );


    // =================================================
    // TAMPILKAN KE CANVAS HASIL
    // =================================================

    resultCtx.putImageData(
        templateData,
        0,
        0
    );


    console.log(
        "Photostrip berhasil dibuat."
    );

}


// =====================================================
// REPLACE GREEN PIXELS
// =====================================================

function replaceGreenAreas(
    templateData,
    photoData
) {

    const templatePixels =
        templateData.data;

    const photoPixels =
        photoData.data;


    for (
        let i = 0;
        i < templatePixels.length;
        i += 4
    ) {

        const r =
            templatePixels[i];

        const g =
            templatePixels[i + 1];

        const b =
            templatePixels[i + 2];


        if (
            isGreen(
                r,
                g,
                b
            )
        ) {

            templatePixels[i] =
                photoPixels[i];

            templatePixels[i + 1] =
                photoPixels[i + 1];

            templatePixels[i + 2] =
                photoPixels[i + 2];

            templatePixels[i + 3] =
                255;

        }

    }

}


// =====================================================
// TAKE 3 PHOTOS
// =====================================================

async function takePhotos() {

    if (
        !templateLoaded
    ) {

        setStatus(
            "Template belum selesai dimuat."
        );

        return;

    }


    if (
        !video.videoWidth
    ) {

        setStatus(
            "Kamera belum siap."
        );

        return;

    }


    /*
        Bersihkan hasil sebelumnya.
    */

    photos = [];


    resultCtx.clearRect(
        0,
        0,
        resultCanvas.width,
        resultCanvas.height
    );


    photostripWrapper.classList.remove(
        "has-result"
    );


    photostripCard.classList.remove(
        "eject-animation"
    );


    startBtn.disabled = true;

    downloadBtn.disabled = true;


    try {

        // =============================================
        // FOTO 1 - 3
        // =============================================

        for (
            let i = 0;
            i < 3;
            i++
        ) {

            setStatus(
                `Bersiap foto ${i + 1} dari 3...`
            );


            await sleep(500);


            await showCountdown(
                3
            );


            /*
                Ambil foto tepat setelah
                countdown selesai.
            */

            const photo =
                capturePhoto();


            photos.push(
                photo
            );


            await cameraFlash();


            setStatus(
                `Foto ${i + 1} berhasil diambil.`
            );


            await sleep(800);

        }


        // =============================================
        // CREATE
        // =============================================

        setStatus(
            "Memasukkan foto ke template..."
        );


        createPhotostrip();


        // =============================================
        // SHOW RESULT
        // =============================================

        photostripWrapper.classList.add(
            "has-result"
        );


        /*
            Tunggu browser merender
            wrapper terlebih dahulu,
            baru jalankan animasi.
        */

        requestAnimationFrame(() => {

            requestAnimationFrame(() => {

                photostripCard.classList.add(
                    "eject-animation"
                );

            });

        });


        downloadBtn.disabled = false;


        setStatus(
            "Selesai! Photostrip siap diunduh."
        );

    }

    catch (error) {

        console.error(
            "Photobooth error:",
            error
        );


        setStatus(
            "Photostrip gagal dibuat. Cek Console (F12)."
        );

    }

    finally {

        startBtn.disabled = false;

    }

}


// =====================================================
// DOWNLOAD
// =====================================================

downloadBtn.addEventListener(
    "click",
    () => {

        if (
            downloadBtn.disabled
        ) {

            return;

        }


        resultCanvas.toBlob(
            (blob) => {

                if (!blob) {

                    return;

                }


                const url =
                    URL.createObjectURL(
                        blob
                    );


                const link =
                    document.createElement("a");


                link.href =
                    url;

                link.download =
                    downloadFileName;


                document.body.appendChild(
                    link
                );


                link.click();


                link.remove();


                setTimeout(() => {

                    URL.revokeObjectURL(
                        url
                    );

                }, 100);

            },

            "image/png"

        );

    }
);


// =====================================================
// START BUTTON
// =====================================================

startBtn.addEventListener(
    "click",
    takePhotos
);


// =====================================================
// START CAMERA
// =====================================================

startCamera();