import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../configs/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const mimetype = file.mimetype;
    const originalName = file.originalname;

    // Xác định loại file
    const isVideo = mimetype.startsWith('video/');
    const isImage = mimetype.startsWith('image/');
    const isExcel = /\.(xlsx|xls|csv)$/i.test(originalName);

    let folder = 'others';
    let resource_type = 'auto'; // để Cloudinary tự đoán nếu không rõ

    if (isImage) {
      folder = 'avatars';
      resource_type = 'image';
    } else if (isVideo) {
      folder = 'videos';
      resource_type = 'video';
    } else if (isExcel) {
      folder = 'excels';
      resource_type = 'raw';
    }

    return {
      folder,
      resource_type,
      allowed_formats: ['jpg', 'jpeg', 'png', 'mp4', 'mov', 'webp', 'avi', 'xlsx', 'csv'],
      public_id: `${Date.now()}-${originalName.split('.')[0]}`,
    };
  },
});

const upload = multer({ storage });

export default upload;
