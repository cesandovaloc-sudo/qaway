#!/usr/bin/env node
/**
 * Qaway Lab - Optimizador y Conversor Inteligente de Imágenes a WebP
 * 
 * Presets configurados:
 * - hero:   Escala 95% | Calidad 95% (Imágenes principales y portadas)
 * - cards:  Escala 80% | Calidad 80% (Tarjetas, catálogos y fichas)
 * - small:  Escala 70% | Calidad 70% (Miniaturas y elementos compactos)
 * - logo:   Escala 100% | Calidad 100% (Transparencia perfecta sin pérdida)
 * 
 * Uso:
 *   node scripts/optimize-images.mjs --dir="./src/assets" --preset=cards
 *   node scripts/optimize-images.mjs --file="./src/assets/hero.png" --preset=hero
 */

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const PROFILES = {
  hero: { scale: 0.95, quality: 95, name: 'Hero / Grandes (95% escala, 95% calidad)' },
  cards: { scale: 0.80, quality: 80, name: 'Tarjetas Medianas (80% escala, 80% calidad)' },
  small: { scale: 0.70, quality: 70, name: 'Pequeñas / Miniaturas (70% escala, 70% calidad)' },
  logo: { scale: 1.00, quality: 100, lossless: true, name: 'Logotipos / Transparencias (100% fidelidad)' }
};

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { preset: 'cards', dir: null, file: null };
  for (const arg of args) {
    if (arg.startsWith('--preset=')) options.preset = arg.split('=')[1].toLowerCase();
    else if (arg.startsWith('--dir=')) options.dir = arg.split('=')[1];
    else if (arg.startsWith('--file=')) options.file = arg.split('=')[1];
  }
  return options;
}

async function optimizeFile(filePath, config) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    if (!['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) return null;

    const stat = fs.statSync(filePath);
    const originalSizeKb = (stat.size / 1024).toFixed(1);

    const image = sharp(filePath);
    const metadata = await image.metadata();

    const targetWidth = Math.round(metadata.width * config.scale);
    const targetHeight = Math.round(metadata.height * config.scale);

    let pipeline = image.resize(targetWidth, targetHeight, { fit: 'inside', withoutEnlargement: true });

    if (config.lossless) {
      pipeline = pipeline.webp({ lossless: true });
    } else {
      pipeline = pipeline.webp({ quality: config.quality, effort: 6 });
    }

    const outPath = filePath.replace(/\.(png|jpg|jpeg|webp)$/i, '.webp');
    const buffer = await pipeline.toBuffer();
    fs.writeFileSync(outPath, buffer);

    const newStat = fs.statSync(outPath);
    const newSizeKb = (newStat.size / 1024).toFixed(1);
    const reduction = (((stat.size - newStat.size) / stat.size) * 100).toFixed(1);

    return { file: path.basename(filePath), originalSizeKb, newSizeKb, reduction };
  } catch (err) {
    console.error('Error al optimizar:', filePath, err.message);
    return null;
  }
}

async function run() {
  const opts = parseArgs();
  const config = PROFILES[opts.preset] || PROFILES.cards;
  console.log(`\n🚀 Qaway Lab Image Optimizer | Preset: ${config.name}\n`);

  if (opts.file) {
    const res = await optimizeFile(opts.file, config);
    if (res) console.log(`✅ ${res.file} -> ${res.newSizeKb} KB (-${res.reduction}%)`);
  } else if (opts.dir) {
    const files = fs.readdirSync(opts.dir);
    for (const f of files) {
      const fullPath = path.join(opts.dir, f);
      if (fs.statSync(fullPath).isFile()) {
        const res = await optimizeFile(fullPath, config);
        if (res) console.log(`✅ ${res.file} -> ${res.newSizeKb} KB (-${res.reduction}%)`);
      }
    }
  }
  console.log('\n✨ Proceso de optimización finalizado.\n');
}

run();
