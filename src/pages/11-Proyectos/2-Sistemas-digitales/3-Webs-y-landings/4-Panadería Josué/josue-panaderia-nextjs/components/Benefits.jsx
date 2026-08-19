import { Reveal } from "./Reveal.jsx";
import { benefits } from "../data/content.js";

export function Benefits() {
  return (
    <section className="benefits sectionCompact">
      <Reveal className="container benefitsGrid">
        {benefits.map(item => (
          <article className="benefit" key={item.title}>
            <img src={item.icon} alt="" width={48} height={48} />
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </Reveal>
    </section>
  );
}
