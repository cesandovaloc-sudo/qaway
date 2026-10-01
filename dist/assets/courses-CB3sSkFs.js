import{t as e}from"./supabase-lJFYjTWB.js";var t=null,n=0,r=3e5;function i(){return t}async function a({category:i,level:a,search:o,status:s=`published`}={},c=!1){let l=!i&&!a&&!o&&s===`published`;if(l&&!c&&t&&Date.now()-n<r)return t;let u=e.from(`courses`).select(`
      id, title, slug, description, short_description, category, level,
      duration, price, is_free, image_url, status, featured, free_preview_lessons,
      instructor:instructor_id (id, full_name, avatar_url)
    `).eq(`status`,s);i&&(u=u.eq(`category`,i)),a&&(u=u.eq(`level`,a)),o&&(u=u.ilike(`title`,`%${o}%`)),u=u.order(`created_at`,{ascending:!1});let{data:d,error:f}=await u;if(f){if(t)return t;throw f}let p=d;return l&&(t=p,n=Date.now()),p}async function o(t){let{data:n,error:r}=await e.from(`courses`).select(`
      id, title, slug, description, short_description, category, level,
      duration, price, is_free, image_url, status, featured, free_preview_lessons,
      what_you_learn, requirements, target_audience,
      instructor:instructor_id (id, full_name, avatar_url),
      modules:modules (
        id, title, description, sort_order,
        lessons:lessons (
          id, title, content, duration, video_url, sort_order, status,
          transcript, transcript_status,
          resources:resources (id, title, type, file_url, file_size)
        )
      )
    `).eq(`slug`,t).single();if(r)throw r;return n}async function s(t){let{data:n,error:r}=await e.from(`courses`).insert(t).select().single();if(r)throw r;return n}async function c(t,n){let{data:r,error:i}=await e.from(`courses`).update(n).eq(`id`,t).select().single();if(i)throw i;return r}async function l(t,n,r=``){let{data:i}=await e.from(`modules`).select(`sort_order`).eq(`course_id`,t).order(`sort_order`,{ascending:!1}).limit(1),a=(i?.[0]?.sort_order||0)+1,{data:o,error:s}=await e.from(`modules`).insert({course_id:t,title:n,description:r,sort_order:a}).select().single();if(s)throw s;return o}async function u(t){let{error:n}=await e.from(`modules`).delete().eq(`id`,t);if(n)throw n}async function d(t,n){let{data:r}=await e.from(`lessons`).select(`sort_order`).eq(`module_id`,t).order(`sort_order`,{ascending:!1}).limit(1),i=(r?.[0]?.sort_order||0)+1,{data:a,error:o}=await e.from(`lessons`).insert({module_id:t,title:n,sort_order:i,status:`draft`}).select().single();if(o)throw o;return a}async function f(t,n){let{data:r,error:i}=await e.from(`lessons`).update(n).eq(`id`,t).select().single();if(i)throw i;return r}async function p(t){let{error:n}=await e.from(`lessons`).delete().eq(`id`,t);if(n)throw n}export{u as a,a as c,p as i,c as l,d as n,i as o,l as r,o as s,s as t,f as u};