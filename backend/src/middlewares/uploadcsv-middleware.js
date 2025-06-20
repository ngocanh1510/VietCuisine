import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'), // thư mục tạm
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const uploadcsv = multer({ storage });

export default uploadcsv;
