const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const filesFolder = path.resolve(__dirname, "../../files");
const promptImagesFolder = path.resolve(filesFolder, "prompt_images");
const audioFilesFolder = path.resolve(filesFolder, "audio");

const getPromptImagePath = (promptId) => {
  return path.resolve(promptImagesFolder, path.normalize(`${promptId}.jpg`));
};

const getPromptThumbnailPath = (promptId) => {
  return path.resolve(
    promptImagesFolder,
    path.normalize(`${promptId}_thumbnail.jpg`)
  );
};

const updatePromptImage = async (promptId, imageData) => {
  const imagePath = getPromptImagePath(promptId);
  const thumbnailPath = getPromptThumbnailPath(promptId);

  if (imageData) {
    // decode data URI type image
    const innerImageData = imageData.split(";base64,")[1];
    let imageBuffer = Buffer.from(innerImageData, "base64");

    const imageMaxDimensions =
      parseInt(process.env.IMAGE_PROMPT_MAX_DIMENSIONS) || 1024;
    const thumbnailMaxDimensions =
      parseInt(process.env.IMAGE_PROMPT_MAX_THUMBNAIL_DIMENSIONS) || 128;

    // save main image
    await saveRotatedResizedJpeg(imageBuffer, imageMaxDimensions, imagePath);

    // save thumbnail
    await saveRotatedResizedJpeg(
      imageBuffer,
      thumbnailMaxDimensions,
      thumbnailPath
    );
  } else {
    try {
      // delete image if already exists and image data is null
      fs.unlinkSync(imagePath);
      fs.unlinkSync(thumbnailPath);
    } catch {}
  }
};

const saveRotatedResizedJpeg = async (imageBuffer, maxDimensions, filePath) => {
  await sharp(imageBuffer)
    .rotate() // apply any rotation from EXIF data
    .flatten({ background: { r: 255, g: 255, b: 255 } }) // turn transparent into white
    .resize({
      width: maxDimensions,
      height: maxDimensions,
      fit: sharp.fit.inside,
      withoutEnlargement: true,
    })
    .toFormat("jpeg")
    .toFile(filePath);
};

// Returns the specified prompt's image (or thumbnail) as a jpeg file in data URI base64 format
const getPromptImage = async (promptId, thumbnail) => {
  const filePath = thumbnail
    ? getPromptThumbnailPath(promptId)
    : getPromptImagePath(promptId);

  try {
    const base64ImageData = await fs.promises.readFile(filePath, {
      encoding: "base64",
    });

    return "data:image/jpeg;base64," + base64ImageData;
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports = { updatePromptImage, getPromptImage };
