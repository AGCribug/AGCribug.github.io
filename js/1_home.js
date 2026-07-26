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

    const images = gallery.querySelectorAll("img");
    const buttons = gallery.querySelectorAll(".controls button");

    if (images.length === 0) {
        return;
    }

    let currentImageIndex = 0;
    let touchStartX = 0;
    let touchStartY = 0;

    function showImage(index) {
        images.forEach(img => {
            img.classList.remove("active");
        });

        buttons.forEach(button => {
            button.classList.remove("active");
        });

        images[index].classList.add("active");

        if (buttons[index]) {
            buttons[index].classList.add("active");
        }

        currentImageIndex = index;
    }

    function showNextImage() {
        const nextIndex =
            (currentImageIndex + 1) % images.length;

        showImage(nextIndex);
    }

    function showPreviousImage() {
        const previousIndex =
            (currentImageIndex - 1 + images.length) %
            images.length;

        showImage(previousIndex);
    }

    function restartAutoPlay() {
        if (window.homeGalleryTimer) {
            clearInterval(window.homeGalleryTimer);
        }

        window.homeGalleryTimer = setInterval(
            showNextImage,
            6000
        );
    }

    buttons.forEach((button, index) => {
        button.onclick = function () {
            showImage(index);
            restartAutoPlay();
        };
    });

    // 触屏设备：记录手指落下的位置
    gallery.ontouchstart = function (event) {
        const touch = event.touches[0];

        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    };

    // 触屏设备：判断左右滑动方向
    gallery.ontouchend = function (event) {
        const touch = event.changedTouches[0];

        const distanceX =
            touch.clientX - touchStartX;

        const distanceY =
            touch.clientY - touchStartY;

        const minimumSwipeDistance = 50;

        // 纵向滑动时，继续正常滚动页面
        if (
            Math.abs(distanceX) <=
            Math.abs(distanceY)
        ) {
            return;
        }

        if (
            Math.abs(distanceX) <
            minimumSwipeDistance
        ) {
            return;
        }

        if (distanceX < 0) {
            // 向左滑：下一张
            showNextImage();
        } else {
            // 向右滑：上一张
            showPreviousImage();
        }

        restartAutoPlay();
    };

    showImage(0);
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