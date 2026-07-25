// 1_页面切换与资源加载
document.addEventListener("DOMContentLoaded", function () {
    const mainContent = document.getElementById("main-content");
    const defaultPage = "1_home_sc";

    if (!mainContent) {
        console.error("未找到 #main-content");
        return;
    }

    // 防止快速切换页面时，旧请求覆盖新页面
    let latestLoadId = 0;

    // 1.1_从网址 hash 中读取当前页面
    function getPageFromHash() {
        const pageId = window.location.hash.replace("#", "");

        return pageId || defaultPage;
    }

    // 1.2_识别当前语言
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

    // 去掉页面名称末尾的语言后缀
    function getBasePageId(pageId) {
        return pageId.replace(/_(sc|tc|en)$/, "");
    }

    // 语言显示文字
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

    // 1.3_关闭语言菜单
    function closeLanguageMenu() {
        const langSwitcher = document.querySelector(".lang-switcher");

        if (langSwitcher) {
            langSwitcher.classList.remove("is-open");
        }
    }

    // 1.4_关闭 Footer 菜单
    function closeFooterMenus() {
        document.querySelectorAll(".menu").forEach(menu => {
            menu.style.display = "none";
        });
    }

    // 1.5_统一处理导航、语言选择和 Footer 菜单点击
    document.addEventListener("click", function (event) {
        // 顶部导航按钮
        const navButton =
            event.target.closest("button[data-base-page]");

        if (navButton) {
            const basePageId =
                navButton.getAttribute("data-base-page");

            const currentLang =
                getLangFromPageId(getPageFromHash());

            const pageId =
                `${basePageId}_${currentLang}`;

            closeLanguageMenu();
            closeFooterMenus();

            if (window.location.hash !== `#${pageId}`) {
                window.location.hash = pageId;
            } else {
                loadContent(pageId);
            }

            return;
        }

        // 当前语言按钮
        const langToggle =
            event.target.closest("#lang-toggle");

        if (langToggle) {
            const langSwitcher =
                document.querySelector(".lang-switcher");

            if (langSwitcher) {
                langSwitcher.classList.toggle("is-open");
            }

            closeFooterMenus();

            return;
        }

        // 语言菜单选项
        const langButton =
            event.target.closest(
                "#lang-menu button[data-lang]"
            );

        if (langButton) {
            const targetLang =
                langButton.getAttribute("data-lang");

            const currentPageId =
                getPageFromHash();

            const basePageId =
                getBasePageId(currentPageId);

            const targetPageId =
                `${basePageId}_${targetLang}`;

            closeLanguageMenu();
            closeFooterMenus();

            // 立即更新菜单，避免短暂显示三个语言
            updateLanguageSwitcher(targetPageId);

            if (
                window.location.hash !==
                `#${targetPageId}`
            ) {
                window.location.hash = targetPageId;
            } else {
                loadContent(targetPageId);
            }

            return;
        }

        // Footer 菜单按钮
        const footerButton =
            event.target.closest(".menu-btn");

        if (footerButton) {
            const group =
                footerButton.closest(".menu-group");

            const menu =
                group
                    ? group.querySelector(".menu")
                    : null;

            if (!menu) {
                return;
            }

            const shouldOpen =
                menu.style.display !== "block";

            closeFooterMenus();
            closeLanguageMenu();

            menu.style.display =
                shouldOpen ? "block" : "none";

            return;
        }

        // 点击其他位置时关闭全部菜单
        closeLanguageMenu();
        closeFooterMenus();
    });

    // 1.6_全局页面初始化接口
    window.currentPageId = getPageFromHash();

    window.initPage = function (pageId) {
        console.log(
            `全局 initPage 已调用：${pageId}`
        );

        window.currentPageId = pageId;

        const navbar =
            document.querySelector(".navbar");

        if (navbar) {
            navbar.classList.remove(
                "navbar-hidden"
            );
        }

        // 初始化首页
        if (
            pageId.startsWith("1_home") &&
            typeof window.initHomePage ===
                "function"
        ) {
            window.initHomePage(pageId);
        }

        // 初始化学术成果页面
        if (
            pageId.startsWith(
                "3_publications"
            ) &&
            typeof window
                .initPublicationsPage ===
                "function"
        ) {
            window.initPublicationsPage();
        }
    };

    // 1.7_加载 Header
    async function loadHeader(
        lang,
        pageId,
        loadId
    ) {
        const headerUrl =
            `parts/header_${lang}.html`;

        try {
            const response =
                await fetch(headerUrl);

            if (!response.ok) {
                throw new Error(
                    `Couldn't load ${headerUrl}`
                );
            }

            const html =
                await response.text();

            // 当前请求已经过期，不再插入
            if (loadId !== latestLoadId) {
                return;
            }

            const header =
                document.getElementById(
                    "header"
                );

            if (!header) {
                console.warn(
                    "未找到 #header"
                );
                return;
            }

            header.innerHTML = html;

            // Header 插入后立即校正语言状态
            updateLanguageSwitcher(pageId);
        } catch (error) {
            console.warn(
                "Header 加载失败：",
                error
            );
        }
    }

    // 1.8_加载 Footer
    async function loadFooter(
        lang,
        loadId
    ) {
        const footerUrl =
            `parts/footer_${lang}.html`;

        try {
            const response =
                await fetch(footerUrl);

            if (!response.ok) {
                throw new Error(
                    `Couldn't load ${footerUrl}`
                );
            }

            const html =
                await response.text();

            // 当前请求已经过期，不再插入
            if (loadId !== latestLoadId) {
                return;
            }

            const footer =
                document.getElementById(
                    "footer"
                );

            if (!footer) {
                console.warn(
                    "未找到 #footer"
                );
                return;
            }

            footer.innerHTML = html;

            initFooterInfo();
        } catch (error) {
            console.warn(
                "Footer 加载失败：",
                error
            );
        }
    }

    // 1.9_初始化 Footer 信息
    function initFooterInfo() {
        const year =
            document.getElementById("year");

        const date =
            document.getElementById("date");

        const visitsText =
            document.getElementById(
                "visits"
            );

        if (
            !year ||
            !date ||
            !visitsText
        ) {
            return;
        }

        year.textContent =
            new Date().getFullYear();

        const now = new Date();

        date.textContent =
            now.toLocaleDateString();

let visits =
    Number(
        localStorage.getItem("visits")
    ) || 0;


    if (!sessionStorage.getItem("visited")) {

        visits++;

        localStorage.setItem(
            "visits",
            String(visits)
        );

        sessionStorage.setItem(
            "visited",
            "true"
        );
    }

        visitsText.textContent =
            String(visits);
    }

    // 1.10_加载页面内容
    async function loadContent(pageId) {
        const loadId = ++latestLoadId;

        const htmlUrl =
            `parts/${pageId}.html`;

        const lang =
            getLangFromPageId(pageId);

        const assetId =
            pageId.replace(
                /_(sc|tc|en)$/,
                ""
            );

        const cssUrl =
            `css/${assetId}.css`;

        const jsUrl =
            `js/${assetId}.js`;

        window.currentPageId = pageId;

        mainContent.style.visibility =
            "hidden";

        // Header、Footer 和主体同时加载
        const headerPromise =
            loadHeader(
                lang,
                pageId,
                loadId
            );

        const footerPromise =
            loadFooter(
                lang,
                loadId
            );

        try {
            const response =
                await fetch(htmlUrl);

            if (!response.ok) {
                throw new Error(
                    `Couldn't load ${htmlUrl}`
                );
            }

            const html =
                await response.text();

            await loadPageCss(
                cssUrl,
                loadId
            );

            await Promise.all([
                headerPromise,
                footerPromise
            ]);

            // 当前请求已经过期
            if (loadId !== latestLoadId) {
                return;
            }

            mainContent.innerHTML = html;

            mainContent.style.visibility =
                "visible";

            window.scrollTo(0, 0);

            // 页面载入后再次校正语言菜单
            updateLanguageSwitcher(pageId);

            loadPageScript(
                jsUrl,
                pageId,
                loadId
            );
        } catch (error) {
            if (loadId !== latestLoadId) {
                return;
            }

            mainContent.style.visibility =
                "visible";

            mainContent.innerHTML =
                `<p>${error.message}</p>`;

            console.error(error);
        }
    }

    // 1.11_加载当前页面 CSS
    function loadPageCss(
        cssUrl,
        loadId
    ) {
        return new Promise(resolve => {
            if (loadId !== latestLoadId) {
                resolve();
                return;
            }

            const existingLink =
                document.getElementById(
                    "page-style"
                );

            const link =
                document.createElement(
                    "link"
                );

            link.rel = "stylesheet";
            link.href = cssUrl;
            link.id = "page-style";

            let hasFinished = false;

            function finish() {
                if (hasFinished) {
                    return;
                }

                hasFinished = true;
                resolve();
            }

            link.onload = finish;

            link.onerror = function () {
                console.warn(
                    `CSS 加载失败：${cssUrl}`
                );

                finish();
            };

            if (existingLink) {
                existingLink.remove();
            }

            document.head.appendChild(link);

            // 防止网络异常时一直等待
            setTimeout(finish, 3000);
        });
    }

    // 1.12_加载当前页面 JS
    function loadPageScript(
        jsUrl,
        pageId,
        loadId
    ) {
        const oldScript =
            document.getElementById(
                "page-script"
            );

        if (oldScript) {
            oldScript.remove();
        }

        fetch(jsUrl)
            .then(response => {
                if (
                    loadId !== latestLoadId
                ) {
                    return;
                }

                if (!response.ok) {
                    console.warn(
                        `未找到 JS：${jsUrl}`
                    );

                    if (window.initPage) {
                        window.initPage(
                            pageId
                        );
                    }

                    return;
                }

                const script =
                    document.createElement(
                        "script"
                    );

                script.src = jsUrl;
                script.id = "page-script";
                script.type = "module";

                script.onload =
                    function () {
                        if (
                            loadId ===
                                latestLoadId &&
                            window.initPage
                        ) {
                            window.initPage(
                                pageId
                            );
                        }
                    };

                script.onerror =
                    function () {
                        console.warn(
                            `JS 加载失败：${jsUrl}`
                        );

                        if (
                            loadId ===
                                latestLoadId &&
                            window.initPage
                        ) {
                            window.initPage(
                                pageId
                            );
                        }
                    };

                document.body.appendChild(
                    script
                );
            })
            .catch(error => {
                if (
                    loadId !== latestLoadId
                ) {
                    return;
                }

                console.warn(
                    `JS 检查失败：${jsUrl}`,
                    error
                );

                if (window.initPage) {
                    window.initPage(pageId);
                }
            });
    }

    // 2_更新语言切换菜单
    function updateLanguageSwitcher(
        pageId
    ) {
        const langSwitcher =
            document.querySelector(
                ".lang-switcher"
            );

        const currentText =
            document.getElementById(
                "lang-current-text"
            );

        const langMenu =
            document.getElementById(
                "lang-menu"
            );

        if (
            !langSwitcher ||
            !currentText ||
            !langMenu
        ) {
            return;
        }

        const currentLang =
            getLangFromPageId(pageId);

        // 外部按钮显示当前语言
        currentText.textContent =
            getLangLabel(currentLang);

        // 每次更新时关闭菜单
        langSwitcher.classList.remove(
            "is-open"
        );

        // 菜单中隐藏当前语言
        const langButtons =
            langMenu.querySelectorAll(
                "button[data-lang]"
            );

        langButtons.forEach(
            function (button) {
                const buttonLang =
                    button.getAttribute(
                        "data-lang"
                    );

                const isCurrentLang =
                    buttonLang ===
                    currentLang;

                button.style.display =
                    isCurrentLang
                        ? "none"
                        : "block";

                if (!isCurrentLang) {
                    button.textContent =
                        getLangLabel(
                            buttonLang
                        );
                }
            }
        );
    }

    // 2.1_首次进入页面
    loadContent(getPageFromHash());

    // 2.2_hash 改变时重新加载
    window.addEventListener(
        "hashchange",
        function () {
            loadContent(
                getPageFromHash()
            );
        }
    );
});

// 3_Scrollbar
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

// 4_Navbar
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