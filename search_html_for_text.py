import re

with open("extracted_mhtml_text.html", "r", encoding="utf-8") as f:
    html = f.read()

# Let's search for occurrences of "Al Kareem" or "AlKareem"
matches = list(re.finditer(r'Al\s*Kareem', html, re.IGNORECASE))
print(f"Found {len(matches)} matches for Al Kareem")

for idx, m in enumerate(matches):
    start = max(0, m.start() - 200)
    end = min(len(html), m.end() + 1000)
    print(f"\n--- MATCH {idx} (Index {m.start()}) ---")
    # Strip HTML tags from context to make it readable
    ctx = html[start:end]
    clean_ctx = re.sub(r'<[^>]+>', ' ', ctx)
    print(clean_ctx[:400].replace('\n', ' '))
