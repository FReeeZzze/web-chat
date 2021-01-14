import multer from 'multer';
import fs from 'fs-extra';

const createDir = (rootDir, filename, name_of_type, cb) => {
  const DIR = `${rootDir}/${filename}/${name_of_type}`;
  fs.mkdir(DIR, { recursive: false }, (err) => {
    if (err) {
      console.log('createDir err: ', err);
      throw err;
    }
    cb(null, DIR);
  });
};

let filename = '';
const rootDir = 'public/uploads';

const createDestination = (req, file, cb) => {
  try {
    const id = `f${(~~(Math.random() * 1e8)).toString(16)}`;
    filename = file.fieldname + '-' + Date.now() + id;

    fs.mkdir(`${rootDir}/${filename}`, { recursive: false }, (err) => {
      if (err) {
        console.log('mkdir-CreateDist: ', err.message);
        throw err;
      }
    });
    switch (file.mimetype) {
      case 'audio/mpeg': {
        createDir(rootDir, filename, 'mpeg', cb);
        break;
      }
      case 'audio/vnd.wave': {
        createDir(rootDir, filename, 'wave', cb);
        break;
      }
      default:
        cb(null, `${rootDir}/${filename}`);
    }
  } catch (err) {
    console.log('THIS ERR: ', err);
  }
};

const storageConfig = multer.diskStorage({
  destination: createDestination,
  filename: (req, file, cb) => {
    cb(null, filename + '.' + file.originalname.split('.').pop());
  },
});

const fileFilter = (req, file, cb) => {
  console.log(file);
  if (file.mimetype === 'audio/mpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const uploader = multer({ storage: storageConfig, fileFilter: fileFilter });

export default uploader;
