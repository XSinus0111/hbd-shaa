const flipBookOptions = {
    width: 400,
    height: 520,
    size: "stretch",
    minWidth: 280,
    maxWidth: 400,
    minHeight: 390,
    maxHeight: 520,
    showCover: true,
    usePortrait: true,
    drawShadow: true,
    maxShadowOpacity: 0.2,
    flippingTime: 900,
    startPage: 0,
    autoSize: true,
    useMouseEvents: true,
    mobileScrollSupport: true,
    swipeDistance: 30,
    disableFlipByClick: false,
};

// Isi dengan URL MP3/Audio Cloudinary untuk memutar lagu saat tombol Hero diklik.
const backgroundMusicUrl = "https://res.cloudinary.com/kw8tf77h/video/upload/v1790270193/Backstreet_Boys_-_Shape_Of_My_Heart.mp3";

function initNavigation() {
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.getElementById("primary-navigation");

    if (!toggle || !menu) return;

    const closeMenu = () => {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Buka menu navigasi");
        menu.classList.remove("is-open");
    };

    toggle.addEventListener("click", () => {
        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!isOpen));
        toggle.setAttribute("aria-label", isOpen ? "Buka menu navigasi" : "Tutup menu navigasi");
        menu.classList.toggle("is-open", !isOpen);
    });

    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
}

function initCards() {
    document.querySelectorAll(".card").forEach((card) => {
        card.addEventListener("click", () => card.classList.toggle("flipped"));
    });
}

function initHeroMusic() {
    const heroButton = document.querySelector(".btn-cta");
    if (!heroButton || !backgroundMusicUrl) return;

    const music = new Audio(backgroundMusicUrl);
    music.loop = true;
    music.preload = "none";
    music.volume = 0.5;

    heroButton.addEventListener("click", () => {
        music.play().catch((error) => console.warn("Music could not play:", error));
    }, { once: true });
}

function initBook() {
    const bookElement = document.getElementById("book");
    const pages = document.querySelectorAll("#poems .page");
    const bookWrapper = document.querySelector("#poems .book-wrapper");

    if (!bookElement || !bookWrapper || !pages.length || typeof St === "undefined") return;

    const pageFlip = new St.PageFlip(bookElement, flipBookOptions);
    const pageCounter = document.getElementById("page-counter");

    const updateBookPosition = () => {
        const currentPage = pageFlip.getCurrentPageIndex();
        const position = currentPage === 0 ? "closed" : currentPage % 2 === 0 ? "open right" : "open left";

        bookWrapper.classList.remove("closed", "open", "left", "right", "center");
        bookWrapper.classList.add(...position.split(" "));
    };

    const updateCounter = () => {
        if (!pageCounter) return;

        const currentPage = pageFlip.getCurrentPageIndex();
        const pageCount = pageFlip.getPageCount();
        const lastVisiblePage = Math.min(currentPage + 2, pageCount);

        pageCounter.textContent = currentPage === 0
            ? `1 / ${pageCount}`
            : `${currentPage + 1}-${lastVisiblePage} / ${pageCount}`;
    };

    document.getElementById("next")?.addEventListener("click", () => pageFlip.flipNext());
    document.getElementById("previous")?.addEventListener("click", () => pageFlip.flipPrev());

    pageFlip.on("flip", () => {
        updateCounter();
        updateBookPosition();
    });
    pageFlip.on("init", () => {
        updateCounter();
        updateBookPosition();
    });
    pageFlip.loadFromHTML(pages);
}

function initLetter() {
    const stage = document.getElementById("letter-stage");
    const envelope = document.getElementById("letter-envelope");

    if (!stage || !envelope) return;

    envelope.addEventListener("click", () => {
        const isOpen = stage.classList.toggle("is-open");
        envelope.setAttribute("aria-expanded", String(isOpen));
        envelope.setAttribute("aria-label", isOpen ? "Tutup surat" : "Buka surat");
    });
}

initNavigation();
initCards();
initHeroMusic();
initBook();
initLetter();
