// 1_页面切换与资源加载
document.addEventListener("DOMContentLoaded", function () {

    const mainContent = document.getElementById("main-content");

    // 默认页面
    const defaultPage = "1_home_sc";

    // 1.1_从网址 hash 中读取当前页面
    function getPageFromHash() {
        const pageId = window.location.hash.replace("#", "");

        return pageId || defaultPage;
    }

    // 1.2_语言识别
    function getLangFromPageId(pageId) {
        if (pageId.endsWith("_sc")) {
            return "sc";
        }

        if (pageId.endsWith("_tc")) {
            return "tc";
        }

        if (pageId.endsWith("_en")) {
            return "en";
        }

        return "sc";
    }

    function getBasePageId(pageId) {
        return pageId.replace(/_(sc|tc|en)$/, "");
    }

    function getLangLabel(lang) {
        if (lang === "sc") {
            return "简";
        }

        if (lang === "tc") {
            return "正";
        }

        if (lang === "en") {
            return "EN";
        }

        return "简";
    }

    // 1.3_事件委托：监听导航按钮点击
    document.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-base-page]");

        if (!button) {
            return;
        }

        const basePageId = button.getAttribute("data-base-page");
        const currentLang = getLangFromPageId(getPageFromHash());
        const pageId = `${basePageId}_${currentLang}`;

        if (window.location.hash !== `#${pageId}`) {
            window.location.hash = pageId;
        } else {
            loadContent(pageId);
        }
    });

    // 1.4_全局初始化接口
    window.currentPageId = defaultPage;

    window.initPage = function (pageId) {
        console.log(`全局 initPage 已调用：${pageId}`);

        window.currentPageId = pageId;

        const navbar = document.querySelector(".navbar");

        if (navbar) {
            navbar.classList.remove("navbar-hidden");
        }

        // 初始化首页
        if (
            pageId.startsWith("1_home") &&
            typeof window.initHomePage === "function"
        ) {
            window.initHomePage(pageId);
        }

        // 初始化学术成果
        if (
            pageId.startsWith("3_publications") &&
            typeof window.initPublicationsPage === "function"
        ) {
            window.initPublicationsPage();
        }
    };

    // 1.5_加载对应的 HTML、CSS 和 JS
    function loadContent(pageId) {
        updateLanguageSwitcher(pageId);

        // HTML 文件保留语言后缀
        const htmlUrl = `parts/${pageId}.html`;

        // 三种语言页面共用同名 CSS 和 JS
        const assetId = pageId.replace(/_(sc|tc|en)$/, "");
        const cssUrl = `css/${assetId}.css`;
        const jsUrl = `js/${assetId}.js`;

        // 先隐藏主内容，避免页面先按照全局样式闪一下
        mainContent.style.visibility = "hidden";

        fetch(htmlUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Couldn't load ${htmlUrl}`);
                }

                return response.text();
            })
            .then(html => {
                // 先加载当前页面 CSS，CSS 准备好以后再插入 HTML
                return loadPageCss(cssUrl).then(() => html);
            })
            .then(html => {
                // 此时 CSS 已加载，再插入页面内容
                mainContent.innerHTML = html;

                // 显示主内容
                mainContent.style.visibility = "visible";

                window.scrollTo(0, 0);

                updateLanguageSwitcher(pageId);

                // 加载当前页面 JS
                loadPageScript(jsUrl, pageId);
            })
            .catch(error => {
                mainContent.style.visibility = "visible";
                mainContent.innerHTML = `<p>${error.message}</p>`;
                console.error(error);
            });
    }

    // 1.6_加载当前页面 CSS
    function loadPageCss(cssUrl) {
        return new Promise(resolve => {
            const existingLink =
                document.getElementById("page-style");

            fetch(cssUrl)
                .then(response => {
                    if (!response.ok) {
                        console.warn(`未找到 CSS：${cssUrl}`);

                        if (existingLink) {
                            existingLink.remove();
                        }

                        resolve();
                        return;
                    }

                    const link =
                        document.createElement("link");

                    link.rel = "stylesheet";
                    link.href = cssUrl;
                    link.id = "page-style";

                    link.onload = function () {
                        resolve();
                    };

                    link.onerror = function () {
                        console.warn(`CSS 加载失败：${cssUrl}`);
                        resolve();
                    };

                    if (existingLink) {
                        existingLink.remove();
                    }

                    document.head.appendChild(link);
                })
                .catch(error => {
                    console.warn(`CSS 检查失败：${cssUrl}`, error);

                    if (existingLink) {
                        existingLink.remove();
                    }

                    resolve();
                });
        });
    }

    // 1.7_加载当前页面 JS
    function loadPageScript(jsUrl, pageId) {
        const oldScript =
            document.getElementById("page-script");

        if (oldScript) {
            oldScript.remove();
        }

        fetch(jsUrl)
            .then(response => {
                if (!response.ok) {
                    console.warn(`未找到 JS：${jsUrl}`);

                    if (window.initPage) {
                        window.initPage(pageId);
                    }

                    return;
                }

                const script =
                    document.createElement("script");

                script.src = jsUrl;
                script.id = "page-script";
                script.type = "module";

                script.onload = function () {
                    if (window.initPage) {
                        window.initPage(pageId);
                    }
                };

                script.onerror = function () {
                    console.warn(`JS 加载失败：${jsUrl}`);

                    if (window.initPage) {
                        window.initPage(pageId);
                    }
                };

                document.body.appendChild(script);
            })
            .catch(error => {
                console.warn(`JS 检查失败：${jsUrl}`, error);

                if (window.initPage) {
                    window.initPage(pageId);
                }
            });
    }

    // 2_语言切换
    function updateLanguageSwitcher(pageId) {
        const langSwitcher = document.querySelector(".lang-switcher");
        const currentText = document.getElementById("lang-current-text");
        const langArrow = document.getElementById("lang-arrow");
        const langMenu = document.getElementById("lang-menu");

        if (!langSwitcher || !currentText || !langArrow || !langMenu) {
            return;
        }

        const currentLang = getLangFromPageId(pageId);

        // 按钮外部显示当前语言
        currentText.textContent = getLangLabel(currentLang);

        // 关闭菜单
        langSwitcher.classList.remove("is-open");

        // 菜单中隐藏当前语言，只显示另外两种语言
        const langButtons = langMenu.querySelectorAll("button[data-lang]");

        langButtons.forEach(function (button) {
            const buttonLang = button.getAttribute("data-lang");

            if (buttonLang === currentLang) {
                button.style.display = "none";
            } else {
                button.style.display = "block";
                button.textContent = getLangLabel(buttonLang);
            }
        });
    }

    function initLanguageSwitcher() {
        const langSwitcher = document.querySelector(".lang-switcher");
        const langToggle = document.getElementById("lang-toggle");
        const langArrow = document.getElementById("lang-arrow");
        const langMenu = document.getElementById("lang-menu");

        if (!langSwitcher || !langToggle || !langArrow || !langMenu) {
            return;
        }

        langToggle.addEventListener("click", function (event) {
            event.stopPropagation();

            langSwitcher.classList.toggle("is-open");
        });

        langMenu.addEventListener("click", function (event) {
            const button = event.target.closest("button[data-lang]");

            if (!button) {
                return;
            }

            const targetLang = button.getAttribute("data-lang");
            const currentPageId = getPageFromHash();
            const basePageId = getBasePageId(currentPageId);
            const targetPageId = `${basePageId}_${targetLang}`;

            langSwitcher.classList.remove("is-open");

            window.location.hash = targetPageId;
        });

        document.addEventListener("click", function () {
            langSwitcher.classList.remove("is-open");
        });
    }

    // 2.1_初始化语言切换
    initLanguageSwitcher();

    // 2.2_初次进入或刷新页面时，加载 hash 对应页面
    loadContent(getPageFromHash());

    // 2.3_浏览器前进、后退，或 hash 改变时，重新加载对应页面
    window.addEventListener("hashchange", function () {
        loadContent(getPageFromHash());
    });

});

// 3_Footer
document.getElementById("year").textContent = new Date().getFullYear();

const now = new Date();
document.getElementById("date").textContent = now.toLocaleDateString();

let visits = localStorage.getItem("visits") || 0;
visits++;
localStorage.setItem("visits", visits);
document.getElementById("visits").textContent = visits;

const groups = document.querySelectorAll(".menu-group");

groups.forEach(group => {
  const btn = group.querySelector(".menu-btn");
  const menu = group.querySelector(".menu");

  btn.addEventListener("click", (e) => {
    e.stopPropagation();

    document.querySelectorAll(".menu").forEach(m => {
      if (m !== menu) m.style.display = "none";
    });

    menu.style.display = (menu.style.display === "block") ? "none" : "block";
  });
});

document.addEventListener("click", () => {
  document.querySelectorAll(".menu").forEach(m => {
    m.style.display = "none";
  });
});

// 4_Scrollbar
(function initFloatingScrollbar() {
    const scrollbar = document.createElement("div");
    scrollbar.className = "floating-scrollbar";

    const thumb = document.createElement("div");
    thumb.className = "floating-scrollbar-thumb";

    scrollbar.appendChild(thumb);
    document.body.appendChild(scrollbar);

    let hideTimer = null;
    let isDragging = false;
    let dragStartY = 0;
    let startScrollTop = 0;

    function getScrollInfo() {
        const scrollTop =
            window.scrollY || document.documentElement.scrollTop;

        const scrollHeight =
            document.documentElement.scrollHeight;

        const clientHeight =
            document.documentElement.clientHeight;

        const maxScrollTop =
            scrollHeight - clientHeight;

        const thumbHeight =
            Math.max((clientHeight / scrollHeight) * clientHeight, 40);

        const maxThumbTop =
            clientHeight - thumbHeight;

        return {
            scrollTop,
            scrollHeight,
            clientHeight,
            maxScrollTop,
            thumbHeight,
            maxThumbTop
        };
    }

    function showScrollbar() {
        scrollbar.classList.add("is-visible");

        clearTimeout(hideTimer);

        if (!isDragging) {
            hideTimer = setTimeout(function () {
                scrollbar.classList.remove("is-visible");
            }, 700);
        }
    }

    function updateScrollbar() {
        const info = getScrollInfo();

        if (info.maxScrollTop <= 0) {
            scrollbar.classList.remove("is-visible");
            return;
        }

        const thumbTop =
            (info.scrollTop / info.maxScrollTop) * info.maxThumbTop;

        thumb.style.height = `${info.thumbHeight}px`;
        thumb.style.transform = `translateY(${thumbTop}px)`;

        showScrollbar();
    }

    thumb.addEventListener("mousedown", function (event) {
        event.preventDefault();

        isDragging = true;
        dragStartY = event.clientY;
        startScrollTop =
            window.scrollY || document.documentElement.scrollTop;

        scrollbar.classList.add("is-visible");
        clearTimeout(hideTimer);

        document.body.style.userSelect = "none";
    });

    window.addEventListener("mousemove", function (event) {
        if (!isDragging) {
            return;
        }

        const info = getScrollInfo();

        if (info.maxScrollTop <= 0 || info.maxThumbTop <= 0) {
            return;
        }

        const deltaY = event.clientY - dragStartY;
        const scrollDelta =
            (deltaY / info.maxThumbTop) * info.maxScrollTop;

        window.scrollTo({
            top: startScrollTop + scrollDelta,
            behavior: "auto"
        });

        updateScrollbar();
    });

    window.addEventListener("mouseup", function () {
        if (!isDragging) {
            return;
        }

        isDragging = false;
        document.body.style.userSelect = "";

        updateScrollbar();
    });

    window.addEventListener("scroll", updateScrollbar);
    window.addEventListener("resize", updateScrollbar);

    updateScrollbar();
})();

// 5_Navbar
(function initNavbarAutoHide() {
    const navbar = document.querySelector(".navbar");

    if (!navbar) {
        return;
    }

    let lastScrollY = window.scrollY;

    window.addEventListener("scroll", function () {
        const currentScrollY = window.scrollY;
        const currentPageId = window.currentPageId || "1_home_sc";

        if (currentPageId.startsWith("1_home")) {
            navbar.classList.remove("navbar-hidden");
            lastScrollY = currentScrollY;
            return;
        }

        if (currentScrollY <= 0) {
            navbar.classList.remove("navbar-hidden");
            lastScrollY = currentScrollY;
            return;
        }

        if (currentScrollY > lastScrollY) {
            navbar.classList.add("navbar-hidden");
        }

        if (currentScrollY < lastScrollY) {
            navbar.classList.remove("navbar-hidden");
        }

        lastScrollY = currentScrollY;
    });
})();