import base64
png_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII="
with open('backend/test_upload.png','wb') as f:
    f.write(base64.b64decode(png_b64))
print('wrote backend/test_upload.png')
