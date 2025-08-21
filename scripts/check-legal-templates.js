#!/usr/bin/env node

/**
 * Legal Templates Checker für JobCoach Münster
 * Prüft, ob alle Platzhalter in den Rechtstexten ersetzt wurden
 */

const fs = require('fs');
const path = require('path');

// Konfiguration
const LEGAL_DIR = path.join(__dirname, '../legal');
const PLACEHOLDERS = [
  '[FIRMA]',
  '[ANSCHRIFT]',
  '[PLZ]',
  '[ORT]',
  '[EMAIL]',
  '[TELEFON]',
  '[DATUM]',
  '[NAME]',
  '[UST-ID]',
  '[HANDELSREGISTER]',
  '[REGISTERGERICHT]',
  '[REGISTERNUMMER]',
  '[AUFSICHTSBEHOERDE]',
  '[AUFSICHT-ANSCHRIFT]',
  '[AUFSICHT-WEBSITE]'
];

const REQUIRED_FILES = [
  'agb.template.md',
  'datenschutz.template.md',
  'impressum.template.md',
  'widerruf.template.md',
  'einwilligungen.template.md'
];

console.log('🔍 Checking legal templates...\n');

let hasErrors = false;
let hasWarnings = false;

// Prüfe, ob alle erforderlichen Dateien vorhanden sind
console.log('📄 Checking required files...');
REQUIRED_FILES.forEach(file => {
  const filePath = path.join(LEGAL_DIR, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    hasErrors = true;
  }
});

console.log('\n📝 Checking for placeholders...');

// Prüfe jede Datei auf Platzhalter
const legalFiles = fs.readdirSync(LEGAL_DIR).filter(file => file.endsWith('.md'));

legalFiles.forEach(file => {
  const filePath = path.join(LEGAL_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  console.log(`\n📋 ${file}:`);
  
  let fileHasPlaceholders = false;
  
  PLACEHOLDERS.forEach(placeholder => {
    if (content.includes(placeholder)) {
      console.log(`  ⚠️  ${placeholder} - NEEDS REPLACEMENT`);
      fileHasPlaceholders = true;
      hasWarnings = true;
    }
  });
  
  if (!fileHasPlaceholders) {
    console.log(`  ✅ All placeholders replaced`);
  }
  
  // Prüfe auf häufige Probleme
  const issues = [];
  
  // Leere Platzhalter
  if (content.match(/\[\s*\]/)) {
    issues.push('Empty placeholders found');
  }
  
  // Ungültige E-Mail-Adressen
  if (content.match(/\[EMAIL\]/) && !content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)) {
    issues.push('No valid email addresses found');
  }
  
  // Veraltete Datumsangaben
  const currentYear = new Date().getFullYear();
  if (content.includes(`${currentYear - 1}`) && !content.includes(`${currentYear}`)) {
    issues.push(`Possibly outdated date (${currentYear - 1})`);
  }
  
  if (issues.length > 0) {
    console.log(`  🚨 Issues found:`);
    issues.forEach(issue => console.log(`    - ${issue}`));
    hasWarnings = true;
  }
});

// DSGVO-Compliance Check
console.log('\n🔒 DSGVO Compliance Check...');

const datenschutzPath = path.join(LEGAL_DIR, 'datenschutz.template.md');
if (fs.existsSync(datenschutzPath)) {
  const datenschutzContent = fs.readFileSync(datenschutzPath, 'utf8');
  
  const requiredSections = [
    'Verantwortlicher',
    'Betroffenenrechte',
    'Rechtsgrundlage',
    'Speicherdauer',
    'Cookies',
    'Kontaktformular'
  ];
  
  requiredSections.forEach(section => {
    if (datenschutzContent.toLowerCase().includes(section.toLowerCase())) {
      console.log(`✅ ${section} section found`);
    } else {
      console.log(`❌ ${section} section missing`);
      hasErrors = true;
    }
  });
}

// Accessibility-Hinweise in Legal-Texten
console.log('\n♿ Accessibility in Legal Documents...');

legalFiles.forEach(file => {
  const filePath = path.join(LEGAL_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Prüfe auf Leichte Sprache Hinweise
  if (content.toLowerCase().includes('leichte sprache')) {
    console.log(`✅ ${file} - References to "Leichte Sprache" found`);
  } else {
    console.log(`⚠️  ${file} - Consider adding "Leichte Sprache" reference`);
  }
});

// Summary
console.log('\n📊 Summary:');

if (hasErrors) {
  console.log('❌ ERRORS FOUND - Please fix before deployment!');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  WARNINGS FOUND - Please review before deployment.');
  console.log('\n💡 To fix placeholders, run: npm run legal:update');
  process.exit(0);
} else {
  console.log('✅ All legal templates are properly configured!');
  process.exit(0);
}

// Helper-Funktionen
function generateReplacementScript() {
  console.log('\n🔧 Replacement script template:');
  console.log('#!/bin/bash');
  console.log('# Replace placeholders in legal documents');
  console.log('cd legal/');
  console.log('');
  
  PLACEHOLDERS.forEach(placeholder => {
    const varName = placeholder.replace(/[\[\]]/g, '').replace(/[^A-Z]/g, '_');
    console.log(`sed -i 's/${placeholder.replace(/[\[\]]/g, '\\[\\]')}/YOUR_${varName}/g' *.md`);
  });
  
  console.log('\n# Example:');
  console.log('# sed -i \'s/\\[FIRMA\\]/JobCoach Münster GmbH/g\' *.md');
  console.log('# sed -i \'s/\\[EMAIL\\]/info@jobcoach-muenster.de/g\' *.md');
}