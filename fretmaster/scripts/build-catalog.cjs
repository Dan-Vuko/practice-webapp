#!/usr/bin/env node

/**
 * Build a compact scale catalog from the full Ian Ring scales.json + relationships.json.
 * Output: public/data/catalog.json (~500KB-1MB with relationships)
 */

const fs = require('fs');
const path = require('path');

const SCALES_PATH = path.join(__dirname, '..', 'ianring', 'webscrap', 'output', 'scales.json');
const RELATIONSHIPS_PATH = path.join(__dirname, '..', 'ianring', 'webscrap', 'output', 'relationships.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'catalog.json');

console.log('Loading scales.json...');
const scalesRaw = JSON.parse(fs.readFileSync(SCALES_PATH, 'utf8'));

console.log('Loading relationships.json...');
const relationshipsRaw = JSON.parse(fs.readFileSync(RELATIONSHIPS_PATH, 'utf8'));

console.log(`Processing ${scalesRaw.length} scales...`);

function parsePitchClassSet(pcsStr) {
  // "{0,2,4,5,7,9,11}" -> [0,2,4,5,7,9,11]
  if (!pcsStr) return [];
  const match = pcsStr.match(/\{([^}]*)\}/);
  if (!match) return [];
  return match[1].split(',').map(Number).filter(n => !isNaN(n));
}

function parseIntervalStructure(ivStr) {
  // "[2, 2, 1, 2, 2, 2, 1]" -> [2,2,1,2,2,2,1]
  if (!ivStr) return [];
  const match = ivStr.match(/\[([^\]]*)\]/);
  if (!match) return [];
  return match[1].split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
}

function parseModesCount(modesStr) {
  if (!modesStr) return 1;
  const n = parseInt(modesStr, 10);
  return isNaN(n) ? 1 : n;
}

function parseCardinality(cardStr) {
  if (!cardStr) return 0;
  const n = parseInt(cardStr, 10);
  return isNaN(n) ? 0 : n;
}

function isPrime(analysis) {
  return analysis?.primeForm?.value === 'yes';
}

function isSymmetric(analysis) {
  const val = analysis?.rotationalSymmetry?.value;
  return val && val !== 'none';
}

// Build a quick lookup: scaleNumber -> scale entry
const scaleByNumber = new Map();
for (const scale of scalesRaw) {
  scaleByNumber.set(scale.number, scale);
}

// Build nameMap and catalog entries
const nameMap = {};
const catalogScales = [];

for (const scale of scalesRaw) {
  const n = scale.number;
  if (n === 0) continue; // Skip empty scale

  const name = scale.name || '';
  nameMap[String(n)] = name;

  const analysis = scale.analysis || {};
  const pcs = parsePitchClassSet(analysis.pitchClassSet?.value);
  const iv = parseIntervalStructure(analysis.intervalStructure?.value);
  const card = parseCardinality(analysis.cardinality?.value);
  const modes = parseModesCount(analysis.modes?.value);
  const prime = isPrime(analysis);
  const sym = isSymmetric(analysis);

  // Find prime number for this scale
  let primeNum = n;
  if (!prime && scale.modes && scale.modes.length > 0) {
    // The prime form is the smallest scale number among all modes (including self)
    const allModes = [n, ...scale.modes.map(m => m.scaleNumber)];
    primeNum = Math.min(...allModes);
  }

  // Mode list
  const modeList = (scale.modes || []).map(m => ({
    m: m.mode,
    n: m.scaleNumber,
    name: m.name || ''
  }));

  // Relationships
  const rel = relationshipsRaw[String(n)] || {};
  const directChildren = rel.directChildren || [];
  const directParents = rel.directParents || [];

  // Complement
  const complement = scale.complement?.complementFamily?.[0] || 0;

  // Inverse
  const inverse = scale.inverse?.scaleNumber || 0;

  catalogScales.push({
    n,
    name,
    pcs,
    iv,
    card,
    modes,
    prime,
    primeNum,
    sym,
    modeList,
    directChildren,
    directParents,
    complement,
    inverse
  });
}

const catalog = {
  nameMap,
  scales: catalogScales
};

// Ensure output directory exists
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const json = JSON.stringify(catalog);
fs.writeFileSync(OUTPUT_PATH, json, 'utf8');

const sizeMB = (Buffer.byteLength(json) / (1024 * 1024)).toFixed(2);
console.log(`Wrote ${catalogScales.length} scales to ${OUTPUT_PATH} (${sizeMB} MB)`);
