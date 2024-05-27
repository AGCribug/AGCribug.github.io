document.addEventListener("DOMContentLoaded", function() {
    loadPart("header", "parts/header.html");
    loadPart("nav", "parts/nav.html");
    loadPart("footer", "parts/footer.html");
    loadContent("home");

    let currentImageIndex = 0;
    const images = document.querySelectorAll(".photo-gallery img");

    setInterval(() => {
        images[currentImageIndex].classList.remove("active");
        currentImageIndex = (currentImageIndex + 1) % images.length;
        images[currentImageIndex].classList.add("active");
    }, 10000);

    document.addEventListener("click", function(event) {
        if (event.target.tagName === "BUTTON" && event.target.hasAttribute("data-page")) {
            const page = event.target.getAttribute("data-page");
            loadContent(page);
        }
    });

    function loadPart(id, url) {
        fetch(url)
            .then(response => response.text())
            .then(data => {
                document.getElementById(id).innerHTML = data;
                if (id === "header") {
                    updateDateTime();
                }
            });
    }

    function loadContent(page) {
        fetch(`parts/${page}.html`)
            .then(response => response.text())
            .then(data => {
                document.getElementById("main-content").innerHTML = data;
                if (page === "home") {
                    initializePhotoGallery();
                }
            });
    }

    function initializePhotoGallery() {
        const buttons = document.querySelectorAll(".photo-gallery .controls button");

        buttons.forEach((button, index) => {
            button.addEventListener("click", () => showImage(index));
        });

        showImage(0);
    }

    function showImage(index) {
        const images = document.querySelectorAll(".photo-gallery img");
        images.forEach(image => image.classList.remove("active"));
        images[index].classList.add("active");
    }

    function updateDateTime() {
        const dateElement = document.getElementById("date");
        const timeElement = document.getElementById("time");

        function update() {
            const now = new Date();
            dateElement.textContent = now.toLocaleDateString();
            timeElement.textContent = now.toLocaleTimeString();
        }

        update();
        setInterval(update, 1000);
    }
});