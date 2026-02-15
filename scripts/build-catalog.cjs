#!/usr/bin/env node

/**
 * Build a compact scale catalog from the full Ian Ring scales.json + relationships.json.
 *
 * Source data: Place scales.json and relationships.json from the Ian Ring webscrap
 * in the same directory as this script (or pass paths as arguments).
 *
 * Output: public/data/catalog.json (~1MB with relationships)
 *
 * Usage: node scripts/build-catalog.cjs [scales.json path] [relationships.json path]
 */

const fs = require('fs');
const path = require('path');

const SCALES_PATH = process.argv[2] || path.join(__dirname, 'scales.json');
const RELATIONSHIPS_PATH = process.argv[3] || path.join(__dirname, 'relationships.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'catalog.json');

if (!fs.existsSync(SCALES_PATH)) {
  console.error(`scales.json not found at: ${SCALES_PATH}`);
  console.error('Usage: node scripts/build-catalog.cjs [scales.json path] [relationships.json path]');
  process.exit(1);
}

if (!fs.existsSync(RELATIONSHIPS_PATH)) {
  console.error(`relationships.json not found at: ${RELATIONSHIPS_PATH}`);
  process.exit(1);
}

console.log('Loading scales.json...');
const scalesRaw = JSON.parse(fs.readFileSync(SCALES_PATH, 'utf8'));

console.log('Loading relationships.json...');
const relationshipsRaw = JSON.parse(fs.readFileSync(RELATIONSHIPS_PATH, 'utf8'));

console.log(`Processing ${scalesRaw.length} scales...`);

function parsePitchClassSet(pcsStr) {
  if (!pcsStr) return [];
  const match = pcsStr.match(/\{([^}]*)\}/);
  if (!match) return [];
  return match[1].split(',').map(Number).filter(n => !isNaN(n));
}

function parseIntervalStructure(ivStr) {
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

const nameMap = {};
const catalogScales = [];

for (const scale of scalesRaw) {
  const n = scale.number;
  if (n === 0) continue;

  const name = scale.name || '';
  nameMap[String(n)] = name;

  const analysis = scale.analysis || {};
  const pcs = parsePitchClassSet(analysis.pitchClassSet?.value);
  const iv = parseIntervalStructure(analysis.intervalStructure?.value);
  const card = parseCardinality(analysis.cardinality?.value);
  const modes = parseModesCount(analysis.modes?.value);
  const prime = isPrime(analysis);
  const sym = isSymmetric(analysis);

  let primeNum = n;
  if (!prime && scale.modes && scale.modes.length > 0) {
    const allModes = [n, ...scale.modes.map(m => m.scaleNumber)];
    primeNum = Math.min(...allModes);
  }

  const modeList = (scale.modes || []).map(m => ({
    m: m.mode,
    n: m.scaleNumber,
    name: m.name || ''
  }));

  const rel = relationshipsRaw[String(n)] || {};
  const directChildren = rel.directChildren || [];
  const directParents = rel.directParents || [];
  const complement = scale.complement?.complementFamily?.[0] || 0;
  const inverse = scale.inverse?.scaleNumber || 0;

  catalogScales.push({
    n, name, pcs, iv, card, modes, prime, primeNum, sym,
    modeList, directChildren, directParents, complement, inverse
  });
}

const catalog = { nameMap, scales: catalogScales };

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const json = JSON.stringify(catalog);
fs.writeFileSync(OUTPUT_PATH, json, 'utf8');

const sizeMB = (Buffer.byteLength(json) / (1024 * 1024)).toFixed(2);
console.log(`Wrote ${catalogScales.length} scales to ${OUTPUT_PATH} (${sizeMB} MB)`);
