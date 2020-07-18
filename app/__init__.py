from fastapi import FastAPI, Form, File, UploadFile, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse
from typing import List
import json
from app.editing import syncToVideo

app = FastAPI()

app.mount('/templates', StaticFiles(directory='templates'), name='templates')
templates = Jinja2Templates(directory="templates")


@app.post("/uploaded")
async def create_upload_files(video: bytes = File(...), audio: bytes = File(...)):
    """
    :arg video is the video clip we edit by replacing the audio with the second argument, and syncing
    :arg audio is the better audio file we want to keep in the video
    """

    # we call a function for checking the delay, then we return the offset for each (one of them is 0)

    videoOffset, audioOffset = syncToVideo(video, audio)

    return json.dumps({
        'videoOffset': videoOffset,
        'audioOffset': audioOffset
    })
    # return JSONResponse(status_code=200, content={
    #     'videoOffset': videoOffset,
    #     'audioOffset': audioOffset
    # })


@app.get("/")
async def root(request: Request):
    """Returns a form ready for submitting your video and audio to automatically sync them :D
    """

    response = templates.TemplateResponse('home.html', {
        'request': request,
        'greeting': 'Edit smartly'
    })

    return response

