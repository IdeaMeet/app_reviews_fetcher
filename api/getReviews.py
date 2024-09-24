# api/getReviews.py

import json

def handler(environ, start_response):
    try:
        status = '200 OK'
        headers = [('Content-Type', 'application/json')]
        start_response(status, headers)
        response = {"message": "Hello, World!"}
        return [json.dumps(response).encode('utf-8')]
    except Exception as e:
        status = '500 Internal Server Error'
        headers = [('Content-Type', 'application/json')]
        start_response(status, headers)
        response = {"error": str(e)}
        return [json.dumps(response).encode('utf-8')]