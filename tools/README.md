# Release Hub Scratch Tools

This directory contains standalone Python command-line utilities used during the initial development and debugging of the BigQuery Release Hub feed integration. 

You can use these tools to inspect the live Google Cloud Release Notes feed, audit formatting conventions, and test backend parsing parameters independently of the Flask server.

---

## 🛠️ Tools Directory & Usages

### 1. Feed Connection Inspector (`inspect_feed.py`)
* **File**: [inspect_feed.py](file:///C:/Users/chl20/agy-cli-projects/bq-releases-notes/tools/inspect_feed.py)
* **Description**: Verifies the XML feed connection, maps the official Atom namespace structure, and prints a metadata snapshot of the newest entry (title, timestamp, URI, and a raw content snippet).
* **Running the tool**:
  ```bash
  python tools/inspect_feed.py
  ```

---

### 2. Markup Layout Audit (`print_content.py`)
* **File**: [print_content.py](file:///C:/Users/chl20/agy-cli-projects/bq-releases-notes/tools/print_content.py)
* **Description**: Pulls the XML feed and outputs the unescaped raw HTML layout stored within the `<content>` tags of the first five entries. This is useful for auditing tag combinations (such as `<h3>`, `<p>`, and `<ul>`) created by the BigQuery release editors.
* **Running the tool**:
  ```bash
  python tools/print_content.py
  ```

---

### 3. Parsing Logic Emulator (`test_parser.py`)
* **File**: [test_parser.py](file:///C:/Users/chl20/agy-cli-projects/bq-releases-notes/tools/test_parser.py)
* **Description**: Runs the segmenting algorithm that splits XML day nodes into separate category cards (Features, Issues, Announcements) and outputs the results as a formatted JSON stream. This simulates the exact parser engine configured in the primary [app.py](file:///C:/Users/chl20/agy-cli-projects/bq-releases-notes/app.py) endpoint.
* **Running the tool**:
  ```bash
  python tools/test_parser.py
  ```
