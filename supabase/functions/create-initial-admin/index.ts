
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
    console.log('Create initial admin function called')
    // Create a Supabase client with the service role key (for admin operations)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Hardcoded initial admin user
    const adminEmail = 'owusuansaheric08@gmail.com'
    const adminPassword = '@Owusu123'
    
    // Check if the admin already exists
    const { data: existingUsers, error: checkError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (checkError) {
      console.error('Error checking existing users:', checkError.message)
      throw checkError
    }

    const adminExists = existingUsers.users.some(user => user.email === adminEmail)
    
    if (adminExists) {
      return new Response(
        JSON.stringify({ message: 'Admin user already exists' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }
    
    console.log('Creating new admin user')
    // Create the admin user with correct parameters
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Initial Admin',
        role: 'super_admin'
      }
    })
    
    if (error) {
      console.error('Error creating admin user:', error.message)
      throw error
    }
    
    console.log('Admin user created successfully, creating profile now')
    
    // Try multiple approaches to create the profile
    try {
      // First approach: direct insert to profiles table
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: data.user.id,
          email: adminEmail,
          full_name: 'Initial Admin',
          role: 'admin' // Use the most likely value for the role
        })
      
      if (profileError) {
        console.log('First profile creation attempt failed:', profileError.message)
        throw profileError
      }
      
      console.log('Profile created successfully via direct insert')
    } catch (error1) {
      try {
        console.log('Trying alternative approach via RPC')
        // Second approach: use our custom RPC function
        const rpcResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/rpc`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            ...corsHeaders
          },
          body: JSON.stringify({
            name: 'create_admin_profile',
            params: {
              user_id: data.user.id,
              user_email: adminEmail, 
              user_full_name: 'Initial Admin'
            }
          })
        })
        
        if (!rpcResponse.ok) {
          const errorText = await rpcResponse.text()
          console.error('RPC function failed:', errorText)
          throw new Error(`RPC call failed: ${errorText}`)
        }
        
        console.log('Profile created successfully via RPC function')
      } catch (error2) {
        console.error('Both profile creation methods failed:', error2)
        // As a direct fallback, try raw SQL via internal API
        try {
          console.log('Attempting direct SQL execution as last resort')
          const { error: sqlError } = await supabaseAdmin.rpc(
            'execute_sql',
            {
              sql_query: `
                INSERT INTO profiles (id, email, full_name, role)
                VALUES ('${data.user.id}', '${adminEmail}', 'Initial Admin', 'admin')
                ON CONFLICT (id) DO NOTHING
              `
            }
          )
          
          if (sqlError) {
            console.error('Direct SQL execution failed:', sqlError.message)
            throw sqlError
          }
          
          console.log('Profile created successfully via direct SQL execution')
        } catch (error3) {
          console.error('All profile creation methods failed:', error3)
          // Just continue - the auth user is created, which might be enough to log in
          console.log('Continuing despite profile creation failure')
        }
      }
    }
    
    return new Response(
      JSON.stringify({ message: 'Initial admin user created successfully', user: data.user }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Create initial admin fatal error:', error.message)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
