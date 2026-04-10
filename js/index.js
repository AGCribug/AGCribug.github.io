document.addEventListener("DOMContentLoaded", function() {

    const mainContent = document.getElementById("main-content");

    // 事件委托，监听导航按钮点击
    document.addEventListener("click", function(event) {
        if (event.target.tagName === "BUTTON" && event.target.hasAttribute("data-page")) {
            const page = event.target.getAttribute("data-page");
            loadContent(page);
        }
    });

    // 默认加载首页
    loadContent("1_home_zh");

    // 全局初始化接口，局部 JS 可以调用
    window.initPage = function(pageId) {
        console.log(`全局 initPage 已调用: ${pageId}`);
        // 可在这里添加全局初始化逻辑，比如重置滚动条、全局状态等
    }

    // 加载对应的 HTML 内容到 main-content
    function loadContent(pageId) {
        const url = `parts/${pageId}.html`;

        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(`Couldn't load ${url}`);
                return response.text();
            })
            .then(html => {
                mainContent.innerHTML = html;

                // 调用全局 initPage
                if (window.initPage) window.initPage(pageId);

                // 动态加载局部 CSS（如果存在）
                const existingLink = document.getElementById("page-style");
                if (existingLink) existingLink.remove();

                const cssUrl = `css/${pageId}.css`;
                fetch(cssUrl)
                    .then(res => {
                        if (res.ok) {
                            const link = document.createElement("link");
                            link.rel = "stylesheet";
                            link.href = cssUrl;
                            link.id = "page-style";
                            document.head.appendChild(link);
                        }
                    })
                    .catch(err => console.warn(err));

                // 动态加载局部 JS（作用域隔离，不覆盖全局）
                const scriptId = "page-script";
                const oldScript = document.getElementById(scriptId);
                if (oldScript) oldScript.remove();

                const script = document.createElement("script");
                script.src = `js/${pageId}.js`;
                script.id = scriptId;
                script.type = "module"; // 模块作用域，避免污染全局
                document.body.appendChild(script);

            })
            .catch(error => {
                mainContent.innerHTML = `<p>${error.message}</p>`;
                console.error(error);
            });
    }

});
// 1.3_语言切换
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