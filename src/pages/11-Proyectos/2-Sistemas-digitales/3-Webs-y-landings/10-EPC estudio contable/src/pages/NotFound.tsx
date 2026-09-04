import {Button} from '../components/Button';
import {BASE} from '../config/site';

export default function NotFound(){
  return (
    <section className="flex min-h-[75vh] items-center justify-center bg-ecp-ice px-6 pt-32 pb-20 text-center">
      <div className="max-w-md">
        <span className="eyebrow text-blue-600">Error 404</span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-ecp-ink md:text-5xl">
          Página no encontrada
        </h1>
        <p className="mt-4 text-[16.5px] leading-relaxed text-slate-600">
          Lo sentimos, la página que estás buscando no existe o ha sido reubicada.
        </p>
        <div className="mt-8 flex justify-center">
          <Button to={`${BASE}/`}>Volver al inicio</Button>
        </div>
      </div>
    </section>
  );
}
