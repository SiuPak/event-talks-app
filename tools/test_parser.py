import requests
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
import json

url = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}
response = requests.get(url, headers=headers)
root = ET.fromstring(response.content)
namespace = {'atom': 'http://www.w3.org/2005/Atom'}
entries = root.findall('atom:entry', namespace)

parsed_updates = []

for entry_idx, entry in enumerate(entries[:5]):  # test with first 5
    date_str = entry.find('atom:title', namespace).text.strip()
    updated_str = entry.find('atom:updated', namespace).text.strip()
    link_el = entry.find('atom:link', namespace)
    link = link_el.get('href') if link_el is not None else ""
    id_str = entry.find('atom:id', namespace).text.strip()
    
    content_el = entry.find('atom:content', namespace)
    if content_el is None or not content_el.text:
        continue
        
    content_html = content_el.text
    soup = BeautifulSoup(content_html, 'html.parser')
    h3s = soup.find_all('h3')
    
    if not h3s:
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

print(json.dumps(parsed_updates[:3], indent=2))
