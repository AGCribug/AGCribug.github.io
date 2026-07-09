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

    function showImage(index) {
        if (index < 0 || index >= images.length) {
            return;
        }

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

    buttons.forEach((button, index) => {
        button.onclick = function () {
            showImage(index);
        };
    });

    if (window.homeGalleryTimer) {
        clearInterval(window.homeGalleryTimer);
    }

    window.homeGalleryTimer = setInterval(function () {
        const nextIndex = (currentImageIndex + 1) % images.length;
        showImage(nextIndex);
    }, 6000);

    showImage(0);
}

// 1.2_首页自动读取最新新闻
function loadLatestNewsToHome(pageId) {
    const homeNewsList = document.getElementById("home-news-list");

    if (!homeNewsList) {
        return;
    }

    const currentPageId =
        pageId || window.location.hash.replace("#", "") || "1_home_zh";

    const langSuffix = currentPageId.replace("1_home", "") || "_zh";

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
            ).slice(0, 3);

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