from html.parser import HTMLParser
import re

class PreTagExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.reset()
        self.convert_charrefs = True
        self.pre_count = 0
        self.in_pre = False
        self.current_pre = []
        self.pre_contents = []

    def handle_starttag(self, tag, attrs):
        if tag == 'pre':
            self.in_pre = True
            self.current_pre = []

    def handle_endtag(self, tag):
        if tag == 'pre' and self.in_pre:
            self.in_pre = False
            self.pre_contents.append(''.join(self.current_pre))
            self.pre_count += 1

    def handle_data(self, data):
        if self.in_pre:
            self.current_pre.append(data)

with open("extracted_mhtml_text.html", "r", encoding="utf-8") as f:
    html = f.read()

extractor = PreTagExtractor()
extractor.feed(html)

print(f"Found {len(extractor.pre_contents)} pre tags")

for idx, content in enumerate(extractor.pre_contents):
    print(f"[{idx}] Length: {len(content)}")
    print(content[:200].replace('\n', ' '))
    # Save content to file
    with open(f"pre_tag_{idx}.txt", "w", encoding="utf-8") as out:
        out.write(content)

# Also let's find any large script tags or json strings
# Let's extract script contents
class ScriptExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.reset()
        self.convert_charrefs = True
        self.in_script = False
        self.current_script = []
        self.scripts = []

    def handle_starttag(self, tag, attrs):
        if tag == 'script':
            self.in_script = True
            self.current_script = []

    def handle_endtag(self, tag):
        if tag == 'script' and self.in_script:
            self.in_script = False
            self.scripts.append(''.join(self.current_script))

    def handle_data(self, data):
        if self.in_script:
            self.current_script.append(data)

script_extractor = ScriptExtractor()
script_extractor.feed(html)
print(f"Found {len(script_extractor.scripts)} script tags")
for idx, script in enumerate(script_extractor.scripts):
    if len(script) > 1000:
        print(f"Script [{idx}] size: {len(script)}")
        if "AlKareem" in script or "Quran" in script:
            print("  Contains 'AlKareem' or 'Quran'")
            with open(f"script_tag_{idx}.js", "w", encoding="utf-8") as out:
                out.write(script)
