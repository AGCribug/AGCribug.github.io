document.addEventListener("DOMContentLoaded", function() {
    loadPart("header", "parts/header.html");
    loadPart("nav", "parts/nav.html");
    loadPart("footer", "parts/footer.html");
    loadContent("home");

    document.querySelector("nav").addEventListener("click", function(event) {
        if (event.target.tagName === "BUTTON") {
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
        const images = document.querySelectorAll(".photo-gallery img");
        const buttons = document.querySelectorAll(".photo-gallery .controls button");
        let currentIndex = 0;

        function showImage(index) {
            images[currentIndex].classList.remove("active");
            currentIndex = index;
            images[currentIndex].classList.add("active");
        }

        buttons.forEach((button, index) => {
            button.addEventListener("click", () => showImage(index));
        });

        showImage(0);
    }

    function updateDateTime() {
        const dateElement = document.getElementById("date");
        const timeElement = document.getElementById("time");
        const visitorElement = document.getElementById("visitors");

        function update() {
            const now = new Date();
            dateElement.textContent = now.toLocaleDateString();
            timeElement.textContent = now.toLocaleTimeString();
        }

        update();
        setInterval(update, 1000);

        // Simulate visitor count (in a real scenario, this would be fetched from a server)
        let visitorCount = 1234;
        visitorElement.textContent = `Visitors: ${visitorCount}`;
    }
});