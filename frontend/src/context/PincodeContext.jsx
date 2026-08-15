import React, { createContext, useContext, useState } from 'react';
import { useToast } from './ToastContext';

const PincodeContext = createContext();

const INITIAL_MOCK_COMMENTS = {
  '1': [
    { _id: 'c1', author: { name: 'Ravi Kumar', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', isOfficial: false }, content: 'I witnessed a scooter skid near this exact pothole yesterday. Needs immediate asphalt patching!', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString() },
    { _id: 'c2', author: { name: 'Roads Dept. Officer', avatar: null, isOfficial: true }, content: 'Official Update: Inspection completed. Road repair crew assigned under Work Order #RW-4892. Patchwork scheduled for tomorrow 8 AM.', createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    { _id: 'c3', author: { name: 'Meena S.', avatar: null, isOfficial: false }, content: 'Thank you for the quick official response! Really appreciate the update.', createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  ],
  '2': [
    { _id: 'c21', author: { name: 'Kavita M.', avatar: null, isOfficial: false }, content: 'Same issue in Sector 4! Water pressure has been zero since Tuesday morning.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { _id: 'c22', author: { name: 'Water Supply Engineer', avatar: null, isOfficial: true }, content: 'Official Update: Emergency water tankers dispatched to Hiranandani Sector 4 market square. Main valve repair in progress.', createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
  ],
  '3': [
    { _id: 'c31', author: { name: 'Suresh B.', avatar: null, isOfficial: false }, content: 'Stray animals are spreading this garbage all over the pavement. Needs daily morning collection.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
    { _id: 'c32', author: { name: 'Sanitation Inspector', avatar: null, isOfficial: true }, content: 'Official Update: Dedicated compactor truck dispatched for morning clearing.', createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
  ],
  '8': [
    { _id: 'c81', author: { name: 'Deepak V.', avatar: null, isOfficial: false }, content: 'Almost fell into this last night! Very dangerous spot.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  ],
  '20': [
    { _id: 'c201', author: { name: 'Anil K.', avatar: null, isOfficial: false }, content: 'Foul odor is unbearable. Please expedite the jetting machine.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
  ],
  '27': [
    { _id: 'c271', author: { name: 'Dr. Ramesh N.', avatar: null, isOfficial: false }, content: 'This is medical waste! Hazardous material crew must handle this immediately.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString() },
  ]
};

const INITIAL_MOCK_VERIFICATIONS = {
  '1': { confirmedCount: 22, notConfirmedCount: 3 },
  '2': { confirmedCount: 18, notConfirmedCount: 1 },
  '3': { confirmedCount: 45, notConfirmedCount: 2 },
  '8': { confirmedCount: 31, notConfirmedCount: 0 },
  '11': { confirmedCount: 29, notConfirmedCount: 4 },
  '20': { confirmedCount: 52, notConfirmedCount: 2 },
  '27': { confirmedCount: 64, notConfirmedCount: 1 },
};

export const DEMO_USERS = [
  {
    email: 'citizen1@demo.com',
    name: 'Priya Sharma',
    role: 'citizen',
    pincode: '400064',
    label: 'Citizen 1 (Pincode: 400064)',
  },
  {
    email: 'citizen2@demo.com',
    name: 'Aarav Mehta',
    role: 'citizen',
    pincode: '400064',
    label: 'Citizen 2 (Pincode: 400064)',
  },
  {
    email: 'citizen3@demo.com',
    name: 'Rohan Gupta',
    role: 'citizen',
    pincode: '400076',
    label: 'Citizen 3 (Pincode: 400076)',
  },
  {
    email: 'citizen4@demo.com',
    name: 'Meena Singh',
    role: 'citizen',
    pincode: '400067',
    label: 'Citizen 4 (Pincode: 400067)',
  },
  {
    email: 'citizen5@demo.com',
    name: 'Vikram Patel',
    role: 'citizen',
    pincode: '400054',
    label: 'Citizen 5 (Pincode: 400054)',
  },
  {
    email: 'officer@demo.com',
    name: 'Officer Rajesh V.',
    role: 'officer',
    pincode: '400064',
    label: 'Municipal Officer',
  },
];

// ── Shared Master Complaints List (28 Realistic Seed Complaints) ─────────────
const INITIAL_COMPLAINTS = [
  {
    _id: '1',
    title: 'Hazardous deep pothole on Link Road near Orlem Junction',
    description: 'A massive 3-foot deep pothole has formed right in front of the main bus shelter. Two two-wheelers skidded last night. Needs immediate asphalt resurfacing.',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    category: 'Road Damage',
    categorySlug: 'roads',
    pincode: '400064',
    ward: 'Ward 47',
    priority: 'urgent',
    department: 'Public Works Department',
    status: 'in_progress',
    upvotes: 142,
    downvotes: 3,
    commentCount: 28,
    estimatedResolution: '3–5 Days',
    aiConfidence: '94%',
    reportedBy: { name: 'Priya Sharma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', isAnonymous: false },
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    _id: '2',
    title: 'No water supply for 3 days in Hiranandani Gardens Sector 4',
    description: 'Main supply pipeline burst near the pump station. Over 400 households affected without drinking water.',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80',
    category: 'Water Supply',
    categorySlug: 'water',
    pincode: '400076',
    ward: 'Ward 12',
    priority: 'urgent',
    department: 'City Water Supply Board',
    status: 'open',
    upvotes: 98,
    downvotes: 1,
    commentCount: 42,
    estimatedResolution: '1–2 Days',
    aiConfidence: '96%',
    reportedBy: { name: 'Anonymous Resident', avatar: null, isAnonymous: true },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    _id: '3',
    title: 'Garbage dump accumulating near St. Joseph High School',
    description: 'Sanitation trucks haven\'t picked up municipal waste for 4 consecutive days. Foul odor spreading to classrooms.',
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    category: 'Garbage Collection',
    categorySlug: 'garbage',
    pincode: '400064',
    ward: 'Ward 47',
    priority: 'high',
    department: 'Sanitation & Solid Waste Management',
    status: 'verified',
    upvotes: 86,
    downvotes: 4,
    commentCount: 19,
    estimatedResolution: '2–3 Days',
    aiConfidence: '91%',
    reportedBy: { name: 'Rajesh Kumar', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', isAnonymous: false },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    _id: '4',
    title: 'Complete blackout — 8 streetlights unfunctional on Powai Lake Promenade',
    description: 'The entire 500-meter dark stretch along the lake walkway has unserviceable sodium lights, raising safety concerns.',
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    category: 'Street Lighting',
    categorySlug: 'streetlights',
    pincode: '400076',
    ward: 'Ward 12',
    priority: 'medium',
    department: 'Electricity & Public Lighting Department',
    status: 'open',
    upvotes: 64,
    downvotes: 2,
    commentCount: 14,
    estimatedResolution: '3–5 Days',
    aiConfidence: '89%',
    reportedBy: { name: 'Meena R.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', isAnonymous: false },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
  },
  {
    _id: '5',
    title: 'Main pipeline leak wasting treated drinking water on SV Road',
    description: 'High pressure stream spilling onto the road near Kandivali station for over 12 hours.',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80',
    category: 'Water Supply',
    categorySlug: 'water',
    pincode: '400067',
    ward: 'Ward 31',
    priority: 'urgent',
    department: 'City Water Supply Board',
    status: 'resolved',
    upvotes: 215,
    downvotes: 5,
    commentCount: 56,
    estimatedResolution: 'Resolved',
    aiConfidence: '97%',
    reportedBy: { name: 'Vikram S.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', isAnonymous: false },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    _id: '6',
    title: 'Severe waterlogging & blocked storm drain near Willingdon Gymkhana',
    description: 'Following yesterday\'s heavy showers, storm drain clogged completely causing knee-deep water on Linking Road.',
    imageUrl: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80',
    category: 'Drainage',
    categorySlug: 'drainage',
    pincode: '400054',
    ward: 'Ward 84',
    priority: 'high',
    department: 'Stormwater Drainage Department',
    status: 'assigned',
    upvotes: 72,
    downvotes: 1,
    commentCount: 12,
    estimatedResolution: '2–4 Days',
    aiConfidence: '93%',
    reportedBy: { name: 'Ananya P.', avatar: null, isAnonymous: true },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
  {
    _id: '7',
    title: 'Damaged footpath tiles creating tripping hazard near Evershine Mall',
    description: 'Broken paver blocks near the main shopping entrance causing multiple stumbles for senior citizens.',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    category: 'Public Infrastructure',
    categorySlug: 'infrastructure',
    pincode: '400064',
    ward: 'Ward 47',
    priority: 'low',
    department: 'Public Works Department',
    status: 'open',
    upvotes: 34,
    downvotes: 0,
    commentCount: 5,
    estimatedResolution: '5–7 Days',
    aiConfidence: '87%',
    reportedBy: { name: 'Kamesh M.', avatar: null, isAnonymous: false },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    _id: '8',
    title: 'Open manhole cover on MG Road market stretch dangerous at night',
    description: 'Missing heavy cast iron lid on busy commercial avenue. Temporary warning cone installed by shopkeepers.',
    imageUrl: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80',
    category: 'Drainage',
    categorySlug: 'drainage',
    pincode: '400067',
    ward: 'Ward 31',
    priority: 'urgent',
    department: 'Stormwater Drainage Department',
    status: 'in_progress',
    upvotes: 156,
    downvotes: 2,
    commentCount: 24,
    estimatedResolution: '1–2 Days',
    aiConfidence: '98%',
    reportedBy: { name: 'Sanjay B.', avatar: null, isAnonymous: true },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
  {
    _id: '9',
    title: 'Caved-in asphalt section near IIT Main Gate flyover',
    description: 'Road bed sinking due to underground soil erosion. Buses hitting bottom chassis when navigating corner.',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    category: 'Road Damage',
    categorySlug: 'roads',
    pincode: '400076',
    ward: 'Ward 12',
    priority: 'high',
    department: 'Public Works Department',
    status: 'reported',
    upvotes: 112,
    downvotes: 3,
    commentCount: 18,
    estimatedResolution: '3–5 Days',
    aiConfidence: '95%',
    reportedBy: { name: 'Rohan Gupta', avatar: null, isAnonymous: false },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
  {
    _id: '10',
    title: 'Overflowing commercial garbage bins near Santacruz Market',
    description: 'Fish and vegetable market waste dumping ground uncleaned for 3 days. Pests congregating around residential area.',
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    category: 'Garbage Collection',
    categorySlug: 'garbage',
    pincode: '400054',
    ward: 'Ward 84',
    priority: 'high',
    department: 'Sanitation & Solid Waste Management',
    status: 'in_progress',
    upvotes: 89,
    downvotes: 1,
    commentCount: 15,
    estimatedResolution: '1–2 Days',
    aiConfidence: '92%',
    reportedBy: { name: 'Vikram Patel', avatar: null, isAnonymous: false },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    _id: '11',
    title: 'Contaminated brown tap water supply in Chincholi Bunder society',
    description: 'Sewage line seepage suspected into municipal water trunk. Tap water running muddy and foul smelling.',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80',
    category: 'Water Supply',
    categorySlug: 'water',
    pincode: '400064',
    ward: 'Ward 47',
    priority: 'high',
    department: 'City Water Supply Board',
    status: 'assigned',
    upvotes: 167,
    downvotes: 4,
    commentCount: 33,
    estimatedResolution: '2–3 Days',
    aiConfidence: '96%',
    reportedBy: { name: 'Aarav Mehta', avatar: null, isAnonymous: false },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
  },
  {
    _id: '12',
    title: 'Flickering high-mast lighting pole at Dahanukar Wadi junction',
    description: 'Light fixture strobing continuously at night, distracting drivers and causing epilepsy risks.',
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    category: 'Street Lighting',
    categorySlug: 'streetlights',
    pincode: '400067',
    ward: 'Ward 31',
    priority: 'medium',
    department: 'Electricity & Public Lighting Department',
    status: 'verified',
    upvotes: 45,
    downvotes: 0,
    commentCount: 8,
    estimatedResolution: '3–4 Days',
    aiConfidence: '90%',
    reportedBy: { name: 'Meena Singh', avatar: null, isAnonymous: false },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    _id: '13',
    title: 'Broken guard rails along Central Avenue pedestrian crossing',
    description: 'Rusted metal railing snapped off after vehicle impact, exposing pedestrians to fast traffic.',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    category: 'Public Infrastructure',
    categorySlug: 'infrastructure',
    pincode: '400076',
    ward: 'Ward 12',
    priority: 'medium',
    department: 'Public Works Department',
    status: 'resolved',
    upvotes: 78,
    downvotes: 2,
    commentCount: 11,
    estimatedResolution: 'Resolved',
    aiConfidence: '88%',
    reportedBy: { name: 'Rohan Gupta', avatar: null, isAnonymous: false },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
  },
  {
    _id: '14',
    title: 'Clogged culvert causing residential basement flooding in Sundar Nagar',
    description: 'Heavy silt accumulation blocking the main culvert outlet. Water level rising rapidly during rainfall.',
    imageUrl: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80',
    category: 'Drainage',
    categorySlug: 'drainage',
    pincode: '400064',
    ward: 'Ward 47',
    priority: 'high',
    department: 'Stormwater Drainage Department',
    status: 'open',
    upvotes: 94,
    downvotes: 1,
    commentCount: 16,
    estimatedResolution: '2–4 Days',
    aiConfidence: '94%',
    reportedBy: { name: 'Priya Sharma', avatar: null, isAnonymous: false },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 34).toISOString(),
  },
  {
    _id: '15',
    title: 'Unfilled construction trench on Hasnabad Lane causing bottlenecks',
    description: 'Utility trench dug 2 weeks ago left open without asphalt backfill. Traffic gridlock every evening.',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    category: 'Road Damage',
    categorySlug: 'roads',
    pincode: '400054',
    ward: 'Ward 84',
    priority: 'urgent',
    department: 'Public Works Department',
    status: 'verified',
    upvotes: 130,
    downvotes: 5,
    commentCount: 22,
    estimatedResolution: '3–5 Days',
    aiConfidence: '93%',
    reportedBy: { name: 'Vikram Patel', avatar: null, isAnonymous: false },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
  },
  {
    _id: '16',
    title: 'Plastic debris accumulation along JVLR green belt',
    description: 'Single-use plastic bags and discarded packaging dumping along tree plantation strip.',
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    category: 'Garbage Collection',
    categorySlug: 'garbage',
    pincode: '400076',
    ward: 'Ward 12',
    priority: 'medium',
    department: 'Sanitation & Solid Waste Management',
    status: 'open',
    upvotes: 52,
    downvotes: 2,
    commentCount: 9,
    estimatedResolution: '3–5 Days',
    aiConfidence: '89%',
    reportedBy: { name: 'Anonymous Resident', avatar: null, isAnonymous: true },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 42).toISOString(),
  },
  {
    _id: '17',
    title: 'Low water pressure in 4th Road Santacruz residential buildings',
    description: 'Booster pump valve fault leading to minimal pressure on upper floors of 5-storey buildings.',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80',
    category: 'Water Supply',
    categorySlug: 'water',
    pincode: '400054',
    ward: 'Ward 84',
    priority: 'high',
    department: 'City Water Supply Board',
    status: 'in_progress',
    upvotes: 83,
    downvotes: 1,
    commentCount: 14,
    estimatedResolution: '2–3 Days',
    aiConfidence: '91%',
    reportedBy: { name: 'Vikram Patel', avatar: null, isAnonymous: false },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString(),
  },
  {
    _id: '18',
    title: 'Dark alley behind Orlem Market creating safety hazard for commuters',
    description: 'Three consecutive street poles completely dark. Multiple female residents reported feeling unsafe at night.',
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    category: 'Street Lighting',
    categorySlug: 'streetlights',
    pincode: '400064',
    ward: 'Ward 47',
    priority: 'high',
    department: 'Electricity & Public Lighting Department',
    status: 'assigned',
    upvotes: 118,
    downvotes: 0,
    commentCount: 21,
    estimatedResolution: '2–3 Days',
    aiConfidence: '95%',
    reportedBy: { name: 'Priya Sharma', avatar: null, isAnonymous: false },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
  },
  {
    _id: '19',
    title: 'Broken bench & collapsed shade canopy at Akurli Road public park',
    description: 'Vandalized park furniture and hanging corrugated sheet poses sharp edge danger to playing kids.',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    category: 'Public Infrastructure',
    categorySlug: 'infrastructure',
    pincode: '400067',
    ward: 'Ward 31',
    priority: 'medium',
    department: 'Public Works Department',
    status: 'open',
    upvotes: 41,
    downvotes: 1,
    commentCount: 6,
    estimatedResolution: '4–6 Days',
    aiConfidence: '86%',
    reportedBy: { name: 'Meena Singh', avatar: null, isAnonymous: false },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 54).toISOString(),
  },
  {
    _id: '20',
    title: 'Sewage overflow on Chandivali Farm Road near commercial towers',
    description: 'Underground sewer main choked up. Raw sewage leaking onto public road creating toxic health hazard.',
    imageUrl: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80',
    category: 'Drainage',
    categorySlug: 'drainage',
    pincode: '400076',
    ward: 'Ward 12',
    priority: 'urgent',
    department: 'Stormwater Drainage Department',
    status: 'in_progress',
    upvotes: 188,
    downvotes: 3,
    commentCount: 37,
    estimatedResolution: '1–2 Days',
    aiConfidence: '97%',
    reportedBy: { name: 'Rohan Gupta', avatar: null, isAnonymous: false },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 58).toISOString(),
  },
  {
    _id: '21',
    title: 'Pothole cluster on Link Road junction near Charkop signal',
    description: 'Multiple crater-like potholes across 3 lanes causing severe traffic deceleration and vehicle rim damage.',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    category: 'Road Damage',
    categorySlug: 'roads',
    pincode: '400067',
    ward: 'Ward 31',
    priority: 'high',
    department: 'Public Works Department',
    status: 'open',
    upvotes: 105,
    downvotes: 2,
    commentCount: 17,
    estimatedResolution: '3–5 Days',
    aiConfidence: '94%',
    reportedBy: { name: 'Meena Singh', avatar: null, isAnonymous: false },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 62).toISOString(),
  },
  {
    _id: '22',
    title: 'Unattended garden trimmings and tree branches blocking Malad station road',
    description: 'Post-pruning branches dumped on public walkway cleared after civic complaint escalation.',
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    category: 'Garbage Collection',
    categorySlug: 'garbage',
    pincode: '400064',
    ward: 'Ward 47',
    priority: 'high',
    department: 'Sanitation & Solid Waste Management',
    status: 'resolved',
    upvotes: 92,
    downvotes: 1,
    commentCount: 13,
    estimatedResolution: 'Resolved',
    aiConfidence: '92%',
    reportedBy: { name: 'Aarav Mehta', avatar: null, isAnonymous: false },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 66).toISOString(),
  },
  {
    _id: '23',
    title: 'Leaking air valve on Powai water main causing continuous street puddle',
    description: 'Faulty valve venting water constantly onto the asphalt road near Rambaug.',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80',
    category: 'Water Supply',
    categorySlug: 'water',
    pincode: '400076',
    ward: 'Ward 12',
    priority: 'medium',
    department: 'City Water Supply Board',
    status: 'verified',
    upvotes: 56,
    downvotes: 0,
    commentCount: 7,
    estimatedResolution: '3–4 Days',
    aiConfidence: '90%',
    reportedBy: { name: 'Rohan Gupta', avatar: null, isAnonymous: false },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(),
  },
  {
    _id: '24',
    title: 'Exposed wiring on streetlight pole near Juhu Tara Road corner',
    description: 'Inspection hatch missing on streetlight column exposing live wiring at child height.',
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    category: 'Street Lighting',
    categorySlug: 'streetlights',
    pincode: '400054',
    ward: 'Ward 84',
    priority: 'urgent',
    department: 'Electricity & Public Lighting Department',
    status: 'open',
    upvotes: 77,
    downvotes: 1,
    commentCount: 10,
    estimatedResolution: '1–2 Days',
    aiConfidence: '96%',
    reportedBy: { name: 'Vikram Patel', avatar: null, isAnonymous: false },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 74).toISOString(),
  },
  {
    _id: '25',
    title: 'Damaged bus stop shelter roof leaking rain onto waiting passengers',
    description: 'Corroded tin roof sheets missing on Marve Road bus shelter #5.',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    category: 'Public Infrastructure',
    categorySlug: 'infrastructure',
    pincode: '400064',
    ward: 'Ward 47',
    priority: 'medium',
    department: 'Public Works Department',
    status: 'assigned',
    upvotes: 63,
    downvotes: 2,
    commentCount: 8,
    estimatedResolution: '4–6 Days',
    aiConfidence: '88%',
    reportedBy: { name: 'Priya Sharma', avatar: null, isAnonymous: false },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 78).toISOString(),
  },
  {
    _id: '26',
    title: 'Dangerous speed breaker without retro-reflective paint marking',
    description: 'Unmarked concrete bump installed illegally on 1st Road causing vehicles to jump dangerously.',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    category: 'Road Damage',
    categorySlug: 'roads',
    pincode: '400054',
    ward: 'Ward 84',
    priority: 'high',
    department: 'Public Works Department',
    status: 'open',
    upvotes: 99,
    downvotes: 4,
    commentCount: 16,
    estimatedResolution: '3–5 Days',
    aiConfidence: '92%',
    reportedBy: { name: 'Vikram Patel', avatar: null, isAnonymous: false },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 82).toISOString(),
  },
  {
    _id: '27',
    title: 'Biomedical waste bag dumped near Kandivali West station road',
    description: 'Hazardous discarded medical packaging spotted near foot overbridge. Urgent bio-hazard team clearance needed.',
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    category: 'Garbage Collection',
    categorySlug: 'garbage',
    pincode: '400067',
    ward: 'Ward 31',
    priority: 'urgent',
    department: 'Sanitation & Solid Waste Management',
    status: 'in_progress',
    upvotes: 210,
    downvotes: 1,
    commentCount: 45,
    estimatedResolution: '1 Day',
    aiConfidence: '98%',
    reportedBy: { name: 'Meena Singh', avatar: null, isAnonymous: false },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 86).toISOString(),
  },
  {
    _id: '28',
    title: 'Broken storm drain grating near South Park Powai',
    description: 'Heavy steel mesh cracked. Bicycle wheels getting stuck in the gap.',
    imageUrl: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80',
    category: 'Drainage',
    categorySlug: 'drainage',
    pincode: '400076',
    ward: 'Ward 12',
    priority: 'medium',
    department: 'Stormwater Drainage Department',
    status: 'open',
    upvotes: 48,
    downvotes: 0,
    commentCount: 6,
    estimatedResolution: '3–5 Days',
    aiConfidence: '89%',
    reportedBy: { name: 'Rohan Gupta', avatar: null, isAnonymous: false },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 90).toISOString(),
  },
];

export function PincodeProvider({ children }) {
  const { toast } = useToast();

  // Unified Master Complaints state
  const [allComplaints, setAllComplaints] = useState(() => {
    try {
      const userCreated = JSON.parse(localStorage.getItem('civicpulse_user_complaints') || '[]');
      const storedEdits = JSON.parse(localStorage.getItem('civicpulse_complaint_updates') || '{}');
      const existingIds = new Set(INITIAL_COMPLAINTS.map(c => c._id));
      const uniqueUserCreated = userCreated.filter(c => !existingIds.has(c._id));
      const combined = [...uniqueUserCreated, ...INITIAL_COMPLAINTS];

      // Merge stored officer edits onto complaints
      return combined.map((c) => (storedEdits[c._id] ? { ...c, ...storedEdits[c._id] } : c));
    } catch {
      return INITIAL_COMPLAINTS;
    }
  });

  const addNewComplaint = (newComplaint) => {
    setAllComplaints((prev) => [newComplaint, ...prev]);
    try {
      const existing = JSON.parse(localStorage.getItem('civicpulse_user_complaints') || '[]');
      localStorage.setItem('civicpulse_user_complaints', JSON.stringify([newComplaint, ...existing]));
    } catch (err) {
      console.warn('LocalStorage error', err);
    }
  };

  const updateComplaintDetails = (complaintId, updates) => {
    setAllComplaints((prev) =>
      prev.map((c) => (c._id === complaintId ? { ...c, ...updates } : c))
    );
    try {
      const storedEdits = JSON.parse(localStorage.getItem('civicpulse_complaint_updates') || '{}');
      const updatedEdits = {
        ...storedEdits,
        [complaintId]: { ...(storedEdits[complaintId] || {}), ...updates },
      };
      localStorage.setItem('civicpulse_complaint_updates', JSON.stringify(updatedEdits));
    } catch (err) {
      console.warn('LocalStorage save error', err);
    }
  };

  const updateComplaintStatus = (complaintId, newStatus) => {
    updateComplaintDetails(complaintId, { status: newStatus });
  };

  // Active Logged-in Demo User State (Default: DEMO_USERS[0])
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('civicpulse_current_user');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // fallback
    }
    return DEMO_USERS[0];
  });

  // User's official registered pincode (Default: matches currentUser.pincode or '400064')
  const [registeredPincode, setRegisteredPincodeState] = useState(() => {
    try {
      const storedUser = localStorage.getItem('civicpulse_current_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.pincode) return parsed.pincode;
      }
    } catch (e) {}
    return localStorage.getItem('civicpulse_registered_pincode') || '400064';
  });

  const loginAsUser = (emailOrObject) => {
    let userToLogin;
    if (typeof emailOrObject === 'string') {
      const targetEmail = emailOrObject.trim().toLowerCase();
      userToLogin = DEMO_USERS.find((u) => u.email.toLowerCase() === targetEmail);
      if (!userToLogin) {
        const isOfficer = targetEmail.includes('officer') || targetEmail.includes('admin') || targetEmail.includes('gov');
        userToLogin = {
          email: targetEmail,
          name: isOfficer ? 'Municipal Officer' : 'Demo Resident',
          role: isOfficer ? 'officer' : 'citizen',
          pincode: '400064',
          label: isOfficer ? 'Municipal Officer' : 'Citizen Resident (400064)',
        };
      }
    } else {
      userToLogin = emailOrObject;
    }

    setCurrentUser(userToLogin);
    localStorage.setItem('civicpulse_current_user', JSON.stringify(userToLogin));

    if (userToLogin.role === 'citizen') {
      setRegisteredPincodeState(userToLogin.pincode);
      localStorage.setItem('civicpulse_registered_pincode', userToLogin.pincode);
    }

    toast.success(`Logged in as ${userToLogin.name} (${userToLogin.role === 'officer' ? 'Officer' : `Pincode: ${userToLogin.pincode}`})`);
    return userToLogin;
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('civicpulse_current_user');
    toast.info('Logged out');
  };

  // Active Pincode selected for browsing feed complaints ('all' or specific 6-digit pin)
  const [selectedBrowsingPincode, setSelectedBrowsingPincode] = useState('all');

  // Track user active votes: { [complaintId]: 'upvote' | 'downvote' }
  const [userVotes, setUserVotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('civicpulse_user_votes') || '{}');
    } catch {
      return {};
    }
  });

  // Track vote delta counts: { [complaintId]: { upDelta: number, downDelta: number } }
  const [voteDeltas, setVoteDeltas] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('civicpulse_vote_deltas') || '{}');
    } catch {
      return {};
    }
  });

  // Track comments per complaint: { [complaintId]: Array<Comment> }
  const [commentsStore, setCommentsStore] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('civicpulse_comments_store') || '{}');
      return { ...INITIAL_MOCK_COMMENTS, ...stored };
    } catch {
      return INITIAL_MOCK_COMMENTS;
    }
  });

  // Track status verifications: { [complaintId]: { confirmedCount: number, notConfirmedCount: number } }
  const [verificationsStore, setVerificationsStore] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('civicpulse_verifications_store') || '{}');
      return { ...INITIAL_MOCK_VERIFICATIONS, ...stored };
    } catch {
      return INITIAL_MOCK_VERIFICATIONS;
    }
  });

  // Track user specific verification submissions: { [complaintId]: 'confirmed' | 'unresolved' }
  const [userVerifications, setUserVerifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('civicpulse_user_verifications') || '{}');
    } catch {
      return {};
    }
  });

  const setRegisteredPincode = (newPin) => {
    if (!/^\d{6}$/.test(newPin)) return false;
    setRegisteredPincodeState(newPin);
    localStorage.setItem('civicpulse_registered_pincode', newPin);
    toast.success(`Registered pincode updated to ${newPin}`);
    return true;
  };

  // Check pincode eligibility rule: user.registeredPincode === complaint.pincode
  const isEligibleToVote = (complaintPincode) => {
    if (!complaintPincode) return false;
    return String(registeredPincode).trim() === String(complaintPincode).trim();
  };

  // Cast, switch, or remove vote with atomic delta updates and eligibility check
  const castVote = (complaintId, complaintPincode, targetAction) => {
    if (!isEligibleToVote(complaintPincode)) {
      toast.warning(`Only residents of pincode ${complaintPincode} can vote on this issue.`);
      return false;
    }

    const currentVote = userVotes[complaintId];
    let newVotes = { ...userVotes };
    let newDeltas = { ...voteDeltas };
    const currentDelta = newDeltas[complaintId] || { upDelta: 0, downDelta: 0 };

    let upDiff = 0;
    let downDiff = 0;

    if (currentVote === targetAction) {
      // Action: Remove vote
      delete newVotes[complaintId];
      if (targetAction === 'upvote') upDiff = -1;
      if (targetAction === 'downvote') downDiff = -1;
      toast.info('Vote removed.');
    } else if (currentVote === 'upvote' && targetAction === 'downvote') {
      // Action: Switch from Upvote to Downvote
      newVotes[complaintId] = 'downvote';
      upDiff = -1;
      downDiff = 1;
      toast.info('Vote changed to downvote.');
    } else if (currentVote === 'downvote' && targetAction === 'upvote') {
      // Action: Switch from Downvote to Upvote
      newVotes[complaintId] = 'upvote';
      upDiff = 1;
      downDiff = -1;
      toast.success('Vote changed to upvote.');
    } else {
      // Action: New Upvote or New Downvote
      newVotes[complaintId] = targetAction;
      if (targetAction === 'upvote') {
        upDiff = 1;
        toast.success('Vote recorded.');
      } else {
        downDiff = 1;
        toast.info('Vote recorded.');
      }
    }

    newDeltas[complaintId] = {
      upDelta: (currentDelta.upDelta || 0) + upDiff,
      downDelta: (currentDelta.downDelta || 0) + downDiff,
    };

    setUserVotes(newVotes);
    setVoteDeltas(newDeltas);
    localStorage.setItem('civicpulse_user_votes', JSON.stringify(newVotes));
    localStorage.setItem('civicpulse_vote_deltas', JSON.stringify(newDeltas));

    return true;
  };

  // Get current Upvotes, Downvotes, and Net Score for any complaint
  const getComplaintVotes = (complaintId, baseUpvotes = 0, baseDownvotes = 0) => {
    const delta = voteDeltas[complaintId] || { upDelta: 0, downDelta: 0 };
    const upvotes = Math.max(0, Number(baseUpvotes || 0) + delta.upDelta);
    const downvotes = Math.max(0, Number(baseDownvotes || 0) + delta.downDelta);
    const netScore = upvotes - downvotes;

    return {
      upvotes,
      downvotes,
      netScore,
      userVote: userVotes[complaintId],
    };
  };

  // ── Comments Management ───────────────────────────────────────────────────
  const getComplaintComments = (complaintId, defaultCount = 0) => {
    const commentsList = commentsStore[complaintId] || [];
    const count = commentsList.length > 0 ? commentsList.length : defaultCount;
    return {
      comments: commentsList,
      count,
    };
  };

  const addComment = (complaintId, { content, isAnonymous = false, authorName = 'Priya Sharma', isOfficialUpdate = false }) => {
    if (!content.trim()) return false;

    const newComment = {
      _id: `comment-${Date.now()}`,
      author: {
        name: isAnonymous ? 'Anonymous Resident' : authorName,
        avatar: isAnonymous ? null : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        isOfficial: isOfficialUpdate,
        isAnonymous,
      },
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    const existingList = commentsStore[complaintId] || INITIAL_MOCK_COMMENTS[complaintId] || [];
    const updatedList = [...existingList, newComment];

    const updatedStore = { ...commentsStore, [complaintId]: updatedList };
    setCommentsStore(updatedStore);
    localStorage.setItem('civicpulse_comments_store', JSON.stringify(updatedStore));

    if (isOfficialUpdate) {
      toast.success('Official update posted.');
    } else {
      toast.success('Comment posted.');
    }
    return newComment;
  };

  // ── Citizen Status Verification Management ──────────────────────────────
  const getComplaintVerification = (complaintId) => {
    const data = verificationsStore[complaintId] || { confirmedCount: 0, notConfirmedCount: 0 };
    const confirmedCount = data.confirmedCount || 0;
    const notConfirmedCount = data.notConfirmedCount || 0;
    const totalResponses = confirmedCount + notConfirmedCount;
    const confirmationPct = totalResponses > 0 ? Math.round((confirmedCount / totalResponses) * 100) : 0;
    const userResponse = userVerifications[complaintId] || null;

    return {
      confirmedCount,
      notConfirmedCount,
      totalResponses,
      confirmationPct,
      userResponse,
    };
  };

  const submitVerification = (complaintId, responseType) => {
    // responseType: 'confirmed' | 'unresolved'
    const currentResponse = userVerifications[complaintId];
    if (currentResponse === responseType) {
      toast.info('You have already submitted this verification response.');
      return false;
    }

    const currentData = verificationsStore[complaintId] || { confirmedCount: 0, notConfirmedCount: 0 };
    let confirmedCount = currentData.confirmedCount || 0;
    let notConfirmedCount = currentData.notConfirmedCount || 0;

    if (currentResponse === 'confirmed') confirmedCount = Math.max(0, confirmedCount - 1);
    if (currentResponse === 'unresolved') notConfirmedCount = Math.max(0, notConfirmedCount - 1);

    if (responseType === 'confirmed') confirmedCount += 1;
    if (responseType === 'unresolved') notConfirmedCount += 1;

    const updatedStore = {
      ...verificationsStore,
      [complaintId]: { confirmedCount, notConfirmedCount },
    };
    const updatedUserResponses = {
      ...userVerifications,
      [complaintId]: responseType,
    };

    setVerificationsStore(updatedStore);
    setUserVerifications(updatedUserResponses);

    localStorage.setItem('civicpulse_verifications_store', JSON.stringify(updatedStore));
    localStorage.setItem('civicpulse_user_verifications', JSON.stringify(updatedUserResponses));

    if (responseType === 'confirmed') {
      toast.success('Complaint verified. Thank you for confirming the status.');
    } else {
      toast.warning('Issue flagged as still unresolved. Municipality will be notified.');
    }

    return true;
  };

  return (
    <PincodeContext.Provider
      value={{
        DEMO_USERS,
        currentUser,
        loginAsUser,
        logoutUser,
        allComplaints,
        addNewComplaint,
        updateComplaintStatus,
        updateComplaintDetails,
        registeredPincode,
        setRegisteredPincode,
        selectedBrowsingPincode,
        setSelectedBrowsingPincode,
        userVotes,
        isEligibleToVote,
        castVote,
        getComplaintVotes,
        getComplaintComments,
        addComment,
        getComplaintVerification,
        submitVerification,
      }}
    >
      {children}
    </PincodeContext.Provider>
  );
}

export function usePincode() {
  const context = useContext(PincodeContext);
  if (!context) {
    throw new Error('usePincode must be used within a PincodeProvider');
  }
  return context;
}
