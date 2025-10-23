#!/usr/bin/env python3
"""Script to integrate the guide editor into App.js"""

import re

# Read the file
with open('src/App.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Change 1: Add import after line 3
import_pattern = r"(import HostedGuidesAdmin from './components/HostedGuidesAdmin';)"
import_replacement = r"\1\nimport GuideEditorStandalone from './components/GuideEditorStandalone';"
content = re.sub(import_pattern, import_replacement, content, count=1)

# Change 2: Add state variables after selectedGuideId
state_pattern = r"(const \[selectedGuideId, setSelectedGuideId\] = useState\(null\);)"
state_replacement = r"\1\n  const [showGuideEditor, setShowGuideEditor] = useState(false);\n  const [editingGuideId, setEditingGuideId] = useState(null);"
content = re.sub(state_pattern, state_replacement, content, count=1)

# Change 3: Replace HostedGuidesAdmin rendering
old_rendering = r"{adminTab === 'hostedGuides' && \(\s*<HostedGuidesAdmin decks={decks} />\s*\)}"

new_rendering = """{adminTab === 'hostedGuides' && (
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
                    alert(`View guide: ${slug}\\n\\nPublic guide viewer coming soon!`);
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
                    alert(`Guide "${guide.title}" saved successfully!`);
                    setShowGuideEditor(false);
                    setEditingGuideId(null);
                  }}
                />
              )}
            </>
          )}"""

content = re.sub(old_rendering, new_rendering, content, flags=re.DOTALL)

# Write the file back
with open('src/App.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Successfully integrated guide editor into App.js!")
print("\nChanges made:")
print("1. Added GuideEditorStandalone import")
print("2. Added showGuideEditor and editingGuideId state variables")
print("3. Updated HostedGuidesAdmin rendering with editor integration")
