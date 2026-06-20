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
