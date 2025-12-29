import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AuthorAvatarProps {
    name: string;
    avatarSrc?: string;
    className?: string;
}

export function AuthorAvatar({ name, avatarSrc, className = "h-8 w-8" }: AuthorAvatarProps) {
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <Avatar className={className}>
            {avatarSrc && <AvatarImage src={avatarSrc} alt={name} />}
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
        </Avatar>
    );
}
