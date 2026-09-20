import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from '../middlewares/error-handler';

const uploadDirs = [
  'uploads/products',
  'uploads/payments',
  'uploads/rentals',
  'uploads/messages',
];

uploadDirs.forEach((dir) => {
  const fullPath = path.resolve(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    let folder = 'uploads/messages';
    if (file.fieldname === 'productImages') folder = 'uploads/products';
    else if (file.fieldname === 'proofImage') folder = 'uploads/payments';
    else if (file.fieldname === 'rentalImage') folder = 'uploads/rentals';
    
    cb(null, path.resolve(process.cwd(), folder));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueSuffix);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Format file tidak didukung. Gunakan JPEG, PNG, atau WebP', 400));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});
