import re

with open("extracted_mhtml_text.html", "r", encoding="utf-8") as f:
    html = f.read()

keywords = ["Nazra", "Tajweed", "Skype", "female", "syllabus", "functional", "academy", "fees", "trial", "plan"]

for kw in keywords:
    matches = list(re.finditer(re.escape(kw), html, re.IGNORECASE))
    print(f"Keyword '{kw}': {len(matches)} matches")
    if len(matches) > 0:
        # Show context for the first match
        m = matches[0]
        start = max(0, m.start() - 100)
        end = min(len(html), m.end() + 200)
        ctx = re.sub(r'<[^>]+>', ' ', html[start:end])
        print(f"  First match context: {ctx[:200].strip().replace('\n', ' ')}")
