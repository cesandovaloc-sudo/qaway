import { Reveal } from "./Reveal.jsx";
import { categories } from "../data/content.js";

export function Products() {
  return (
    <section id="productos" className="section">
      <div className="container">
        <Reveal className="sectionHeading">
          <div>
            <p className="eyebrow">Recién horneado</p>
            <h2>Nuestros productos</h2>
          </div>
          <p>Todo lo que necesitas, preparado cada mañana.</p>
        </Reveal>
        <Reveal className="cardsGrid">
          {categories.map(c => (
            <article className="card" key={c.title}>
              <div className="cardImage">
                <img src={c.image} alt={c.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div className="cardBody">
                <h3>{c.title}</h3>
                <p>{c.text}</p>
                <a href="#pedidos">Ver más →</a>
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
