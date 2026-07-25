from fastapi import UploadFile, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime, timezone
from app.core.storage import storage
from app.api.documents.schema import DocumentResponse
from typing import List

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg"
}

class DocumentService:
    @staticmethod
    def _map_mongo_to_response(doc: dict) -> DocumentResponse:
        doc["id"] = str(doc["_id"])
        if isinstance(doc.get("created_at"), str):
            doc["created_at"] = datetime.fromisoformat(doc["created_at"].replace("Z", "+00:00"))
        return DocumentResponse(**doc)

    @staticmethod
    async def upload_document(
        file: UploadFile, 
        case_id: str, 
        user_id: str, 
        db: AsyncIOMotorDatabase
    ) -> DocumentResponse:
        
        # Validate MIME type
        if file.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type. Allowed types: PDF, DOCX, PNG, JPEG."
            )

        # Read file into memory (for now, assume files are reasonably sized)
        # For huge files, we would stream directly to storage
        content = await file.read()
        size = len(content)
        
        # Save physical file
        try:
            filepath = await storage.save_file(content, file.filename)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save physical file: {str(e)}"
            )

        # Store metadata in DB
        doc_metadata = {
            "case_id": case_id,
            "filename": file.filename,
            "mime_type": file.content_type,
            "size": size,
            "uploaded_by": user_id,
            "filepath": filepath,
            "created_at": datetime.now(timezone.utc)
        }

        result = await db["documents"].insert_one(doc_metadata)
        doc_metadata["_id"] = result.inserted_id

        return DocumentService._map_mongo_to_response(doc_metadata)

    @staticmethod
    async def get_documents(user_id: str, case_id: str, db: AsyncIOMotorDatabase) -> List[DocumentResponse]:
        query = {"uploaded_by": user_id}
        if case_id:
            query["case_id"] = case_id
            
        cursor = db["documents"].find(query).sort("created_at", -1)
        documents = []
        async for doc in cursor:
            documents.append(DocumentService._map_mongo_to_response(doc))
            
        return documents

    @staticmethod
    async def delete_document(document_id: str, user_id: str, db: AsyncIOMotorDatabase) -> bool:
        if not ObjectId.is_valid(document_id):
            return False

        # Find metadata to get filepath
        query = {"_id": ObjectId(document_id), "uploaded_by": user_id}
        doc_metadata = await db["documents"].find_one(query)
        
        if not doc_metadata:
            return False

        # Delete physical file
        filepath = doc_metadata.get("filepath")
        if filepath:
            await storage.delete_file(filepath)
            
        # Delete DB record
        result = await db["documents"].delete_one(query)
        return result.deleted_count > 0
