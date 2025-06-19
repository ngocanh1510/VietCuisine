import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../configs/cloudinary.js';

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'avatars', // Thư mục trong Cloudinary để lưu ảnh
        allowed_formats: ['jpg', 'jpeg', 'png'], // Định dạng cho phép
    },
});

const upload = multer({ storage: storage });

export default upload;