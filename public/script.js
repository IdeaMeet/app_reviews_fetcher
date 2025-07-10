// public/script.js

let currentPage = 1;
let totalPages = 1;
let currentReviews = [];
let allReviews = [];
let currentCountry = 'us';
let currentAppId = '';
let currentSort = 'mostRecent';
let currentTotalReviews = 100;
let currentRatingFilter = '';

async function loadPage(page) {
    const reviewsContainer = document.getElementById('reviews');
    if (!reviewsContainer) return;
    reviewsContainer.innerHTML = '<div class="loader"></div>';
    reviewsContainer.style.display = 'block';
    try {
        const response = await fetch(`/api/getReviews?country=${encodeURIComponent(currentCountry)}&app_id=${encodeURIComponent(currentAppId)}&total_reviews=${currentTotalReviews}&sort=${encodeURIComponent(currentSort)}&page=${page}&rating=${encodeURIComponent(currentRatingFilter)}`);
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
    if (!reviewsContainer) return;
    reviewsContainer.innerHTML = '';
    reviews.forEach((review, index) => {
        const reviewDiv = document.createElement('div');
        reviewDiv.classList.add('review');
        reviewDiv.innerHTML = `
            <div class="review-title">#${(page-1)*100 + index + 1} ${review.title}</div>
            <div class="review-meta">评分: ${review.rating} 星 | 作者: ${review.author} | 日期: ${new Date(review.date).toLocaleDateString()}</div>
            <div class="review-content">${review.content}</div>
        `;
        reviewsContainer.appendChild(reviewDiv);
    });
}

function updatePagination() {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';
    const prevButton = document.createElement('button');
    prevButton.id = 'prevPage';
    prevButton.disabled = currentPage === 1;
    prevButton.innerText = '上一页';
    prevButton.addEventListener('click', async function() {
        if (currentPage > 1) {
            currentPage -= 1;
            await loadPage(currentPage);
        }
    });
    paginationContainer.appendChild(prevButton);
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.innerText = i;
        pageButton.disabled = i === currentPage;
        pageButton.addEventListener('click', async function() {
            currentPage = i;
            await loadPage(currentPage);
        });
        paginationContainer.appendChild(pageButton);
    }
    const nextButton = document.createElement('button');
    nextButton.id = 'nextPage';
    nextButton.disabled = currentPage === totalPages;
    nextButton.innerText = '下一页';
    nextButton.addEventListener('click', async function() {
        if (currentPage < totalPages) {
            currentPage += 1;
            await loadPage(currentPage);
        }
    });
    paginationContainer.appendChild(nextButton);
}

function addShowMoreToolsButton() {
    const button = document.createElement('button');
    button.id = 'show-more-tools';
    button.textContent = '显示更多工具';
    button.style.position = 'fixed';
    button.style.right = '20px';
    button.style.top = '20px';
    button.style.display = 'none';
    button.addEventListener('click', function() {
        const moreTools = document.getElementById('more-tools');
        if (moreTools) {
            moreTools.classList.remove('hidden');
        }
        this.style.display = 'none';
    });
    document.body.appendChild(button);
}

document.addEventListener('DOMContentLoaded', function() {
    addShowMoreToolsButton();
    // 表单提交事件
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            currentPage = 1;
            allReviews = [];
            // 国家
            const countryCheckboxes = document.querySelectorAll('#country-group input[name="country"]');
            let selectedCountries = Array.from(countryCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
            if (selectedCountries.includes('')) {
                selectedCountries = [''];
            } else {
                selectedCountries = selectedCountries.filter(v => v);
            }
            currentCountry = selectedCountries.join(',');
            currentAppId = document.getElementById('app_id').value.trim();
            currentTotalReviews = parseInt(document.getElementById('total_reviews').value, 10);
            currentSort = document.getElementById('sort').value;
            // 星级
            const ratingCheckboxes = document.querySelectorAll('#rating-group input[name="rating"]');
            let selectedRatings = Array.from(ratingCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
            if (selectedRatings.includes('')) {
                selectedRatings = [''];
            } else {
                selectedRatings = selectedRatings.filter(v => v);
            }
            currentRatingFilter = selectedRatings.join(',');
            const reviewsContainer = document.getElementById('reviews');
            const reviewsTitle = document.getElementById('reviewsTitle');
            const pagination = document.getElementById('pagination');
            if (!currentAppId) {
                reviewsContainer.innerHTML = '请提供有效的 App ID。';
                reviewsContainer.style.display = 'block';
                if (reviewsTitle) reviewsTitle.style.display = 'block';
                if (pagination) pagination.style.display = 'block';
                return;
            }
            reviewsContainer.innerHTML = '<div class="loader"></div>';
            reviewsContainer.style.display = 'block';
            if (reviewsTitle) reviewsTitle.style.display = 'block';
            if (pagination) pagination.style.display = 'block';
            try {
                const response = await fetch(`/api/getReviews?country=${encodeURIComponent(currentCountry)}&app_id=${encodeURIComponent(currentAppId)}&total_reviews=${currentTotalReviews}&sort=${encodeURIComponent(currentSort)}&page=${currentPage}&rating=${encodeURIComponent(currentRatingFilter)}`);
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
                    allReviews = data.reviews;
                    totalPages = Math.ceil(currentTotalReviews / 100);
                    updatePagination();
                    displayReviews(currentReviews, currentPage);
                } else {
                    reviewsContainer.innerHTML = `错误: ${data.error}`;
                }
            } catch (error) {
                reviewsContainer.innerHTML = `请求失败: ${error.message}`;
            }
        });
    }
    // 下载为 Excel 功能
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            if (allReviews.length === 0) {
                alert('没有评论可下载！');
                return;
            }
            const data = allReviews.map((review, index) => ({
                "序号": index + 1,
                "标题": review.title,
                "评分": review.rating,
                "作者": review.author,
                "日期": new Date(review.date).toLocaleDateString(),
                "内容": review.content
            }));
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Reviews');
            XLSX.writeFile(workbook, 'App_Reviews.xlsx');
        });
    }
    // 关闭"更多工具"功能
    const closeMoreToolsBtn = document.getElementById('close-more-tools');
    if (closeMoreToolsBtn) {
        closeMoreToolsBtn.addEventListener('click', function() {
            document.getElementById('more-tools').classList.add('hidden');
            const showMoreToolsBtn = document.getElementById('show-more-tools');
            if (showMoreToolsBtn) {
                showMoreToolsBtn.style.display = 'block';
            }
        });
    }
    // "所有"选项互斥逻辑 - 星级筛选
    document.querySelectorAll('#rating-group input[name="rating"]').forEach(cb => {
        cb.addEventListener('change', function() {
            const allCb = document.querySelector('#rating-group input[value=""]');
            if (this.value === '') {
                if (this.checked) {
                    document.querySelectorAll('#rating-group input[name="rating"]').forEach(other => {
                        if (other.value !== '') other.checked = false;
                    });
                }
            } else {
                if (this.checked) {
                    allCb.checked = false;
                }
                const anyChecked = Array.from(document.querySelectorAll('#rating-group input[name="rating"]')).some(cb => cb.checked && cb.value !== '');
                if (!anyChecked) allCb.checked = true;
            }
        });
    });
    // "所有"选项互斥逻辑 - 国家选择
    document.querySelectorAll('#country-group input[name="country"]').forEach(cb => {
        cb.addEventListener('change', function() {
            const allCb = document.querySelector('#country-group input[value=""]');
            if (this.value === '') {
                if (this.checked) {
                    document.querySelectorAll('#country-group input[name="country"]').forEach(other => {
                        if (other.value !== '') other.checked = false;
                    });
                }
            } else {
                if (this.checked) {
                    allCb.checked = false;
                }
                const anyChecked = Array.from(document.querySelectorAll('#country-group input[name="country"]')).some(cb => cb.checked && cb.value !== '');
                if (!anyChecked) allCb.checked = true;
            }
        });
    });
}); 
