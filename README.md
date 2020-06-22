# Serverless Thumbnails

Serverless image upload & thumbnail generator for JuniorDev talk - https://juniordev.io

This repo demonstrates how a basic image upload + display can integrate with Lamdba, S3 and serverless framework to allow uploading images without having a constantly running backend.

It also adds in an automatic thumbnail generator, which runs every time a new image gets uploaded and scales down the image so that the largest dimension is 200px.

Setting this up yourself is a bit of a hassle (you need to set up CORS policy on the bucket as well as some other things), but if you want to give it a try feel free to reach out at https://pat.vc/connect and I will do my best to help :)

For those with some preexisting AWS knowledge here is the bucket policy:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::sls-thumb-test/*"
        }
    ]
}
```

And here is the CORS config:
```
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
<CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <MaxAgeSeconds>3000</MaxAgeSeconds>
    <AllowedHeader>*</AllowedHeader>
</CORSRule>
<CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>PUT</AllowedMethod>
    <MaxAgeSeconds>3000</MaxAgeSeconds>
    <AllowedHeader>*</AllowedHeader>
</CORSRule>
</CORSConfiguration>
```

These could probably be tightened but are fine for demo purposes.

If there is demand I will make a more detailed tutorial showing how I got the AWS environment set up as well.

Check it out live at https://pat.vc/thumbnails. All I ask is that you please don't use this as an image host or hotlink the images (I don't want to have to shut it down because of a billing alarm!)

I reserve the right to clear the stored photos at any time, and please keep it G rated... :)