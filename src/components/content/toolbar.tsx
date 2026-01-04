"use client"

import { type Editor } from "@tiptap/react"
import {
    Bold,
    Italic,
    Strikethrough,
    List,
    ListOrdered,
    Heading2,
} from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { Separator } from "@/components/ui/separator"

type Props = {
    editor: Editor | null
}

export function Toolbar({ editor }: Props) {
    if (!editor) {
        return null
    }

    return (
        <div className="border border-input bg-transparent rounded-md mb-2 p-1 flex flex-row items-center gap-1">
            <Toggle
                size="sm"
                pressed={editor.isActive("heading")}
                onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                aria-label="Toggle heading"
            >
                <Heading2 className="h-4 w-4" />
            </Toggle>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <Toggle
                size="sm"
                pressed={editor.isActive("bold")}
                onPressedChange={() => editor.chain().focus().toggleBold().run()}
                aria-label="Toggle bold"
            >
                <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("italic")}
                onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                aria-label="Toggle italic"
            >
                <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("strike")}
                onPressedChange={() => editor.chain().focus().toggleStrike().run()}
                aria-label="Toggle strikethrough"
            >
                <Strikethrough className="h-4 w-4" />
            </Toggle>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <Toggle
                size="sm"
                pressed={editor.isActive("bulletList")}
                onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                aria-label="Toggle bullet list"
            >
                <List className="h-4 w-4" />
            </Toggle>
            <Toggle
                size="sm"
                pressed={editor.isActive("orderedList")}
                onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                aria-label="Toggle ordered list"
            >
                <ListOrdered className="h-4 w-4" />
            </Toggle>
        </div>
    )
}
