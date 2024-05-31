import { useState, useEffect } from "react"

const useIntersectObserver = (target: HTMLElement | null, cb: IntersectionObserverCallback, opts?: IntersectionObserverInit) => {
    const [observer, setObserver] = useState<IntersectionObserver | null>(null);

    useEffect(() => {
        const OPTIONS: IntersectionObserverInit = {
            root: target,
            rootMargin: opts?.rootMargin || "0px 0px 0px 0px",
            threshold: opts?.threshold || 0
        };
        setObserver(new IntersectionObserver(cb, OPTIONS));
    }, [cb, opts]);

    useEffect(() => {
        if (observer && target) {
            observer.observe(target);
        }
        return () => {
            if (observer && target) {
                observer.unobserve(target);
            }
        }

    }, [target, observer]);
}

export { useIntersectObserver };