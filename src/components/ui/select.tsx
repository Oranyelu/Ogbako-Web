'use client';

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Check } from "lucide-react"

interface SelectContextType {
    value?: string
    onValueChange?: (val: string) => void
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    labels: Record<string, React.ReactNode>
    registerLabel: (val: string, label: React.ReactNode) => void
}

const SelectContext = React.createContext<SelectContextType | null>(null)

export function Select({
    value: controlledValue,
    defaultValue = "",
    onValueChange,
    children
}: {
    value?: string
    defaultValue?: string
    onValueChange?: (val: string) => void
    children: React.ReactNode
}) {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
    const [open, setOpen] = React.useState(false)
    const [labels, setLabels] = React.useState<Record<string, React.ReactNode>>({})

    const value = controlledValue !== undefined ? controlledValue : uncontrolledValue

    const handleValueChange = (newVal: string) => {
        if (controlledValue === undefined) {
            setUncontrolledValue(newVal)
        }
        onValueChange?.(newVal)
        setOpen(false)
    }

    const registerLabel = React.useCallback((val: string, label: React.ReactNode) => {
        setLabels(prev => prev[val] === label ? prev : { ...prev, [val]: label })
    }, [])

    // Close when clicking outside
    const containerRef = React.useRef<HTMLDivElement>(null)
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <SelectContext.Provider value={{ value, onValueChange: handleValueChange, open, setOpen, labels, registerLabel }}>
            <div ref={containerRef} className="relative w-full">{children}</div>
        </SelectContext.Provider>
    )
}

export function SelectTrigger({
    className,
    children,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const ctx = React.useContext(SelectContext)
    return (
        <button
            type="button"
            onClick={() => ctx?.setOpen(!ctx.open)}
            className={cn(
                "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-left",
                className
            )}
            {...props}
        >
            {children}
            <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
        </button>
    )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
    const ctx = React.useContext(SelectContext)
    const display = ctx?.value && ctx.labels[ctx.value] ? ctx.labels[ctx.value] : (ctx?.value || placeholder || "Select...")
    return <span className={cn("truncate block", !ctx?.value && "text-muted-foreground")}>{display}</span>
}

export function SelectContent({
    className,
    children
}: {
    className?: string
    children: React.ReactNode
}) {
    const ctx = React.useContext(SelectContext)
    if (!ctx?.open) return null

    return (
        <div
            className={cn(
                "absolute top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80",
                className
            )}
        >
            {children}
        </div>
    )
}

export function SelectItem({
    value,
    className,
    children
}: {
    value: string
    className?: string
    children: React.ReactNode
}) {
    const ctx = React.useContext(SelectContext)

    React.useEffect(() => {
        ctx?.registerLabel(value, children)
    }, [value, children, ctx?.registerLabel])

    const isSelected = ctx?.value === value

    return (
        <div
            onClick={() => ctx?.onValueChange?.(value)}
            className={cn(
                "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                isSelected && "bg-accent font-semibold",
                className
            )}
        >
            {isSelected && (
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Check className="h-4 w-4 text-primary" />
                </span>
            )}
            <span>{children}</span>
        </div>
    )
}
