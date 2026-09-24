import{a as e,r as t}from"./rolldown-runtime-B0Z9INg1.js";import{t as n}from"./react-CUdNIagt.js";import{d as r,l as i,n as a}from"./chunk-62JRHF6Z-uL5kjEjd.js";import{t as o}from"./jsx-runtime-B74pBk57.js";import{n as s,t as c}from"./supabaseClient-DANACPCs.js";import{t as l}from"./arrow-right-BJQfQsoS.js";import{t as u}from"./eye-off-DBeGUwGQ.js";import{t as d}from"./eye-CHdDQjFf.js";import{t as f}from"./lock-CKf0ou9G.js";import{t as p}from"./mail-BkdpzOSC.js";import{n as m}from"./auth-CvR-td_v.js";var h=e(n(),1),g=o();function _({text:e=`Cargando tu espacio…`}){return(0,g.jsxs)(`div`,{className:`qaway-cube-loader-wrapper`,children:[(0,g.jsxs)(`div`,{className:`loader`,children:[(0,g.jsx)(`div`,{className:`ground`,children:(0,g.jsx)(`div`,{})}),(0,g.jsx)(`div`,{className:`box box0`,children:(0,g.jsx)(`div`,{})}),(0,g.jsx)(`div`,{className:`box box1`,children:(0,g.jsx)(`div`,{})}),(0,g.jsx)(`div`,{className:`box box2`,children:(0,g.jsx)(`div`,{})}),(0,g.jsx)(`div`,{className:`box box3`,children:(0,g.jsx)(`div`,{})}),(0,g.jsx)(`div`,{className:`box box4`,children:(0,g.jsx)(`div`,{})}),(0,g.jsx)(`div`,{className:`box box5`,children:(0,g.jsx)(`div`,{})}),(0,g.jsx)(`div`,{className:`box box6`,children:(0,g.jsx)(`div`,{})}),(0,g.jsx)(`div`,{className:`box box7`,children:(0,g.jsx)(`div`,{})})]}),e&&(0,g.jsx)(`p`,{className:`qaway-loader-text`,children:e}),(0,g.jsx)(`style`,{children:`
        .qaway-cube-loader-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 380px;
          width: 100%;
          user-select: none;
        }

        .qaway-loader-text {
          margin-top: 18px;
          font-size: 13px;
          font-weight: 600;
          color: #73737b;
          letter-spacing: -0.2px;
          text-align: center;
          animation: qawayFadePulse 1.8s ease-in-out infinite;
        }

        @keyframes qawayFadePulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; color: #ff4b0b; }
        }

        /* Uiverse.io by Admin12121 — Qaway Lab Edition */
        .loader {
          --duration: 3s;
          --primary: #ff4b0b;
          --primary-light: #ff6a38;
          --primary-rgba: rgba(255, 75, 11, 0);
          width: 200px;
          height: 320px;
          position: relative;
          transform-style: preserve-3d;
        }

        @media (max-width: 480px) {
          .loader {
            zoom: 0.44;
          }
        }

        .loader:before, .loader:after {
          --r: 20.5deg;
          content: "";
          width: 320px;
          height: 140px;
          position: absolute;
          right: 32%;
          bottom: -11px;
          background: #f7f7f8;
          transform: translateZ(200px) rotate(var(--r));
          -webkit-animation: mask var(--duration) linear forwards infinite;
          animation: mask var(--duration) linear forwards infinite;
        }

        .loader:after {
          --r: -20.5deg;
          right: auto;
          left: 32%;
        }

        .loader .ground {
          position: absolute;
          left: -50px;
          bottom: -120px;
          transform-style: preserve-3d;
          transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1);
        }

        .loader .ground div {
          transform: rotateX(90deg) rotateY(0deg) translate(-48px, -120px) translateZ(100px) scale(0);
          width: 200px;
          height: 200px;
          background: var(--primary);
          background: linear-gradient(45deg, var(--primary) 0%, var(--primary) 50%, var(--primary-light) 50%, var(--primary-light) 100%);
          transform-style: preserve-3d;
          -webkit-animation: ground var(--duration) linear forwards infinite;
          animation: ground var(--duration) linear forwards infinite;
        }

        .loader .ground div:before, .loader .ground div:after {
          --rx: 90deg;
          --ry: 0deg;
          --x: 44px;
          --y: 162px;
          --z: -50px;
          content: "";
          width: 156px;
          height: 300px;
          opacity: 0;
          background: linear-gradient(var(--primary), var(--primary-rgba));
          position: absolute;
          transform: rotateX(var(--rx)) rotateY(var(--ry)) translate(var(--x), var(--y)) translateZ(var(--z));
          -webkit-animation: ground-shine var(--duration) linear forwards infinite;
          animation: ground-shine var(--duration) linear forwards infinite;
        }

        .loader .ground div:after {
          --rx: 90deg;
          --ry: 90deg;
          --x: 0;
          --y: 177px;
          --z: 150px;
        }

        .loader .box {
          --x: 0;
          --y: 0;
          position: absolute;
          -webkit-animation: var(--duration) linear forwards infinite;
          animation: var(--duration) linear forwards infinite;
          transform: translate(var(--x), var(--y));
        }

        .loader .box div {
          background-color: var(--primary);
          width: 48px;
          height: 48px;
          position: relative;
          transform-style: preserve-3d;
          -webkit-animation: var(--duration) ease forwards infinite;
          animation: var(--duration) ease forwards infinite;
          transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0);
        }

        .loader .box div:before, .loader .box div:after {
          --rx: 90deg;
          --ry: 0deg;
          --z: 24px;
          --y: -24px;
          --x: 0;
          content: "";
          position: absolute;
          background-color: inherit;
          width: inherit;
          height: inherit;
          transform: rotateX(var(--rx)) rotateY(var(--ry)) translate(var(--x), var(--y)) translateZ(var(--z));
          filter: brightness(var(--b, 1.2));
        }

        .loader .box div:after {
          --rx: 0deg;
          --ry: 90deg;
          --x: 24px;
          --y: 0;
          --b: 1.4;
        }

        .loader .box.box0 { --x: -220px; --y: -120px; left: 58px; top: 108px; }
        .loader .box.box1 { --x: -260px; --y: 120px; left: 25px; top: 120px; }
        .loader .box.box2 { --x: 120px; --y: -190px; left: 58px; top: 64px; }
        .loader .box.box3 { --x: 280px; --y: -40px; left: 91px; top: 120px; }
        .loader .box.box4 { --x: 60px; --y: 200px; left: 58px; top: 132px; }
        .loader .box.box5 { --x: -220px; --y: -120px; left: 25px; top: 76px; }
        .loader .box.box6 { --x: -260px; --y: 120px; left: 91px; top: 76px; }
        .loader .box.box7 { --x: -240px; --y: 200px; left: 58px; top: 87px; }

        .loader .box0 { -webkit-animation-name: box-move0; animation-name: box-move0; }
        .loader .box0 div { -webkit-animation-name: box-scale0; animation-name: box-scale0; }
        .loader .box1 { -webkit-animation-name: box-move1; animation-name: box-move1; }
        .loader .box1 div { -webkit-animation-name: box-scale1; animation-name: box-scale1; }
        .loader .box2 { -webkit-animation-name: box-move2; animation-name: box-move2; }
        .loader .box2 div { -webkit-animation-name: box-scale2; animation-name: box-scale2; }
        .loader .box3 { -webkit-animation-name: box-move3; animation-name: box-move3; }
        .loader .box3 div { -webkit-animation-name: box-scale3; animation-name: box-scale3; }
        .loader .box4 { -webkit-animation-name: box-move4; animation-name: box-move4; }
        .loader .box4 div { -webkit-animation-name: box-scale4; animation-name: box-scale4; }
        .loader .box5 { -webkit-animation-name: box-move5; animation-name: box-move5; }
        .loader .box5 div { -webkit-animation-name: box-scale5; animation-name: box-scale5; }
        .loader .box6 { -webkit-animation-name: box-move6; animation-name: box-move6; }
        .loader .box6 div { -webkit-animation-name: box-scale6; animation-name: box-scale6; }
        .loader .box7 { -webkit-animation-name: box-move7; animation-name: box-move7; }
        .loader .box7 div { -webkit-animation-name: box-scale7; animation-name: box-scale7; }

        @-webkit-keyframes box-move0 { 12% { transform: translate(var(--x), var(--y)); } 25%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, -32px); } 90%, 100% { transform: translate(0, 188px); } }
        @keyframes box-move0 { 12% { transform: translate(var(--x), var(--y)); } 25%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, -32px); } 90%, 100% { transform: translate(0, 188px); } }
        @-webkit-keyframes box-scale0 { 6% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 14%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }
        @keyframes box-scale0 { 6% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 14%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }

        @-webkit-keyframes box-move1 { 16% { transform: translate(var(--x), var(--y)); } 29%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, -32px); } 90%, 100% { transform: translate(0, 188px); } }
        @keyframes box-move1 { 16% { transform: translate(var(--x), var(--y)); } 29%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, -32px); } 90%, 100% { transform: translate(0, 188px); } }
        @-webkit-keyframes box-scale1 { 10% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 18%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }
        @keyframes box-scale1 { 10% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 18%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }

        @-webkit-keyframes box-move2 { 20% { transform: translate(var(--x), var(--y)); } 33%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, -32px); } 90%, 100% { transform: translate(0, 188px); } }
        @keyframes box-move2 { 20% { transform: translate(var(--x), var(--y)); } 33%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, -32px); } 90%, 100% { transform: translate(0, 188px); } }
        @-webkit-keyframes box-scale2 { 14% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 22%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }
        @keyframes box-scale2 { 14% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 22%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }

        @-webkit-keyframes box-move3 { 24% { transform: translate(var(--x), var(--y)); } 37%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, -32px); } 90%, 100% { transform: translate(0, 188px); } }
        @keyframes box-move3 { 24% { transform: translate(var(--x), var(--y)); } 37%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, -32px); } 90%, 100% { transform: translate(0, 188px); } }
        @-webkit-keyframes box-scale3 { 18% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 26%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }
        @keyframes box-scale3 { 18% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 26%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }

        @-webkit-keyframes box-move4 { 28% { transform: translate(var(--x), var(--y)); } 41%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, -32px); } 90%, 100% { transform: translate(0, 188px); } }
        @keyframes box-move4 { 28% { transform: translate(var(--x), var(--y)); } 41%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, -32px); } 90%, 100% { transform: translate(0, 188px); } }
        @-webkit-keyframes box-scale4 { 22% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 30%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }
        @keyframes box-scale4 { 22% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 30%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }

        @-webkit-keyframes box-move5 { 32% { transform: translate(var(--x), var(--y)); } 45%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, -32px); } 90%, 100% { transform: translate(0, 188px); } }
        @keyframes box-move5 { 32% { transform: translate(var(--x), var(--y)); } 45%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, -32px); } 90%, 100% { transform: translate(0, 188px); } }
        @-webkit-keyframes box-scale5 { 26% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 34%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }
        @keyframes box-scale5 { 26% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 34%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }

        @-webkit-keyframes box-move6 { 36% { transform: translate(var(--x), var(--y)); } 49%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, -32px); } 90%, 100% { transform: translate(0, 188px); } }
        @keyframes box-move6 { 36% { transform: translate(var(--x), var(--y)); } 49%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, -32px); } 90%, 100% { transform: translate(0, 188px); } }
        @-webkit-keyframes box-scale6 { 30% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 38%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }
        @keyframes box-scale6 { 30% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 38%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }

        @-webkit-keyframes box-move7 { 40% { transform: translate(var(--x), var(--y)); } 53%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, -32px); } 90%, 100% { transform: translate(0, 188px); } }
        @keyframes box-move7 { 40% { transform: translate(var(--x), var(--y)); } 53%, 52% { transform: translate(0, 0); } 80% { transform: translate(0, -32px); } 90%, 100% { transform: translate(0, 188px); } }
        @-webkit-keyframes box-scale7 { 34% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 42%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }
        @keyframes box-scale7 { 34% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(0); } 42%, 100% { transform: rotateY(-47deg) rotateX(-15deg) rotateZ(15deg) scale(1); } }

        @-webkit-keyframes ground { 0%, 65% { transform: rotateX(90deg) rotateY(0deg) translate(-48px, -120px) translateZ(100px) scale(0); } 75%, 90% { transform: rotateX(90deg) rotateY(0deg) translate(-48px, -120px) translateZ(100px) scale(1); } 100% { transform: rotateX(90deg) rotateY(0deg) translate(-48px, -120px) translateZ(100px) scale(0); } }
        @keyframes ground { 0%, 65% { transform: rotateX(90deg) rotateY(0deg) translate(-48px, -120px) translateZ(100px) scale(0); } 75%, 90% { transform: rotateX(90deg) rotateY(0deg) translate(-48px, -120px) translateZ(100px) scale(1); } 100% { transform: rotateX(90deg) rotateY(0deg) translate(-48px, -120px) translateZ(100px) scale(0); } }

        @-webkit-keyframes ground-shine { 0%, 70% { opacity: 0; } 75%, 87% { opacity: 0.25; } 100% { opacity: 0; } }
        @keyframes ground-shine { 0%, 70% { opacity: 0; } 75%, 87% { opacity: 0.25; } 100% { opacity: 0; } }

        @-webkit-keyframes mask { 0%, 65% { opacity: 0; } 66%, 100% { opacity: 1; } }
        @keyframes mask { 0%, 65% { opacity: 0; } 66%, 100% { opacity: 1; } }
      `})]})}var v=t({default:()=>y});function y(){let[e,t]=(0,h.useState)(``),[n,o]=(0,h.useState)(``),[v,y]=(0,h.useState)(!1),[b,x]=(0,h.useState)(!1),[S,C]=(0,h.useState)(``),[w,T]=(0,h.useState)(!1),[E,D]=(0,h.useState)(``),[O,k]=(0,h.useState)(!1),[A,j]=(0,h.useState)(!1),[M,N]=(0,h.useState)(``),[P,F]=(0,h.useState)(!0),I=i(),[L]=r(),R=L.get(`registered`)===`1`,z=L.get(`verified`)===`1`,B=L.get(`redirect`),V=B&&B.startsWith(`/`)&&!B.startsWith(`//`)?B:`/hub/panel`,H=L.get(`email`)||``,U=L.get(`linkError`)||``,W=L.get(`linkErrorDesc`)||``,G=async(e,t)=>{if(B&&B.startsWith(`/`)&&!B.startsWith(`//`))return B;try{let{data:n}=await e.from(`users`).select(`tenant_id, is_platform_admin`).eq(`id`,t).maybeSingle();if(n&&n.tenant_id===null&&!n.is_platform_admin)return`/onboarding`}catch{}return`/hub/panel`},K=(()=>{let e=H.trim().toLowerCase();return e.endsWith(`@gmail.com`)?`https://mail.google.com/mail/`:/@(outlook|hotmail|live|msn)\./.test(e)?`https://outlook.live.com/mail/`:e.endsWith(`@yahoo.com`)?`https://mail.yahoo.com/`:`https://mail.google.com/mail/`})(),q=(e,t,n)=>{sessionStorage.setItem(`qaway_auth_token`,e),sessionStorage.setItem(`qaway_auth_email`,t),sessionStorage.setItem(`qaway_auth_role`,n),b?(localStorage.setItem(`qaway_auth_token`,e),localStorage.setItem(`qaway_auth_email`,t),localStorage.setItem(`qaway_auth_role`,n)):(localStorage.removeItem(`qaway_auth_token`),localStorage.removeItem(`qaway_auth_email`),localStorage.removeItem(`qaway_auth_role`))},J=async t=>{t.preventDefault(),C(``),T(!0);let r=e.trim();try{let e=s();if(e){let{data:t,error:i}=await e.auth.signInWithPassword({email:r,password:n});if(!i&&t?.session){let n=m(r)?`admin`:t.user?.user_metadata?.role||`viewer`;q(t.session.access_token,r,n);let i=await G(e,t.session.user.id);I(i,{replace:!0});return}if(i&&(i.code===`email_not_confirmed`||String(i.message||``).toLowerCase().includes(`confirm`))){C(`Te falta confirmar tu correo.`);return}}C(`Credenciales incorrectas o usuario no registrado.`)}catch(e){console.error(`[Auth Error]`,e),C(`Error al procesar la autenticación. Verifica tus datos.`)}finally{T(!1)}},Y=async e=>{D(e),C(``);try{let t=s();if(!t){C(`Servicio de autenticación no disponible.`);return}let{error:n}=await t.auth.signInWithOAuth({provider:e,options:{redirectTo:`${c}${V}`}});n&&C(`Error al conectar con ${e}. Intenta de nuevo.`)}catch{C(`No se pudo iniciar el flujo OAuth.`)}finally{D(``)}},[X,Z]=(0,h.useState)(`password`),[Q,$]=(0,h.useState)(0);return(0,h.useEffect)(()=>{let e=!0,t=s();if(!t){e&&F(!1);return}return t.auth.getSession().then(async({data:n})=>{if(e){if(n.session){let r=await G(t,n.session.user.id);e&&I(r,{replace:!0});return}F(!1)}}).catch(()=>{e&&F(!1)}),()=>{e=!1}},[V,I]),(0,h.useEffect)(()=>{if(!z)return;let e=!0,t=s();if(!t){e&&F(!1);return}return t.auth.getUser().then(async({data:n})=>{if(e){if(n?.user){let r=await G(t,n.user.id);e&&I(r,{replace:!0});return}F(!1)}}).catch(()=>{e&&F(!1)}),()=>{e=!1}},[z,I]),(0,h.useEffect)(()=>{if(!U)return;let e=U.includes(`otp_expired`)||U.includes(`access_denied`)||W.toLowerCase().includes(`email`)||W.toLowerCase().includes(`link`);Z(e?`activation`:`password`),j(!0),M===``&&H&&N(H)},[U,W]),(0,h.useEffect)(()=>{if(Q<=0)return;let e=setInterval(()=>$(e=>e-1),1e3);return()=>clearInterval(e)},[Q]),(0,g.jsx)(g.Fragment,{children:P?(0,g.jsx)(`div`,{className:`flex flex-col items-center justify-center min-h-[350px] w-full`,children:(0,g.jsx)(_,{text:`Verificando tu acceso a Qaway Hub…`})}):A?(0,g.jsxs)(`div`,{className:`bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl`,children:[(0,g.jsx)(`button`,{onClick:()=>{j(!1),k(!1),C(``),Z(`password`)},className:`text-zinc-400 hover:text-white text-xs font-semibold mb-6 flex items-center gap-2 transition-colors uppercase tracking-wider`,children:`← Volver al inicio de sesión`}),X===`activation`?(0,g.jsxs)(`div`,{children:[(0,g.jsxs)(`div`,{className:`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-4 tracking-wide`,children:[(0,g.jsx)(`span`,{className:`w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse`}),`ACTIVACIÓN DE CUENTA`]}),(0,g.jsx)(`h2`,{className:`text-2xl font-black text-white mb-2 tracking-tight`,children:`Activa tu cuenta`}),(0,g.jsx)(`p`,{className:`text-zinc-400 text-sm leading-relaxed mb-6`,children:`Por seguridad, los enlaces de confirmación tienen vigencia limitada. Si tu enlace caducó o no te llegó, ingresa tu correo para enviarte uno nuevo de inmediato.`}),O?(0,g.jsxs)(`div`,{className:`bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-5 rounded-xl text-sm font-medium space-y-2`,children:[(0,g.jsx)(`div`,{className:`font-bold flex items-center gap-2 text-emerald-300`,children:`✓ Enlace de activación enviado`}),(0,g.jsxs)(`p`,{className:`text-xs text-emerald-400/90 leading-relaxed`,children:[`Revisa tu bandeja de entrada o carpeta de spam en `,(0,g.jsx)(`span`,{className:`underline font-semibold`,children:M}),` y confirma tu acceso.`]})]}):(0,g.jsxs)(`form`,{onSubmit:async e=>{if(e.preventDefault(),!(!M.trim()||Q>0)){C(``);try{let e=s();if(!e){C(`Servicio no disponible.`);return}let{error:t}=await e.auth.resend({type:`signup`,email:M.trim(),options:{emailRedirectTo:`${c}/login?verified=1`}});t?C(t.message||`No se pudo reenviar la activación.`):(k(!0),$(60))}catch{C(`Error al procesar la solicitud.`)}}},className:`space-y-4`,children:[(0,g.jsxs)(`div`,{className:`space-y-2`,children:[(0,g.jsx)(`label`,{className:`text-xs font-bold text-zinc-400 uppercase tracking-widest`,children:`Correo Registrado`}),(0,g.jsxs)(`div`,{className:`relative`,children:[(0,g.jsx)(`div`,{className:`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none`,children:(0,g.jsx)(p,{className:`h-5 w-5 text-zinc-500`})}),(0,g.jsx)(`input`,{type:`email`,value:M,onChange:e=>N(e.target.value),placeholder:`tu@correo.com`,required:!0,className:`w-full bg-zinc-950/80 border border-zinc-800 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium placeholder:text-zinc-600 text-sm`})]})]}),S&&(0,g.jsx)(`div`,{className:`bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-xs font-medium`,children:S}),(0,g.jsx)(`button`,{type:`submit`,disabled:Q>0,className:`w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.99] text-sm shadow-lg shadow-orange-500/10 disabled:opacity-50 disabled:cursor-not-allowed`,children:Q>0?`Reenviar en ${Q}s...`:`Reenviar enlace de activación →`}),(0,g.jsx)(`div`,{className:`pt-2 text-center`,children:(0,g.jsx)(`button`,{type:`button`,onClick:()=>{Z(`password`),C(``)},className:`text-xs text-zinc-500 hover:text-zinc-300 transition-colors`,children:`¿Ya activaste tu cuenta y olvidaste tu clave? Restablécela aquí`})})]})]}):(0,g.jsxs)(`div`,{children:[(0,g.jsx)(`h2`,{className:`text-2xl font-black text-white mb-2 tracking-tight`,children:`Recuperar acceso`}),(0,g.jsx)(`p`,{className:`text-zinc-400 text-sm leading-relaxed mb-6`,children:`Te enviaremos un enlace seguro a tu correo electrónico para que puedas crear una nueva contraseña.`}),O?(0,g.jsxs)(`div`,{className:`bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-5 rounded-xl text-sm font-medium space-y-2`,children:[(0,g.jsx)(`div`,{className:`font-bold flex items-center gap-2 text-emerald-300`,children:`✓ Enlace de recuperación enviado`}),(0,g.jsxs)(`p`,{className:`text-xs text-emerald-400/90 leading-relaxed`,children:[`Revisa tu bandeja de entrada o spam en `,(0,g.jsx)(`span`,{className:`underline font-semibold`,children:M}),` y sigue los pasos para cambiar tu clave.`]})]}):(0,g.jsxs)(`form`,{onSubmit:async e=>{if(e.preventDefault(),M.trim()){C(``);try{let e=s();if(!e){C(`Servicio no disponible.`);return}let{error:t}=await e.auth.resetPasswordForEmail(M.trim(),{redirectTo:`${c}/update-password`});t?C(`No se pudo enviar el correo de recuperación.`):k(!0)}catch{C(`Error al procesar la solicitud.`)}}},className:`space-y-4`,children:[(0,g.jsxs)(`div`,{className:`space-y-2`,children:[(0,g.jsx)(`label`,{className:`text-xs font-bold text-zinc-400 uppercase tracking-widest`,children:`Correo Electrónico`}),(0,g.jsxs)(`div`,{className:`relative`,children:[(0,g.jsx)(`div`,{className:`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none`,children:(0,g.jsx)(p,{className:`h-5 w-5 text-zinc-500`})}),(0,g.jsx)(`input`,{type:`email`,value:M,onChange:e=>N(e.target.value),placeholder:`tu@correo.com`,required:!0,className:`w-full bg-zinc-950/80 border border-zinc-800 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all font-medium placeholder:text-zinc-600 text-sm`})]})]}),S&&(0,g.jsx)(`div`,{className:`bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-xs font-medium`,children:S}),(0,g.jsx)(`button`,{type:`submit`,className:`w-full bg-white hover:bg-zinc-200 text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.99] text-sm shadow-md`,children:`Enviar enlace de recuperación`}),(0,g.jsx)(`div`,{className:`pt-2 text-center`,children:(0,g.jsx)(`button`,{type:`button`,onClick:()=>{Z(`activation`),C(``)},className:`text-xs text-zinc-500 hover:text-zinc-300 transition-colors`,children:`¿Tu cuenta es nueva y no lograste confirmarla? Actívala aquí`})})]})]})]}):(0,g.jsxs)(g.Fragment,{children:[(0,g.jsxs)(`div`,{className:`mb-8 text-center lg:text-left`,children:[(0,g.jsx)(`h2`,{className:`text-3xl font-black text-white mb-2`,children:`Iniciar Sesión`}),(0,g.jsx)(`p`,{className:`text-zinc-400`,children:`Ingresa al ecosistema de trabajo Qaway Lab.`})]}),z&&(0,g.jsx)(`div`,{className:`mb-6 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-4 rounded-xl text-sm font-medium leading-relaxed text-center`,children:`✓ Correo verificado. Tu cuenta está activa. Ya puedes iniciar sesión.`}),(0,g.jsxs)(`div`,{className:`flex bg-zinc-900 p-1 rounded-2xl border border-zinc-800 mb-6`,children:[(0,g.jsx)(`button`,{type:`button`,className:`flex-1 py-2.5 text-xs font-bold rounded-xl bg-white text-black shadow-sm`,children:`Iniciar Sesión`}),(0,g.jsx)(a,{to:B?`/registrarse?redirect=${encodeURIComponent(B)}`:`/registrarse`,className:`flex-1 py-2.5 text-xs font-bold rounded-xl text-zinc-500 hover:text-white text-center`,children:`Crear Cuenta`})]}),(0,g.jsx)(`div`,{className:`space-y-3 mb-6`,children:(0,g.jsxs)(`button`,{onClick:()=>Y(`google`),disabled:!!E,className:`w-full flex items-center justify-center gap-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 text-white font-semibold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-60`,children:[E===`google`?(0,g.jsx)(`span`,{className:`w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin`}):(0,g.jsxs)(`svg`,{className:`w-5 h-5`,viewBox:`0 0 24 24`,children:[(0,g.jsx)(`path`,{fill:`#4285F4`,d:`M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z`}),(0,g.jsx)(`path`,{fill:`#34A853`,d:`M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z`}),(0,g.jsx)(`path`,{fill:`#FBBC05`,d:`M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z`}),(0,g.jsx)(`path`,{fill:`#EA4335`,d:`M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z`})]}),`Continuar con Google`]})}),(0,g.jsxs)(`div`,{className:`flex items-center gap-3 mb-6`,children:[(0,g.jsx)(`div`,{className:`flex-1 h-px bg-zinc-800`}),(0,g.jsx)(`span`,{className:`text-zinc-600 text-xs font-medium`,children:`o continúa con correo`}),(0,g.jsx)(`div`,{className:`flex-1 h-px bg-zinc-800`})]}),(0,g.jsxs)(`form`,{onSubmit:J,className:`space-y-5`,children:[(0,g.jsxs)(`div`,{className:`space-y-2`,children:[(0,g.jsx)(`label`,{className:`text-xs font-bold text-zinc-400 uppercase tracking-widest`,children:`Correo Electrónico`}),(0,g.jsxs)(`div`,{className:`relative`,children:[(0,g.jsx)(`div`,{className:`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none`,children:(0,g.jsx)(p,{className:`h-5 w-5 text-zinc-600`})}),(0,g.jsx)(`input`,{type:`email`,value:e,onChange:e=>t(e.target.value),className:`w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all font-medium placeholder:text-zinc-600`,placeholder:`ejemplo@qaway.pe`,required:!0})]})]}),(0,g.jsxs)(`div`,{className:`space-y-2`,children:[(0,g.jsx)(`label`,{className:`text-xs font-bold text-zinc-400 uppercase tracking-widest`,children:`Contraseña`}),(0,g.jsxs)(`div`,{className:`relative`,children:[(0,g.jsx)(`div`,{className:`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none`,children:(0,g.jsx)(f,{className:`h-5 w-5 text-zinc-600`})}),(0,g.jsx)(`input`,{type:v?`text`:`password`,value:n,onChange:e=>o(e.target.value),className:`w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-3.5 pl-12 pr-12 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all font-medium placeholder:text-zinc-600`,placeholder:`••••••••`,required:!0}),(0,g.jsx)(`button`,{type:`button`,onClick:()=>y(!v),className:`absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-600 hover:text-zinc-300 transition-colors`,tabIndex:-1,"aria-label":v?`Ocultar contraseña`:`Ver contraseña`,children:v?(0,g.jsx)(u,{className:`h-5 w-5`}):(0,g.jsx)(d,{className:`h-5 w-5`})})]})]}),(0,g.jsxs)(`div`,{className:`flex items-center justify-between`,children:[(0,g.jsxs)(`label`,{className:`flex items-center gap-2.5 cursor-pointer select-none`,children:[(0,g.jsx)(`input`,{type:`checkbox`,checked:b,onChange:e=>x(e.target.checked),className:`w-4 h-4 rounded border-zinc-700 bg-zinc-900 accent-white cursor-pointer`}),(0,g.jsx)(`span`,{className:`text-sm text-zinc-400 font-medium`,children:`Recordarme`})]}),(0,g.jsx)(`button`,{type:`button`,onClick:()=>{j(!0),C(``)},className:`text-sm text-zinc-500 hover:text-white transition-colors font-medium`,children:`¿Olvidaste tu contraseña?`})]}),S&&(0,g.jsx)(`div`,{className:`bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium`,children:S}),R&&(0,g.jsx)(`div`,{className:`bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-4 rounded-xl text-sm font-medium leading-relaxed text-center`,children:`✓ Cuenta creada correctamente. Revisa tu correo para confirmar tu registro y luego inicia sesión.`}),R?(0,g.jsxs)(g.Fragment,{children:[(0,g.jsxs)(`a`,{href:K,target:`_blank`,rel:`noreferrer`,className:`w-full bg-white hover:bg-zinc-200 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]`,children:[`Verificar mi cuenta`,(0,g.jsx)(l,{className:`w-5 h-5`})]}),(0,g.jsxs)(`p`,{className:`text-sm text-zinc-500 text-center`,children:[`¿Ya confirmaste tu correo?`,` `,(0,g.jsx)(a,{to:`/login`,className:`font-semibold text-white underline underline-offset-2 hover:text-green-400 transition-colors`,children:`Iniciar sesión`})]})]}):(0,g.jsx)(`button`,{type:`submit`,disabled:w,className:`w-full bg-white hover:bg-zinc-200 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed`,children:w?(0,g.jsx)(`span`,{className:`w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin`}):(0,g.jsxs)(g.Fragment,{children:[`Ingresar al Hub`,(0,g.jsx)(l,{className:`w-5 h-5`})]})})]})]})})}export{v as n,y as t};