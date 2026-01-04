import { useState, useEffect, useRef } from 'react';

interface UseTypewriterOptions {
    speed?: number;
    startDelay?: number;
    onComplete?: () => void;
}

export const useTypewriter = (text: string, options: UseTypewriterOptions = {}) => {
    const { speed = 50, startDelay = 0, onComplete } = options;
    const [displayText, setDisplayText] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    const onCompleteRef = useRef(onComplete);

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        let currentIndex = 0;
        let cancelled = false;

        const startTyping = () => {
            setHasStarted(true);
            const typeChar = () => {
                if (cancelled) return;

                if (currentIndex < text.length) {
                    setDisplayText(text.slice(0, currentIndex + 1));
                    currentIndex++;
                    timeoutId = setTimeout(typeChar, speed);
                } else {
                    setIsComplete(true);
                    if (onCompleteRef.current) onCompleteRef.current();
                }
            };
            typeChar();
        };

        if (startDelay > 0) {
            timeoutId = setTimeout(startTyping, startDelay);
        } else {
            startTyping();
        }

        return () => {
            cancelled = true;
            clearTimeout(timeoutId);
        };
    }, [text, speed, startDelay]);

    return { displayText, isComplete, hasStarted };
};
