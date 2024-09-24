// public/script.js

document.getElementById('reviewForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const country = document.getElementById('country').value;
    const appId = document.getElementById('app_id').value.trim();
    const totalReviews = parseInt(document.getElementById('total_reviews').value, 10);
    const sort = document.getElementById('sort').value;
    const reviewsContainer = document.getElementById('reviews');

    if (!appId) {
        reviewsContainer.innerHTML = '请提供有效的 App ID。';
        return;
    }

    reviewsContainer.innerHTML = '加载中...';

    try {
        const response = await fetch(`/api/getReviews?country=${encodeURIComponent(country)}&app_id=${encodeURIComponent(appId)}&total_reviews=${totalReviews}&sort=${encodeURIComponent(sort)}`);
        
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

            reviewsContainer.innerHTML = '';
            data.reviews.forEach((review, index) => {
                const reviewDiv = document.createElement('div');
                reviewDiv.classList.add('review');

                reviewDiv.innerHTML = `
                    <div class="review-title">#${index + 1} ${review.title}</div>
                    <div class="review-meta">评分: ${review.rating} 星 | 作者: ${review.author} | 日期: ${new Date(review.date).toLocaleDateString()}</div>
                    <div class="review-content">${review.content}</div>
                `;
                reviewsContainer.appendChild(reviewDiv);
            });
        } else {
            reviewsContainer.innerHTML = `错误: ${data.error}`;
        }
    } catch (error) {
        reviewsContainer.innerHTML = `请求失败: ${error.message}`;
    }
});

// 下载为 Excel 功能
document.getElementById('downloadBtn').addEventListener('click', function() {
    const reviews = [];

    document.querySelectorAll('.review').forEach(reviewDiv => {
        const title = reviewDiv.querySelector('.review-title').innerText.replace(/^#\d+\s/, '');
        const meta = reviewDiv.querySelector('.review-meta').innerText;
        const content = reviewDiv.querySelector('.review-content').innerText;

        // 拆分 meta 信息
        const [ratingPart, authorPart, datePart] = meta.split(' | ');
        const rating = ratingPart.replace('评分: ', '');
        const author = authorPart.replace('作者: ', '');
        const date = datePart.replace('日期: ', '');

        reviews.push({ Title: title, Rating: rating, Author: author, Date: date, Content: content });
    });

    if (reviews.length === 0) {
        alert('没有评论可下载！');
        return;
    }

    // 使用 SheetJS 将数据转换为工作簿
    const worksheet = XLSX.utils.json_to_sheet(reviews);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reviews');

    // 生成 Excel 文件并触发下载
    XLSX.writeFile(workbook, 'App_Reviews.xlsx');
});