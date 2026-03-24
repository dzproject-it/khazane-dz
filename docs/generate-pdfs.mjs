import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { mdToPdf } = require('C:/Users/bchet/AppData/Roaming/npm/node_modules/md-to-pdf');
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const files = [
  { input: 'MODE_OPERATOIRE_UTILISATION.md', output: 'MODE_OPERATOIRE_UTILISATION.pdf' },
  { input: 'USER_GUIDE_EN.md',               output: 'USER_GUIDE_EN.pdf' },
  { input: 'USER_GUIDE_AR.md',               output: 'USER_GUIDE_AR.pdf' },
  { input: 'MODE_OPERATOIRE_INSTALLATION.md', output: 'MODE_OPERATOIRE_INSTALLATION.pdf' },
  { input: 'INSTALLATION_GUIDE_EN.md',        output: 'INSTALLATION_GUIDE_EN.pdf' },
  { input: 'INSTALLATION_GUIDE_AR.md',        output: 'INSTALLATION_GUIDE_AR.pdf' },
];

const pdfOptions = {
  format: 'A4',
  margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
  printBackground: true,
};

for (const file of files) {
  const inputPath = resolve(__dirname, file.input);
  const outputPath = resolve(__dirname, file.output);

  try {
    readFileSync(inputPath, 'utf8');
  } catch {
    console.log(`⏭ Skipped (not found): ${file.input}`);
    continue;
  }

  try {
    console.log(`📄 Generating ${file.output}...`);
    await mdToPdf(
      { path: inputPath },
      {
        dest: outputPath,
        pdf_options: pdfOptions,
        css: `
          body { font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 13px; line-height: 1.6; }
          h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 8px; }
          h2 { color: #1e3a5f; margin-top: 1.5em; }
          h3 { color: #374151; }
          table { border-collapse: collapse; width: 100%; margin: 12px 0; }
          th, td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; font-size: 12px; }
          th { background: #f3f4f6; font-weight: 600; }
          tr:nth-child(even) { background: #f9fafb; }
          code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
          pre { background: #1f2937; color: #e5e7eb; padding: 16px; border-radius: 8px; overflow-x: auto; }
          pre code { background: none; color: inherit; }
          blockquote { border-left: 4px solid #3b82f6; margin: 16px 0; padding: 8px 16px; background: #eff6ff; }
        `,
        launch_options: { args: ['--no-sandbox'] },
      }
    );
    console.log(`✅ ${file.output}`);
  } catch (err) {
    console.error(`❌ Failed: ${file.input} — ${err.message}`);
  }
}

console.log('\n🎉 Done!');
