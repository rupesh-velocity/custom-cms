'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export default function TipTapEditor({ content, onChange }: { content: string, onChange: (html: string, text: string) => void }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-base focus:outline-none min-h-[400px] p-4 max-w-none text-[#32373c]',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), editor.getText());
    },
  });

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ onClick, isActive, children }: any) => (
    <button
      onClick={onClick}
      type="button"
      className={`px-2 py-0.5 text-[13px] border rounded-[2px] transition-colors ${
        isActive 
          ? 'bg-[#e5e5e5] border-[#8c8f94] text-[#32373c] shadow-inner' 
          : 'bg-[#f3f5f6] border-[#c3c4c7] text-[#50575e] hover:bg-[#f6f7f7] hover:border-[#8c8f94]'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col bg-white h-full">
      <div className="bg-[#f1f1f1] border-b border-[#c3c4c7] p-1.5 flex gap-1 flex-wrap">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}>
          <span className="font-bold font-serif">b</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}>
          <span className="italic font-serif">i</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => alert('Link feature not fully implemented')} isActive={false}>
          link
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')}>
          b-quote
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')}>
          <span className="line-through">del</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => {}} isActive={false}>
          ins
        </ToolbarButton>
        <ToolbarButton onClick={() => {}} isActive={false}>
          img
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}>
          ul
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}>
          ol
        </ToolbarButton>
        <ToolbarButton onClick={() => {}} isActive={false}>
          li
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')}>
          code
        </ToolbarButton>
        <ToolbarButton onClick={() => {}} isActive={false}>
          more
        </ToolbarButton>
        <ToolbarButton onClick={() => {}} isActive={false}>
          close tags
        </ToolbarButton>
      </div>
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
