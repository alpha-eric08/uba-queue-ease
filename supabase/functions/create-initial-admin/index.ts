
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
    
    // Manually insert the profile record to ensure it's created properly
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: data.user.id,
        email: adminEmail,
        full_name: 'Initial Admin',
        role: 'super_admin'
      })
    
    if (profileError) {
      console.error('Error creating profile:', profileError.message)
      throw new Error(`Error creating profile: ${profileError.message}`)
    }
    
    return new Response(
      JSON.stringify({ message: 'Initial admin user created successfully', user: data.user }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Create initial admin error:', error.message)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
