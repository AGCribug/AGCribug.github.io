function filterPublications() {
    const year = document.getElementById('year-filter').value;
    const items = document.querySelectorAll('.publication-item');
    items.forEach(item => {
        if (year === 'all' || item.dataset.year === year) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}