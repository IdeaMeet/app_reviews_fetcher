# api/getReviews.py

import json

def handler(request, response):
    try:
        # 返回一个简单的 JSON 响应
        response.status_code = 200
        response.content_type = 'application/json'
        response.body = json.dumps({"message": "Hello, World!"})
    except Exception as e:
        response.status_code = 500
        response.content_type = 'application/json'
        response.body = json.dumps({"error": str(e)})