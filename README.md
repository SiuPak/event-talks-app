# BigQuery Release Hub

A premium, interactive single-page dashboard application built with Python Flask and plain vanilla HTML, JavaScript, and CSS. The application parses the official Google Cloud BigQuery Release Notes feed, groups updates by date, and allows you to search, filter, and share specific releases on Twitter/X using a custom-designed composer modal.

---

## 📁 Project Directory Map

Here is a brief description of each file included in this repository:

### Core Application Code
* **[app.py](file:///C:/Users/chl20/agy-cli-projects/bq-releases-notes/app.py)**: The Python Flask backend router. Fetches the Google Cloud BigQuery XML feed, segments releases by day and update type (parsing `<h3>` tags), caches data in-memory for 1 hour to prevent rate-limiting, and exposes the `/api/updates` JSON API endpoint.
* **[templates/index.html](file:///C:/Users/chl20/agy-cli-projects/bq-releases-notes/templates/index.html)**: The frontend HTML template defining the semantic page structures, dashboard metric cards, controls (search input & filter pills), loading skeleton loaders, and the modal view markup for the X composer.
* **[static/css/style.css](file:///C:/Users/chl20/agy-cli-projects/bq-releases-notes/static/css/style.css)**: The stylesheet defining the dark-mode layout, glassmorphic card boundaries, color-coded tag pills, and animations (shimmer placeholders, rotating reload indicators, and modal scale transitions).
* **[static/js/app.js](file:///C:/Users/chl20/agy-cli-projects/bq-releases-notes/static/js/app.js)**: The client-side interactive logic. Manages client state, handles asynchronous GET queries, performs real-time keyword fuzzy matching, handles pill filtering, and operates the simulated X composer's SVG character progress limit.

### Configuration & Git
* **[requirements.txt](file:///C:/Users/chl20/agy-cli-projects/bq-releases-notes/requirements.txt)**: Contains the external Python package dependencies required for this project (`Flask`, `requests`, and `beautifulsoup4`).
* **[.gitignore](file:///C:/Users/chl20/agy-cli-projects/bq-releases-notes/.gitignore)**: Standard Git ignore configurations excluding compiled files (`__pycache__/`, `*.pyc`), environments (`venv/`), logs, and operating system clutter (`.DS_Store`).

### Project Artifacts & Documentation
* **[release_hub_summary.md](file:///C:/Users/chl20/agy-cli-projects/bq-releases-notes/release_hub_summary.md)**: A high-level overview summary of the project features, folder layout, and build steps.
* **[project_architecture_details.md](file:///C:/Users/chl20/agy-cli-projects/bq-releases-notes/project_architecture_details.md)**: A comprehensive deep-dive report tracing the architectural flow of the system. Includes server-side parser logic details, client-side circular meter math formulas, and sequence logic diagrams mapping the data fetching and tweeting flows.

### Developer Utility Tools
* **[tools/](file:///C:/Users/chl20/agy-cli-projects/bq-releases-notes/tools)**: A directory containing standalone debug scripts used to test feed connections ([inspect_feed.py](file:///C:/Users/chl20/agy-cli-projects/bq-releases-notes/tools/inspect_feed.py)), audit HTML tags ([print_content.py](file:///C:/Users/chl20/agy-cli-projects/bq-releases-notes/tools/print_content.py)), and validate parser JSON engines ([test_parser.py](file:///C:/Users/chl20/agy-cli-projects/bq-releases-notes/tools/test_parser.py)). Includes a dedicated [tools/README.md](file:///C:/Users/chl20/agy-cli-projects/bq-releases-notes/tools/README.md) guide.

---

## ⚡ Quick Start & Run Guide

To run this application locally:

1. **Install Dependencies**:
   Open a terminal in the project root folder and execute:
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the Flask Server**:
   Execute the application script:
   ```bash
   python app.py
   ```
   *The server will spin up on your localhost: `http://127.0.0.1:5000/` in debug mode.*

3. **Open the Dashboard**:
   Go to your web browser and navigate to **[http://127.0.0.1:5000/](http://127.0.0.1:5000/)** to explore release notes, refresh the feed, filter categories, or draft tweets.

---

## 🌐 Deployment Guides

### 1. Render Cloud Service (Web Service)
To deploy this project for free on Render:
1. Create a new **Web Service** on Render and connect your GitHub repository.
2. Configure the following settings during creation:
   * **Environment**: `Python`
   * **Branch**: `main`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `gunicorn app:app`
   * **Instance Type**: `Free`

---

### 2. Ubuntu 24.04 Cloud VPS (Gunicorn + Nginx)
To host the app in production on an Ubuntu VPS:

#### A. Install Dependencies
```bash
sudo apt update
sudo apt install -y python3 python3-pip python3-venv git nginx
```

#### B. Setup Project
```bash
sudo mkdir -p /var/www/event-talks-app
sudo chown -R $USER:$USER /var/www/event-talks-app
git clone https://github.com/SiuPak/event-talks-app.git /var/www/event-talks-app
cd /var/www/event-talks-app
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### C. Systemd Service Configuration
Create a service file:
```bash
sudo nano /etc/systemd/system/event-talks-app.service
```
Paste this configuration (replace `your_username` with your VPS username, e.g. `ubuntu` or `sipk`):
```ini
[Unit]
Description=Gunicorn instance to serve BigQuery Release Hub
After=network.target

[Service]
User=your_username
Group=www-data
WorkingDirectory=/var/www/event-talks-app
Environment="PATH=/var/www/event-talks-app/venv/bin"
Environment="HOME=/var/www/event-talks-app"
ExecStart=/var/www/event-talks-app/venv/bin/gunicorn --workers 3 --bind unix:app.sock -m 007 app:app

[Install]
WantedBy=multi-user.target
```
Enable and start the background service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable event-talks-app
sudo systemctl start event-talks-app
```

#### D. Nginx Reverse Proxy Config
Create an Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/event-talks-app
```
Paste this configuration (replace `your_domain_or_ip` with your domain name or server IP):
```nginx
server {
    listen 80;
    server_name your_domain_or_ip;

    location / {
        include proxy_params;
        proxy_pass http://unix:/var/www/event-talks-app/app.sock;
    }

    location /static/ {
        alias /var/www/event-talks-app/static/;
    }
}
```
Link and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/event-talks-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

