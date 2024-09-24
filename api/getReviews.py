import json
import requests
import sys

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

def handler(environ, start_response):
    try:
        # 解析查询字符串
        query = {}
        if 'QUERY_STRING' in environ:
            from urllib.parse import parse_qs
            query = parse_qs(environ['QUERY_STRING'])

        app_id = query.get('app_id', [None])[0]
        total_reviews = int(query.get('total_reviews', [100])[0])
        sort = query.get('sort', ['mostRecent'])[0]

        # 日志记录
        print(f"Fetching reviews for App ID: {app_id}, Total Reviews: {total_reviews}, Sort: {sort}", file=sys.stderr)

        if not app_id:
            status = '400 Bad Request'
            headers = [('Content-Type', 'application/json')]
            start_response(status, headers)
            response = json.dumps({"error": "Missing 'app_id' parameter."})
            return [response.encode('utf-8')]

        app_reviews = get_app_reviews(app_id, total_reviews, sort)
        status = '200 OK'
        headers = [('Content-Type', 'application/json')]
        start_response(status, headers)
        response = json.dumps({"reviews": app_reviews})
        return [response.encode('utf-8')]

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        status = '500 Internal Server Error'
        headers = [('Content-Type', 'application/json')]
        start_response(status, headers)
        response = json.dumps({"error": str(e)})
        return [response.encode('utf-8')]