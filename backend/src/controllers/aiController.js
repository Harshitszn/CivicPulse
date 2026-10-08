/**
 * AI Controller
 * Exposes AI classification endpoint for frontend client and internal services.
 */
const AiService = require('../services/aiService');
const { ApiResponse } = require('../utils/ApiResponse');

const classify = async (req, res, next) => {
  try {
    const { title, description, text, imageUrl, image_url } = req.body;

    const classification = await AiService.classifyComplaint({
      title: title || '',
      description: description || '',
      text: text || '',
      imageUrl: imageUrl || image_url || null,
    });

    return ApiResponse.ok(res, classification, 'AI classification completed successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  classify,
};
