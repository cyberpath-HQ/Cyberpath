import React, {
    useState, useEffect, useMemo, useCallback
} from "react";
import Fuse, { type FuseIndex } from "fuse.js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import { AuthorAvatar } from "@/components/react/author-avatar";
import { OptimizedImage } from "@/components/react/optimized-image";
import {
    type SearchableBlogPost, FUSE_OPTIONS
} from "@/lib/search-utils";
import {
    ALL_CATEGORIES, getCategoryColor, type Category
} from "@/lib/categories";
import type { Author } from "@/data/authors";
import { cn } from "@/lib/utils";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from "@/components/ui/collapsible";

interface BlogListProps {
    posts:              Array<SearchableBlogPost>
    authors:            Record<string, Author>
    itemsPerPage?:      number
    images:             Record<string, string | undefined>
    author_images:      Record<string, string | undefined>
    blur_images:        Record<string, string | undefined>
    author_blur_images: Record<string, string | undefined>
    index:              FuseIndex<SearchableBlogPost>
}

export function BlogList({
    posts,
    authors,
    itemsPerPage = 9,
    images,
    author_images,
    blur_images,
    author_blur_images,
    index,
}: BlogListProps): React.JSX.Element {

    const [
        searchQuery,
        setSearchQuery,
    ] = useState(``);
    const [
        selectedCategory,
        setSelectedCategory,
    ] = useState<Category | `all`>(`all`);
    const [
        selectedTags,
        setSelectedTags,
    ] = useState<Set<string>>(new Set());
    const [
        currentPage,
        setCurrentPage,
    ] = useState(1);
    const [
        showFilters,
        setShowFilters,
    ] = useState(false);

    // Initialize Fuse.js
    const fuse = useMemo(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-type-assertion
        () => new Fuse(posts, FUSE_OPTIONS, Fuse.parseIndex(index as any)),
        [
            posts,
            index,
        ]
    );

    // Get all unique tags
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        posts.forEach((post) => post.data.tags.forEach((tag) => tags.add(tag)));
        return Array.from(tags).sort();
    }, [ posts ]);

    // Filter and search posts
    const filteredPosts = useMemo(() => {
        let result = posts;

        // Apply search
        if (searchQuery.trim()) {
            const searchResults = fuse.search(searchQuery);
            result = searchResults.map((r) => r.item);
        }

        // Apply category filter
        if (selectedCategory !== `all`) {
            result = result.filter((post) => post.data.category === selectedCategory);
        }

        // Apply tag filters
        if (selectedTags.size > 0) {
            result = result.filter((post) => post.data.tags.some((tag) => selectedTags.has(tag)));
        }

        return result;
    }, [
        posts,
        fuse,
        searchQuery,
        selectedCategory,
        selectedTags,
    ]);

    // Pagination
    const totalPages = useMemo(() => Math.ceil(filteredPosts.length / itemsPerPage), [
        filteredPosts,
        itemsPerPage,
    ]);
    const paginatedPosts = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredPosts.slice(start, start + itemsPerPage);
    }, [
        filteredPosts,
        currentPage,
        itemsPerPage,
    ]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [
        searchQuery,
        selectedCategory,
        selectedTags,
    ]);

    // Toggle tag selection
    const toggleTag = useCallback(
        (tag: string): void => {
            const newTags = new Set(selectedTags);
            if (newTags.has(tag)) {
                newTags.delete(tag);
            }
            else {
                newTags.add(tag);
            }
            setSelectedTags(newTags);
        },
        [ selectedTags ]
    );

    // Clear all filters
    const clearFilters = useCallback((): void => {
        setSearchQuery(``);
        setSelectedCategory(`all`);
        setSelectedTags(new Set());
        setCurrentPage(1);
    }, []);

    const has_active_filters = useMemo(
        () => Boolean(searchQuery) || selectedCategory !== `all` || selectedTags.size > 0,
        [
            searchQuery,
            selectedCategory,
            selectedTags,
        ]
    );

    const [
        is_collapsible_open,
        setCollapsibleOpen,
    ] = useState(false);

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
                <svg
                    className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
                <input
                    type="text"
                    placeholder="Search articles by title, description, tags, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-10 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery(``)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label="Clear search"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Filter Toggle Button (Mobile) */}
            <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="md:hidden">
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                        />
                    </svg>
                    Filters
                    {has_active_filters && (
                        <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                            {(selectedCategory !== `all` ? 1 : 0) + selectedTags.size}
                        </span>
                    )}
                </Button>

                {has_active_filters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                        Clear all
                        <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </Button>
                )}
            </div>

            {/* Filters Section */}
            <div className={`space-y-4 ${ showFilters ? `block` : `hidden` } md:block`}>
                {/* Category Filter */}
                <div>
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={selectedCategory === `all` ? `default` : `outline`}
                            size="sm"
                            onClick={() => setSelectedCategory(`all`)}
                        >
                            All
                        </Button>
                        {ALL_CATEGORIES.map((category) => (
                            <Button
                                key={category}
                                variant={selectedCategory === category ? `default` : `outline`}
                                size="sm"
                                onClick={() => setSelectedCategory(category)}
                                className={selectedCategory === category ? `` : getCategoryColor(category)}
                            >
                                {category}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Tag Filter */}
                {allTags.length > 0 && (
                    <div>
                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Tags</h3>
                        <Collapsible className="flex flex-wrap gap-2"
                            open={is_collapsible_open}
                            onOpenChange={setCollapsibleOpen}
                        >
                            {allTags.slice(0, 15).map((tag) => (
                                <Badge
                                    key={tag}
                                    variant={selectedTags.has(tag) ? `default` : `outline`}
                                    className="cursor-pointer"
                                    onClick={() => toggleTag(tag)}
                                >
                                    {tag}
                                </Badge>
                            ))}
                            <CollapsibleContent className="flex flex-wrap gap-2">
                                {allTags.slice(15).map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant={selectedTags.has(tag) ? `default` : `outline`}
                                        className="cursor-pointer"
                                        onClick={() => toggleTag(tag)}
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </CollapsibleContent>
                            <CollapsibleTrigger asChild className="w-full text-left text-sm cursor-pointer">
                                <a className="underline">
                                    {is_collapsible_open ? `Show less` : `Show more`}
                                </a>
                            </CollapsibleTrigger>
                        </Collapsible>
                    </div>
                )}
            </div>

            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
                {
                    filteredPosts.length === posts.length
                        ? (
                            <span>Showing all {posts.length} articles</span>
                        )
                        : (
                            <span>
                                Found {filteredPosts.length} of {posts.length} articles
                            </span>
                        )
                }
            </div>

            {/* Blog Posts Grid */}
            {
                paginatedPosts.length > 0
                    ? (
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {paginatedPosts.map((post) => {
                                const author = authors[post.data.author];
                                if (!author) {
                                    return null;
                                }

                                return (
                                    <a key={post.id} href={post.data.url} className="group block h-full">
                                        <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                                            {images[post.id] && blur_images[post.id] && (
                                                <div className="aspect-[16/9] transition-all hover:border-primary/50 overflow-hidden rounded-t-xl">
                                                    <OptimizedImage
                                                        src={images[post.id]!}
                                                        blurSrc={blur_images[post.id]!}
                                                        alt={post.data.title}
                                                        loading="lazy"
                                                        className={cn(
                                                            `h-full w-full object-cover transition-transform group-hover:scale-105`,
                                                            post.data.heroClass
                                                        )}
                                                    />
                                                </div>
                                            )}
                                            <CardHeader>
                                                <div className="mb-2 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <AuthorAvatar name={author.name} avatarSrc={author.avatar?.default} className="h-8 w-8">
                                                            <OptimizedImage
                                                                src={author_images[post.data.author] ?? ``}
                                                                blurSrc={author_blur_images[post.data.author] ?? ``}
                                                                alt={author.name}
                                                                loading="lazy"
                                                            />
                                                        </AuthorAvatar>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium">{author.name}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {new Date(post.data.pubDate).toLocaleDateString(`en-US`, {
                                                                    year:  `numeric`,
                                                                    month: `short`,
                                                                    day:   `numeric`,
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <Badge className={getCategoryColor(post.data.category)}>{post.data.category}</Badge>
                                                </div>

                                                <CardTitle className="line-clamp-2 group-hover:text-primary">{post.data.title}</CardTitle>
                                                <CardDescription className="line-clamp-3">{post.data.description}</CardDescription>
                                            </CardHeader>

                                            <CardContent>
                                                {post.data.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {post.data.tags.slice(0, 2).map((tag) => (
                                                            <Badge key={tag} variant="secondary" className="text-xs">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                        {post.data.tags.length > 2 && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                +{post.data.tags.length - 2}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}
                                            </CardContent>

                                            {post.data.readingTime && (
                                                <CardFooter>
                                                    <span className="text-sm text-muted-foreground">{post.data.readingTime}</span>
                                                </CardFooter>
                                            )}
                                        </Card>
                                    </a>
                                );
                            })}
                        </div>
                    )
                    : (
                        <div className="py-16 text-center">
                            <p className="text-xl text-muted-foreground">No articles found matching your criteria.</p>
                            {has_active_filters && (
                                <Button variant="outline" onClick={clearFilters} className="mt-4">
                                    Clear filters
                                </Button>
                            )}
                        </div>
                    )
            }

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                    </Button>

                    <div className="flex items-center gap-1">
                        {Array.from(
                            {
                                length: totalPages,
                            },
                            (_, i) => i + 1
                        ).map((page) => {
                            // Show first page, last page, current page, and pages around current
                            const showPage = page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 1 && page <= currentPage + 1);

                            if (!showPage) {
                                // Show ellipsis
                                if (page === currentPage - 2 || page === currentPage + 2) {
                                    return (
                                        <span key={page} className="px-2">
                                            ...
                                        </span>
                                    );
                                }
                                return null;
                            }

                            return (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? `default` : `outline`}
                                    size="sm"
                                    onClick={() => setCurrentPage(page)}
                                    className="min-w-[2.5rem]"
                                >
                                    {page}
                                </Button>
                            );
                        })}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                        <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Button>
                </div>
            )}
        </div>
    );
}
