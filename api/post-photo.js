const { v4: uuidv4 } = require('uuid')
const AWS = require('aws-sdk');
const { BUCKET_NAME } = require('./constants');
AWS.config.update({ region: 'ap-southeast-2' })
const s3 = new AWS.S3();

exports.handler = async (event, context) => {
  const filename = uuidv4()

  const s3Params = {
    Bucket: BUCKET_NAME,
    Key: `full-size/${filename}.jpg`,
    ContentType: 'image/jpeg',
    Expires: 3600
  }

  const uploadUrl = s3.getSignedUrl('putObject', s3Params)

  return {
    statusCode: 200,
    isBase64Encoded: false,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ uploadUrl, filename })
  }
}