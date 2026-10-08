/**
 * AI Classification & Triage Service
 * Delegates directly to the modular AI Service Layer (with support for Swappable Adapters).
 */
const aiServiceLayer = require('./ai');

class AiService {
  /**
   * Classify complaint text and/or image information.
   * Supports either (title, description) or object { title, description, text, imageUrl }.
   */
  static async classifyComplaint(titleOrParams, description) {
    if (typeof titleOrParams === 'object' && titleOrParams !== null) {
      return aiServiceLayer.classifyComplaint(titleOrParams);
    }
    return aiServiceLayer.classifyComplaint({
      title: titleOrParams || '',
      description: description || '',
    });
  }
}

module.exports = AiService;
