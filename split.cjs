const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'pages', '1-inicio', 'InicioPage.jsx');
const content = fs.readFileSync(file, 'utf-8');
const lines = content.split('\n');

const components = [
  { name: 'HeroSection', start: 19, end: 200 },
  { name: 'StatsBar', start: 201, end: 278 },
  { name: 'SystemRoadmapSection', start: 279, end: 502 },
  { name: 'LogosMarquee', start: 503, end: 528 },
  { name: 'EcosystemQuickNav', start: 529, end: 639 },
  { name: 'ServicesArchitectureSection', start: 640, end: 781 },
  { name: 'useCountUpOnView', start: 782, end: 840 },
  { name: 'StatsSection', start: 841, end: 879 },
  { name: 'EcosystemSection', start: 880, end: 980 },
  { name: 'ServicesSection', start: 981, end: 1068 },
  { name: 'ArchitectureSection', start: 1069, end: 1167 },
  { name: 'LandingsSection', start: 1168, end: 1247 },
  { name: 'CTASection', start: 1248, end: 1305 },
  { name: 'TrustBandSection', start: 1306, end: 1333 },
  { name: 'WhatIsQawaySection', start: 1334, end: 1398 },
  { name: 'UseCasesBentoSection', start: 1399, end: 1472 },
  { name: 'MainAreasSection', start: 1473, end: 1669 },
];

const importsText = lines.slice(0, 18).join('\n');

components.forEach(comp => {
  const compCode = lines.slice(comp.start - 1, comp.end).join('\n');
  const exportCode = compCode.replace(/^function /gm, 'export function ');
  
  // Create file
  const outPath = path.join(__dirname, 'src', 'pages', '1-inicio', 'components', `${comp.name}.jsx`);
  fs.writeFileSync(outPath, importsText + '\n\n' + exportCode, 'utf-8');
  console.log(`Created ${comp.name}.jsx`);
});

const inicioPageCode = lines.slice(1669).join('\n');
const importStatements = components.map(c => `import { ${c.name} } from './components/${c.name}'`).join('\n');

const newInicioPage = importsText + '\n\n' + importStatements + '\n\n' + inicioPageCode;
fs.writeFileSync(file, newInicioPage, 'utf-8');
console.log('Updated InicioPage.jsx');
