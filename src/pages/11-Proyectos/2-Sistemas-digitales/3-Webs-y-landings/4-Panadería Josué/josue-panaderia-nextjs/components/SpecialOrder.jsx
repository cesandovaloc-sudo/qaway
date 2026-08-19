import { Reveal } from "./Reveal.jsx";
import { whatsappUrl } from "../data/site.js";

export function SpecialOrder() {
  return (
    <section id="pedidos" className="section sectionCompact">
      <Reveal className="container specialOrder">
        <div>
          <p className="eyebrow">Pedidos especiales</p>
          <h2>¿Tienes un pedido especial?<br />Estamos para ayudarte.</h2>
          <p>Escríbenos por WhatsApp y te responderemos al instante.</p>
          <a className="button buttonPrimary" href={whatsappUrl("Hola, necesito información sobre un pedido especial.")} target="_blank" rel="noreferrer">Escríbenos por WhatsApp</a>
        </div>
        <img src="/josue-images/sections/section-cta-basket2.webp" alt="Canasta con variedad de panes" width={520} height={325} />
      </Reveal>
    </section>
  );
}
