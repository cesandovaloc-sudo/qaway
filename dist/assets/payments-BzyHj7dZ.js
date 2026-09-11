import{t as e}from"./supabase-B_r0LcI1.js";async function t({studentId:t,orderId:n,courseId:r=null,amount:i,currency:a=`PEN`,provider:o=`manual`,proofUrl:s=null,notes:c=null}){let l={student_id:t,order_id:n,amount:i,currency:a,status:`pending`,provider:o,notes:c};r&&(l.course_id=r),s&&(l.proof_url=s);let{data:u,error:d}=await e.from(`payments`).insert(l).select().single();if(d)throw d;return u}async function n(t,n,{providerId:r=null,approvedBy:i=null,notes:a=null}={}){let o={status:n};r&&(o.provider_id=r),i&&(o.approved_by=i),a&&(o.notes=a),n===`completed`&&!i&&(o.approved_by=null);let{data:s,error:c}=await e.from(`payments`).update(o).eq(`id`,t).select().single();if(c)throw c;if(n===`completed`&&s.course_id){let{course_id:t,student_id:n}=s;await e.from(`enrollments`).upsert({student_id:n,course_id:t,status:`active`})}return n===`completed`&&s.order_id&&await e.from(`orders`).update({status:`paid`,paid_at:new Date().toISOString()}).eq(`id`,s.order_id),s}async function r(t){let{data:n,error:r}=await e.from(`payments`).select(`
      id, amount, currency, status, provider, created_at, proof_url, notes,
      course:courses (id, title, slug)
    `).eq(`student_id`,t).order(`created_at`,{ascending:!1});if(r)throw r;return n||[]}async function i(){let{data:t,error:n}=await e.from(`payments`).select(`
      id, amount, currency, status, provider, created_at, proof_url, notes,
      student:student_id (id, full_name, avatar_url),
      course:courses (id, title, slug)
    `).eq(`provider`,`manual`).eq(`status`,`pending`).order(`created_at`,{ascending:!1});if(n)throw n;return t||[]}async function a({status:t,provider:n,limit:r=50}={}){let i=e.from(`payments`).select(`
      id, amount, currency, status, provider, created_at, proof_url, notes,
      student:student_id (id, full_name, avatar_url),
      course:courses (id, title, slug)
    `).order(`created_at`,{ascending:!1}).limit(r);t&&(i=i.eq(`status`,t)),n&&(i=i.eq(`provider`,n));let{data:a,error:o}=await i;if(o)throw o;return a||[]}async function o(e){return n(e,`completed`,{providerId:`culqi_sim_${Date.now()}`})}export{o as a,i,a as n,n as o,r,t};