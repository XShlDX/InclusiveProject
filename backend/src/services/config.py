import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
HTML_FILE_PATH = os.path.join(BASE_DIR, "frontend", "pages", "home", "index.html")
join_path = os.path.join(HTML_FILE_PATH, "index.html")