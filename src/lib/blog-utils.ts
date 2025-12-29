/**
 * Calculate reading time for text content
 * @param text The text content to analyze
 * @param wordsPerMinute Average reading speed (default: 200 wpm)
 * @returns Reading time string (e.g., "5 min read")
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 200): string {
    // Remove HTML tags
    const plainText = text.replace(/<[^>]*>/g, '');
    
    // Remove code blocks (they read faster)
    const withoutCode = plainText.replace(/```[\s\S]*?```/g, '');
    
    // Count words
    const words = withoutCode.trim().split(/\s+/).length;
    
    // Calculate minutes
    const minutes = Math.ceil(words / wordsPerMinute);
    
    return `${minutes} min read`;
}

/**
 * Format a date to a readable string
 * @param date Date object or string
 * @param locale Locale string (default: "en-US")
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, locale: string = "en-US"): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return dateObj.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Format a date to ISO 8601 format for datetime attributes
 * @param date Date object or string
 * @returns ISO 8601 date string
 */
export function formatISODate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString();
}

/**
 * Get initials from a name
 * @param name Full name string
 * @returns Initials (e.g., "John Doe" -> "JD")
 */
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Truncate text to a specific length
 * @param text Text to truncate
 * @param maxLength Maximum length
 * @param suffix Suffix to add when truncated (default: "...")
 * @returns Truncated text
 */
export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - suffix.length) + suffix;
}
