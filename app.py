from flask import Flask, jsonify, render_template, request
import requests
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
import time
from datetime import datetime

app = Flask(__name__)

# In-memory cache for feed data to avoid rate limiting and speed up initial page load
cache = {
    "updates": [],
    "last_updated": 0,
    "error": None
}

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

def fetch_and_parse_feed():
    """Fetches the official Google Cloud BigQuery release notes XML feed and parses it.
    Splits feed entries by header tags (h3) to categorize updates (Features, Issues, etc.)
    under individual date cards.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    response = requests.get(FEED_URL, headers=headers, timeout=15)
    response.raise_for_status()
    
    root = ET.fromstring(response.content)
    namespace = {'atom': 'http://www.w3.org/2005/Atom'}
    entries = root.findall('atom:entry', namespace)
    
    parsed_updates = []
    
    for entry_idx, entry in enumerate(entries):
        date_str = entry.find('atom:title', namespace).text.strip()
        updated_str = entry.find('atom:updated', namespace).text.strip()
        
        link_el = entry.find('atom:link', namespace)
        link = link_el.get('href') if link_el is not None else ""
        
        content_el = entry.find('atom:content', namespace)
        if content_el is None or not content_el.text:
            continue
            
        content_html = content_el.text
        soup = BeautifulSoup(content_html, 'html.parser')
        h3s = soup.find_all('h3')
        
        if not h3s:
            # If the entry has no h3 groupings, treat the whole entry as a single 'General' update
            parsed_updates.append({
                'id': f"entry_{entry_idx}_0",
                'date': date_str,
                'updated': updated_str,
                'type': 'General',
                'description_html': str(soup),
                'description_text': soup.get_text().strip(),
                'link': link
            })
        else:
            for h3_idx, h3 in enumerate(h3s):
                update_type = h3.get_text().strip()
                
                # Gather all HTML sibling elements until the next h3 tag
                description_parts = []
                sibling = h3.find_next_sibling()
                while sibling and sibling.name != 'h3':
                    description_parts.append(str(sibling))
                    sibling = sibling.find_next_sibling()
                
                description_html = "\n".join(description_parts)
                sibling_soup = BeautifulSoup(description_html, 'html.parser')
                description_text = sibling_soup.get_text().strip()
                
                parsed_updates.append({
                    'id': f"entry_{entry_idx}_{h3_idx}",
                    'date': date_str,
                    'updated': updated_str,
                    'type': update_type,
                    'description_html': description_html,
                    'description_text': description_text,
                    'link': link
                })
                
    return parsed_updates

@app.route('/')
def index():
    """Serves the main application single-page interface."""
    return render_template('index.html')

@app.route('/api/updates')
def get_updates():
    """Endpoint to return parsed release notes updates. Supports refreshing dynamically
    via query params. Cached data is used if fetched within the last hour.
    """
    force_refresh = request.args.get('refresh', 'false').lower() == 'true'
    now = time.time()
    
    # 1 hour cache duration (3600 seconds)
    cache_duration = 3600
    
    if force_refresh or not cache["updates"] or (now - cache["last_updated"] > cache_duration):
        try:
            updates = fetch_and_parse_feed()
            cache["updates"] = updates
            cache["last_updated"] = now
            cache["error"] = None
        except Exception as e:
            # Fall back to cache if available, but return a warning banner
            if cache["updates"]:
                return jsonify({
                    "updates": cache["updates"],
                    "last_updated": cache["last_updated"],
                    "warning": f"Failed to refresh from feed: {str(e)}. Displaying cached data.",
                    "status": "warning"
                })
            else:
                return jsonify({
                    "error": f"Failed to fetch live feed: {str(e)}",
                    "status": "error"
                }), 500
                
    return jsonify({
        "updates": cache["updates"],
        "last_updated": cache["last_updated"],
        "status": "success"
    })

if __name__ == '__main__':
    # Run the application on localhost
    app.run(debug=True, host='127.0.0.1', port=5000)
