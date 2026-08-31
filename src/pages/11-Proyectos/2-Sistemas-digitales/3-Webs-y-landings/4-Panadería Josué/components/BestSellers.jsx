import { useEffect, useRef } from "react";
import { Reveal } from "./Reveal.jsx";
import { bestSellers } from "../data/content.js";

export function BestSellers() {
  const carouselRef = useRef(null);
  const items = [...bestSellers, ...bestSellers];

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    let index = 0;
    const interval = window.setInterval(() => {
      const firstCard = container.children[0];
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
    <section id="mas-pedidos" className="section sectionSoft">
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
                  <img src={p.image} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
