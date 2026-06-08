with open("extracted_mhtml_text.html", "r", encoding="utf-8") as f:
    html = f.read()

# Let's search for AlKareem_Quran_Institute_PRD.md in the HTML file
import re
matches = [m.start() for m in re.finditer(r'AlKareem_Quran_Institute_PRD\.md', html)]
print("Matches found at indices:", matches)

# Let's search for pre or code blocks in the HTML
# Claude artifacts are typically represented by a specific HTML structure
# or inside a <pre> or <code> or text area
# Let's write out chunks of 1000 characters around each match
for idx, m in enumerate(matches):
    start = max(0, m - 500)
    end = min(len(html), m + 1500)
    print(f"\n--- MATCH {idx} ---")
    print(html[start:end])
