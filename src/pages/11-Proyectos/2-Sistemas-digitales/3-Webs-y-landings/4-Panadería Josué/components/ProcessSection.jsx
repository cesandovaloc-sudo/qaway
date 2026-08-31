import { Reveal } from "./Reveal.jsx";
import { processItems } from "../data/content.js";

export function ProcessSection() {
  return (
    <section id="proceso" className="section processSection">
      <div className="container">
        <Reveal className="processTop">
          <div>
            <p className="eyebrow">Cómo lo hacemos</p>
            <h2>El proceso detrás de cada pan</h2>
            <p>Desde la selección de harinas hasta el último minuto en el horno, cuidamos cada paso para garantizar el sabor y la frescura que nos distingue.</p>
          </div>
          <img className="breadDisplay" src="/assets/sections/section-bread-display2.webp" alt="Exhibición de panes recién horneados" width={380} height={260} />
        </Reveal>
        <Reveal className="processGrid">
          {processItems.map(item => (
            <article key={item.title}>
              <img src={item.icon} alt="" width={42} height={42} />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
