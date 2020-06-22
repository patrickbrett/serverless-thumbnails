const AWS = require("aws-sdk");
AWS.config.update({ region: "ap-southeast-2" });
const s3 = new AWS.S3();
const sizeOf = require("image-size");
const resizeImg = require("resize-img");
const { THUMBNAIL_SIZE } = require("./constants");

exports.handler = (event, context, callback) => {
  const srcBucket = event.Records[0].s3.bucket.name;
  const dstBucket = srcBucket;
  // Object key may have spaces or unicode non-ASCII characters.
  const srcKey = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, " ")
  );
  const dstKey = "thumbnail/" + srcKey.split("/")[1];

  s3.getObject(
    {
      Bucket: srcBucket,
      Key: srcKey,
    },
    async (err, data) => {
      const image = data.Body;

      const { width, height } = sizeOf(image);

      const { newWidth, newHeight } = (() => {
        if (width > height) {
          return {
            newWidth: THUMBNAIL_SIZE,
            newHeight: (THUMBNAIL_SIZE * height) / width,
          };
        } else {
          return {
            newWidth: (THUMBNAIL_SIZE * width) / height,
            newHeight: THUMBNAIL_SIZE,
          };
        }
      })();

      const resizedImage = await resizeImg(image, {
        width: newWidth,
        height: newHeight,
      });

      s3.putObject(
        {
          Bucket: dstBucket,
          Key: dstKey,
          Body: resizedImage,
          ContentType: "image/jpeg",
        },
        (err, data) => {
          callback(null, {
            statusCode: 200,
            isBase64Encoded: false,
          });
        }
      );
    }
  );
};
