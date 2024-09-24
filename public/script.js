// public/script.js

let currentPage = 1;
let totalPages = 1;
let currentReviews = [];
let currentCountry = 'us';
let currentAppId = '';
let currentSort = 'mostRecent';
let currentTotalReviews = 100;

document.getElementById('reviewForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    currentPage = 1; // 重置为第一页

    currentCountry = document.getElementById('country').value;
    currentAppId = document.getElementById('app_id').value.trim();
    currentTotalReviews = parseInt(document.getElementById('total_reviews').value, 10);
    currentSort = document.getElementById('sort').value;
    const reviewsContainer = document.getElementById('reviews');

    if (!currentAppId) {
        reviewsContainer.innerHTML = '请提供有效的 App ID。';
        return;
    }

    reviewsContainer.innerHTML = '<div class="loader"></div>';

    try {
        const response = await fetch(`/api/getReviews?country=${encodeURIComponent(currentCountry)}&app_id=${encodeURIComponent(currentAppId)}&total_reviews=${currentTotalReviews}&sort=${encodeURIComponent(currentSort)}&page=${currentPage}`);
        
        // 检查响应头的Content-Type
        const contentType = response.headers.get("Content-Type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("返回的数据不是 JSON 格式");
        }

        const data = await response.json();

        if (response.ok) {
            if (data.reviews.length === 0) {
                reviewsContainer.innerHTML = '没有找到评论。';
                return;
            }

            currentReviews = data.reviews;
            totalPages = Math.ceil(currentTotalReviews / 50); // 每页50条
            updatePagination();
            displayReviews(currentReviews, currentPage);
        } else {
            reviewsContainer.innerHTML = `错误: ${data.error}`;
        }
    } catch (error) {
        reviewsContainer.innerHTML = `请求失败: ${error.message}`;
    }
});

// 添加分页控制
document.getElementById('nextPage').addEventListener('click', async function() {
    if (currentPage < totalPages) {
        currentPage += 1;
        await loadPage(currentPage);
    }
});

document.getElementById('prevPage').addEventListener('click', async function() {
    if (currentPage > 1) {
        currentPage -= 1;
        await loadPage(currentPage);
    }
});

async function loadPage(page) {
    const reviewsContainer = document.getElementById('reviews');
    reviewsContainer.innerHTML = '<div class="loader"></div>';

    try {
        const response = await fetch(`/api/getReviews?country=${encodeURIComponent(currentCountry)}&app_id=${encodeURIComponent(currentAppId)}&total_reviews=${currentTotalReviews}&sort=${encodeURIComponent(currentSort)}&page=${page}`);
        
        // 检查响应头的Content-Type
        const contentType = response.headers.get("Content-Type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("返回的数据不是 JSON 格式");
        }

        const data = await response.json();

        if (response.ok) {
            if (data.reviews.length === 0) {
                reviewsContainer.innerHTML = '没有找到评论。';
                return;
            }

            currentReviews = data.reviews;
            displayReviews(currentReviews, page);
            updatePagination();
        } else {
            reviewsContainer.innerHTML = `错误: ${data.error}`;
        }
    } catch (error) {
        reviewsContainer.innerHTML = `请求失败: ${error.message}`;
    }
}

function displayReviews(reviews, page) {
    const reviewsContainer = document.getElementById('reviews');
    reviewsContainer.innerHTML = '';

    reviews.forEach((review, index) => {
        const reviewDiv = document.createElement('div');
        reviewDiv.classList.add('review');

        reviewDiv.innerHTML = `
            <div class="review-title">#${(page-1)*50 + index + 1} ${review.title}</div>
            <div class="review-meta">评分: ${review.rating} 星 | 作者: ${review.author} | 日期: ${new Date(review.date).toLocaleDateString()}</div>
            <div class="review-content">${review.content}</div>
        `;
        reviewsContainer.appendChild(reviewDiv);
    });
}

function updatePagination() {
    document.getElementById('currentPage').innerText = currentPage;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
}

// 下载为 Excel 功能
document.getElementById('downloadBtn').addEventListener('click', function() {
    if (currentReviews.length === 0) {
        alert('没有评论可下载！');
        return;
    }

    // 准备数据
    const data = currentReviews.map((review, index) => ({
        "序号": (currentPage - 1) * 50 + index + 1,
        "标题": review.title,
        "评分": review.rating,
        "作者": review.author,
        "日期": new Date(review.date).toLocaleDateString(),
        "内容": review.content
    }));

    // 使用 SheetJS 将数据转换为工作簿
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reviews');

    // 生成 Excel 文件并触发下载
    XLSX.writeFile(workbook, 'App_Reviews_Page_' + currentPage + '.xlsx');
});