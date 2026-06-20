# BigQuery Release Notes Visualizer

A modern, responsive single-page web application to browse, filter, and search Google Cloud BigQuery release notes. It fetches the official Atom XML feed, parses it on the backend, categorizes updates, and presents them in an elegant, interactive dashboard.

---

## 🚀 Features

- **Segmented Categories**: Instead of viewing monolithic blocks of text, updates are split by their headers (e.g., *Features*, *Issues*, *Changed*) and displayed as individual cards.
- **In-Memory Caching**: Implements a robust caching mechanism on the backend (1-hour TTL) to guarantee fast page loads and avoid hitting rate limits.
- **Dynamic Refresh**: Allows users to bypass the cache and fetch the latest release notes on-demand.
- **Search & Filtering**: Search and filter updates instantly on the frontend by type, keyword, or date.
- **Error Resilience**: Gracefully falls back to the cache if the live Google Cloud feed is temporarily unavailable or timed out.

---

## 🛠️ Tech Stack

- **Backend**: Python, [Flask](https://flask.palletsprojects.com/), [Beautiful Soup 4](https://www.crummy.com/software/BeautifulSoup/) (for HTML parsing), XML ElementTree (for Atom feed parsing).
- **Frontend**: Vanilla CSS and Vanilla Javascript (dynamic API integration, DOM rendering, search filtering).

---

## 📂 Directory Structure

```text
bq-releases-notes/
├── app.py                # Main Flask backend application & API
├── requirements.txt      # Python dependencies
├── static/
│   ├── css/
│   │   └── style.css     # UI design & layout styles
│   └── js/
│       └── app.js        # Frontend interactions & rendering logic
└── templates/
    └── index.html        # Single Page application HTML template
```

---

## ⚙️ Setup & Installation

### 1. Prerequisites
Ensure you have **Python 3.8+** installed on your system.

### 2. Clone and Navigate
Clone the repository or navigate to the project directory:
```bash
cd bq-releases-notes
```

### 3. Install Dependencies
Install the required packages using `pip`:
```bash
pip install -r requirements.txt
```

### 4. Run the Application
Start the Flask development server:
```bash
python app.py
```

Open your browser and navigate to:
```text
http://127.0.0.1:5000/
```

---

## 🔌 API Endpoints

- **`GET /`**: Renders the main dashboard interface.
- **`GET /api/updates`**: Fetches the parsed updates.
  - **Query Parameters**:
    - `refresh=true`: Forces the backend to bypass cache and fetch a fresh copy of the Atom feed.
  - **JSON Response Format**:
    ```json
    {
      "status": "success",
      "last_updated": 1718872340.5,
      "updates": [
        {
          "id": "entry_0_0",
          "date": "June 18, 2026",
          "updated": "2026-06-18T12:00:00Z",
          "type": "Feature",
          "description_html": "<p>BigQuery now supports...</p>",
          "description_text": "BigQuery now supports...",
          "link": "https://cloud.google.com/bigquery/docs/release-notes"
        }
      ]
    }
    ```

---

## 📝 License

This project is licensed under the Apache 2.0 License. See the [LICENSE](file:///C:/Users/chl20/agy-cli-projects/bq-releases-notes/LICENSE) file for details.
