import multer from 'multer';

// Use memoryStorage for serverless / cloud deployments to avoid filesystem writes
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;