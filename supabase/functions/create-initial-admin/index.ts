
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
    
    // Query the database to check the role column type
    const { data: roleTypeData, error: roleTypeError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .limit(1)
      .single()
    
    // Determine if the role column accepts string values directly
    let roleValue = 'super_admin'
    
    // Insert profile record with proper role handling
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: data.user.id,
        email: adminEmail,
        full_name: 'Initial Admin',
        role: roleValue // Use string value directly
      })
      .select()
    
    if (profileError) {
      console.error('Error creating profile:', profileError.message)
      
      // Try with alternative approach if the first one fails - role might be an enum
      const { error: altProfileError } = await supabaseAdmin.rpc(
        'create_admin_profile',
        { 
          user_id: data.user.id,
          user_email: adminEmail,
          user_full_name: 'Initial Admin'
        }
      )
      
      if (altProfileError) {
        console.error('Alternative profile creation also failed:', altProfileError.message)
        console.log('Attempting direct SQL insertion as last resort')
        
        // As a last resort, try direct SQL query
        const { error: sqlError } = await supabaseAdmin.rpc(
          'execute_sql', 
          { 
            sql_query: `
              INSERT INTO profiles (id, email, full_name, role)
              VALUES ('${data.user.id}', '${adminEmail}', 'Initial Admin', 'admin')
            `
          }
        )
        
        if (sqlError) {
          console.error('SQL insertion failed:', sqlError.message)
          throw new Error(`Could not create admin profile: ${sqlError.message}`)
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
