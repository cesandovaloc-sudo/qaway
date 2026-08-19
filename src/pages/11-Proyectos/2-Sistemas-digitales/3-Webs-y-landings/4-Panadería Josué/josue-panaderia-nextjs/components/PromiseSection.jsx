import { Reveal } from "./Reveal.jsx";

export function PromiseSection() {
  return (
    <section id="nosotros" className="section">
      <Reveal className="container splitPanel">
        <div className="splitCopy">
          <p className="eyebrow">Nuestra promesa</p>
          <h2>Pan de verdad, hecho por personas que aman lo que hacen.</h2>
          <p>Cada madrugada comenzamos a amasar con dedicación para que tengas pan fresco y de calidad todos los días. Gracias por elegirnos.</p>
          <a className="button buttonOutline" href="#contacto">Conócenos</a>
        </div>
        <div className="splitImage">
          <img src="/josue-images/sections/section-preparacion3.webp" alt="Panadera preparando masa fresca" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </Reveal>
    </section>
  );
}
