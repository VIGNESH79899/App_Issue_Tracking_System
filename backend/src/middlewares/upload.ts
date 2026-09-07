import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { env } from '../config/env.js';
import { ApiError } from './errorHandler.js';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), env.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage Configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Generate safe UUID random filename to prevent path traversal and collisions
    const randomName = crypto.randomUUID();
    const ext = path.extname(file.originalname).toLowerCase();
    // Sanitize extension
    const safeExt = ext.replace(/[^a-z0-9.]/g, '');
    cb(null, `${randomName}${safeExt}`);
  },
});

// File Filter (MIME Type Whitelist)
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/json',
  'application/zip',
  'application/x-zip-compressed',
];

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        `Invalid file type '${file.mimetype}'. Allowed types: images, PDF, text, CSV, JSON, ZIP.`
      )
    );
  }
};

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024, // MB limit
  },
  fileFilter,
});
