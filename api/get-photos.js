const AWS = require("aws-sdk");
const { BUCKET_NAME } = require("./constants");
AWS.config.update({ region: "ap-southeast-2" });
const s3ls = require("s3-ls");

exports.handler = async (event, context) => {
  const lister = s3ls({ bucket: BUCKET_NAME })

  const { files: fullSize } = await lister.ls("/full-size")
  const { files: thumbnail } = await lister.ls("/thumbnail")

  return {
    statusCode: 200,
    isBase64Encoded: false,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ fullSize, thumbnail }),
  };
};
