const { Readable } = require('stream');
const cloudinary = require('../config/cloudinary');

/**
 * Uploads a file buffer (e.g. PDF Resume) to Cloudinary.
 *
 * @param {Buffer} buffer - File buffer
 * @param {object} [options] - Cloudinary upload options
 * @param {string} [options.folder='placetrack/resumes'] - Destination folder
 * @param {string} [options.publicId] - Optional public ID
 * @returns {Promise<{ secureUrl: string, publicId: string, format: string, bytes: number }>}
 */
const uploadResumeBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    // If running in test or without configured Cloudinary credentials, return a deterministic URL
    if (
      process.env.NODE_ENV === 'test' ||
      !process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME === ''
    ) {
      return resolve({
        secureUrl: `https://res.cloudinary.com/placetrack/raw/upload/v1234567890/placetrack/resumes/${options.publicId || 'resume_sample'}.pdf`,
        publicId: `placetrack/resumes/${options.publicId || 'resume_sample'}`,
        format: 'pdf',
        bytes: buffer ? buffer.length : 0
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'placetrack/resumes',
        public_id: options.publicId,
        resource_type: 'raw',
        format: 'pdf',
        use_filename: true,
        unique_filename: true,
        overwrite: true
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        return resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          bytes: result.bytes
        });
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};

module.exports = {
  uploadResumeBuffer
};
