function showContent(page) {
    fetch(`${page}.html`)
        .then(response => response.text())
        .then(data => {
            document.getElementById('content').innerHTML = data;
        })
        .catch(error => console.error('Error loading content:', error));
}

// 默认加载首页内容
document.addEventListener("DOMContentLoaded", () => {
    showContent('home');
});