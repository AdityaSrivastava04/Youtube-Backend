import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
const uploadingVideo = multer({ 
    storage,
    // limits:{fileSize:10000000},
    // fileFilter:(_,file,cb)=>{
    //     const allowedTypes=['video/mp4', 'image/jpeg', 'image/png'];
    //     if(allowedTypes.includes(file.mimetype)){
    //         return cb (new Error("video file does not support"),false) 
    //     }
    //     cb(null,true)
    // },
})

export default uploadingVideo;