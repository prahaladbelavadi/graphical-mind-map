from fastapi import APIRouter, UploadFile, File
from app.models import UploadRequest

router = APIRouter()

@router.post("/")
async def upload_conversation(file: UploadFile = File(...)):
    pass 