"use client";
import { useEffect, useRef } from "react";
import Image from "next/image"; 
import { Reveal } from "@/components/Reveal"; 
import { bestSellers } from "@/data/content";

export function BestSellers() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const items = [...bestSellers, ...bestSellers];

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    let index = 0;
    const interval = window.setInterval(() => {
      const firstCard = container.children[0] as HTMLElement | undefined;
      const cardWidth = firstCard ? firstCard.getBoundingClientRect().width + 22 : 282;
      index += 1;

      container.scrollTo({ left: cardWidth * index, behavior: "smooth" });

      if (index >= bestSellers.length) {
        window.setTimeout(() => {
          container.style.scrollBehavior = "auto";
          container.scrollLeft = 0;
          container.style.scrollBehavior = "";
          index = 0;
        }, 950);
      }
    }, 3600);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="section sectionSoft">
      <div className="container">
        <Reveal className="sectionHeading">
          <div>
            <p className="eyebrow">Favoritos del barrio</p>
            <h2>Los más pedidos</h2>
          </div>
        </Reveal>
        <Reveal>
          <div ref={carouselRef} className="cardsGrid carousel">
            {items.map((p, index) => (
              <article className="card productCard" key={`${p.title}-${index}`} aria-hidden={index >= bestSellers.length}>
                <div className="cardImage">
                  <Image src={p.image} alt={p.title} fill sizes="(max-width: 680px) 100vw, (max-width: 980px) 50vw, 25vw" />
                </div>
                <div className="cardBody">
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                  <strong>{p.price}</strong>
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
