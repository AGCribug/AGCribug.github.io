document.addEventListener("DOMContentLoaded", function() {
    // 加载页面各部分
    loadPart("header", "parts/header.html");
    loadPart("nav", "parts/nav.html");
    loadPart("footer", "parts/footer.html");
    loadContent("home");

    // 初始化图片轮播的当前索引
    let currentImageIndex = 0;
    const images = document.querySelectorAll(".photo-gallery img");

    // 设置图片每6秒自动切换
    setInterval(() => {
        images[currentImageIndex].classList.remove("active");
        currentImageIndex = (currentImageIndex + 1) % images.length;
        images[currentImageIndex].classList.add("active");
    }, 6000);

    // 监听按钮点击事件以加载相应的页面内容
    document.addEventListener("click", function(event) {
        if (event.target.tagName === "BUTTON" && event.target.hasAttribute("data-page")) {
            const page = event.target.getAttribute("data-page");
            loadContent(page);
        }
    });

    // 加载部分页面的函数
    function loadPart(id, url) {
        fetch(url)
            .then(response => response.text())
            .then(data => {
                document.getElementById(id).innerHTML = data;
                // 如果加载的是header部分，初始化日期时间显示
                if (id === "header") {
                    updateDateTime();
                }
            });
    }

    // 加载页面内容的函数
    function loadContent(page) {
        fetch(`parts/${page}.html`)
            .then(response => response.text())
            .then(data => {
                document.getElementById("main-content").innerHTML = data;
                // 如果加载的是home页面，初始化图片轮播
                if (page === "home") {
                    initializePhotoGallery();
                }
            });
    }

    // 初始化图片轮播的函数
    function initializePhotoGallery() {
        const buttons = document.querySelectorAll(".photo-gallery .controls button");

        buttons.forEach((button, index) => {
            button.addEventListener("click", () => showImage(index));
        });

        showImage(0); // 显示第一张图片
    }

    // 显示指定索引图片的函数
    function showImage(index) {
        const images = document.querySelectorAll(".photo-gallery img");
        images.forEach(image => image.classList.remove("active"));
        images[index].classList.add("active");
    }

    // 更新日期和时间的函数
    function updateDateTime() {
        const dateElement = document.getElementById("date");
        const timeElement = document.getElementById("time");

        function update() {
            const now = new Date();
            dateElement.textContent = now.toLocaleDateString();
            timeElement.textContent = now.toLocaleTimeString();
        }

        update(); // 初始化时立即更新一次
        setInterval(update, 1000); // 每秒更新一次
    }
});
