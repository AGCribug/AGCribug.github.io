// 1_页面切换与资源加载
document.addEventListener("DOMContentLoaded", function () {

    const mainContent = document.getElementById("main-content");

    // 事件委托：监听导航按钮点击
    document.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-page]");

        if (button) {
            const pageId = button.getAttribute("data-page");
            loadContent(pageId);
        }
    });

    // 默认加载中文首页
    loadContent("1_home_zh");

// 全局初始化接口
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

    // 加载对应的 HTML、CSS 和 JS
    function loadContent(pageId) {

        // HTML 文件保留语言后缀
        const htmlUrl = `parts/${pageId}.html`;

        const assetId = pageId.replace(/_(zh|en)$/, "");

        // 中英文页面共用同名 CSS 和 JS
        const cssUrl = `css/${assetId}.css`;
        const jsUrl = `js/${assetId}.js`;

        fetch(htmlUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Couldn't load ${htmlUrl}`);
                }

                return response.text();
            })
            .then(html => {

                // 将 HTML 页面插入主内容区
                mainContent.innerHTML = html;

                // 删除上一个页面的局部 CSS
                const existingLink =
                    document.getElementById("page-style");

                if (existingLink) {
                    existingLink.remove();
                }

                // 检查并加载当前页面的共用 CSS
                fetch(cssUrl)
                    .then(response => {
                        if (!response.ok) {
                            console.warn(`未找到 CSS：${cssUrl}`);
                            return;
                        }

                        const link =
                            document.createElement("link");

                        link.rel = "stylesheet";
                        link.href = cssUrl;
                        link.id = "page-style";

                        document.head.appendChild(link);
                    })
                    .catch(error => {
                        console.warn(`CSS 加载失败：${cssUrl}`, error);
                    });

                // 删除上一个页面的局部 JS
                const oldScript =
                    document.getElementById("page-script");

                if (oldScript) {
                    oldScript.remove();
                }

                // 检查当前页面是否有对应的共用 JS
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

                        /*
                         * 这里暂时保留 module，
                         * 与你原来的代码保持一致。
                         */
                        script.type = "module";

                        script.onload = function () {
                            if (window.initPage) {
                                window.initPage(pageId);
                            }
                        };

                        document.body.appendChild(script);
                    })
                    .catch(error => {
                        console.warn(`JS 加载失败：${jsUrl}`, error);

                        if (window.initPage) {
                            window.initPage(pageId);
                        }
                    });
            })
            .catch(error => {
                mainContent.innerHTML = `<p>${error.message}</p>`;
                console.error(error);
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