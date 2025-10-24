const fs = require('fs');

console.log('Adding key prop to modal overlays to force React re-render...\\n');

let content = fs.readFileSync('src/App.js', 'utf8');

// Find both modals and add key prop to the overlay divs
// Pattern: <div className="edit-resource-overlay"
// Replace with: <div key={editingResource?.id || 'modal'} className="edit-resource-overlay"

const oldPattern = '<div className="edit-resource-overlay" onClick={() => setEditingResource(null)>';
const newPattern = '<div key={editingResource?.id || \'modal\'} className="edit-resource-overlay" onClick={() => setEditingResource(null)}>';

// Count occurrences
const count = (content.match(new RegExp(oldPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&'), 'g')) || []).length;
console.log(`Found ${count} modal overlay(s) to update`);

if (count > 0) {
  content = content.split(oldPattern).join(newPattern);
  fs.writeFileSync('src/App.js', content, 'utf8');
  console.log(`\\n✅ Added key prop to ${count} modal overlay(s)`);
  console.log('The key prop will force React to create a new component instance');
  console.log('when editingResource.id changes, triggering a fresh render.');
} else {
  console.log('⚠️  No modals found with the expected pattern');
}
