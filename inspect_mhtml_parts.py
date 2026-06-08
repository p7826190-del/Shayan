import email

mhtml_path = "C:\\Users\\User\\Downloads\\Competitor website analysis and PRD documentation - Claude.mhtml"
with open(mhtml_path, 'rb') as f:
    msg = email.message_from_binary_file(f)

print(f"Subject: {msg.get('Subject')}")
print(f"Content-Type: {msg.get_content_type()}")
print("Parts list:")

for i, part in enumerate(msg.walk()):
    content_type = part.get_content_type()
    filename = part.get_filename()
    loc = part.get('Content-Location')
    payload = part.get_payload()
    size = len(payload) if payload else 0
    print(f"[{i}] Type: {content_type}, Filename: {filename}, Location: {loc}, Size: {size}")
