import email
import quopri

def extract_mhtml(mhtml_path, output_path):
    with open(mhtml_path, 'rb') as f:
        msg = email.message_from_binary_file(f)
    
    html_parts = []
    for part in msg.walk():
        content_type = part.get_content_type()
        if content_type == 'text/html':
            payload = part.get_payload(decode=True)
            if payload:
                html_parts.append(payload.decode('utf-8', errors='ignore'))
            else:
                # Quoted printable decoding if decode=True didn't work as expected
                raw = part.get_payload()
                if isinstance(raw, str):
                    decoded = quopri.decodestring(raw.encode('utf-8')).decode('utf-8', errors='ignore')
                    html_parts.append(decoded)
    
    # Merge and write to output
    with open(output_path, 'w', encoding='utf-8') as out:
        out.write('\n\n--- PART SPLIT ---\n\n'.join(html_parts))

if __name__ == '__main__':
    extract_mhtml(
        "C:\\Users\\User\\Downloads\\Competitor website analysis and PRD documentation - Claude.mhtml",
        "c:\\Users\\User\\Desktop\\Quran Academy\\AL Kareem Quran Institute\\extracted_mhtml_text.html"
    )
    print("Done")
