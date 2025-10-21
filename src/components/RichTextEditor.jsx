import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import './RichTextEditor.css';

const RichTextEditor = ({ content, onChange, placeholder }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3]
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'guide-image'
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing your guide section...'
      })
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    }
  });

  const addImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image is too large. Maximum size is 10MB.');
        return;
      }

      // Show loading state
      const button = document.querySelector('.image-upload-btn');
      if (button) {
        button.disabled = true;
        button.textContent = 'Uploading...';
      }

      try {
        // Convert to base64 for upload
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const token = localStorage.getItem('token');

            const response = await fetch('/api/upload-guide-image', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                image: event.target.result,
                fileName: file.name
              })
            });

            const result = await response.json();

            if (!response.ok) {
              throw new Error(result.error || 'Upload failed');
            }

            // Insert image into editor
            editor.chain().focus().setImage({ src: result.url }).run();

          } catch (error) {
            console.error('Image upload error:', error);
            alert('Failed to upload image: ' + error.message);
          } finally {
            if (button) {
              button.disabled = false;
              button.textContent = '🖼️ Image';
            }
          }
        };

        reader.readAsDataURL(file);

      } catch (error) {
        console.error('File read error:', error);
        alert('Failed to read image file');
        if (button) {
          button.disabled = false;
          button.textContent = '🖼️ Image';
        }
      }
    };

    input.click();
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) {
      return; // Cancelled
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="rich-text-editor">
      {/* Toolbar */}
      <div className="editor-toolbar">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
          title="Bold"
        >
          <strong>B</strong>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
          title="Italic"
        >
          <em>I</em>
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
          title="Heading 2"
        >
          H2
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
          title="Heading 3"
        >
          H3
        </button>

        <span className="toolbar-separator">|</span>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
          title="Bullet List"
        >
          • List
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
          title="Numbered List"
        >
          1. List
        </button>

        <span className="toolbar-separator">|</span>

        <button
          type="button"
          onClick={setLink}
          className={editor.isActive('link') ? 'is-active' : ''}
          title="Add Link"
        >
          🔗 Link
        </button>

        <button
          type="button"
          onClick={addImage}
          className="image-upload-btn"
          title="Upload Image"
        >
          🖼️ Image
        </button>

        <span className="toolbar-separator">|</span>

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          ↶ Undo
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          ↷ Redo
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
};

export default RichTextEditor;
