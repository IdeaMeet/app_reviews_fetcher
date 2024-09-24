{
    "version": 2,
    "builds": [
      {
        "src": "api/**/*.py",
        "use": "@vercel/python"
      },
      {
        "src": "public/**",
        "use": "@vercel/static"
      }
    ],
    "routes": [
      {
        "src": "/api/(.*)",
        "dest": "/api/get_reviews.py"
      },
      {
        "src": "/(.*)",
        "dest": "/public/$1"
      }
    ],
    "env": {
      "PATH": "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
    }
  }