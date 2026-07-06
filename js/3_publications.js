window.filterPublications = function () {
    const yearFilter = document.getElementById("year-filter");

    if (!yearFilter) {
        return;
    }

    const selectedYear = yearFilter.value;
    const items = document.querySelectorAll(".publication-item");

    items.forEach(item => {
        const shouldShow =
            selectedYear === "all" ||
            item.dataset.year === selectedYear;

        item.hidden = !shouldShow;
    });
};