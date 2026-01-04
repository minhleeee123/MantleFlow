import React from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

export type AnimationVariant =
    | 'fade-up'
    | 'fade-in'
    | 'slide-left'
    | 'slide-right'
    | 'zoom-in'
    | 'slide-up';

interface ScrollRevealProps {
    children: React.ReactNode;
    variant?: AnimationVariant;
    delay?: number;
    className?: string;
    threshold?: number;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
    children,
    variant = 'fade-up',
    delay = 0,
    className = '',
    threshold = 0.1
}) => {
    const { isVisible, elementRef } = useScrollAnimation({ threshold, triggerOnce: true });

    const getAnimationClasses = () => {
        const baseClasses = 'transition-all duration-700 ease-out';

        if (!isVisible) {
            switch (variant) {
                case 'fade-up':
                    return `${baseClasses} opacity-0 translate-y-8`;
                case 'fade-in':
                    return `${baseClasses} opacity-0`;
                case 'slide-left':
                    return `${baseClasses} opacity-0 -translate-x-12`;
                case 'slide-right':
                    return `${baseClasses} opacity-0 translate-x-12`;
                case 'zoom-in':
                    return `${baseClasses} opacity-0 scale-95`;
                case 'slide-up':
                    return `${baseClasses} opacity-0 translate-y-12`;
                default:
                    return `${baseClasses} opacity-0`;
            }
        }

        return `${baseClasses} opacity-100 translate-y-0 translate-x-0 scale-100`;
    };

    return (
        <div
            ref={elementRef}
            className={`${getAnimationClasses()} ${className}`}
            style={{
                transitionDelay: `${delay}ms`,
                willChange: 'transform, opacity'
            }}
        >
            {children}
        </div>
    );
};

export default ScrollReveal;
