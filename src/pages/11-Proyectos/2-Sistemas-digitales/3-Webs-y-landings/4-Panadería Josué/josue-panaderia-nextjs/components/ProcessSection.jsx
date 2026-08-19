import { Reveal } from "./Reveal.jsx";
import { processItems } from "../data/content.js";

export function ProcessSection() {
  return (
    <section className="section processSection">
      <div className="container">
        <Reveal className="processTop">
          <div>
            <p className="eyebrow">Así trabajamos</p>
            <h2>Con ingredientes reales y mucho cariño.</h2>
          </div>
          <img className="breadDisplay" src="/josue-images/sections/section-bread-display2.webp" alt="Panes artesanales" width={420} height={300} />
        </Reveal>
        <Reveal className="processGrid">
          {processItems.map(i => (
            <article key={i.title}>
              <img src={i.icon} alt="" width={48} height={48} />
              <h3>{i.title}</h3>
              <p>{i.text}</p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
