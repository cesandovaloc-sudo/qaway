"use client";
import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { useEffect, useState, useRef } from "react";

function AnimatedStat({ end, prefix = "", suffix = "" }: { end: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setCount(end);
      return;
    }

    const io = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      io.disconnect();

      const start = performance.now();
      const duration = 1400;
      const animate = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * end));

        if (progress < 1) requestAnimationFrame(animate);
        else setCount(end);
      };

      requestAnimationFrame(animate);
    }, { threshold: 0.25 });

    io.observe(el);
    return () => io.disconnect();
  }, [end]);

  return <strong ref={ref} className="statNumber">{prefix}{count}{suffix}</strong>;
}

export function Neighborhood(){
  return (
    <section className="section sectionSoft">
      <Reveal className="container neighborhood">
        <div className="neighborhoodImage">
          <Image src="/assets/sections/section-interior-bakery2.webp" alt="Interior de Josué Panadería" fill sizes="(max-width: 850px) 100vw, 60vw"/>
        </div>
        <div className="neighborhoodCopy">
          <p className="eyebrow">Siempre cerca de ti</p>
          <h2>Tu panadería de todos los días.</h2>
          <p>Atendemos a nuestras familias vecinas con la calidad y el trato que merecen. Gracias por hacer de Josué Panadería parte de tu día a día.</p>
          <div className="stats">
            <div>
              <AnimatedStat end={5} prefix="+" />
              <span>años de experiencia</span>
            </div>
            <div>
              <AnimatedStat end={10} suffix="+" />
              <span>variedades de pan</span>
            </div>
            <div>
              <AnimatedStat end={100} suffix="%" />
              <span>comprometidos contigo</span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
