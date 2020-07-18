from fastapi import FastAPI, File, UploadFile, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.editing import syncToVideo

app = FastAPI()

app.mount('/templates', StaticFiles(directory='templates'), name='templates')
templates = Jinja2Templates(directory="templates")


@app.post("/uploaded/")
async def create_upload_files(request: Request, video: UploadFile = File(...), audio: UploadFile = File(...)):
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

    # TODO create a streaming response

    return templates.TemplateResponse('uploaded.html', {
            'request': request,
            "content": content,
            "heading": "You can stream the video below"
        })


@app.get("/")
async def root(request: Request):
    """Returns a form ready for submitting your video and audio to automatically sync them :D
    """

    response = templates.TemplateResponse('home.html', {
        'request': request,
        'greeting': 'Hello'
    })

    return response

