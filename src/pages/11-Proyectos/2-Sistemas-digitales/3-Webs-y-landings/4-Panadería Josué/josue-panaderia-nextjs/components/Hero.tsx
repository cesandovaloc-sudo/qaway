import { whatsappUrl } from "@/data/site";
export function Hero() {
  return <section id="inicio" className="hero">
    <div className="heroOverlay" />
    <div className="heroContent">
      <h1>Recién salido<br/>del horno.</h1>
      <p className="heroLead">Pan fresco todos los días.</p>
      <p className="heroText">Horneamos cada mañana para que encuentres pan fresco, variedad y el sabor de siempre cerca de casa.</p>
      <div className="heroActions">
        <a className="button buttonPrimary" href={whatsappUrl("Hola, quiero hacer un pedido.")} target="_blank" rel="noreferrer">Haz tu pedido</a>
        <a className="button buttonGhost" href="#productos">Ver productos</a>
      </div>
    </div>
  </section>;
}
