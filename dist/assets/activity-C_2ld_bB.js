import{t as e}from"./supabase-B_r0LcI1.js";async function t(t=10){let{data:n,error:r}=await e.from(`activity_logs`).select(`
      id, action, entity_type, metadata, created_at,
      user:user_id (id, full_name, avatar_url)
    `).order(`created_at`,{ascending:!1}).limit(t);if(r)throw r;return n}export{t};