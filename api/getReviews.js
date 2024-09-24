// api/getReviews.js

const axios = require('axios');

/**
 * 获取指定 App 的评论
 * @param {string} appId - App 的 Apple ID
 * @param {number} totalReviews - 需要获取的评论总数
 * @param {string} sort - 排序方式，'mostRecent' 或 'mostHelpful'
 * @returns {Promise<Array>} 评论列表
 */
async function getAppReviews(appId, totalReviews = 100, sort = 'mostRecent') {
    const reviews = [];
    let page = 1;
    const maxReviewsPerPage = 50; // 根据 Apple RSS Feed 的限制

    while (reviews.length < totalReviews) {
        const fetchedReviews = await fetchAppReviews(appId, page, sort);
        if (fetchedReviews.length === 0) {
            break;
        }
        reviews.push(...fetchedReviews);
        if (reviews.length >= totalReviews) {
            break;
        }
        page += 1;
    }

    return reviews.slice(0, totalReviews);
}

/**
 * 从 Apple RSS Feed 获取指定页面的评论
 * @param {string} appId - App 的 Apple ID
 * @param {number} page - 页码
 * @param {string} sort - 排序方式
 * @returns {Promise<Array>} 评论列表
 */
async function fetchAppReviews(appId, page = 1, sort = 'mostRecent') {
    const url = `https://itunes.apple.com/rss/customerreviews/page=${page}/id=${appId}/sortby=${sort}/json`;
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            },
            timeout: 10000 // 10秒超时
        });

        const data = response.data;
        if (data.feed && data.feed.entry) {
            // 第一条 entry 通常是应用信息，实际评论从第二条开始
            return data.feed.entry.slice(1).map(parseReview);
        } else {
            return [];
        }
    } catch (error) {
        console.error(`请求失败: ${error.message}`);
        return [];
    }
}

/**
 * 解析单条评论
 * @param {Object} entry - 单条评论的 JSON 数据
 * @returns {Object} 解析后的评论信息
 */
function parseReview(entry) {
    return {
        id: entry.id?.label || '',
        title: entry.title?.label || '',
        content: entry.content?.label || '',
        rating: entry['im:rating']?.label || '',
        author: entry.author?.name?.label || '',
        date: entry.updated?.label || ''
    };
}

module.exports = async (req, res) => {
    const { app_id, total_reviews = 100, sort = 'mostRecent' } = req.query;

    if (!app_id) {
        res.status(400).json({ error: "Missing 'app_id' parameter." });
        return;
    }

    let totalReviewsNum = parseInt(total_reviews, 10);
    if (isNaN(totalReviewsNum) || totalReviewsNum <= 0) {
        res.status(400).json({ error: "'total_reviews' must be a positive integer." });
        return;
    }

    try {
        const appReviews = await getAppReviews(app_id, totalReviewsNum, sort);
        res.status(200).json({ reviews: appReviews });
    } catch (error) {
        console.error(`内部错误: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
};