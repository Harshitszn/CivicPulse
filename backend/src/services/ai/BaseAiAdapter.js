/**
 * Base AI Adapter Interface
 * Defines the contract for all AI classification providers (NLP + Vision models).
 */
class BaseAiAdapter {
  /**
   * Classify a civic issue by text and/or image.
   * @param {Object} params
   * @param {string} [params.title]
   * @param {string} [params.description]
   * @param {string} [params.text]
   * @param {string} [params.imageUrl]
   * @returns {Promise<{
   *   category: string,
   *   requirement: string,
   *   priority: string,
   *   estimated_resolution_time: string,
   *   confidence: number,
   *   department?: string,
   *   urgencyScore?: number,
   *   issue?: string
   * }>}
   */
  async classify(params) {
    throw new Error('classify() must be implemented by concrete AI adapter');
  }

  getProviderName() {
    return 'base';
  }
}

module.exports = BaseAiAdapter;
