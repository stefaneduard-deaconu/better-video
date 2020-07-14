from typing import List
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.responses import HTMLResponse

app = FastAPI()


@app.post("/uploadfiles/")
async def create_upload_files(video: UploadFile = File(...), audio: UploadFile = File(...)):
    """
    :arg video is the video clip we edit by replacing the audio with the second argument, and syncing
    :arg audio is the better audio file we want to keep in the video
    """

    content = [
        {"video": video.filename,
         'content-type': video.content_type},

        {'audio': audio.filename,
         'content-type': audio.content_type}
    ]

    return content


@app.get("/")
async def main():

    content = """
<body>

<form action="/uploadfiles/" enctype="multipart/form-data" method="post">
<input name="video" type="file">
<input name="audio" type="file">
<input type="submit">
</form>
</body>
    """
    return HTMLResponse(content=content)

