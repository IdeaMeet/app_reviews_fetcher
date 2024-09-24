// api/getReviews.js

const axios = require('axios');

/**
 * 获取指定国家和 App 的评论
 * @param {string} country - 国家代码，如 'us', 'cn'
 * @param {string} appId - App 的 Apple ID
 * @param {number} totalReviews - 需要获取的评论总数
 * @param {string} sort - 排序方式，'mostRecent' 或 'mostHelpful'
 * @param {number} page - 页码
 * @returns {Promise<Array>} 评论列表
 */
async function getAppReviews(country, appId, totalReviews = 100, sort = 'mostRecent', page = 1) {
    const reviews = [];
    const fetchedReviews = await fetchAppReviews(country, appId, page, sort);
    reviews.push(...fetchedReviews);
    return reviews.slice(0, totalReviews);
}

/**
 * 从 Apple RSS Feed 获取指定国家、页面的评论
 * @param {string} country - 国家代码，如 'us', 'cn'
 * @param {string} appId - App 的 Apple ID
 * @param {number} page - 页码
 * @param {string} sort - 排序方式
 * @returns {Promise<Array>} 评论列表
 */
async function fetchAppReviews(country, appId, page = 1, sort = 'mostRecent') {
    const url = `https://itunes.apple.com/${country}/rss/customerreviews/page=${page}/id=${appId}/sortby=${sort}/json`;
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
        console.error(`请求失败 (${country}): ${error.message}`);
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
    const { country = 'us', app_id, total_reviews = 100, sort = 'mostRecent', page = 1 } = req.query;

    if (!app_id) {
        res.status(400).json({ error: "Missing 'app_id' parameter." });
        return;
    }

    let totalReviewsNum = parseInt(total_reviews, 10);
    if (isNaN(totalReviewsNum) || totalReviewsNum <= 0) {
        res.status(400).json({ error: "'total_reviews' must be a positive integer." });
        return;
    }

    let pageNum = parseInt(page, 10);
    if (isNaN(pageNum) || pageNum <= 0) {
        res.status(400).json({ error: "'page' must be a positive integer." });
        return;
    }

    console.log(`Fetching reviews for Country: ${country}, App ID: ${app_id}, Total Reviews: ${totalReviewsNum}, Sort: ${sort}, Page: ${pageNum}`);

    try {
        const appReviews = await getAppReviews(country, app_id, totalReviewsNum, sort, pageNum);
        res.status(200).json({ reviews: appReviews });
    } catch (error) {
        console.error(`内部错误: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
};