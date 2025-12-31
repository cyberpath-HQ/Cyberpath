import {
    useEffect, useRef, useState
} from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
    src:        string
    blurSrc?:   string
    alt:        string
    width?:     number
    height?:    number
    className?: string
    loading?:   `lazy` | `eager`
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function OptimizedImage({
    src,
    blurSrc,
    alt,
    width,
    height,
    className = ``,
    loading = `lazy`,
}: OptimizedImageProps): React.JSX.Element {
    const [
        is_loaded,
        setIsLoaded,
    ] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const img = imgRef.current;
        const complete_height = 0;

        if (!img) {
            return;
        }

        if (img.complete && img.naturalHeight !== complete_height) {
            setIsLoaded(true);
        }
    }, []);

    const handleLoad = (): void => {
        setIsLoaded(true);
    };

    const handleError = (): void => {
    // Still mark as loaded to hide blur
        setIsLoaded(true);
        console.error(`Failed to load image:`, src);
    };

    // If no blur placeholder or loading is eager, just render the image
    if (!blurSrc || loading === `eager`) {
        return (
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                width={width}
                height={height}
                loading={loading}
                className={className}
                onLoad={handleLoad}
                onError={handleError}
            />
        );
    }

    return (
        <div className={cn(`relative overflow-hidden`, className)}>
            {/* Blur placeholder */}
            <img
                src={blurSrc}
                alt=""
                aria-hidden="true"
                className={cn(
                    `absolute inset-0 w-full h-full object-cover blur-xl scale-110 transition-opacity duration-400`,
                    is_loaded ? `opacity-0 pointer-events-none` : `opacity-100`,
                    className
                )}
            />

            {/* Main image */}
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                width={width}
                height={height}
                loading={loading}
                className={cn(
                    `relative z-10 w-full h-full object-cover transition-opacity duration-400`,
                    is_loaded ? `opacity-100` : `opacity-0`,
                    className
                )}
                onLoad={handleLoad}
                onError={handleError}
            />
        </div>
    );
}
