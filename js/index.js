// 1_页面切换与资源加载
document.addEventListener("DOMContentLoaded", function () {

    const mainContent = document.getElementById("main-content");

// 事件委托：监听导航按钮点击
document.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-page]");

    if (button) {
        const pageId = button.getAttribute("data-page");

        // 点击导航时，把当前页面写入网址 hash
        if (window.location.hash !== `#${pageId}`) {
            window.location.hash = pageId;
        } else {
            loadContent(pageId);
        }
    }
});

    // 默认页面
    const defaultPage = "1_home_zh";

    // 从网址 hash 中读取当前页面
    function getPageFromHash() {
        const pageId = window.location.hash.replace("#", "");

        return pageId || defaultPage;
    }

    // 初次进入或刷新页面时，加载 hash 对应页面
    loadContent(getPageFromHash());

    // 浏览器前进、后退，或 hash 改变时，重新加载对应页面
    window.addEventListener("hashchange", function () {
        loadContent(getPageFromHash());
    });

// 1.1_全局初始化接口
window.initPage = function (pageId) {
    console.log(`全局 initPage 已调用：${pageId}`);

    // 初始化学术成果页面
    if (
        pageId.startsWith("3_publications") &&
        typeof window.initPublicationsPage === "function"
    ) {
        window.initPublicationsPage();
    }
};

// 1.2_加载对应的 HTML、CSS 和 JS
    function loadContent(pageId) {

        // HTML 文件保留语言后缀
        const htmlUrl = `parts/${pageId}.html`;

        const assetId = pageId.replace(/_(zh|en)$/, "");

        // 中英文页面共用同名 CSS 和 JS
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

                // 加载当前页面 JS
                loadPageScript(jsUrl, pageId);
            })
            .catch(error => {
                mainContent.style.visibility = "visible";
                mainContent.innerHTML = `<p>${error.message}</p>`;
                console.error(error);
            });
    }

    // 加载当前页面 CSS
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

    // 加载当前页面 JS
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

});

// 2_语言切换
// 🌐 点击地球 → 展开菜单
document.querySelector(".lang-btn").addEventListener("click", () => {
  const menu = document.querySelector(".lang-menu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
});

// 点击外部关闭
document.addEventListener("click", (e) => {
  if (!e.target.closest(".lang-menu-group")) {
    document.querySelector(".lang-menu").style.display = "none";
  }
});

// 3_footer
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

// 4_自定义浮动滚动条
(function initFloatingScrollbar() {
    const scrollbar = document.createElement("div");
    scrollbar.className = "floating-scrollbar";

    const thumb = document.createElement("div");
    thumb.className = "floating-scrollbar-thumb";

    scrollbar.appendChild(thumb);
    document.body.appendChild(scrollbar);

    let hideTimer = null;

    function updateScrollbar() {
        const scrollTop =
            window.scrollY || document.documentElement.scrollTop;

        const scrollHeight =
            document.documentElement.scrollHeight;

        const clientHeight =
            document.documentElement.clientHeight;

        const maxScrollTop =
            scrollHeight - clientHeight;

        // 页面没有超过一屏时，不显示滚动条
        if (maxScrollTop <= 0) {
            scrollbar.classList.remove("is-visible");
            return;
        }

        const thumbHeight =
            Math.max((clientHeight / scrollHeight) * clientHeight, 40);

        const thumbTop =
            (scrollTop / maxScrollTop) * (clientHeight - thumbHeight);

        thumb.style.height = `${thumbHeight}px`;
        thumb.style.transform = `translateY(${thumbTop}px)`;

        scrollbar.classList.add("is-visible");

        clearTimeout(hideTimer);

        hideTimer = setTimeout(function () {
            scrollbar.classList.remove("is-visible");
        }, 700);
    }

    window.addEventListener("scroll", updateScrollbar);
    window.addEventListener("resize", updateScrollbar);

    updateScrollbar();
})();