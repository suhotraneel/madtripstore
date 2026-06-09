const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

for (const file of files) {
  const filePath = path.join(localesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // A simple regex to replace the specific anchor tags we care about.
  // We'll target "<a href=\"{{ link }}\">" when it's near "shipping" or in general.
  // Actually, we can just replace within the specific keys by parsing JSON, but
  // string replacement is easier since we know the exact keys from grep.
  
  // We want to replace <a href="{{ link }}"> with <a href="{{ link }}" target="_blank">
  // ONLY in lines that define the shipping policy strings.
  
  const lines = content.split('\n');
  const updatedLines = lines.map(line => {
    if (line.includes('shipping_policy_html') || line.includes('_with_policy_html')) {
      // replace the exact string or handle translated attributes
      return line.replace(/<a\s+href=\\"\{\{\s*link\s*\}\}\\"([^>]*)>/g, '<a href=\\"{{ link }}\\" target=\\"_blank\\"$1>');
    }
    // Also handle languages that might use single quotes or HTML entities.
    // Like: <a href=\"&lt;span%20class='notranslate'&gt;{{%20link%20}}&lt;\/span&gt;\">
    if (line.includes('shipping_policy_html') || line.includes('_with_policy_html')) {
        return line.replace(/<a\s+href=\\"([^"]+)\\"([^>]*)>/g, '<a href=\\"$1\\" target=\\"_blank\\"$2>');
    }
    
    return line;
  });
  
  fs.writeFileSync(filePath, updatedLines.join('\n'), 'utf8');
  console.log(`Updated ${file}`);
}
