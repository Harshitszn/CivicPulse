/**
 * AI Service Layer
 * Abstracts AI provider interactions so providers can be swapped cleanly
 * without modifying business or controller logic.
 */
const DevAiAdapter = require('./DevAiAdapter');
const FastApiAiAdapter = require('./FastApiAiAdapter');
const logger = require('../../utils/logger');

class AiServiceLayer {
  constructor() {
    const provider = process.env.AI_PROVIDER || 'dev';
    if (provider === 'fastapi') {
      this.adapter = new FastApiAiAdapter();
    } else {
      this.adapter = new DevAiAdapter();
    }
    logger.info(`🤖 AI Service Layer initialized with adapter: [${this.adapter.getProviderName()}]`);
  }

  /**
   * Set custom adapter (useful for testing or runtime provider swapping)
   * @param {import('./BaseAiAdapter')} newAdapter
   */
  setAdapter(newAdapter) {
    this.adapter = newAdapter;
  }

  getAdapterName() {
    return this.adapter.getProviderName();
  }

  /**
   * Classify complaint text and/or image information.
   * Standard output contract:
   * {
   *   category: string,
   *   requirement: string,
   *   priority: string,
   *   estimated_resolution_time: string,
   *   confidence: number,
   *   department?: string,
   *   urgencyScore?: number,
   *   issue?: string
   * }
   */
  async classifyComplaint({ title = '', description = '', text = '', imageUrl = null }) {
    const result = await this.adapter.classify({
      title,
      description,
      text,
      imageUrl,
    });

    return {
      category: result.category || 'Other Municipal Issue',
      categorySlug: result.categorySlug || 'other',
      requirement: result.requirement || 'Inspection and resolution by relevant department',
      priority: (result.priority || 'medium').toLowerCase(),
      estimated_resolution_time: result.estimated_resolution_time || '2–4 Days',
      confidence: typeof result.confidence === 'number' ? result.confidence : 0.85,
      department: result.department || 'General Municipal Administration',
      urgencyScore: result.urgencyScore || 50,
      issue: result.issue || 'Civic Issue',
    };
  }
}

// Singleton instance
const aiService = new AiServiceLayer();

module.exports = aiService;
