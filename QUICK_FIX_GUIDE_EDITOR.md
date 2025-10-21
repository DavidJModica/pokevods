# Quick Fix: Enable Guide Editor

## Step 1: Add Imports to App.js

At the top of App.js (around line 3), add:

```javascript
import GuideEditorStandalone from './components/GuideEditorStandalone';
```

## Step 2: Add State Variables

Find where state variables are defined (around line 83) and add these after `selectedGuideId`:

```javascript
const [showGuideEditor, setShowGuideEditor] = useState(false);
const [editingGuideId, setEditingGuideId] = useState(null);
```

## Step 3: Update the HostedGuidesAdmin Component Call

Find where `<HostedGuidesAdmin decks={decks} />` is rendered (around line 4007) and replace it with:

```javascript
{admin Tab === 'hostedGuides' && !showGuideEditor && (
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
      // For now, just alert - we'll add the viewer later
      alert(`View guide: ${slug}`);
    }}
  />
)}

{/* Guide Editor */}
{adminTab === 'hostedGuides' && showGuideEditor && (
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
      // Optionally refresh the guides list here
    }}
  />
)}
```

## That's It!

After making these 3 changes:

1. **Restart your dev server** (`npm run client`)
2. **Go to Admin Panel → Hosted Guides tab**
3. **Click "+ Create New Hosted Guide"**
4. **The editor will appear!**

## How to Use the Editor

1. Fill in the guide title and select a deck
2. Edit the Introduction section (it starts with one section)
3. Click "+ Add Section" to add more sections
4. For each section:
   - Choose the section type (Intro, Decklist, Matchups, etc.)
   - Give it a title
   - Add content using the rich text editor
5. For Matchups sections:
   - Click "+ Add Matchup"
   - Select opposing deck
   - Set win rate (slider)
   - Choose difficulty
   - Write strategy notes
   - Add key cards
6. Click "Save Draft" to save without publishing
7. Click "Publish" to make it live

## Features Available

✅ Rich text editor with bold, italic, headings, lists, links
✅ Image upload (click image icon in editor)
✅ Multiple sections with custom titles
✅ Matchup builder with visual controls
✅ Draft/publish workflow
✅ Section reordering (up/down arrows)
✅ Form validation

## Next Steps

After you have this working:
- We can add the public guide viewer
- Add guide browsing/listing
- Add search and filtering

But for now, this gives you the full guide creation experience!
