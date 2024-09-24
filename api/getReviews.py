import requests
import json
from urllib.parse import parse_qs

def fetch_app_reviews(app_id, page=1, sort='mostRecent'):
    url = f"https://itunes.apple.com/rss/customerreviews/page={page}/id={app_id}/sortby={sort}/json"
    headers = {
        'User-Agent': 'Mozilla/5.0'
    }
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        if 'feed' in data and 'entry' in data['feed']:
            reviews = data['feed']['entry'][1:]
            return reviews
        else:
            return []
    else:
        return []

def parse_review(entry):
    review = {
        'id': entry.get('id', {}).get('label', ''),
        'title': entry.get('title', {}).get('label', ''),
        'content': entry.get('content', {}).get('label', ''),
        'rating': entry.get('im:rating', {}).get('label', ''),
        'author': entry.get('author', {}).get('name', {}).get('label', ''),
        'date': entry.get('updated', {}).get('label', '')
    }
    return review

def get_app_reviews(app_id, total_reviews=100, sort='mostRecent'):
    reviews = []
    page = 1
    while len(reviews) < total_reviews:
        fetched_reviews = fetch_app_reviews(app_id, page, sort)
        if not fetched_reviews:
            break
        for entry in fetched_reviews:
            review = parse_review(entry)
            reviews.append(review)
            if len(reviews) >= total_reviews:
                break
        page += 1
    return reviews

def handler(request, response):
    try:
        # 解析查询字符串
        query = request.query
        app_id = query.get('app_id')
        total_reviews = int(query.get('total_reviews', 100))
        sort = query.get('sort', 'mostRecent')

        if not app_id:
            response.status(400).send({"error": "Missing 'app_id' parameter."})
            return

        app_reviews = get_app_reviews(app_id, total_reviews, sort)
        response.status(200).send({"reviews": app_reviews})
    except Exception as e:
        response.status(500).send({"error": str(e)})