(function() {
    // 定义全局初始化函数，index.js 在加载 HTML 后调用
    window.initPhotoGallery = function() {
        const homeSection = document.getElementById("home");
        if (!homeSection) return; // 防止找不到元素时报错

        const images = homeSection.querySelectorAll(".photo-gallery img");
        const buttons = homeSection.querySelectorAll(".photo-gallery .controls button");

        if (images.length === 0 || buttons.length === 0) return;

        let currentImageIndex = 0; // 当前显示的图片索引

        // 显示指定索引的图片
        function showImage(index) {
            images.forEach(img => img.classList.remove("active"));
            images[index].classList.add("active");
            currentImageIndex = index;
        }

        // 按钮点击切换图片
        buttons.forEach((btn, index) => {
            btn.addEventListener("click", () => showImage(index));
        });

        // 自动轮播，每6秒切换
        setInterval(() => {
            const nextIndex = (currentImageIndex + 1) % images.length;
            showImage(nextIndex);
        }, 6000);

        // 默认显示第一张图片
        showImage(0);

        console.log("1_home.js 局部脚本初始化完成");
    };
})();