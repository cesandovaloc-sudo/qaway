import { Clock, MapPin, MessageCircle } from "lucide-react";
import { Map } from "./Map.jsx";
import { Reveal } from "./Reveal.jsx";
import { site, whatsappUrl } from "../data/site.js";

export function Contact() {
  return (
    <section id="contacto" className="section contactSection">
      <div className="container">
        <Reveal className="contactCards">
          <article>
            <Clock size={38} color="#4f7f2f" strokeWidth={1.8} />
            <div>
              <strong>Horarios de atención</strong>
              <span>{site.schedule}</span>
            </div>
          </article>
          <article id="ubicacion">
            <MapPin size={38} color="#4f7f2f" strokeWidth={1.8} />
            <div>
              <strong>Visítanos</strong>
              <a href={site.mapsUrl} target="_blank" rel="noreferrer">
                {site.address}
              </a>
            </div>
          </article>
          <article>
            <MessageCircle size={38} color="#4f7f2f" strokeWidth={1.8} />
            <div>
              <strong>Escríbenos</strong>
              <a href={whatsappUrl("Hola, quisiera información.")} target="_blank" rel="noreferrer">
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
