import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../configs/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');

    return {
      folder: isVideo ? 'videos' : 'avatars', // tuỳ folder theo loại file
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: ['mp4', 'mov', 'avi','jpg', 'jpeg', 'png'],
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

const upload = multer({ storage });

export default upload;
