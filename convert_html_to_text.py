from html.parser import HTMLParser
import re

class MLStrip(HTMLParser):
    def __init__(self):
        super().__init__()
        self.reset()
        self.strict = False
        self.convert_charrefs = True
        self.text = []
    def handle_data(self, d):
        self.text.append(d)
    def get_data(self):
        return ''.join(self.text)

def strip_tags(html):
    s = MLStrip()
    s.feed(html)
    return s.get_data()

with open("extracted_mhtml_text.html", "r", encoding="utf-8") as f:
    html_content = f.read()

# Remove style and script tags content before stripping
html_content = re.sub(r'<style[^>]*>.*?</style>', '', html_content, flags=re.DOTALL | re.IGNORECASE)
html_content = re.sub(r'<script[^>]*>.*?</script>', '', html_content, flags=re.DOTALL | re.IGNORECASE)

text = strip_tags(html_content)

# Clean up empty lines
clean_lines = []
for line in text.splitlines():
    line = line.strip()
    if line:
        clean_lines.append(line)

with open("extracted_text.txt", "w", encoding="utf-8") as f:
    f.write('\n'.join(clean_lines))

print("Done conversion")
