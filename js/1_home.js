// 1_Home 初始化入口
window.initHomePage = function (pageId) {
    initPhotoGallery();
    loadLatestNewsToHome(pageId);
};

// 1.1_照片展示廊
function initPhotoGallery() {
    const gallery = document.querySelector(".photo-gallery");

    if (!gallery) {
        return;
    }

    const images = Array.from(
        gallery.querySelectorAll("img")
    );

    const buttons = Array.from(
        gallery.querySelectorAll(".controls button")
    );

    if (images.length === 0) {
        return;
    }

    let currentImageIndex = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchDistanceX = 0;
    let swipeDirection = 0;
    let nearbyImageIndex = 0;
    let isHorizontalSwipe = false;
    let isAnimating = false;

    function getNearbyIndex(direction) {
        return (
            currentImageIndex +
            direction +
            images.length
        ) % images.length;
    }

    function updateButtons() {
        buttons.forEach((button, index) => {
            button.classList.toggle(
                "active",
                index === currentImageIndex
            );
        });
    }

    function resetImagePositions() {
        images.forEach((image, index) => {
            image.style.transition = "none";

            image.style.transform =
                index === currentImageIndex
                    ? "translateX(0)"
                    : "translateX(100%)";

            image.classList.toggle(
                "active",
                index === currentImageIndex
            );
        });

        updateButtons();

        gallery.offsetWidth;

        window.requestAnimationFrame(() => {
            images.forEach(image => {
                image.style.transition = "";
            });
        });
    }

    function slideToImage(nextIndex, direction = 1) {
        if (
            isAnimating ||
            nextIndex === currentImageIndex
        ) {
            return;
        }

        isAnimating = true;

        const currentImage =
            images[currentImageIndex];

        const nextImage =
            images[nextIndex];

        const entryPosition =
            direction > 0 ? 100 : -100;

        const exitPosition =
            direction > 0 ? -100 : 100;

        images.forEach(image => {
            image.style.transition = "none";
        });

        currentImage.style.transform =
            "translateX(0)";

        nextImage.style.transform =
            `translateX(${entryPosition}%)`;

        nextImage.classList.add("active");

        // 强制浏览器记录动画开始位置
        nextImage.offsetWidth;

        currentImage.style.transition =
            "transform 0.4s ease";

        nextImage.style.transition =
            "transform 0.4s ease";

        currentImage.style.transform =
            `translateX(${exitPosition}%)`;

        nextImage.style.transform =
            "translateX(0)";

        window.setTimeout(() => {
            currentImageIndex = nextIndex;
            isAnimating = false;
            resetImagePositions();
        }, 400);
    }

    function showNextImage() {
        slideToImage(
            getNearbyIndex(1),
            1
        );
    }

    function showPreviousImage() {
        slideToImage(
            getNearbyIndex(-1),
            -1
        );
    }

    function restartAutoPlay() {
        if (window.homeGalleryTimer) {
            clearInterval(
                window.homeGalleryTimer
            );
        }

        window.homeGalleryTimer = setInterval(
            showNextImage,
            6000
        );
    }

    buttons.forEach((button, index) => {
        button.onclick = function () {
            if (index === currentImageIndex) {
                return;
            }

            const direction =
                index > currentImageIndex ? 1 : -1;

            slideToImage(index, direction);
            restartAutoPlay();
        };
    });

    gallery.ontouchstart = function (event) {
        if (isAnimating) {
            return;
        }

        const touch = event.touches[0];

        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchDistanceX = 0;
        swipeDirection = 0;
        isHorizontalSwipe = false;

        if (window.homeGalleryTimer) {
            clearInterval(
                window.homeGalleryTimer
            );
        }
    };

    gallery.ontouchmove = function (event) {
        if (isAnimating) {
            return;
        }

        const touch = event.touches[0];

        const distanceX =
            touch.clientX - touchStartX;

        const distanceY =
            touch.clientY - touchStartY;

        // 尚未确定方向时，先判断是横滑还是纵滑
        if (!isHorizontalSwipe) {
            if (
                Math.abs(distanceX) <
                Math.abs(distanceY)
            ) {
                return;
            }

            if (Math.abs(distanceX) < 8) {
                return;
            }

            isHorizontalSwipe = true;
        }

        touchDistanceX = distanceX;

        // 左滑为下一张，右滑为上一张
        const newDirection =
            distanceX < 0 ? 1 : -1;

        if (newDirection !== swipeDirection) {
            swipeDirection = newDirection;

            nearbyImageIndex =
                getNearbyIndex(swipeDirection);

            images.forEach((image, index) => {
                image.style.transition = "none";

                if (
                    index !== currentImageIndex &&
                    index !== nearbyImageIndex
                ) {
                    image.style.transform =
                        "translateX(100%)";
                }
            });
        }

        const galleryWidth =
            gallery.clientWidth;

        const movementPercent =
            (distanceX / galleryWidth) * 100;

        const nearbyStartPosition =
            swipeDirection > 0 ? 100 : -100;

        images[currentImageIndex].style.transform =
            `translateX(${movementPercent}%)`;

        images[nearbyImageIndex].style.transform =
            `translateX(${
                nearbyStartPosition +
                movementPercent
            }%)`;

        images[nearbyImageIndex]
            .classList.add("active");
    };

    gallery.ontouchend = function () {
        if (
            isAnimating ||
            !isHorizontalSwipe
        ) {
            restartAutoPlay();
            return;
        }

        const minimumSwipeDistance =
            Math.min(
                80,
                gallery.clientWidth * 0.2
            );

        const currentImage =
            images[currentImageIndex];

        const nearbyImage =
            images[nearbyImageIndex];

        currentImage.style.transition =
            "transform 0.3s ease";

        nearbyImage.style.transition =
            "transform 0.3s ease";

        if (
            Math.abs(touchDistanceX) >=
            minimumSwipeDistance
        ) {
            isAnimating = true;

            const exitPosition =
                swipeDirection > 0 ? -100 : 100;

            currentImage.style.transform =
                `translateX(${exitPosition}%)`;

            nearbyImage.style.transform =
                "translateX(0)";

            window.setTimeout(() => {
                currentImageIndex =
                    nearbyImageIndex;

                isAnimating = false;
                resetImagePositions();
                restartAutoPlay();
            }, 300);
        } else {
            // 滑动距离不足，回弹到原图
            const nearbyPosition =
                swipeDirection > 0 ? 100 : -100;

            currentImage.style.transform =
                "translateX(0)";

            nearbyImage.style.transform =
                `translateX(${nearbyPosition}%)`;

            window.setTimeout(() => {
                resetImagePositions();
                restartAutoPlay();
            }, 300);
        }
    };

    gallery.ontouchcancel = function () {
        resetImagePositions();
        restartAutoPlay();
    };

    resetImagePositions();
    restartAutoPlay();
}

// 1.2_首页自动读取最新新闻
function loadLatestNewsToHome(pageId) {
    const homeNewsList = document.getElementById("home-news-list");

    if (!homeNewsList) {
        return;
    }

    const currentPageId =
        pageId || window.location.hash.replace("#", "") || "1_home_sc";

    const langSuffix = currentPageId.replace("1_home", "") || "_sc";

    const newsUrl = `parts/5_news${langSuffix}.html`;

    fetch(newsUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Couldn't load ${newsUrl}`);
            }

            return response.text();
        })
        .then(html => {
            const doc = new DOMParser().parseFromString(html, "text/html");

            const newsItems = Array.from(
                doc.querySelectorAll(".news-item")
            ).slice(0, 5);

            homeNewsList.innerHTML = "";

            newsItems.forEach(item => {
                const sourceDate = item.querySelector(".news-date");
                const sourceText = item.querySelector(".news-text");

                if (!sourceDate || !sourceText) {
                    return;
                }

                const newsItem = document.createElement("div");
                newsItem.className = "home-news-item";

                const date = document.createElement("span");
                date.className = "home-news-date";
                date.textContent = sourceDate.textContent.trim();

                const text = document.createElement("span");
                text.className = "home-news-text";

                // 关键：用 innerHTML，保留 sub/sup 等标签
                text.innerHTML = sourceText.innerHTML.trim();

                newsItem.appendChild(date);
                newsItem.appendChild(text);

                homeNewsList.appendChild(newsItem);
            });
        })
        .catch(error => {
            console.warn("首页新闻加载失败：", error);
        });
}