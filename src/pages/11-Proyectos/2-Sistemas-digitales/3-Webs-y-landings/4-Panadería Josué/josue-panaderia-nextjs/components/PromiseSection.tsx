import Image from "next/image";
import { Reveal } from "@/components/Reveal";

export function PromiseSection(){
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
          <Image src="/assets/sections/section-preparacion3.webp" alt="Panadera preparando masa fresca" fill sizes="(max-width: 800px) 100vw, 50vw"/>
        </div>
      </Reveal>
    </section>
  );
}
