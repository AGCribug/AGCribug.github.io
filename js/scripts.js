document.addEventListener("DOMContentLoaded", function() {
    // 加载网站的各个部分
    loadPart("header", "parts/header.html");
    loadPart("nav", "parts/nav.html");
    loadPart("footer", "parts/footer.html");
    loadContent("home");  // 默认加载主页内容

    let currentImageIndex = 0; // 跟踪当前图片在画廊中的索引

    // 初始化图片画廊，设置按钮点击处理程序并开始图片轮播
    function initializePhotoGallery() {
        const images = document.querySelectorAll(".photo-gallery img");
        const buttons = document.querySelectorAll(".photo-gallery .controls button");

        // 每6秒自动切换图片
        setInterval(() => {
            images[currentImageIndex].classList.remove("active");
            currentImageIndex = (currentImageIndex + 1) % images.length;
            images[currentImageIndex].classList.add("active");
        }, 6000);

        // 为画廊按钮添加点击事件监听器以显示相应的图片
        buttons.forEach((button, index) => {
            button.addEventListener("click", () => showImage(index));
        });

        // 默认显示第一张图片
        showImage(0);
    }

    // 显示画廊中的特定图片
    function showImage(index) {
        const images = document.querySelectorAll(".photo-gallery img");
        images.forEach(image => image.classList.remove("active"));
        images[index].classList.add("active");
        currentImageIndex = index;  // 更新当前索引以匹配点击的按钮
    }

    // 处理导航按钮点击事件以加载不同的内容部分
    document.addEventListener("click", function(event) {
        if (event.target.tagName === "BUTTON" && event.target.hasAttribute("data-page")) {
            const page = event.target.getAttribute("data-page");
            loadContent(page);
        }
    });

    // 加载网站部分
    function loadPart(id, url) {
        fetch(url)
            .then(response => response.text())
            .then(data => {
                document.getElementById(id).innerHTML = data;
                if (id === "header") {
                    updateDateTime(); // 如果是header部分，更新日期和时间
                }
            });
    }

    // 加载内容部分
    function loadContent(page) {
        fetch(`parts/${page}.html`)
            .then(response => response.text())
            .then(data => {
                document.getElementById("main-content").innerHTML = data;
                if (page === "home") {
                    initializePhotoGallery(); // 如果是主页，初始化图片画廊
                }
            });
    }

    // 更新日期和时间
    function updateDateTime() {
        const dateElement = document.getElementById("date");
        const timeElement = document.getElementById("time");

        function update() {
            const now = new Date();
            dateElement.textContent = now.toLocaleDateString();
            timeElement.textContent = now.toLocaleTimeString();
        }

        update();
        setInterval(update, 1000); // 每1秒更新一次日期和时间
    }
});
