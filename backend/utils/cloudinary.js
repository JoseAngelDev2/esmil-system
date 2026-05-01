const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getCloudinaryPublicId(url) {
  if (!url || !url.includes("res.cloudinary.com")) return null;

  try {
    const { pathname } = new URL(url);
    const uploadIndex = pathname.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    const pathAfterUpload = pathname.slice(uploadIndex + "/upload/".length);
    const withoutVersion = pathAfterUpload.replace(/^v\d+\//, "");
    return withoutVersion.replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
}

async function destroyCloudinaryImage(url) {
  const publicId = getCloudinaryPublicId(url);
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
}

module.exports = {
  cloudinary,
  destroyCloudinaryImage,
};
