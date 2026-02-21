import subprocess
import os

files = [
    "backend/check_db.py",
    "backend/email_utils.py",
    "backend/main.py",
    "backend/models.py",
    "backend/requirements.txt",
    "backend/seed.py",
    "src/App.jsx",
    "src/components/home/InfoSections.jsx",
    "src/components/layout/Footer.jsx",
    "src/components/layout/Navbar.jsx",
    "src/index.css",
    "src/pages/AdminDashboard.jsx",
    "src/pages/Checkout.jsx",
    "src/pages/UserDashboard.jsx",
    "vite.config.js"
]

with open("diffs_utf8.txt", "w", encoding="utf-8") as f:
    for file in files:
        f.write(f"\n{'='*40}\nFILE: {file}\n{'='*40}\n")
        try:
            result = subprocess.run(['git', 'diff', file], capture_output=True, text=True, encoding="utf-8")
            if result.stdout:
                f.write(result.stdout)
            else:
                f.write("No diff output or new file not staged.\n")
        except Exception as e:
            f.write(f"Error: {e}\n")
