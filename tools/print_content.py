import requests
import xml.etree.ElementTree as ET

url = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}
response = requests.get(url, headers=headers)
root = ET.fromstring(response.content)
namespace = {'atom': 'http://www.w3.org/2005/Atom'}
entries = root.findall('atom:entry', namespace)

for i in range(min(5, len(entries))):
    entry = entries[i]
    title = entry.find('atom:title', namespace).text
    content = entry.find('atom:content', namespace).text
    print(f"\n=================== ENTRY {i}: {title} ===================")
    print(content)
