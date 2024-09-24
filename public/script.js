// public/script.js

document.getElementById('reviewForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const appId = document.getElementById('app_id').value;
    const totalReviews = document.getElementById('total_reviews').value;
    const sort = document.getElementById('sort').value;
    const reviewsContainer = document.getElementById('reviews');

    reviewsContainer.innerHTML = '加载中...';

    try {
        const response = await fetch(`/api/getReviews?app_id=${appId}&total_reviews=${totalReviews}&sort=${sort}`);
        
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
                    <div class="review-meta">评分: ${review.rating} 星 | 作者: ${review.author} | 日期: ${review.date}</div>
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