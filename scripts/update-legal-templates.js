#!/usr/bin/env node

/**
 * Legal Templates Updater für JobCoach Münster
 * Interaktives Script zum Ersetzen der Platzhalter
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Konfiguration
const LEGAL_DIR = path.join(__dirname, '../legal');
const BACKUP_DIR = path.join(__dirname, '../legal/backups');

const PLACEHOLDERS = {
  '[FIRMA]': 'Firmenname (z.B. JobCoach Münster GmbH)',
  '[ANSCHRIFT]': 'Straße und Hausnummer (z.B. Musterstraße 123)',
  '[PLZ]': 'Postleitzahl (z.B. 48149)',
  '[ORT]': 'Ort (z.B. Münster)',
  '[EMAIL]': 'E-Mail-Adresse (z.B. info@jobcoach-muenster.de)',
  '[TELEFON]': 'Telefonnummer (z.B. +49 251 123456)',
  '[DATUM]': 'Aktuelles Datum (z.B. 01.01.2024)',
  '[NAME]': 'Verantwortlicher Name (z.B. Max Mustermann)',
  '[UST-ID]': 'Umsatzsteuer-ID (z.B. DE123456789) - optional',
  '[HANDELSREGISTER]': 'Handelsregister (z.B. HRB 12345)',
  '[REGISTERGERICHT]': 'Registergericht (z.B. Amtsgericht Münster)',
  '[REGISTERNUMMER]': 'Registernummer (z.B. HRB 12345)',
  '[AUFSICHTSBEHOERDE]': 'Aufsichtsbehörde (z.B. IHK Münster)',
  '[AUFSICHT-ANSCHRIFT]': 'Adresse der Aufsichtsbehörde',
  '[AUFSICHT-WEBSITE]': 'Website der Aufsichtsbehörde'
};

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('🔧 JobCoach Münster - Legal Templates Updater\n');
  console.log('Dieses Script hilft Ihnen dabei, alle Platzhalter in den Rechtstexten zu ersetzen.\n');
  
  // Backup erstellen
  console.log('📦 Creating backup...');
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);
  fs.mkdirSync(backupPath);
  
  // Alle .md Dateien sichern
  const legalFiles = fs.readdirSync(LEGAL_DIR).filter(file => file.endsWith('.md'));
  legalFiles.forEach(file => {
    const source = path.join(LEGAL_DIR, file);
    const backup = path.join(backupPath, file);
    fs.copyFileSync(source, backup);
  });
  
  console.log(`✅ Backup created: ${backupPath}\n`);
  
  // Firmeninformationen sammeln
  console.log('📝 Bitte geben Sie Ihre Firmeninformationen ein:\n');
  
  const replacements = {};
  
  for (const [placeholder, description] of Object.entries(PLACEHOLDERS)) {
    let answer = '';
    
    if (placeholder === '[UST-ID]') {
      answer = await askQuestion(`${description} (leer lassen falls nicht vorhanden): `);
      if (!answer) {
        replacements[placeholder] = 'Nicht vorhanden';
        continue;
      }
    } else if (placeholder === '[DATUM]') {
      const today = new Date().toLocaleDateString('de-DE');
      answer = await askQuestion(`${description} [${today}]: `);
      if (!answer) answer = today;
    } else {
      while (!answer) {
        answer = await askQuestion(`${description}: `);
        if (!answer) {
          console.log('⚠️  Dieses Feld ist erforderlich!');
        }
      }
    }
    
    replacements[placeholder] = answer;
  }
  
  // Bestätigung anzeigen
  console.log('\n📋 Ihre Eingaben:');
  for (const [placeholder, value] of Object.entries(replacements)) {
    console.log(`${placeholder} → ${value}`);
  }
  
  const confirm = await askQuestion('\n✅ Sind diese Angaben korrekt? (y/N): ');
  
  if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
    console.log('❌ Abgebrochen. Keine Änderungen vorgenommen.');
    rl.close();
    return;
  }
  
  // Platzhalter ersetzen
  console.log('\n🔄 Updating legal templates...');
  
  legalFiles.forEach(file => {
    const filePath = path.join(LEGAL_DIR, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    let hasChanges = false;
    
    for (const [placeholder, replacement] of Object.entries(replacements)) {
      if (content.includes(placeholder)) {
        content = content.replace(new RegExp(escapeRegex(placeholder), 'g'), replacement);
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${file}`);
    } else {
      console.log(`ℹ️  No changes: ${file}`);
    }
  });
  
  // HTML-Versionen erstellen (optional)
  const createHTML = await askQuestion('\n🌐 HTML-Versionen der Rechtstexte erstellen? (y/N): ');
  
  if (createHTML.toLowerCase() === 'y' || createHTML.toLowerCase() === 'yes') {
    await generateHTMLVersions();
  }
  
  // Validation
  console.log('\n🔍 Validating updates...');
  await validateLegalDocuments();
  
  console.log('\n✅ Legal templates successfully updated!');
  console.log('\n📋 Next steps:');
  console.log('1. Review the updated files in legal/');
  console.log('2. Run: npm run test to verify everything works');
  console.log('3. Commit the changes to version control');
  console.log('4. Deploy to production');
  
  rl.close();
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function generateHTMLVersions() {
  console.log('📄 Generating HTML versions...');
  
  const markdownFiles = fs.readdirSync(LEGAL_DIR).filter(file => 
    file.endsWith('.md') && !file.includes('.template')
  );
  
  markdownFiles.forEach(file => {
    const mdPath = path.join(LEGAL_DIR, file);
    const htmlPath = path.join(LEGAL_DIR, file.replace('.md', '.html'));
    
    const content = fs.readFileSync(mdPath, 'utf8');
    const htmlContent = convertMarkdownToHTML(content, file);
    
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log(`✅ Generated: ${file.replace('.md', '.html')}`);
  });
}

function convertMarkdownToHTML(markdown, filename) {
  // Einfache Markdown-zu-HTML Konvertierung
  let html = markdown
    // Headers
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    
    // Bold/Italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  
  // Wrap in paragraphs
  html = '<p>' + html + '</p>';
  
  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '').replace(/<p><h/g, '<h').replace(/h><\/p>/g, 'h>');
  
  const title = filename.replace('.template.md', '').replace('.md', '');
  const titleMap = {
    'agb': 'Allgemeine Geschäftsbedingungen',
    'datenschutz': 'Datenschutzerklärung',
    'impressum': 'Impressum',
    'widerruf': 'Widerrufsbelehrung',
    'einwilligungen': 'Einwilligungen'
  };
  
  return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${titleMap[title] || title} - JobCoach Münster</title>
    <link rel="stylesheet" href="../assets/app.css">
    <meta name="robots" content="noindex, nofollow">
</head>
<body>
    <header>
        <nav>
            <a href="../index.html">← Zurück zur Hauptseite</a>
        </nav>
    </header>
    
    <main>
        <article>
            ${html}
        </article>
    </main>
    
    <footer>
        <p><a href="../index.html">Zurück zur Hauptseite</a></p>
    </footer>
</body>
</html>`;
}

async function validateLegalDocuments() {
  const legalFiles = fs.readdirSync(LEGAL_DIR).filter(file => file.endsWith('.md'));
  
  let validationErrors = 0;
  
  legalFiles.forEach(file => {
    const filePath = path.join(LEGAL_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Prüfe auf verbleibende Platzhalter
    const remainingPlaceholders = PLACEHOLDERS.filter(p => content.includes(p));
    
    if (remainingPlaceholders.length > 0) {
      console.log(`⚠️  ${file}: ${remainingPlaceholders.length} placeholders remaining`);
      validationErrors++;
    } else {
      console.log(`✅ ${file}: All placeholders replaced`);
    }
    
    // Prüfe auf gültige E-Mail-Adressen
    const emailMatches = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    if (emailMatches) {
      console.log(`📧 ${file}: ${emailMatches.length} email address(es) found`);
    }
    
    // Prüfe Datenschutzerklärung spezifisch
    if (file === 'datenschutz.template.md') {
      const requiredPhrases = [
        'Art. 6 Abs. 1',
        'DSGVO',
        'personenbezogene Daten',
        'Betroffenenrechte'
      ];
      
      const missingPhrases = requiredPhrases.filter(phrase => 
        !content.toLowerCase().includes(phrase.toLowerCase())
      );
      
      if (missingPhrases.length > 0) {
        console.log(`⚠️  ${file}: Missing GDPR phrases: ${missingPhrases.join(', ')}`);
      }
    }
  });
  
  if (validationErrors === 0) {
    console.log('✅ All validations passed!');
  } else {
    console.log(`⚠️  ${validationErrors} validation warnings found.`);
  }
}

// Script ausführen
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, validateLegalDocuments };