const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const filesFolder = path.resolve(__dirname, "../../files");
const promptImagesFolder = path.resolve(filesFolder, "prompt_images");
const audioFilesFolder = path.resolve(filesFolder, "audio");

/**
 * Get the absolute path of a prompt's image on the disk.
 *
 * @param {*} promptId ID of the prompt whose image to get
 * @returns a string containing the absolute path of the specified prompt's image
 */
const getPromptImagePath = (promptId) => {
  return path.resolve(promptImagesFolder, path.normalize(`${promptId}.jpg`));
};

/**
 * Get the absolute path of a prompt's thumbnail on the disk.
 *
 * @param {*} promptId ID of the prompt whose thumbnail to get
 * @returns a string containing the absolute path of the specified prompt's thumbnail
 */
const getPromptThumbnailPath = (promptId) => {
  return path.resolve(
    promptImagesFolder,
    path.normalize(`${promptId}_thumbnail.jpg`)
  );
};

/**
 * Save or update an image associated with a prompt.
 *
 * @param {*} promptId ID of the prompt whose image to update
 * @param {*} imageData image data as a base64 encoded URI format string
 */
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

/**
 * Save an image buffer as a JPEG file. Apply any rotation metadata and scale the image
 * down to maximum specified dimensions if necessary.
 *
 * @param {*} imageBuffer input data representing the image as a buffer
 * @param {*} maxDimensions maximum image dimensions to allow, if larger then the image will be scaled to these
 * @param {*} filePath where to save the image file
 */
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

// Return the specified prompt's image (or thumbnail) as a jpeg file in data URI base64 format
const getPromptImage = async (promptId, thumbnail, withPrefixData = true) => {
  const filePath = thumbnail
    ? getPromptThumbnailPath(promptId)
    : getPromptImagePath(promptId);

  try {
    let base64ImageData = await fs.promises.readFile(filePath, {
      encoding: "base64",
    });

    if (withPrefixData) {
      base64ImageData = "data:image/jpeg;base64," + base64ImageData;
    }

    return base64ImageData;
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports = { updatePromptImage, getPromptImage };
