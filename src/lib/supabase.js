import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://egtseoxoufhwysdtsjmi.supabase.co'
const supabaseAnonKey = 'sb_publishable_WF8hk5QCmFAIAznCsLBMEg_MW2B3lUv'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)