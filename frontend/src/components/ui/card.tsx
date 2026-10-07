import * as React from "react"

import {cn} from "@/lib/utils"

function Card({className, ...props}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card"
            className={cn(
                "bg-card text-card-foreground flex flex-col rounded-lg border border-border transition-colors",
                className
            )}
            {...props}
        />
    )
}

function CardHeader({className, ...props}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-header"
            className={cn(
                "flex flex-col space-y-1.5 p-4 [.border-b]:pb-4",
                className
            )}
            {...props}
        />
    )
}

function CardTitle({className, ...props}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-title"
            className={cn("leading-none font-semibold text-foreground", className)}
            {...props}
        />
    )
}

function CardDescription({className, ...props}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-description"
            className={cn("text-muted-foreground text-xs leading-relaxed", className)}
            {...props}
        />
    )
}

function CardAction({className, ...props}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-action"
            className={cn(
                "ml-auto flex items-center gap-2",
                className
            )}
            {...props}
        />
    )
}

function CardContent({className, ...props}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-content"
            className={cn("p-4 pt-0", className)}
            {...props}
        />
    )
}

function CardFooter({className, ...props}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-footer"
            className={cn("flex items-center p-4 pt-0 [.border-t]:pt-4", className)}
            {...props}
        />
    )
}

export {
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardAction,
    CardDescription,
    CardContent,
}
