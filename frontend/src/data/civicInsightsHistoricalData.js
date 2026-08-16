/**
 * Prototype Historical Dataset for Civic Insights
 * 
 * IMPORTANT NOTICE:
 * This dataset represents prototype/demo data for college-round demonstration.
 * All historical figures are explicitly marked as "Prototype/Demo Data" and do not
 * represent official government ratings or verified municipal records.
 * 
 * Keeps data separate from UI components for future real API integration.
 */

export const PROTOTYPE_DATA_LABEL = "Prototype/Demo Data";
export const IS_PROTOTYPE_DATA = true;

export const PROTOTYPE_HISTORICAL_DATA = {
  // Pincode 400064: Malad West (Ward 47 · P/North Ward)
  '400064': [
    {
      year: '2022',
      total: 410,
      resolved: 217,
      pending: 121,
      inProgress: 72,
      resolutionRate: 53,
      avgResolutionTime: 14.8,
      highPriority: 86,
      majorCategory: 'Roads & Potholes',
      majorCategoryEmoji: '🛣️',
      majorCategoryShare: '36%',
      outcomeTrend: 'stable',
      neutralSummary: [
        'Initial observation year for historical recording in Malad West.',
        'Major service category: Roads & Potholes (36% of local reports).',
        'Resolution rate recorded at 53%.',
        'Average resolution time recorded at 14.8 days.',
      ],
      services: {
        roads:    { total: 148, resolved: 76, pending: 42, inProgress: 30, resolutionRate: 51, avgResolutionTime: 16.2 },
        garbage:  { total: 94,  resolved: 56, pending: 24, inProgress: 14, resolutionRate: 60, avgResolutionTime: 11.5 },
        water:    { total: 72,  resolved: 38, pending: 22, inProgress: 12, resolutionRate: 53, avgResolutionTime: 14.1 },
        drainage: { total: 58,  resolved: 29, pending: 19, inProgress: 10, resolutionRate: 50, avgResolutionTime: 17.5 },
        lighting: { total: 38,  resolved: 24, pending: 9,  inProgress: 5,  resolutionRate: 63, avgResolutionTime: 9.8  },
      },
    },
    {
      year: '2023',
      total: 470,
      resolved: 287,
      pending: 112,
      inProgress: 71,
      resolutionRate: 61,
      avgResolutionTime: 12.3,
      highPriority: 94,
      majorCategory: 'Water Supply',
      majorCategoryEmoji: '💧',
      majorCategoryShare: '32%',
      outcomeTrend: 'improving',
      neutralSummary: [
        'Resolution rate increased from 53% to 61% (+8% vs 2022).',
        'Average resolution time decreased from 14.8d to 12.3d (2.5 days faster).',
        'Complaint volume increased from 410 to 470 (+60 complaints).',
        'Major service category: Water Supply (32% of annual volume).',
      ],
      services: {
        roads:    { total: 152, resolved: 91,  pending: 36, inProgress: 25, resolutionRate: 60, avgResolutionTime: 13.5 },
        garbage:  { total: 112, resolved: 73,  pending: 24, inProgress: 15, resolutionRate: 65, avgResolutionTime: 9.4  },
        water:    { total: 104, resolved: 62,  pending: 26, inProgress: 16, resolutionRate: 60, avgResolutionTime: 11.8 },
        drainage: { total: 64,  resolved: 36,  pending: 17, inProgress: 11, resolutionRate: 56, avgResolutionTime: 15.0 },
        lighting: { total: 38,  resolved: 25,  pending: 9,  inProgress: 4,  resolutionRate: 66, avgResolutionTime: 8.2  },
      },
    },
    {
      year: '2024',
      total: 530,
      resolved: 366,
      pending: 98,
      inProgress: 66,
      resolutionRate: 69,
      avgResolutionTime: 9.6,
      highPriority: 102,
      majorCategory: 'Drainage & Stormwater',
      majorCategoryEmoji: '🌊',
      majorCategoryShare: '29%',
      outcomeTrend: 'improving',
      neutralSummary: [
        'Resolution rate increased from 61% to 69% (+8% vs 2023).',
        'Average resolution time decreased from 12.3d to 9.6d (2.7 days faster).',
        'Complaint volume increased from 470 to 530 (+60 complaints).',
        'Major service category: Drainage & Stormwater (29% of annual volume).',
      ],
      services: {
        roads:    { total: 160, resolved: 107, pending: 32, inProgress: 21, resolutionRate: 67, avgResolutionTime: 10.4 },
        garbage:  { total: 126, resolved: 91,  pending: 22, inProgress: 13, resolutionRate: 72, avgResolutionTime: 7.2  },
        water:    { total: 110, resolved: 76,  pending: 21, inProgress: 13, resolutionRate: 69, avgResolutionTime: 9.1  },
        drainage: { total: 86,  resolved: 56,  pending: 18, inProgress: 12, resolutionRate: 65, avgResolutionTime: 12.2 },
        lighting: { total: 48,  resolved: 36,  pending: 5,  inProgress: 7,  resolutionRate: 75, avgResolutionTime: 6.0  },
      },
    },
    {
      year: '2025',
      total: 585,
      resolved: 450,
      pending: 82,
      inProgress: 53,
      resolutionRate: 77,
      avgResolutionTime: 7.4,
      highPriority: 110,
      majorCategory: 'Sanitation & Waste',
      majorCategoryEmoji: '🗑️',
      majorCategoryShare: '34%',
      outcomeTrend: 'improving',
      neutralSummary: [
        'Resolution rate increased from 69% to 77% (+8% vs 2024).',
        'Average resolution time decreased from 9.6d to 7.4d (2.2 days faster).',
        'Complaint volume increased from 530 to 585 (+55 complaints).',
        'Major service category: Sanitation & Waste (34% of annual volume).',
      ],
      services: {
        roads:    { total: 172, resolved: 129, pending: 26, inProgress: 17, resolutionRate: 75, avgResolutionTime: 8.1 },
        garbage:  { total: 154, resolved: 123, pending: 19, inProgress: 12, resolutionRate: 80, avgResolutionTime: 5.5 },
        water:    { total: 118, resolved: 91,  pending: 17, inProgress: 10, resolutionRate: 77, avgResolutionTime: 7.0 },
        drainage: { total: 88,  resolved: 63,  pending: 15, inProgress: 10, resolutionRate: 72, avgResolutionTime: 9.4 },
        lighting: { total: 53,  resolved: 44,  pending: 5,  inProgress: 4,  resolutionRate: 83, avgResolutionTime: 4.2 },
      },
    },
    {
      year: '2026',
      total: 630,
      resolved: 529,
      pending: 63,
      inProgress: 38,
      resolutionRate: 84,
      avgResolutionTime: 5.6,
      highPriority: 118,
      majorCategory: 'Roads & Potholes',
      majorCategoryEmoji: '🛣️',
      majorCategoryShare: '31%',
      outcomeTrend: 'improving',
      neutralSummary: [
        'Resolution rate increased from 77% to 84% (+7% vs 2025).',
        'Average resolution time decreased from 7.4d to 5.6d (1.8 days faster).',
        'Complaint volume increased from 585 to 630 (+45 complaints).',
        'Major service category: Roads & Potholes (31% of annual volume).',
      ],
      services: {
        roads:    { total: 195, resolved: 156, pending: 24, inProgress: 15, resolutionRate: 80, avgResolutionTime: 6.2 },
        garbage:  { total: 168, resolved: 143, pending: 15, inProgress: 10, resolutionRate: 85, avgResolutionTime: 3.8 },
        water:    { total: 124, resolved: 102, pending: 14, inProgress: 8,  resolutionRate: 82, avgResolutionTime: 5.1 },
        drainage: { total: 85,  resolved: 66,  pending: 11, inProgress: 8,  resolutionRate: 78, avgResolutionTime: 7.3 },
        lighting: { total: 58,  resolved: 52,  pending: 4,  inProgress: 2,  resolutionRate: 90, avgResolutionTime: 2.9 },
      },
    },
  ],

  // Pincode 400067: Kandivali West (Ward 31 · R/South Ward)
  '400067': [
    {
      year: '2022',
      total: 390,
      resolved: 215,
      pending: 115,
      inProgress: 60,
      resolutionRate: 55,
      avgResolutionTime: 13.9,
      highPriority: 78,
      majorCategory: 'Water Supply',
      majorCategoryEmoji: '💧',
      majorCategoryShare: '34%',
      outcomeTrend: 'stable',
      neutralSummary: [
        'Initial observation year for historical recording in Kandivali West.',
        'Major service category: Water Supply (34% of local reports).',
        'Resolution rate recorded at 55%.',
        'Average resolution time recorded at 13.9 days.',
      ],
      services: {
        roads:    { total: 120, resolved: 64, pending: 36, inProgress: 20, resolutionRate: 53, avgResolutionTime: 15.0 },
        garbage:  { total: 90,  resolved: 54, pending: 23, inProgress: 13, resolutionRate: 60, avgResolutionTime: 10.8 },
        water:    { total: 105, resolved: 58, pending: 30, inProgress: 17, resolutionRate: 55, avgResolutionTime: 13.2 },
        drainage: { total: 45,  resolved: 23, pending: 15, inProgress: 7,  resolutionRate: 51, avgResolutionTime: 16.8 },
        lighting: { total: 30,  resolved: 16, pending: 9,  inProgress: 5,  resolutionRate: 53, avgResolutionTime: 11.2 },
      },
    },
    {
      year: '2023',
      total: 445,
      resolved: 280,
      pending: 105,
      inProgress: 60,
      resolutionRate: 63,
      avgResolutionTime: 11.8,
      highPriority: 86,
      majorCategory: 'Roads & Potholes',
      majorCategoryEmoji: '🛣️',
      majorCategoryShare: '31%',
      outcomeTrend: 'improving',
      neutralSummary: [
        'Resolution rate increased from 55% to 63% (+8% vs 2022).',
        'Average resolution time decreased from 13.9d to 11.8d (2.1 days faster).',
        'Complaint volume increased from 390 to 445 (+55 complaints).',
        'Major service category: Roads & Potholes (31% of annual volume).',
      ],
      services: {
        roads:    { total: 138, resolved: 86,  pending: 32, inProgress: 20, resolutionRate: 62, avgResolutionTime: 12.8 },
        garbage:  { total: 105, resolved: 70,  pending: 22, inProgress: 13, resolutionRate: 67, avgResolutionTime: 8.9  },
        water:    { total: 112, resolved: 69,  pending: 27, inProgress: 16, resolutionRate: 62, avgResolutionTime: 11.0 },
        drainage: { total: 55,  resolved: 33,  pending: 14, inProgress: 8,  resolutionRate: 60, avgResolutionTime: 14.5 },
        lighting: { total: 35,  resolved: 22,  pending: 8,  inProgress: 5,  resolutionRate: 63, avgResolutionTime: 9.0  },
      },
    },
    {
      year: '2024',
      total: 505,
      resolved: 359,
      pending: 91,
      inProgress: 55,
      resolutionRate: 71,
      avgResolutionTime: 9.2,
      highPriority: 95,
      majorCategory: 'Sanitation & Waste',
      majorCategoryEmoji: '🗑️',
      majorCategoryShare: '30%',
      outcomeTrend: 'improving',
      neutralSummary: [
        'Resolution rate increased from 63% to 71% (+8% vs 2023).',
        'Average resolution time decreased from 11.8d to 9.2d (2.6 days faster).',
        'Complaint volume increased from 445 to 505 (+60 complaints).',
        'Major service category: Sanitation & Waste (30% of annual volume).',
      ],
      services: {
        roads:    { total: 150, resolved: 104, pending: 28, inProgress: 18, resolutionRate: 69, avgResolutionTime: 9.8 },
        garbage:  { total: 125, resolved: 94,  pending: 19, inProgress: 12, resolutionRate: 75, avgResolutionTime: 6.8 },
        water:    { total: 120, resolved: 85,  pending: 22, inProgress: 13, resolutionRate: 71, avgResolutionTime: 8.7 },
        drainage: { total: 68,  resolved: 46,  pending: 14, inProgress: 8,  resolutionRate: 68, avgResolutionTime: 11.5 },
        lighting: { total: 42,  resolved: 30,  pending: 8,  inProgress: 4,  resolutionRate: 71, avgResolutionTime: 6.4 },
      },
    },
    {
      year: '2025',
      total: 560,
      resolved: 437,
      pending: 75,
      inProgress: 48,
      resolutionRate: 78,
      avgResolutionTime: 7.1,
      highPriority: 104,
      majorCategory: 'Water Supply',
      majorCategoryEmoji: '💧',
      majorCategoryShare: '28%',
      outcomeTrend: 'improving',
      neutralSummary: [
        'Resolution rate increased from 71% to 78% (+7% vs 2024).',
        'Average resolution time decreased from 9.2d to 7.1d (2.1 days faster).',
        'Complaint volume increased from 505 to 560 (+55 complaints).',
        'Major service category: Water Supply (28% of annual volume).',
      ],
      services: {
        roads:    { total: 165, resolved: 125, pending: 25, inProgress: 15, resolutionRate: 76, avgResolutionTime: 7.5 },
        garbage:  { total: 140, resolved: 115, pending: 15, inProgress: 10, resolutionRate: 82, avgResolutionTime: 5.0 },
        water:    { total: 135, resolved: 105, pending: 18, inProgress: 12, resolutionRate: 78, avgResolutionTime: 6.8 },
        drainage: { total: 72,  resolved: 54,  pending: 11, inProgress: 7,  resolutionRate: 75, avgResolutionTime: 8.9 },
        lighting: { total: 48,  resolved: 38,  pending: 6,  inProgress: 4,  resolutionRate: 79, avgResolutionTime: 4.8 },
      },
    },
    {
      year: '2026',
      total: 610,
      resolved: 518,
      pending: 56,
      inProgress: 36,
      resolutionRate: 85,
      avgResolutionTime: 5.2,
      highPriority: 112,
      majorCategory: 'Garbage Collection',
      majorCategoryEmoji: '🗑️',
      majorCategoryShare: '32%',
      outcomeTrend: 'improving',
      neutralSummary: [
        'Resolution rate increased from 78% to 85% (+7% vs 2025).',
        'Average resolution time decreased from 7.1d to 5.2d (1.9 days faster).',
        'Complaint volume increased from 560 to 610 (+50 complaints).',
        'Major service category: Garbage Collection (32% of annual volume).',
      ],
      services: {
        roads:    { total: 180, resolved: 148, pending: 20, inProgress: 12, resolutionRate: 82, avgResolutionTime: 5.8 },
        garbage:  { total: 165, resolved: 145, pending: 12, inProgress: 8,  resolutionRate: 88, avgResolutionTime: 3.2 },
        water:    { total: 138, resolved: 116, pending: 14, inProgress: 8,  resolutionRate: 84, avgResolutionTime: 4.9 },
        drainage: { total: 75,  resolved: 60,  pending: 9,  inProgress: 6,  resolutionRate: 80, avgResolutionTime: 6.8 },
        lighting: { total: 52,  resolved: 49,  pending: 1,  inProgress: 2,  resolutionRate: 94, avgResolutionTime: 2.2 },
      },
    },
  ],

  // Pincode 400076: Powai (Ward 12 · S Ward)
  '400076': [
    {
      year: '2022',
      total: 425,
      resolved: 247,
      pending: 118,
      inProgress: 60,
      resolutionRate: 58,
      avgResolutionTime: 12.5,
      highPriority: 90,
      majorCategory: 'Drainage & Stormwater',
      majorCategoryEmoji: '🌊',
      majorCategoryShare: '35%',
      outcomeTrend: 'stable',
      neutralSummary: [
        'Initial observation year for historical recording in Powai.',
        'Major service category: Drainage & Stormwater (35% of local reports).',
        'Resolution rate recorded at 58%.',
        'Average resolution time recorded at 12.5 days.',
      ],
      services: {
        roads:    { total: 115, resolved: 63, pending: 32, inProgress: 20, resolutionRate: 55, avgResolutionTime: 13.8 },
        garbage:  { total: 100, resolved: 62, pending: 24, inProgress: 14, resolutionRate: 62, avgResolutionTime: 9.8  },
        water:    { total: 90,  resolved: 52, pending: 24, inProgress: 14, resolutionRate: 58, avgResolutionTime: 12.0 },
        drainage: { total: 85,  resolved: 47, pending: 25, inProgress: 13, resolutionRate: 55, avgResolutionTime: 15.2 },
        lighting: { total: 35,  resolved: 23, pending: 8,  inProgress: 4,  resolutionRate: 66, avgResolutionTime: 8.5  },
      },
    },
    {
      year: '2023',
      total: 485,
      resolved: 320,
      pending: 105,
      inProgress: 60,
      resolutionRate: 66,
      avgResolutionTime: 10.4,
      highPriority: 98,
      majorCategory: 'Roads & Potholes',
      majorCategoryEmoji: '🛣️',
      majorCategoryShare: '30%',
      outcomeTrend: 'improving',
      neutralSummary: [
        'Resolution rate increased from 58% to 66% (+8% vs 2022).',
        'Average resolution time decreased from 12.5d to 10.4d (2.1 days faster).',
        'Complaint volume increased from 425 to 485 (+60 complaints).',
        'Major service category: Roads & Potholes (30% of annual volume).',
      ],
      services: {
        roads:    { total: 145, resolved: 93,  pending: 32, inProgress: 20, resolutionRate: 64, avgResolutionTime: 11.2 },
        garbage:  { total: 115, resolved: 80,  pending: 22, inProgress: 13, resolutionRate: 70, avgResolutionTime: 7.8  },
        water:    { total: 105, resolved: 68,  pending: 23, inProgress: 14, resolutionRate: 65, avgResolutionTime: 10.1 },
        drainage: { total: 80,  resolved: 50,  pending: 19, inProgress: 11, resolutionRate: 63, avgResolutionTime: 13.0 },
        lighting: { total: 40,  resolved: 29,  pending: 7,  inProgress: 4,  resolutionRate: 73, avgResolutionTime: 6.8  },
      },
    },
    {
      year: '2024',
      total: 545,
      resolved: 403,
      pending: 87,
      inProgress: 55,
      resolutionRate: 74,
      avgResolutionTime: 8.1,
      highPriority: 108,
      majorCategory: 'Water Supply',
      majorCategoryEmoji: '💧',
      majorCategoryShare: '28%',
      outcomeTrend: 'improving',
      neutralSummary: [
        'Resolution rate increased from 66% to 74% (+8% vs 2023).',
        'Average resolution time decreased from 10.4d to 8.1d (2.3 days faster).',
        'Complaint volume increased from 485 to 545 (+60 complaints).',
        'Major service category: Water Supply (28% of annual volume).',
      ],
      services: {
        roads:    { total: 160, resolved: 115, pending: 27, inProgress: 18, resolutionRate: 72, avgResolutionTime: 8.8 },
        garbage:  { total: 130, resolved: 101, pending: 17, inProgress: 12, resolutionRate: 78, avgResolutionTime: 5.9 },
        water:    { total: 125, resolved: 93,  pending: 20, inProgress: 12, resolutionRate: 74, avgResolutionTime: 7.8 },
        drainage: { total: 85,  resolved: 61,  pending: 15, inProgress: 9,  resolutionRate: 72, avgResolutionTime: 10.2 },
        lighting: { total: 45,  resolved: 33,  pending: 8,  inProgress: 4,  resolutionRate: 73, avgResolutionTime: 5.2 },
      },
    },
    {
      year: '2025',
      total: 600,
      resolved: 486,
      pending: 69,
      inProgress: 45,
      resolutionRate: 81,
      avgResolutionTime: 6.2,
      highPriority: 116,
      majorCategory: 'Sanitation & Waste',
      majorCategoryEmoji: '🗑️',
      majorCategoryShare: '31%',
      outcomeTrend: 'improving',
      neutralSummary: [
        'Resolution rate increased from 74% to 81% (+7% vs 2024).',
        'Average resolution time decreased from 8.1d to 6.2d (1.9 days faster).',
        'Complaint volume increased from 545 to 600 (+55 complaints).',
        'Major service category: Sanitation & Waste (31% of annual volume).',
      ],
      services: {
        roads:    { total: 175, resolved: 138, pending: 23, inProgress: 14, resolutionRate: 79, avgResolutionTime: 6.8 },
        garbage:  { total: 150, resolved: 128, pending: 13, inProgress: 9,  resolutionRate: 85, avgResolutionTime: 4.3 },
        water:    { total: 130, resolved: 105, pending: 15, inProgress: 10, resolutionRate: 81, avgResolutionTime: 6.0 },
        drainage: { total: 90,  resolved: 70,  pending: 12, inProgress: 8,  resolutionRate: 78, avgResolutionTime: 8.0 },
        lighting: { total: 55,  resolved: 45,  pending: 6,  inProgress: 4,  resolutionRate: 82, avgResolutionTime: 3.8 },
      },
    },
    {
      year: '2026',
      total: 650,
      resolved: 566,
      pending: 51,
      inProgress: 33,
      resolutionRate: 87,
      avgResolutionTime: 4.5,
      highPriority: 122,
      majorCategory: 'Roads & Potholes',
      majorCategoryEmoji: '🛣️',
      majorCategoryShare: '29%',
      outcomeTrend: 'improving',
      neutralSummary: [
        'Resolution rate increased from 81% to 87% (+6% vs 2025).',
        'Average resolution time decreased from 6.2d to 4.5d (1.7 days faster).',
        'Complaint volume increased from 600 to 650 (+50 complaints).',
        'Major service category: Roads & Potholes (29% of annual volume).',
      ],
      services: {
        roads:    { total: 190, resolved: 162, pending: 18, inProgress: 10, resolutionRate: 85, avgResolutionTime: 5.0 },
        garbage:  { total: 175, resolved: 158, pending: 10, inProgress: 7,  resolutionRate: 90, avgResolutionTime: 2.8 },
        water:    { total: 140, resolved: 122, pending: 11, inProgress: 7,  resolutionRate: 87, avgResolutionTime: 4.2 },
        drainage: { total: 85,  resolved: 71,  pending: 8,  inProgress: 6,  resolutionRate: 84, avgResolutionTime: 5.9 },
        lighting: { total: 60,  resolved: 53,  pending: 4,  inProgress: 3,  resolutionRate: 88, avgResolutionTime: 2.1 },
      },
    },
  ],

  // Pincode 400054: Santacruz West (Ward 84 · H/West Ward)
  '400054': [
    {
      year: '2022',
      total: 380,
      resolved: 209,
      pending: 114,
      inProgress: 57,
      resolutionRate: 55,
      avgResolutionTime: 13.5,
      highPriority: 76,
      majorCategory: 'Roads & Potholes',
      majorCategoryEmoji: '🛣️',
      majorCategoryShare: '35%',
      outcomeTrend: 'stable',
      neutralSummary: [
        'Initial observation year for historical recording in Santacruz West.',
        'Major service category: Roads & Potholes (35% of local reports).',
        'Resolution rate recorded at 55%.',
        'Average resolution time recorded at 13.5 days.',
      ],
      services: {
        roads:    { total: 130, resolved: 69, pending: 41, inProgress: 20, resolutionRate: 53, avgResolutionTime: 14.5 },
        garbage:  { total: 95,  resolved: 57, pending: 25, inProgress: 13, resolutionRate: 60, avgResolutionTime: 10.2 },
        water:    { total: 75,  resolved: 41, pending: 22, inProgress: 12, resolutionRate: 55, avgResolutionTime: 12.8 },
        drainage: { total: 50,  resolved: 26, pending: 16, inProgress: 8,  resolutionRate: 52, avgResolutionTime: 16.0 },
        lighting: { total: 30,  resolved: 16, pending: 10, inProgress: 4,  resolutionRate: 53, avgResolutionTime: 10.5 },
      },
    },
    {
      year: '2023',
      total: 435,
      resolved: 274,
      pending: 101,
      inProgress: 60,
      resolutionRate: 63,
      avgResolutionTime: 11.2,
      highPriority: 84,
      majorCategory: 'Garbage Collection',
      majorCategoryEmoji: '🗑️',
      majorCategoryShare: '33%',
      outcomeTrend: 'improving',
      neutralSummary: [
        'Resolution rate increased from 55% to 63% (+8% vs 2022).',
        'Average resolution time decreased from 13.5d to 11.2d (2.3 days faster).',
        'Complaint volume increased from 380 to 435 (+55 complaints).',
        'Major service category: Garbage Collection (33% of annual volume).',
      ],
      services: {
        roads:    { total: 140, resolved: 87,  pending: 33, inProgress: 20, resolutionRate: 62, avgResolutionTime: 12.1 },
        garbage:  { total: 115, resolved: 78,  pending: 24, inProgress: 13, resolutionRate: 68, avgResolutionTime: 8.5  },
        water:    { total: 90,  resolved: 56,  pending: 21, inProgress: 13, resolutionRate: 62, avgResolutionTime: 10.5 },
        drainage: { total: 55,  resolved: 33,  pending: 14, inProgress: 8,  resolutionRate: 60, avgResolutionTime: 13.8 },
        lighting: { total: 35,  resolved: 20,  pending: 9,  inProgress: 6,  resolutionRate: 57, avgResolutionTime: 8.7  },
      },
    },
    {
      year: '2024',
      total: 495,
      resolved: 351,
      pending: 89,
      inProgress: 55,
      resolutionRate: 71,
      avgResolutionTime: 8.8,
      highPriority: 92,
      majorCategory: 'Water Supply',
      majorCategoryEmoji: '💧',
      majorCategoryShare: '30%',
      outcomeTrend: 'improving',
      neutralSummary: [
        'Resolution rate increased from 63% to 71% (+8% vs 2023).',
        'Average resolution time decreased from 11.2d to 8.8d (2.4 days faster).',
        'Complaint volume increased from 435 to 495 (+60 complaints).',
        'Major service category: Water Supply (30% of annual volume).',
      ],
      services: {
        roads:    { total: 150, resolved: 104, pending: 28, inProgress: 18, resolutionRate: 69, avgResolutionTime: 9.5 },
        garbage:  { total: 130, resolved: 98,  pending: 20, inProgress: 12, resolutionRate: 75, avgResolutionTime: 6.5 },
        water:    { total: 105, resolved: 75,  pending: 18, inProgress: 12, resolutionRate: 71, avgResolutionTime: 8.2 },
        drainage: { total: 65,  resolved: 44,  pending: 13, inProgress: 8,  resolutionRate: 68, avgResolutionTime: 10.9 },
        lighting: { total: 45,  resolved: 30,  pending: 10, inProgress: 5,  resolutionRate: 67, avgResolutionTime: 6.1 },
      },
    },
    {
      year: '2025',
      total: 550,
      resolved: 429,
      pending: 73,
      inProgress: 48,
      resolutionRate: 78,
      avgResolutionTime: 6.8,
      highPriority: 100,
      majorCategory: 'Drainage & Stormwater',
      majorCategoryEmoji: '🌊',
      majorCategoryShare: '29%',
      outcomeTrend: 'improving',
      neutralSummary: [
        'Resolution rate increased from 71% to 78% (+7% vs 2024).',
        'Average resolution time decreased from 8.8d to 6.8d (2.0 days faster).',
        'Complaint volume increased from 495 to 550 (+55 complaints).',
        'Major service category: Drainage & Stormwater (29% of annual volume).',
      ],
      services: {
        roads:    { total: 165, resolved: 125, pending: 25, inProgress: 15, resolutionRate: 76, avgResolutionTime: 7.2 },
        garbage:  { total: 145, resolved: 119, pending: 16, inProgress: 10, resolutionRate: 82, avgResolutionTime: 4.8 },
        water:    { total: 115, resolved: 89,  pending: 16, inProgress: 10, resolutionRate: 77, avgResolutionTime: 6.4 },
        drainage: { total: 75,  resolved: 56,  pending: 12, inProgress: 7,  resolutionRate: 75, avgResolutionTime: 8.2 },
        lighting: { total: 50,  resolved: 40,  pending: 6,  inProgress: 4,  resolutionRate: 80, avgResolutionTime: 4.5 },
      },
    },
    {
      year: '2026',
      total: 600,
      resolved: 510,
      pending: 54,
      inProgress: 36,
      resolutionRate: 85,
      avgResolutionTime: 4.9,
      highPriority: 108,
      majorCategory: 'Roads & Potholes',
      majorCategoryEmoji: '🛣️',
      majorCategoryShare: '30%',
      outcomeTrend: 'improving',
      neutralSummary: [
        'Resolution rate increased from 78% to 85% (+7% vs 2025).',
        'Average resolution time decreased from 6.8d to 4.9d (1.9 days faster).',
        'Complaint volume increased from 550 to 600 (+50 complaints).',
        'Major service category: Roads & Potholes (30% of annual volume).',
      ],
      services: {
        roads:    { total: 180, resolved: 148, pending: 20, inProgress: 12, resolutionRate: 82, avgResolutionTime: 5.4 },
        garbage:  { total: 160, resolved: 141, pending: 11, inProgress: 8,  resolutionRate: 88, avgResolutionTime: 3.0 },
        water:    { total: 125, resolved: 105, pending: 12, inProgress: 8,  resolutionRate: 84, avgResolutionTime: 4.7 },
        drainage: { total: 80,  resolved: 65,  pending: 9,  inProgress: 6,  resolutionRate: 81, avgResolutionTime: 6.2 },
        lighting: { total: 55,  resolved: 51,  pending: 2,  inProgress: 2,  resolutionRate: 93, avgResolutionTime: 2.1 },
      },
    },
  ],
};

/**
 * Retrieves historical 5-year data for any 6-digit pincode.
 * Uses curated data for 400064, 400067, 400076, 400054, and generates
 * deterministic prototype data for any unlisted pincode.
 */
export function getHistoricalDataForPincode(pincode) {
  const pinStr = String(pincode || '400064').trim();

  // 1. Return exact curated prototype dataset if available
  if (PROTOTYPE_HISTORICAL_DATA[pinStr]) {
    return PROTOTYPE_HISTORICAL_DATA[pinStr];
  }

  // 2. Deterministic generator for custom/unlisted 6-digit pincodes
  const pinNum = parseInt(pinStr, 10) || 400000;
  const pinOffset = (pinNum % 19);

  const yearConfigs = [
    { year: '2022', baseTotal: 410 + pinOffset * 9,  baseRate: 53 + (pinNum % 8),  avgDays: 14.8 - (pinNum % 3) * 0.4, cat: 'Roads & Potholes', emoji: '🛣️', share: '36%' },
    { year: '2023', baseTotal: 470 + pinOffset * 10, baseRate: 61 + (pinNum % 9),  avgDays: 12.3 - (pinNum % 3) * 0.4, cat: 'Water Supply', emoji: '💧', share: '32%' },
    { year: '2024', baseTotal: 530 + pinOffset * 11, baseRate: 69 + (pinNum % 10), avgDays: 9.6  - (pinNum % 3) * 0.3, cat: 'Drainage & Stormwater', emoji: '🌊', share: '29%' },
    { year: '2025', baseTotal: 585 + pinOffset * 12, baseRate: 77 + (pinNum % 9),  avgDays: 7.4  - (pinNum % 3) * 0.3, cat: 'Sanitation & Waste', emoji: '🗑️', share: '34%' },
    { year: '2026', baseTotal: 630 + pinOffset * 13, baseRate: 84 + (pinNum % 7),  avgDays: 5.6  - (pinNum % 3) * 0.2, cat: 'Roads & Potholes', emoji: '🛣️', share: '31%' },
  ];

  const raw = yearConfigs.map((item) => {
    const total = item.baseTotal;
    const rate = Math.min(96, Math.max(48, item.baseRate));
    const resolved = Math.round(total * (rate / 100));
    const unresolved = total - resolved;
    const inProgress = Math.max(1, Math.round(unresolved * 0.62));
    const pending = Math.max(0, unresolved - inProgress);
    const avgResolutionTime = Number(Math.max(2.5, item.avgDays).toFixed(1));
    const highPriority = Math.round(total * 0.18);

    // Compute service-level breakdown
    const services = {
      roads:    { total: Math.round(total * 0.30), resolved: Math.round(resolved * 0.28), pending: Math.round(pending * 0.32), inProgress: Math.round(inProgress * 0.30), resolutionRate: rate - 2, avgResolutionTime: Number((avgResolutionTime + 0.8).toFixed(1)) },
      garbage:  { total: Math.round(total * 0.26), resolved: Math.round(resolved * 0.28), pending: Math.round(pending * 0.22), inProgress: Math.round(inProgress * 0.25), resolutionRate: rate + 3, avgResolutionTime: Number((avgResolutionTime - 1.8).toFixed(1)) },
      water:    { total: Math.round(total * 0.20), resolved: Math.round(resolved * 0.20), pending: Math.round(pending * 0.22), inProgress: Math.round(inProgress * 0.22), resolutionRate: rate,     avgResolutionTime: Number((avgResolutionTime - 0.5).toFixed(1)) },
      drainage: { total: Math.round(total * 0.14), resolved: Math.round(resolved * 0.14), pending: Math.round(pending * 0.14), inProgress: Math.round(inProgress * 0.13), resolutionRate: rate - 4, avgResolutionTime: Number((avgResolutionTime + 1.7).toFixed(1)) },
      lighting: { total: Math.round(total * 0.10), resolved: Math.round(resolved * 0.10), pending: Math.round(pending * 0.10), inProgress: Math.round(inProgress * 0.10), resolutionRate: rate + 6, avgResolutionTime: Number((avgResolutionTime - 2.5).toFixed(1)) },
    };

    return {
      year: item.year,
      total,
      resolved,
      inProgress,
      pending,
      resolutionRate: rate,
      rate,
      avgResolutionTime,
      highPriority,
      majorCategory: item.cat,
      majorCategoryEmoji: item.emoji,
      majorCategoryShare: item.share,
      services,
    };
  });

  return raw.map((item, idx) => {
    if (idx === 0) {
      return {
        ...item,
        outcomeTrend: 'stable',
        outcomeLabel: 'Baseline Year',
        volumeDiff: 0,
        rateDiff: 0,
        timeDiff: 0,
        neutralSummary: [
          `Initial observation year for historical recording in Pincode ${pinStr}.`,
          `Major service category: ${item.majorCategory} (${item.majorCategoryShare} of local reports).`,
          `Resolution rate recorded at ${item.resolutionRate}%.`,
          `Average resolution time recorded at ${item.avgResolutionTime} days.`,
        ],
      };
    }

    const prev = raw[idx - 1];
    const volumeDiff = item.total - prev.total;
    const rateDiff = item.resolutionRate - prev.resolutionRate;
    const timeDiff = Number((item.avgResolutionTime - prev.avgResolutionTime).toFixed(1));

    let outcomeTrend = 'stable';
    if (rateDiff >= 3 || timeDiff <= -0.8) {
      outcomeTrend = 'improving';
    } else if (rateDiff <= -3 || timeDiff >= 0.8) {
      outcomeTrend = 'declining';
    }

    const neutralSummary = [];

    if (rateDiff > 0) {
      neutralSummary.push(`Resolution rate increased from ${prev.resolutionRate}% to ${item.resolutionRate}% (+${rateDiff}% vs ${prev.year}).`);
    } else if (rateDiff < 0) {
      neutralSummary.push(`Resolution rate decreased from ${prev.resolutionRate}% to ${item.resolutionRate}% (${rateDiff}% vs ${prev.year}).`);
    } else {
      neutralSummary.push(`Resolution rate remained stable at ${item.resolutionRate}%.`);
    }

    if (timeDiff < 0) {
      neutralSummary.push(`Average resolution time decreased from ${prev.avgResolutionTime}d to ${item.avgResolutionTime}d (${Math.abs(timeDiff)} days faster).`);
    } else if (timeDiff > 0) {
      neutralSummary.push(`Average resolution time increased from ${prev.avgResolutionTime}d to ${item.avgResolutionTime}d (+${timeDiff} days).`);
    } else {
      neutralSummary.push(`Average resolution time remained unchanged at ${item.avgResolutionTime} days.`);
    }

    if (volumeDiff > 0) {
      neutralSummary.push(`Complaint volume increased from ${prev.total} to ${item.total} (+${volumeDiff} complaints).`);
    } else if (volumeDiff < 0) {
      neutralSummary.push(`Complaint volume decreased from ${prev.total} to ${item.total} (${volumeDiff} complaints).`);
    } else {
      neutralSummary.push(`Complaint volume remained unchanged.`);
    }

    neutralSummary.push(`Major service category: ${item.majorCategory} (${item.majorCategoryShare} of annual volume).`);

    return {
      ...item,
      outcomeTrend,
      volumeDiff,
      rateDiff,
      timeDiff,
      neutralSummary,
    };
  });
}
