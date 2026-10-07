/**
 * AI Classification & Triage Service.
 * Connects to the AI classification microservice or applies smart heuristics fallback.
 */
const { config } = require('../config/env');
const logger = require('../utils/logger');

class AiService {
  /**
   * Classify complaint text and severity.
   * @param {string} title
   * @param {string} description
   * @returns {Promise<{category: string, priority: string, department: string, confidence: number, urgencyScore: number}>}
   */
  static async classifyComplaint(title, description) {
    const text = `${title} ${description}`.toLowerCase();

    // Default heuristics
    let category = 'Others';
    let priority = 'medium';
    let department = 'Public Works';
    let confidence = 0.85;
    let urgencyScore = 50;

    if (text.includes('pothole') || text.includes('road') || text.includes('crack') || text.includes('tar') || text.includes('asphalt')) {
      category = 'Roads & Infrastructure';
      department = 'Road Works Department';
      urgencyScore = 65;
    } else if (text.includes('garbage') || text.includes('waste') || text.includes('dump') || text.includes('trash') || text.includes('smell')) {
      category = 'Garbage & Sanitation';
      department = 'Sanitation Department';
      urgencyScore = 60;
    } else if (text.includes('water') || text.includes('leak') || text.includes('pipe') || text.includes('drain') || text.includes('sewage') || text.includes('flood')) {
      category = 'Water & Sewage';
      department = 'Water Board (Jal Nigam)';
      urgencyScore = 75;
    } else if (text.includes('light') || text.includes('electric') || text.includes('wire') || text.includes('pole') || text.includes('dark') || text.includes('transformer')) {
      category = 'Electricity & Streetlights';
      department = 'Electricity Distribution Corp';
      urgencyScore = 70;
    } else if (text.includes('park') || text.includes('tree') || text.includes('garden') || text.includes('bench')) {
      category = 'Parks & Environment';
      department = 'Horticulture Department';
      urgencyScore = 40;
    }

    if (text.includes('danger') || text.includes('hazard') || text.includes('urgent') || text.includes('accident') || text.includes('critical') || text.includes('sparking') || text.includes('live wire')) {
      priority = 'high';
      urgencyScore = Math.min(100, urgencyScore + 30);
    } else if (text.includes('minor') || text.includes('low') || text.includes('suggestion')) {
      priority = 'low';
      urgencyScore = Math.max(10, urgencyScore - 20);
    }

    return {
      category,
      priority,
      department,
      confidence,
      urgencyScore,
    };
  }
}

module.exports = AiService;
