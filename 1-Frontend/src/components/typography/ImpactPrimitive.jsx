import Kicker from './Kicker'
import SectionHeading from './SectionHeading'
import BodyText from './BodyText'

export default function ImpactPrimitive({
  kicker,
  title,
  body,
  className = '',
}) {
  return (
    <div className={`max-w-xl ${className}`}>
      {kicker && <Kicker className="mb-5">{kicker}</Kicker>}
      <SectionHeading
        size="default"
        tracking="-0.022em"
        leading="0.88"
        className="uppercase"
      >
        {title}
      </SectionHeading>
      {body && (
        <BodyText size="lg" className="mt-5">
          {body}
        </BodyText>
      )}
    </div>
  )
}
