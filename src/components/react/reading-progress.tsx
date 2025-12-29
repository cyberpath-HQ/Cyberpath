import {
    useEffect, useState
} from "react";

export function ReadingProgress() {
    const [
        progress,
        setProgress,
    ] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            const article = document.querySelector(`article`);
            if (!article) {
                return;
            }

            const scrollTop = window.scrollY;
            const articleTop = article.offsetTop;
            const articleHeight = article.offsetHeight;
            const windowHeight = window.innerHeight;

            const distanceScrolled = scrollTop - articleTop + windowHeight;
            const totalHeight = articleHeight + windowHeight;

            const percentage = Math.min(
                Math.max((distanceScrolled / totalHeight) * 100, 0),
                100
            );

            setProgress(percentage);
        };

        window.addEventListener(`scroll`, updateProgress);
        window.addEventListener(`resize`, updateProgress);
        updateProgress();

        return () => {
            window.removeEventListener(`scroll`, updateProgress);
            window.removeEventListener(`resize`, updateProgress);
        };
    }, []);

    return (
        <div
            className="fixed top-0 left-0 z-50 h-1 bg-[#d313bf] transition-all duration-150"
            style={{
                width: `${ progress }%`,
            }}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
        />
    );
}
