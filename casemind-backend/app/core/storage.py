import os
import uuid
import aiofiles
from abc import ABC, abstractmethod

class StorageProvider(ABC):
    @abstractmethod
    async def save_file(self, file_content: bytes, filename: str) -> str:
        """Saves a file and returns its storage path or URL."""
        pass

    @abstractmethod
    async def delete_file(self, filepath: str) -> bool:
        """Deletes a file by its storage path or URL."""
        pass

class LocalStorageProvider(StorageProvider):
    def __init__(self, upload_dir: str = "uploads"):
        self.upload_dir = upload_dir
        os.makedirs(self.upload_dir, exist_ok=True)

    async def save_file(self, file_content: bytes, filename: str) -> str:
        # Generate a unique safe filename to prevent overwrites or path traversal
        ext = filename.split(".")[-1] if "." in filename else ""
        unique_name = f"{uuid.uuid4().hex}.{ext}" if ext else uuid.uuid4().hex
        filepath = os.path.join(self.upload_dir, unique_name)
        
        async with aiofiles.open(filepath, 'wb') as out_file:
            await out_file.write(file_content)
            
        return filepath

    async def delete_file(self, filepath: str) -> bool:
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
                return True
            return False
        except Exception:
            return False

# Initialize the active storage provider
# Easily swappable for S3StorageProvider in the future
storage = LocalStorageProvider()
