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
 *   node scripts/optimize-images.mjs --dir="./src/pages/11-Proyectos/..." --preset=cards
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
  const options = {
    preset: 'cards',
    dir: null,
    file: null,
  };

  for (const arg of args) {
    if (arg.startsWith('--preset=')) {
      options.preset = arg.split('=')[1].toLowerCase();
    } else if (arg.startsWith('--dir=')) {
      options.dir = arg.split('=')[1];
    } else if (arg.startsWith('--file=')) {
      options.file = arg.split('=')[1];
    }
  }

  return options;
}

async function optimizeFile(filePath, config) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    if (!['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
      return null;
    }

    const stat = fs.statSync(filePath);
    const originalSizeKb = (stat.size / 1024).toFixed(1);

    const image = sharp(filePath);
    const metadata = await image.metadata();

    const targetWidth = Math.round(metadata.width * config.scale);
    const targetHeight = Math.round(metadata.height * config.scale);

    const outDir = path.dirname(filePath);
    const baseName = path.basename(filePath, ext);
    const outPath = path.join(outDir, `${baseName}.webp`);

    let pipeline = sharp(filePath).resize(targetWidth, targetHeight, {
      fit: 'inside',
      withoutEnlargement: true
    });

    if (config.lossless) {
      pipeline = pipeline.webp({ lossless: true, alphaQuality: 100 });
    } else {
      pipeline = pipeline.webp({
        quality: config.quality,
        alphaQuality: 100,
        effort: 6
      });
    }

    const tempOut = outPath === filePath ? `${outPath}.tmp.webp` : outPath;
    await pipeline.toFile(tempOut);

    if (tempOut !== outPath) {
      fs.renameSync(tempOut, outPath);
    }

    const newStat = fs.statSync(outPath);
    const newSizeKb = (newStat.size / 1024).toFixed(1);
    const savedPercent = (((stat.size - newStat.size) / stat.size) * 100).toFixed(1);

    return {
      file: path.basename(filePath),
      out: path.basename(outPath),
      originalKb: originalSizeKb,
      newKb: newSizeKb,
      saved: savedPercent,
      origDim: `${metadata.width}x${metadata.height}`,
      newDim: `${targetWidth}x${targetHeight}`
    };
  } catch (err) {
    console.error(`❌ Error procesando ${filePath}:`, err.message);
    return null;
  }
}

async function main() {
  const options = parseArgs();
  const config = PROFILES[options.preset] || PROFILES.cards;

  console.log('\n🚀 [QAWAY LAB] Optimizador de Imágenes WebP');
  console.log(`📌 Perfil seleccionado: ${config.name}`);

  const filesToProcess = [];

  if (options.file) {
    if (fs.existsSync(options.file)) {
      filesToProcess.push(path.resolve(options.file));
    } else {
      console.error(`❌ Archivo no encontrado: ${options.file}`);
      process.exit(1);
    }
  } else if (options.dir) {
    if (fs.existsSync(options.dir)) {
      const entries = fs.readdirSync(options.dir, { recursive: true });
      for (const entry of entries) {
        const fullPath = path.resolve(options.dir, entry);
        if (fs.statSync(fullPath).isFile()) {
          const ext = path.extname(fullPath).toLowerCase();
          if (['.png', '.jpg', '.jpeg'].includes(ext)) {
            filesToProcess.push(fullPath);
          }
        }
      }
    } else {
      console.error(`❌ Directorio no encontrado: ${options.dir}`);
      process.exit(1);
    }
  } else {
    console.log('\n💡 Instrucciones de uso:');
    console.log('   node scripts/optimize-images.mjs --dir="ruta/de/carpeta" --preset=hero');
    console.log('   node scripts/optimize-images.mjs --file="ruta/imagen.png" --preset=cards');
    console.log('\n   Presets disponibles: hero | cards | small | logo\n');
    process.exit(0);
  }

  console.log(`🔍 Procesando ${filesToProcess.length} imagen(es)...\n`);

  let totalOrig = 0;
  let totalNew = 0;

  for (const f of filesToProcess) {
    const res = await optimizeFile(f, config);
    if (res) {
      totalOrig += parseFloat(res.originalKb);
      totalNew += parseFloat(res.newKb);
      console.log(`  ✅ ${res.file} (${res.origDim}) -> ${res.out} (${res.newDim})`);
      console.log(`     ${res.originalKb} KB -> ${res.newKb} KB (Ahorro: -${res.saved}%)\n`);
    }
  }

  const totalSaved = totalOrig > 0 ? (((totalOrig - totalNew) / totalOrig) * 100).toFixed(1) : 0;
  console.log(`✨ Optimización completada:`);
  console.log(`   Peso Total Inicial: ${totalOrig.toFixed(1)} KB`);
  console.log(`   Peso Total Optimizado: ${totalNew.toFixed(1)} KB`);
  console.log(`   Ahorro Global: -${totalSaved}%\n`);
}

main();
