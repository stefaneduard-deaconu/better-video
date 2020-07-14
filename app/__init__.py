from typing import List
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.responses import HTMLResponse

from templates import home as homeTemplate, uploaded as uploadedTemplate
from jinja2 import Template

app = FastAPI()


@app.post("/uploaded/")
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

    return HTMLResponse(
        content=uploadedTemplate.render(content=content)
    )


@app.get("/")
async def root():
    print(homeTemplate.render(greeting='Welcome back'), type(homeTemplate.render(greeting='Welcome back')), flush=True)

    content = homeTemplate.render(greeting='Welcome back')
    response = HTMLResponse(content=content)

    return response

