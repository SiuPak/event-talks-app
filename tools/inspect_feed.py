import requests
import xml.etree.ElementTree as ET

url = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

try:
    print(f"Fetching {url}...")
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    response = requests.get(url, headers=headers, timeout=10)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        root = ET.fromstring(response.content)
        
        # Atom namespace
        namespace = {'atom': 'http://www.w3.org/2005/Atom'}
        
        # Print basic channel / feed info
        title_el = root.find('atom:title', namespace)
        title = title_el.text if title_el is not None else "None"
        print(f"Feed Title: {title}")
        
        entries = root.findall('atom:entry', namespace)
        print(f"Total entries found: {len(entries)}")
        
        if entries:
            first_entry = entries[0]
            print("\n--- First Entry Structure ---")
            
            entry_title_el = first_entry.find('atom:title', namespace)
            print(f"Title: {entry_title_el.text if entry_title_el is not None else 'None'}")
            
            updated_el = first_entry.find('atom:updated', namespace)
            print(f"Updated: {updated_el.text if updated_el is not None else 'None'}")
            
            id_el = first_entry.find('atom:id', namespace)
            print(f"ID: {id_el.text if id_el is not None else 'None'}")
            
            link_el = first_entry.find('atom:link', namespace)
            if link_el is not None:
                print(f"Link: {link_el.get('href')}")
            
            content_el = first_entry.find('atom:content', namespace)
            if content_el is not None:
                content_text = content_el.text or ""
                print(f"Content length: {len(content_text)}")
                print("Content sample (first 800 chars):")
                print(content_text[:800])
        else:
            print("No entries found.")
except Exception as e:
    import traceback
    print(f"Error occurred: {e}")
    traceback.print_exc()
