import {
    useEffect, useState,
    type FC
} from "react";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";

interface Heading {
    id:    string
    text:  string
    level: number
}

export const TableOfContents: FC = () => {
    const [
        headings,
        setHeadings,
    ] = useState<Array<Heading>>([]);
    const [
        activeId,
        setActiveId,
    ] = useState<string>(``);

    useEffect(() => {
        // Extract headings from the page
        const articleElement = document.querySelector(`article`);
        if (!articleElement) {
            return;
        }

        const headingElements = articleElement.querySelectorAll(`h1, h2, h3, h4`);
        const headingData: Array<Heading> = Array.from(headingElements)
            .filter((heading) => heading.id)
            .map((heading) => ({
                id:    heading.id,
                text:  heading.textContent || ``,
                level: Number(heading.tagName.substring(1)),
            }));

        setHeadings(headingData);

        // Set up intersection observer for active heading
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: `-100px 0px -66%`,
            }
        );

        headingElements.forEach((heading) => {
            observer.observe(heading);
        });

        return () => {
            headingElements.forEach((heading) => {
                observer.unobserve(heading);
            });
        };
    }, []);

    if (headings.length === 0) {
        return null;
    }

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({
                behavior: `smooth`,
            });
        }
    };

    return (
        <Card className="sticky top-24">
            <CardHeader>
                <CardTitle className="text-lg">Table of Contents</CardTitle>
            </CardHeader>
            <CardContent>
                <nav className="space-y-2 overflow-y-auto max-h-[70dvh]">
                    {headings.map((heading) => (
                        <a
                            key={heading.id}
                            href={`#${ heading.id }`}
                            onClick={(e) => handleClick(e, heading.id)}
                            className={`block text-sm transition-colors hover:text-primary ${
                                activeId === heading.id
                                    ? `font-medium text-primary`
                                    : `text-muted-foreground`
                            }`}
                            style={{
                                paddingLeft: `${ (heading.level - 2) * 1 }rem`,
                            }}
                        >
                            {heading.text}
                        </a>
                    ))}
                </nav>
            </CardContent>
        </Card>
    );
};
