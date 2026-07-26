// 1_按年份筛选学术成果
window.filterPublications = function () {

    const yearFilter = document.getElementById("year-filter");

    if (!yearFilter) {
        return;
    }

    const selectedYear = yearFilter.value;

    const sections =
        document.querySelectorAll(".publication-section");

    sections.forEach(function(section){

        const items =
            section.querySelectorAll(".publication-item");

        let visibleCount = 0;

        items.forEach(function(item){

            const shouldShow =
                selectedYear === "all" ||
                item.dataset.year === selectedYear;

            item.hidden = !shouldShow;

            if(shouldShow){
                visibleCount++;
            }

        });

        // 控制整个模块（包括标题）
        section.hidden = visibleCount === 0;

    });

};

// 2_初始化年份筛选器
window.initPublicationsPage = function () {

    const yearFilter = document.getElementById("year-filter");


    if (!yearFilter) {
        return;
    }

    yearFilter.onchange =
        window.filterPublications;

    window.filterPublications();

};