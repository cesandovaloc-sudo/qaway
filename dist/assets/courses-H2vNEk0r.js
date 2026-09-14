import{t as e}from"./supabase-lJFYjTWB.js";async function t({category:t,level:n,search:r,status:i=`published`}={}){let a=e.from(`courses`).select(`
      id, title, slug, description, short_description, category, level,
      duration, price, is_free, image_url, status, featured, free_preview_lessons,
      instructor:instructor_id (id, full_name, avatar_url)
    `).eq(`status`,i);t&&(a=a.eq(`category`,t)),n&&(a=a.eq(`level`,n)),r&&(a=a.ilike(`title`,`%${r}%`)),a=a.order(`created_at`,{ascending:!1});let{data:o,error:s}=await a;if(s)throw s;return o}async function n(t){let{data:n,error:r}=await e.from(`courses`).select(`
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
    `).eq(`slug`,t).single();if(r)throw r;return n}async function r(t){let{data:n,error:r}=await e.from(`courses`).insert(t).select().single();if(r)throw r;return n}async function i(t,n){let{data:r,error:i}=await e.from(`courses`).update(n).eq(`id`,t).select().single();if(i)throw i;return r}async function a(t,n,r=``){let{data:i}=await e.from(`modules`).select(`sort_order`).eq(`course_id`,t).order(`sort_order`,{ascending:!1}).limit(1),a=(i?.[0]?.sort_order||0)+1,{data:o,error:s}=await e.from(`modules`).insert({course_id:t,title:n,description:r,sort_order:a}).select().single();if(s)throw s;return o}async function o(t){let{error:n}=await e.from(`modules`).delete().eq(`id`,t);if(n)throw n}async function s(t,n){let{data:r}=await e.from(`lessons`).select(`sort_order`).eq(`module_id`,t).order(`sort_order`,{ascending:!1}).limit(1),i=(r?.[0]?.sort_order||0)+1,{data:a,error:o}=await e.from(`lessons`).insert({module_id:t,title:n,sort_order:i,status:`draft`}).select().single();if(o)throw o;return a}async function c(t,n){let{data:r,error:i}=await e.from(`lessons`).update(n).eq(`id`,t).select().single();if(i)throw i;return r}async function l(t){let{error:n}=await e.from(`lessons`).delete().eq(`id`,t);if(n)throw n}export{o as a,i as c,l as i,c as l,s as n,n as o,a as r,t as s,r as t};