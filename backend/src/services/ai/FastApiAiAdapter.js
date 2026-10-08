/**
 * FastAPI AI Microservice Adapter
 * Pre-configured HTTP client designed to integrate with FastAPI NLP (e.g. HuggingFace / Transformers)
 * and Computer Vision (e.g. ResNet / CLIP / YOLO) microservices.
 */
const http = require('http');
const https = require('https');
const BaseAiAdapter = require('./BaseAiAdapter');
const DevAiAdapter = require('./DevAiAdapter');
const { config } = require('../../config/env');
const logger = require('../../utils/logger');

class FastApiAiAdapter extends BaseAiAdapter {
  constructor() {
    super();
    this.fallbackAdapter = new DevAiAdapter();
    this.serviceUrl = config.ai.serviceUrl;
    this.apiKey = config.ai.apiKey;
    this.timeoutMs = 5000;
  }

  getProviderName() {
    return 'fastapi-microservice';
  }

  /**
   * Send payload to FastAPI service or fallback to Dev adapter on timeout/unavailability.
   */
  async classify(params) {
    if (!this.serviceUrl || this.serviceUrl === 'http://localhost:8000/api/classify') {
      // If service is default/local without live instance, safely use isolated dev adapter
      return this.fallbackAdapter.classify(params);
    }

    try {
      const payload = JSON.stringify({
        title: params.title || '',
        description: params.description || '',
        text: params.text || '',
        image_url: params.imageUrl || null,
      });

      const urlObj = new URL(this.serviceUrl);
      const isHttps = urlObj.protocol === 'https:';
      const requestModule = isHttps ? https : http;

      const response = await new Promise((resolve, reject) => {
        const req = requestModule.request(
          {
            protocol: urlObj.protocol,
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: `${urlObj.pathname}${urlObj.search}`,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(payload),
              ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
            },
            timeout: this.timeoutMs,
          },
          (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
              if (res.statusCode >= 200 && res.statusCode < 300) {
                try {
                  resolve(JSON.parse(data));
                } catch (e) {
                  reject(new Error(`FastAPI returned non-JSON response: ${data}`));
                }
              } else {
                reject(new Error(`FastAPI responded with status code ${res.statusCode}: ${data}`));
              }
            });
          }
        );

        req.on('timeout', () => {
          req.destroy(new Error(`FastAPI request timed out after ${this.timeoutMs}ms`));
        });

        req.on('error', reject);
        req.write(payload);
        req.end();
      });

      // Normalize schema matching expected CivicPulse format
      return {
        category: response.category || 'General',
        categorySlug: response.category_slug || response.category?.toLowerCase() || 'general',
        issue: response.issue || response.title || 'Civic Issue',
        requirement: response.requirement || 'Inspection and resolution by relevant department',
        priority: (response.priority || 'medium').toLowerCase(),
        estimated_resolution_time: response.estimated_resolution_time || response.estimatedResolution || '2–4 Days',
        department: response.department || 'General Municipal Administration',
        confidence: typeof response.confidence === 'number' ? response.confidence : 0.9,
        urgencyScore: response.urgency_score || 60,
      };
    } catch (err) {
      logger.warn(`FastAPI AI service unreachable (${err.message}). Falling back to DevAiAdapter.`);
      return this.fallbackAdapter.classify(params);
    }
  }
}

module.exports = FastApiAiAdapter;
