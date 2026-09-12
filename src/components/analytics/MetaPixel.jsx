import { useEffect, useState } from 'react';

const PIXEL_ID = '1787532068936007';

export default function MetaPixel() {
  const [country, setCountry] = useState(null);
  const [hasConsent, setHasConsent] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('qaway_cookie_consent') === 'accepted' ||
           localStorage.getItem('cookie_consent') === 'true';
  });

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(d => setCountry(d.country_code))
      .catch(() => setCountry('PE'));

    const handleConsentChange = () => {
      const isAccepted = localStorage.getItem('qaway_cookie_consent') === 'accepted' ||
                         localStorage.getItem('cookie_consent') === 'true';
      setHasConsent(isAccepted);
    };

    window.addEventListener('qaway_cookie_consent_change', handleConsentChange);
    window.addEventListener('storage', handleConsentChange);
    return () => {
      window.removeEventListener('qaway_cookie_consent_change', handleConsentChange);
      window.removeEventListener('storage', handleConsentChange);
    };
  }, []);

  useEffect(() => {
    const shouldLoad = hasConsent || (country && country === 'PE');
    if (!shouldLoad) return;
    if (window.fbq) return;

    !(function(f,b,e,v,n,t,s){
      if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)})(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
  }, [country, hasConsent]);

  return null;
}
