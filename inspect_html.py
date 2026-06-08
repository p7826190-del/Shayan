import re

with open("extracted_mhtml_text.html", "r", encoding="utf-8") as f:
    html = f.read()

print("Length of html:", len(html))

# Search for pre tags (case insensitive)
pre_matches = list(re.finditer(r'<pre[^>]*>(.*?)</pre>', html, re.DOTALL | re.IGNORECASE))
print("Pre tags found via regex:", len(pre_matches))
for idx, m in enumerate(pre_matches[:10]):
    content = m.group(1)
    print(f"Pre [{idx}] length: {len(content)}")
    print(content[:200].replace('\n', ' '))
    with open(f"regex_pre_{idx}.txt", "w", encoding="utf-8") as out:
        out.write(content)

# Search for script tags
script_matches = list(re.finditer(r'<script[^>]*>(.*?)</script>', html, re.DOTALL | re.IGNORECASE))
print("Script tags found via regex:", len(script_matches))

# Also search for any JSON strings inside script tags or the whole html
# The Claude UI might contain the artifact data inside a JSON block (e.g. state, next_data, or similar)
# Let's search for "AlKareem_Quran_Institute_PRD" in the whole html
matches = list(re.finditer(r'AlKareem_Quran_Institute_PRD', html))
print("Matches for AlKareem_Quran_Institute_PRD:", len(matches))
for idx, m in enumerate(matches):
    start = max(0, m.start() - 1000)
    end = min(len(html), m.end() + 5000)
    print(f"Match [{idx}] context length: {end - start}")
    with open(f"match_context_{idx}.txt", "w", encoding="utf-8") as out:
        out.write(html[start:end])
