import Link from "next/link";
import { whatsappUrl } from "@/data/site";

export default function NotFound() {
  return (
    <main className="notFound">
      <div className="container">
        <p className="eyebrow">Error 404</p>
        <h1>Página no encontrada.</h1>
        <p className="notFoundText">
          La página que buscas no existe o fue movida. Vuelve al inicio o escríbenos por WhatsApp.
        </p>
        <div className="notFoundActions">
          <Link className="button buttonPrimary" href="/">
            Volver al inicio
          </Link>
          <a
            className="button buttonOutline"
            href={whatsappUrl("Hola, buscaba algo en su página y no lo encontré.")}
            target="_blank"
            rel="noreferrer"
          >
            Escríbenos
          </a>
        </div>
      </div>
    </main>
  );
}
