# Manual Integration Steps - Guide Editor

Since the dev server is running and preventing automated edits, please make these 3 manual changes to `src/App.js`:

## Change 1: Add Import (Line 4)

After line 3 which has:
```javascript
import HostedGuidesAdmin from './components/HostedGuidesAdmin';
```

Add this new line:
```javascript
import GuideEditorStandalone from './components/GuideEditorStandalone';
```

## Change 2: Add State Variables (Around Line 84)

After these lines:
```javascript
const [selectedGuideSlug, setSelectedGuideSlug] = useState(null);
const [selectedGuideId, setSelectedGuideId] = useState(null);
```

Add these two new lines:
```javascript
const [showGuideEditor, setShowGuideEditor] = useState(false);
const [editingGuideId, setEditingGuideId] = useState(null);
```

## Change 3: Replace HostedGuidesAdmin Rendering (Around Line 4007)

Find this line:
```javascript
{adminTab === 'hostedGuides' && (
  <HostedGuidesAdmin decks={decks} />
)}
```

Replace it with:
```javascript
{adminTab === 'hostedGuides' && (
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
          alert(`View guide: ${slug}\n\nPublic guide viewer coming soon!`);
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
)}
```

## That's It!

Save the file and the dev server will auto-reload. Then:

1. Go to Admin Panel
2. Click "Hosted Guides" tab
3. Click "+ Create New Hosted Guide"
4. The editor will appear!

## Then Deploy to Vercel

Once it's working locally:
```bash
git add src/App.js
git commit -m "Integrate guide editor into admin panel"
git push
```

Vercel will auto-deploy!
