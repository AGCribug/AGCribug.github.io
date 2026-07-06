// 1_按年份筛选学术成果
window.filterPublications = function () {
    const yearFilter = document.getElementById("year-filter");

    if (!yearFilter) {
        return;
    }

    const selectedYear = yearFilter.value;
    const publicationItems =
        document.querySelectorAll(".publication-item");

    publicationItems.forEach(function (item) {
        const shouldShow =
            selectedYear === "all" ||
            item.dataset.year === selectedYear;

        item.hidden = !shouldShow;
    });
};

// 2_初始化年份筛选器
window.initPublicationsPage = function () {
    const yearFilter = document.getElementById("year-filter");

    if (!yearFilter) {
        return;
    }

    yearFilter.onchange = window.filterPublications;

    // 根据筛选框当前值立即执行一次
    window.filterPublications();
};