'use client';

import React, { useCallback, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import FontFamily from '@tiptap/extension-font-family';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import CharacterCount from '@tiptap/extension-character-count';
import Image from '@tiptap/extension-image';
import styles from './RichTextEditor.module.css';

// قائمة الخطوط المتاحة
const FONTS = [
    { name: 'Cairo', value: 'var(--font-cairo)', label: 'القاهرة' },
    { name: 'Tajawal', value: 'var(--font-tajawal)', label: 'تجوال' },
    { name: 'Almarai', value: 'var(--font-almarai)', label: 'المراعي' },
    { name: 'Amiri', value: 'var(--font-amiri)', label: 'أميري' },
    { name: 'Noto Naskh', value: 'var(--font-noto-naskh)', label: 'نوتو نسخ' },
    { name: 'Reem Kufi', value: 'var(--font-reem-kufi)', label: 'ريم كوفي' },
    { name: 'El Messiri', value: 'var(--font-el-messiri)', label: 'المسيري' },
    { name: 'Lateef', value: 'var(--font-lateef)', label: 'لطيف' },
];

// ألوان النص
const TEXT_COLORS = [
    '#000000', '#374151', '#6B7280', '#9CA3AF',
    '#DC2626', '#EA580C', '#D97706', '#CA8A04',
    '#65A30D', '#16A34A', '#0D9488', '#0891B2',
    '#2563EB', '#4F46E5', '#7C3AED', '#9333EA',
    '#C026D3', '#DB2777', '#E11D48',
];

// ألوان التظليل
const HIGHLIGHT_COLORS = [
    '#FEF08A', '#FDE68A', '#FED7AA', '#FECACA',
    '#BBF7D0', '#A7F3D0', '#99F6E4', '#A5F3FC',
    '#BFDBFE', '#C7D2FE', '#DDD6FE', '#E9D5FF',
    '#FBCFE8', '#FECDD3',
];

interface RichTextEditorProps {
    content: string;
    onChange?: (html: string) => void;
    placeholder?: string;
}

function RichTextEditorImpl({ content, onChange, placeholder = 'اكتب محتوى المقال هنا...' }: RichTextEditorProps) {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showHighlightPicker, setShowHighlightPicker] = useState(false);
    const [showFontPicker, setShowFontPicker] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                autolink: true,
                HTMLAttributes: {
                    class: styles.editorLink,
                },
            }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({ placeholder }),
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            FontFamily,
            Subscript,
            Superscript,
            CharacterCount,
            Image.configure({
                HTMLAttributes: {
                    class: styles.editorImage,
                },
            }),
        ],
        content,
        editorProps: {
            attributes: {
                class: styles.editorContent,
                dir: 'rtl',
            },
        },
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
        immediatelyRender: false,
    });

    React.useEffect(() => {
        if (!editor) return;
        const html = editor.getHTML();
        if (content !== html) {
            editor.commands.setContent(content ?? '');
        }
    }, [editor, content]);

    const setLink = useCallback(() => {
        const previousUrl = editor?.getAttributes('link').href;
        const url = window.prompt('أدخل الرابط', previousUrl);

        if (url === null) return;

        if (url === '') {
            editor?.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor?.chain().focus().extendMarkRange('link').setLink({ href: url, target: '_blank' }).run();
    }, [editor]);

    const addImage = useCallback(() => {
        const url = window.prompt('أدخل رابط الصورة');
        if (url) {
            editor?.chain().focus().setImage({ src: url }).run();
        }
    }, [editor]);

    if (!editor) return null;

    const characterCount = editor.storage.characterCount;

    return (
        <div className={styles.editorWrapper}>
            {/* شريط الأدوات الرئيسي */}
            <div className={styles.toolbar}>
                {/* مجموعة العناوين */}
                <div className={styles.toolbarGroup}>
                    <button
                        type="button"
                        className={`${styles.toolbarBtn} ${editor.isActive('heading', { level: 1 }) ? styles.toolbarBtnActive : ''}`}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        title="عنوان رئيسي"
                    >
                        H1
                    </button>
                    <button
                        type="button"
                        className={`${styles.toolbarBtn} ${editor.isActive('heading', { level: 2 }) ? styles.toolbarBtnActive : ''}`}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        title="عنوان فرعي"
                    >
                        H2
                    </button>
                    <button
                        type="button"
                        className={`${styles.toolbarBtn} ${editor.isActive('heading', { level: 3 }) ? styles.toolbarBtnActive : ''}`}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        title="عنوان صغير"
                    >
                        H3
                    </button>
                    <button
                        type="button"
                        className={`${styles.toolbarBtn} ${editor.isActive('paragraph') ? styles.toolbarBtnActive : ''}`}
                        onClick={() => editor.chain().focus().setParagraph().run()}
                        title="فقرة"
                    >
                        ¶
                    </button>
                </div>

                <div className={styles.toolbarDivider} />

                {/* مجموعة التنسيق */}
                <div className={styles.toolbarGroup}>
                    <button
                        type="button"
                        className={`${styles.toolbarBtn} ${editor.isActive('bold') ? styles.toolbarBtnActive : ''}`}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        title="عريض (Ctrl+B)"
                    >
                        عريض
                    </button>
                    <button
                        type="button"
                        className={`${styles.toolbarBtn} ${editor.isActive('italic') ? styles.toolbarBtnActive : ''}`}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        title="مائل (Ctrl+I)"
                    >
                        مائل
                    </button>
                    <button
                        type="button"
                        className={`${styles.toolbarBtn} ${editor.isActive('underline') ? styles.toolbarBtnActive : ''}`}
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        title="تحته خط (Ctrl+U)"
                    >
                        تحته خط
                    </button>
                    <button
                        type="button"
                        className={`${styles.toolbarBtn} ${editor.isActive('strike') ? styles.toolbarBtnActive : ''}`}
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        title="مشطوب"
                    >
                        مشطوب
                    </button>
                </div>

                <div className={styles.toolbarDivider} />

                {/* الخطوط */}
                <div className={styles.toolbarGroup}>
                    <div className={styles.dropdownWrapper}>
                        <button
                            type="button"
                            className={styles.toolbarBtn}
                            onClick={() => setShowFontPicker(!showFontPicker)}
                            title="نوع الخط"
                        >
                            🖋️ الخط
                        </button>
                        {showFontPicker && (
                            <div className={styles.dropdown}>
                                {FONTS.map((font) => (
                                    <button
                                        key={font.name}
                                        type="button"
                                        className={styles.dropdownItem}
                                        style={{ fontFamily: font.value }}
                                        onClick={() => {
                                            editor.chain().focus().setFontFamily(font.value).run();
                                            setShowFontPicker(false);
                                        }}
                                    >
                                        {font.label}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    className={styles.dropdownItem}
                                    onClick={() => {
                                        editor.chain().focus().unsetFontFamily().run();
                                        setShowFontPicker(false);
                                    }}
                                >
                                    افتراضي
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.toolbarDivider} />

                {/* الألوان */}
                <div className={styles.toolbarGroup}>
                    <div className={styles.dropdownWrapper}>
                        <button
                            type="button"
                            className={styles.toolbarBtn}
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            title="لون النص"
                        >
                            🎨
                        </button>
                        {showColorPicker && (
                            <div className={styles.colorPicker}>
                                {TEXT_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={styles.colorBtn}
                                        style={{ backgroundColor: color }}
                                        onClick={() => {
                                            editor.chain().focus().setColor(color).run();
                                            setShowColorPicker(false);
                                        }}
                                    />
                                ))}
                                <button
                                    type="button"
                                    className={styles.colorResetBtn}
                                    onClick={() => {
                                        editor.chain().focus().unsetColor().run();
                                        setShowColorPicker(false);
                                    }}
                                >
                                    إزالة اللون
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={styles.dropdownWrapper}>
                        <button
                            type="button"
                            className={`${styles.toolbarBtn} ${editor.isActive('highlight') ? styles.toolbarBtnActive : ''}`}
                            onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                            title="تظليل"
                        >
                            🖍️
                        </button>
                        {showHighlightPicker && (
                            <div className={styles.colorPicker}>
                                {HIGHLIGHT_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={styles.colorBtn}
                                        style={{ backgroundColor: color }}
                                        onClick={() => {
                                            editor.chain().focus().toggleHighlight({ color }).run();
                                            setShowHighlightPicker(false);
                                        }}
                                    />
                                ))}
                                <button
                                    type="button"
                                    className={styles.colorResetBtn}
                                    onClick={() => {
                                        editor.chain().focus().unsetHighlight().run();
                                        setShowHighlightPicker(false);
                                    }}
                                >
                                    إزالة التظليل
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.toolbarDivider} />

                {/* القوائم */}
                <div className={styles.toolbarGroup}>
                    <button
                        type="button"
                        className={`${styles.toolbarBtn} ${editor.isActive('bulletList') ? styles.toolbarBtnActive : ''}`}
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        title="قائمة نقطية"
                    >
                        •
                    </button>
                    <button
                        type="button"
                        className={`${styles.toolbarBtn} ${editor.isActive('orderedList') ? styles.toolbarBtnActive : ''}`}
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        title="قائمة رقمية"
                    >
                        1.
                    </button>
                    <button
                        type="button"
                        className={`${styles.toolbarBtn} ${editor.isActive('blockquote') ? styles.toolbarBtnActive : ''}`}
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        title="اقتباس"
                    >
                        ❝
                    </button>
                </div>

                <div className={styles.toolbarDivider} />

                {/* المحاذاة */}
                <div className={styles.toolbarGroup}>
                    <button
                        type="button"
                        className={`${styles.toolbarBtn} ${editor.isActive({ textAlign: 'right' }) ? styles.toolbarBtnActive : ''}`}
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        title="محاذاة يمين"
                    >
                        ⫷
                    </button>
                    <button
                        type="button"
                        className={`${styles.toolbarBtn} ${editor.isActive({ textAlign: 'center' }) ? styles.toolbarBtnActive : ''}`}
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        title="محاذاة وسط"
                    >
                        ≡
                    </button>
                    <button
                        type="button"
                        className={`${styles.toolbarBtn} ${editor.isActive({ textAlign: 'left' }) ? styles.toolbarBtnActive : ''}`}
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        title="محاذاة يسار"
                    >
                        ⫸
                    </button>
                </div>

                <div className={styles.toolbarDivider} />

                {/* الإضافات */}
                <div className={styles.toolbarGroup}>
                    <button
                        type="button"
                        className={`${styles.toolbarBtn} ${editor.isActive('link') ? styles.toolbarBtnActive : ''}`}
                        onClick={setLink}
                        title="إضافة رابط"
                    >
                        🔗
                    </button>
                    <button
                        type="button"
                        className={styles.toolbarBtn}
                        onClick={() => editor.chain().focus().unsetLink().run()}
                        title="إزالة الرابط"
                        disabled={!editor.isActive('link')}
                    >
                        🔗✕
                    </button>
                    <button
                        type="button"
                        className={styles.toolbarBtn}
                        onClick={addImage}
                        title="إضافة صورة"
                    >
                        🖼️
                    </button>
                </div>

                <div className={styles.toolbarDivider} />

                {/* Subscript/Superscript */}
                <div className={styles.toolbarGroup}>
                    <button
                        type="button"
                        className={`${styles.toolbarBtn} ${editor.isActive('subscript') ? styles.toolbarBtnActive : ''}`}
                        onClick={() => editor.chain().focus().toggleSubscript().run()}
                        title="نص منخفض"
                    >
                        X₂
                    </button>
                    <button
                        type="button"
                        className={`${styles.toolbarBtn} ${editor.isActive('superscript') ? styles.toolbarBtnActive : ''}`}
                        onClick={() => editor.chain().focus().toggleSuperscript().run()}
                        title="نص مرتفع"
                    >
                        X²
                    </button>
                </div>

                <div className={styles.toolbarDivider} />

                {/* التراجع والإعادة */}
                <div className={styles.toolbarGroup}>
                    <button
                        type="button"
                        className={styles.toolbarBtn}
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        title="تراجع (Ctrl+Z)"
                    >
                        ↩
                    </button>
                    <button
                        type="button"
                        className={styles.toolbarBtn}
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        title="إعادة (Ctrl+Y)"
                    >
                        ↪
                    </button>
                </div>
            </div>

            {/* منطقة الكتابة */}
            <EditorContent editor={editor} />

            {/* عداد الكلمات */}
            <div className={styles.footer}>
                <span className={styles.counter}>
                    {characterCount?.characters() || 0} حرف • {characterCount?.words() || 0} كلمة
                </span>
            </div>
        </div>
    );
}

export default function RichTextEditor(props: RichTextEditorProps) {
    const [mounted, setMounted] = useState(false);
    React.useEffect(() => setMounted(true), []);
    if (!mounted) return null;
    return <RichTextEditorImpl {...props} />;
}
