"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import { Toolbar } from "./toolbar"

interface EditorProps {
    value: string;
    onChange: (richText: string) => void;
}

export function Editor({ value, onChange }: EditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
            }),
            Image,
        ],
        content: value,
        editorProps: {
            attributes: {
                class: "rounded-md border min-h-[150px] border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            },
        },
        onUpdate({ editor }) {
            onChange(editor.getHTML())
        },
    })

    return (
        <div className="flex flex-col justify-stretch min-h-[250px] w-full">
            <Toolbar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    )
}
