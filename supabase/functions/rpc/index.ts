
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
    console.log(`RPC function called: ${name}`, params)
    
    if (name === 'create_admin_profile') {
      const { user_id, user_email, user_full_name } = params
      console.log(`Creating admin profile for user: ${user_id}, ${user_email}`)
      
      try {
        // First attempt: direct insert
        const { data: insertData, error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: user_id,
            email: user_email,
            full_name: user_full_name,
            role: 'admin'
          })
          .select()
        
        if (insertError) {
          console.log('Direct insert failed:', insertError.message)
          
          // Second attempt: direct SQL query
          const { data: sqlData, error: sqlError } = await supabaseAdmin.rpc(
            'execute_sql',
            {
              sql_query: `
                INSERT INTO profiles (id, email, full_name, role)
                VALUES ('${user_id}', '${user_email}', '${user_full_name}', 'admin')
                RETURNING id
              `
            }
          )
          
          if (sqlError) {
            console.error('SQL execution failed:', sqlError.message)
            throw sqlError
          }
          
          return new Response(
            JSON.stringify({ success: true, data: sqlData, method: 'sql-query' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        }
        
        return new Response(
          JSON.stringify({ success: true, data: insertData, method: 'direct-insert' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      } catch (err) {
        console.error('Admin profile creation failed with all methods:', err.message)
        throw new Error(`Failed to create admin profile: ${err.message}`)
      }
    }
    
    if (name === 'execute_sql') {
      const { sql_query } = params
      console.log('Executing SQL query:', sql_query.substring(0, 100) + '...')
      
      // Execute the SQL query directly
      const { data, error } = await supabaseAdmin.rpc(
        'execute_sql', 
        { sql_query }
      )
      
      if (error) {
        console.error('SQL execution error:', error.message)
        throw error
      }
      
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
    console.error('RPC function error:', error.message)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
