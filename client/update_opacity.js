const fs = require('fs');
const path = require('path');

const dir = './src/components/landing';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('Background Image')) {
    // Replace <img ... className="w-full h-full object-cover" />
    content = content.replace(/className="w-full h-full object-cover"/g, 'className="w-full h-full object-cover opacity-20"');
    
    // Replace the overlay div
    content = content.replace(/bg-primary-dark\/[0-9]+/g, 'bg-primary-dark/95');
    
    fs.writeFileSync(filePath, content);
  }
});
console.log('Opacity updated');
