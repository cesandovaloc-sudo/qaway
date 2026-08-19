import Image from "next/image";
import { Map } from "@/components/Map";
import { Reveal } from "@/components/Reveal";
import { site, whatsappUrl } from "@/data/site";

export function Contact() {
  return (
    <section id="contacto" className="section contactSection">
      <div className="container">
        <Reveal className="contactCards">
          <article>
            <Image src="/assets/icons/icon-clock.svg" alt="" width={42} height={42} />
            <div>
              <strong>Horarios de atención</strong>
              <span>{site.schedule}</span>
            </div>
          </article>
          <article id="ubicacion">
            <Image src="/assets/icons/icon-pin.svg" alt="" width={42} height={42} />
            <div>
              <strong>Visítanos</strong>
              <a href={site.mapsUrl} target="_blank" rel="noreferrer">
                {site.address}
              </a>
            </div>
          </article>
          <article>
            <Image src="/assets/icons/icon-whatsapp.svg" alt="" width={42} height={42} />
            <div>
              <strong>Escríbenos</strong>
              <a
                href={whatsappUrl("Hola, quisiera información.")}
                target="_blank"
                rel="noreferrer"
              >
                {site.phone}
              </a>
            </div>
          </article>
        </Reveal>
        <Reveal className="map">
          <Map />
          <a className="mapCta button buttonPrimary" href={site.mapsDirectionsUrl} target="_blank" rel="noreferrer" aria-label="Cómo llegar a Josué Panadería en Google Maps">
            Cómo llegar
            <span className="mapCtaIcon">↗</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
