(function() {
    window.initPhotoGallery = function() {
        const homeSection = document.getElementById("home");
        if (!homeSection) return;

        const images = homeSection.querySelectorAll(".photo-gallery img");
        const buttons = homeSection.querySelectorAll(".photo-gallery .controls button");
        if (images.length === 0 || buttons.length === 0) return;

        let currentImageIndex = 0;

        function showImage(index) {
            images.forEach(img => img.classList.remove("active"));
            images[index].classList.add("active");
            currentImageIndex = index;
        }

        // 按钮点击切换图片
        buttons.forEach((btn, index) => {
            btn.addEventListener("click", () => showImage(index));
        });

        // 自动轮播
        setInterval(() => {
            const nextIndex = (currentImageIndex + 1) % images.length;
            showImage(nextIndex);
        }, 6000);

        // 默认显示第一张图片
        showImage(0);
    };
})();
