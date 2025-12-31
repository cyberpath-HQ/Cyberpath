import {
    Avatar, AvatarFallback, AvatarImage
} from "@/components/ui/avatar";
import {
    useMemo, type ReactNode
} from "react";

interface AuthorAvatarProps {
    name:       string
    avatarSrc?: string
    className?: string
    children?:  ReactNode
}

export function AuthorAvatar({
    name, avatarSrc, className = `h-8 w-8`,
    children,
}: AuthorAvatarProps) {
    const getInitials = useMemo(
        () => name
            .split(` `)
            .map((n) => n[0])
            .join(``)
            .toUpperCase()
            .slice(0, 2),
        []
    );

    return (
        <Avatar className={className}>
            {avatarSrc && <AvatarImage src={avatarSrc} alt={name} asChild>{children}</AvatarImage>}
            <AvatarFallback>{getInitials}</AvatarFallback>
        </Avatar>
    );
}
