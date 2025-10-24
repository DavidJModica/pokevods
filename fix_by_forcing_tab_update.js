const fs = require('fs');

console.log('Forcing React update by toggling adminTab...\\n');

let content = fs.readFileSync('src/App.js', 'utf8');

// Change the tab button onClick to toggle the tab to force React update
const oldOnClick = `              onClick={() => {
                setAdminTab('manageResources');
                fetchAllResources();
              }}`;

const newOnClick = `              onClick={async () => {
                setAdminTab('manageResources');
                await fetchAllResources();
                // Force re-render by briefly toggling to empty then back
                setAdminTab('');
                setTimeout(() => setAdminTab('manageResources'), 0);
              }}`;

if (content.includes(oldOnClick)) {
  content = content.replace(oldOnClick, newOnClick);
  console.log('✅ Updated Manage Resources tab button onClick');
  fs.writeFileSync('src/App.js', content, 'utf8');
  console.log('\\nThis will toggle the tab to force React to re-render the content.');
} else {
  console.log('⚠️  Could not find the exact onClick pattern');
  console.log('Trying simpler approach...');

  // Try to just wrap fetchAllResources and make it async
  const pattern = /setAdminTab\('manageResources'\);[\s\n\r]+fetchAllResources\(\);/;
  if (pattern.test(content)) {
    content = content.replace(pattern, `setAdminTab('manageResources');
                const loadData = async () => {
                  await fetchAllResources();
                  setAdminTab('');
                  setTimeout(() => setAdminTab('manageResources'), 0);
                };
                loadData();`);
    console.log('✅ Updated with async pattern');
    fs.writeFileSync('src/App.js', content, 'utf8');
  } else {
    console.log('❌ Could not find pattern to update');
  }
}
