const fs = require('fs');

const text = fs.readFileSync('scratch/companies.txt', 'utf8');
const lines = text.split('\n').filter(l => l.trim().length > 0);

const companies = lines.map((line, idx) => {
  // Line format: "1. Google – https://careers.google.com"
  const match = line.match(/^\d+\.\s+(.*?)\s+[–-]\s+(.*)$/);
  if (match) {
    const name = match[1].trim();
    const website = match[2].trim();
    // Default values for industry and logo
    const logo = `https://logo.clearbit.com/${new URL(website.startsWith('http') ? website : 'https://' + website).hostname.replace('careers.', '').replace('jobs.', '').replace('www.', '')}`;
    const desc = `Explore career opportunities at ${name}.`;
    let industry = 'Corporate';
    
    // Quick heuristic for industry based on index in the list
    if (idx < 10) industry = 'Big Tech';
    else if (idx < 20) industry = 'IT & Software';
    else if (idx < 30) industry = 'Indian IT';
    else if (idx < 40) industry = 'Startups';
    else if (idx < 50) industry = 'Finance';
    else if (idx < 60) industry = 'Engineering';
    else if (idx < 70) industry = 'Healthcare';
    else if (idx < 80) industry = 'Retail/FMCG';
    else industry = 'Technology';

    return { id: idx + 1, name, logo, website, desc, industry };
  }
  return null;
}).filter(Boolean);

const companiesStr = JSON.stringify(companies, null, 2);

const jsxPath = 'frontend/src/pages/Companies.jsx';
let jsxContent = fs.readFileSync(jsxPath, 'utf8');

// Replace the const MOCK_COMPANIES = [ ... ]; block
const regex = /const MOCK_COMPANIES = \[[\s\S]*?\];/;
jsxContent = jsxContent.replace(regex, `const MOCK_COMPANIES = ${companiesStr};`);

fs.writeFileSync(jsxPath, jsxContent, 'utf8');
console.log('Updated Companies.jsx successfully!');
