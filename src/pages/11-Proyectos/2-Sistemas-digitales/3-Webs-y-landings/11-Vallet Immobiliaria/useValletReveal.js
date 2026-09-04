import { useEffect } from 'react';

/**
 * Hook de Scroll Reveal optimizado según Estándar V4 de Qaway Lab
 * Revela elementos con curva de desaceleración suave una sola vez (once: true)
 */
export function useValletReveal(dependency) {
  useEffect(() => {
    const elements = document.querySelectorAll('.vallet-reveal');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.1,
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [dependency]);
}
