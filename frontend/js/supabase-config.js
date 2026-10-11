import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = 'https://jlcqjeinikyddptoagdx.supabase.co'
const supabaseKey = 'sb_publishable_oqkQdsnFcq0VvU-efUk_4w_eNgIpmg_'

export const supabase = createClient(supabaseUrl, supabaseKey)
