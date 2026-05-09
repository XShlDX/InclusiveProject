import os

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "..", "..", ".."))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
HTML_FILE_PATH = os.path.join(FRONTEND_DIR, "pages", "home", "index.html")

join_path = os.path.normpath(FRONTEND_DIR)

if not os.path.exists(FRONTEND_DIR):
    print(f"ОШИБКА: Папка не найдена по адресу {FRONTEND_DIR}")
else:
    print("Успех: Папка frontend доступна!")