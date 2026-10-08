/**
 * Dev AI Adapter
 * Isolated development adapter providing deterministic NLP & heuristic classifications
 * until the dedicated FastAPI + NLP/vision microservice is connected.
 */
const BaseAiAdapter = require('./BaseAiAdapter');

class DevAiAdapter extends BaseAiAdapter {
  getProviderName() {
    return 'dev-adapter';
  }

  /**
   * Deterministic issue classifier.
   * Analyzes title, description, and visual clues.
   */
  async classify({ title = '', description = '', text = '', imageUrl = null }) {
    const combinedText = `${title} ${description} ${text}`.toLowerCase();
    const imageHint = (imageUrl || '').toLowerCase();

    // 1. Roads & Infrastructure / Potholes
    if (
      combinedText.includes('pothole') ||
      combinedText.includes('road') ||
      combinedText.includes('crater') ||
      combinedText.includes('asphalt') ||
      combinedText.includes('tar') ||
      combinedText.includes('crack') ||
      combinedText.includes('speed breaker') ||
      imageHint.includes('pothole')
    ) {
      const isUrgent =
        combinedText.includes('accident') ||
        combinedText.includes('hazard') ||
        combinedText.includes('danger') ||
        combinedText.includes('deep');

      return {
        category: 'Roads & Infrastructure',
        categorySlug: 'roads',
        issue: 'Pothole & Surface Damage',
        requirement: isUrgent
          ? 'Urgent road surface milling, asphalt patch filling & safety barricading'
          : 'Standard road patchwork and resurfacing',
        priority: isUrgent ? 'high' : 'medium',
        estimated_resolution_time: isUrgent ? '1–3 Days' : '3–5 Days',
        department: 'Public Works Department',
        confidence: 0.94,
        urgencyScore: isUrgent ? 85 : 65,
      };
    }

    // 2. Water Supply & Pipe Bursts
    if (
      combinedText.includes('water') ||
      combinedText.includes('pipe') ||
      combinedText.includes('pipeline') ||
      combinedText.includes('leak') ||
      combinedText.includes('valve') ||
      combinedText.includes('contamination') ||
      combinedText.includes('tap') ||
      imageHint.includes('water')
    ) {
      const isBurst =
        combinedText.includes('burst') ||
        combinedText.includes('flood') ||
        combinedText.includes('pressure') ||
        combinedText.includes('gushing');

      return {
        category: 'Water Supply',
        categorySlug: 'water',
        issue: 'Pipeline Leakage / Water Supply Interruption',
        requirement: isBurst
          ? 'Emergency valve isolation and high-pressure pipe section replacement'
          : 'Pipeline inspection, valve sealing & pressure test',
        priority: isBurst ? 'urgent' : 'high',
        estimated_resolution_time: isBurst ? '24–48 Hours' : '2–4 Days',
        department: 'City Water Supply Board',
        confidence: 0.96,
        urgencyScore: isBurst ? 92 : 75,
      };
    }

    // 3. Garbage & Solid Waste
    if (
      combinedText.includes('garbage') ||
      combinedText.includes('waste') ||
      combinedText.includes('dump') ||
      combinedText.includes('trash') ||
      combinedText.includes('litter') ||
      combinedText.includes('odor') ||
      combinedText.includes('smell') ||
      imageHint.includes('garbage')
    ) {
      return {
        category: 'Garbage & Sanitation',
        categorySlug: 'garbage',
        issue: 'Solid Waste Accumulation',
        requirement: 'Dedicated compactor truck deployment and area bleaching sanitization',
        priority: 'high',
        estimated_resolution_time: '1–2 Days',
        department: 'Sanitation & Solid Waste Management',
        confidence: 0.95,
        urgencyScore: 78,
      };
    }

    // 4. Drainage & Stormwater
    if (
      combinedText.includes('drain') ||
      combinedText.includes('drainage') ||
      combinedText.includes('sewage') ||
      combinedText.includes('manhole') ||
      combinedText.includes('waterlog') ||
      combinedText.includes('clog') ||
      imageHint.includes('drain')
    ) {
      return {
        category: 'Stormwater & Drainage',
        categorySlug: 'drainage',
        issue: 'Drainage Blockage / Waterlogging',
        requirement: 'High-pressure suction jetting and drain inlet grate desilting',
        priority: 'high',
        estimated_resolution_time: '2–3 Days',
        department: 'Stormwater Drainage Department',
        confidence: 0.92,
        urgencyScore: 80,
      };
    }

    // 5. Street Lighting & Electrical
    if (
      combinedText.includes('light') ||
      combinedText.includes('lamp') ||
      combinedText.includes('electric') ||
      combinedText.includes('pole') ||
      combinedText.includes('wire') ||
      combinedText.includes('dark') ||
      combinedText.includes('blackout') ||
      imageHint.includes('light')
    ) {
      const isLiveWire = combinedText.includes('live wire') || combinedText.includes('spark');
      return {
        category: 'Street Lighting',
        categorySlug: 'streetlights',
        issue: isLiveWire ? 'Exposed Live Wire Hazard' : 'Non-functional Streetlight',
        requirement: isLiveWire
          ? 'Immediate power cutoff and emergency insulated cabling repair'
          : 'LED luminaire module replacement and timer check',
        priority: isLiveWire ? 'urgent' : 'medium',
        estimated_resolution_time: isLiveWire ? '12–24 Hours' : '1–3 Days',
        department: 'Electricity & Public Lighting Department',
        confidence: 0.93,
        urgencyScore: isLiveWire ? 95 : 68,
      };
    }

    // 6. Public Infrastructure / Footpaths / Parks
    if (
      combinedText.includes('footpath') ||
      combinedText.includes('pavement') ||
      combinedText.includes('bench') ||
      combinedText.includes('park') ||
      combinedText.includes('tree') ||
      combinedText.includes('barrier') ||
      combinedText.includes('sidewalk') ||
      imageHint.includes('infra') ||
      imageHint.includes('footpath')
    ) {
      return {
        category: 'Public Infrastructure',
        categorySlug: 'infra',
        issue: 'Pedestrian Infrastructure Damage',
        requirement: 'Paving tile realignment, barrier repair & pedestrian pathway clearing',
        priority: 'medium',
        estimated_resolution_time: '3–5 Days',
        department: 'Pedestrian Infrastructure Dept',
        confidence: 0.89,
        urgencyScore: 55,
      };
    }

    // Default Fallback
    return {
      category: 'Other Municipal Issue',
      categorySlug: 'other',
      issue: 'General Civic Issue',
      requirement: 'Municipal preliminary inspection and task assignment',
      priority: 'medium',
      estimated_resolution_time: '3–7 Days',
      department: 'General Municipal Administration',
      confidence: 0.82,
      urgencyScore: 50,
    };
  }
}

module.exports = DevAiAdapter;
