import { useEffect } from " react\;
import { useCookieConsent } from \@/context/CookieConsentContext\;

const META_PIXEL_ID = \995244849980283\;

export default function MetaPixel() {
 const { accepted } = useCookieConsent();

 useEffect(() => {
 if (!accepted) return;
 if (!window.fbq) {
 !(function(f,b,e,v,n,t,s){
 if(f.fbq) return;
 n=f.fbq=function(){ n.callMethod ? n.callMethod.apply(n,arguments) : n.queue.push(arguments); };
 if(!f._fbq) f._fbq=n;
 n.push=n; n.loaded=!0; n.version='2.0'; n.queue=[];
 t=b.createElement(e); t.async=!0; t.src=v;
 s=b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t,s);
 })(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
 }
 window.fbq('init', META_PIXEL_ID);
 window.fbq('track','PageView');
 }, [accepted]);

 return (
 <noscript>
 <img height='1' width='1' style={{display:'none'}} src={https://www.facebook.com/tr?id=&ev=PageView&noscript=1} alt='' />
 </noscript>
 );
}
