
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    const { name, params } = await req.json()
    
    if (name === 'create_admin_profile') {
      const { user_id, user_email, user_full_name } = params
      
      // Execute raw SQL to bypass type issues
      const { data, error } = await supabaseAdmin.rpc(
        'execute_sql', 
        { 
          sql_query: `
            INSERT INTO profiles (id, email, full_name, role)
            VALUES ('${user_id}', '${user_email}', '${user_full_name}', 'admin')
            RETURNING id
          `
        }
      )
      
      if (error) throw error
      
      return new Response(
        JSON.stringify({ success: true, data }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }
    
    if (name === 'execute_sql') {
      const { sql_query } = params
      
      // Execute the SQL query directly
      const { data, error } = await supabaseAdmin.rpc(
        'execute_sql', 
        { sql_query }
      )
      
      if (error) throw error
      
      return new Response(
        JSON.stringify({ success: true, data }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }
    
    return new Response(
      JSON.stringify({ error: 'Unknown RPC function' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
