// Envs
require('dotenv').config();

// Express
const express = require('express');
const app = express();

app.listen(process.env.PORT, () => {
  console.log('Listening on port ' + process.env.PORT);
});

// AWS Config
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const BUCKET = process.env.BUCKET;

aws.config.update(
  {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.ACCESS_SECRET,
    region: process.env.REGION
  }
);

const s3 = new aws.S3();

const upload = multer({
  storage: multerS3({
    bucket: BUCKET,
    s3: s3,
    acl: 'public-read',
    key: (req, file, callBack) => {
      callBack(null, file.originalname);
    }
  })
});

// Upload a new file to bucket
app.post(
  '/upload',
  upload.single("file"),
  (req, res) => {
    
    console.log(req.file);
  
    res.send(`File successfully uploaded to ${req.file.location} location`);
  }
);

// List bucket's files
app.get(
  '/list',
  async (req, res) => {
    const objectList = await s3.listObjectsV2(
      {
        Bucket: BUCKET
      }
    ).promise();

    const result = objectList.Contents.map(
      item => item.Key
    );

    res.send(result);
  }
);

// Download a file
app.get(
  '/download/:filename',
  async (req, res) => {
    let result = await s3.getObject(
      {
        Bucket: BUCKET,
        Key: req.params.filename
      }
    ).promise();

    res.send(result);
  }
);

// Delete a file
app.delete(
  '/delete/:filename',
  async (req, res) => {
    let result = await s3.deleteObject(
      {
        Bucket: BUCKET,
        Key: req.params.filename
      }
    ).promise();

    res.send('File deleted successfully');
  }
);