const fs = require('fs');

// Read the file
let content = fs.readFileSync('src/App.js', 'utf-8');

// Change 1: Add import after HostedGuidesAdmin import
content = content.replace(
  "import HostedGuidesAdmin from './components/HostedGuidesAdmin';",
  "import HostedGuidesAdmin from './components/HostedGuidesAdmin';\nimport GuideEditorStandalone from './components/GuideEditorStandalone';"
);

// Change 2: Add state variables after selectedGuideId
content = content.replace(
  'const [selectedGuideId, setSelectedGuideId] = useState(null);',
  `const [selectedGuideId, setSelectedGuideId] = useState(null);
  const [showGuideEditor, setShowGuideEditor] = useState(false);
  const [editingGuideId, setEditingGuideId] = useState(null);`
);

// Change 3: Replace HostedGuidesAdmin rendering
const oldRendering = `{adminTab === 'hostedGuides' && (
            <HostedGuidesAdmin decks={decks} />
          )}`;

const newRendering = `{adminTab === 'hostedGuides' && (
            <>
              {!showGuideEditor && (
                <HostedGuidesAdmin
                  decks={decks}
                  onCreateGuide={() => {
                    setEditingGuideId(null);
                    setShowGuideEditor(true);
                  }}
                  onEditGuide={(guideId) => {
                    setEditingGuideId(guideId);
                    setShowGuideEditor(true);
                  }}
                  onViewGuide={(slug) => {
                    alert(\`View guide: \${slug}\\n\\nPublic guide viewer coming soon!\`);
                  }}
                />
              )}

              {showGuideEditor && (
                <GuideEditorStandalone
                  guideId={editingGuideId}
                  decks={decks}
                  onCancel={() => {
                    setShowGuideEditor(false);
                    setEditingGuideId(null);
                  }}
                  onSaveSuccess={(guide) => {
                    alert(\`Guide "\${guide.title}" saved successfully!\`);
                    setShowGuideEditor(false);
                    setEditingGuideId(null);
                  }}
                />
              )}
            </>
          )}`;

content = content.replace(oldRendering, newRendering);

// Write the file back
fs.writeFileSync('src/App.js', content, 'utf-8');

console.log('✅ Successfully integrated guide editor into App.js!');
console.log('\nChanges made:');
console.log('1. Added GuideEditorStandalone import');
console.log('2. Added showGuideEditor and editingGuideId state variables');
console.log('3. Updated HostedGuidesAdmin rendering with editor integration');
