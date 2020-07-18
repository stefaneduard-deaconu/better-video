from fastapi import FastAPI, File, UploadFile
from fastapi.responses import HTMLResponse

from templates import home as homeTemplate, uploaded as uploadedTemplate
from app.editing import syncToVideo

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

    # TODO create a streaming response

    return HTMLResponse(
        content=uploadedTemplate.render(content=content, heading="You can stream the video below:")
    )


@app.get("/")
async def root():
    """Returns a form ready for submitting your video and audio to automatically sync them :D
    """

    content = homeTemplate.render(greeting='Better Editing, Better Video ;)')
    response = HTMLResponse(content=content)

    return response

