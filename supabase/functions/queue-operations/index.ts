
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get the Supabase client
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
  );

  // Parse the request body
  const { action, queueData } = await req.json();

  try {
    if (action === 'join') {
      // Generate a queue number with a letter prefix and random number
      const prefix = queueData.serviceType.charAt(0).toUpperCase();
      const randomNum = Math.floor(10 + Math.random() * 90); // 10-99 range
      const queueNumber = `${prefix}${randomNum}`;
      
      // Store the queue entry in the database
      const { data, error } = await supabaseClient
        .from('queue_entries')
        .insert([{ 
          queue_number: queueNumber,
          name: queueData.name,
          phone: queueData.phone,
          service_type: queueData.serviceType,
          branch: queueData.branch,
          status: 'waiting',
          position: randomNum, // Using the random number as position for simplicity
          estimated_wait_time: randomNum * 3 // Simple calculation for estimated wait time
        }])
        .select();
      
      if (error) throw error;
      
      return new Response(
        JSON.stringify({ success: true, queueEntry: data[0] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } 
    else if (action === 'track') {
      const queueNumber = queueData.queueNumber;
      
      // Fetch the queue entry
      const { data, error } = await supabaseClient
        .from('queue_entries')
        .select('*')
        .eq('queue_number', queueNumber)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No data found
          return new Response(
            JSON.stringify({ success: false, message: 'Queue number not found' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
          );
        }
        throw error;
      }
      
      // Calculate additional tracking data
      const totalAhead = data.position - 1;
      const progress = Math.max(0, Math.min(100, 100 - (totalAhead / 10) * 100));
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          queueData: {
            ...data,
            totalAhead,
            progress
          } 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    else if (action === 'update_status') {
      const { queueNumber, status } = queueData;
      
      // Update the status in the database
      const { data, error } = await supabaseClient
        .from('queue_entries')
        .update({ status })
        .eq('queue_number', queueNumber)
        .select();
      
      if (error) throw error;
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          queueEntry: data[0],
          message: `Status successfully updated to ${status}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    else if (action === 'adjust_time') {
      const { queueNumber, priority, estimatedWaitTime } = queueData;
      let newEstimatedTime = estimatedWaitTime;
      
      // If priority is provided, adjust position and time accordingly
      if (priority) {
        // Improve position by moving up in the queue
        const newPosition = Math.max(1, Math.floor(priority)); // Ensure it's at least 1
        
        const { data, error } = await supabaseClient
          .from('queue_entries')
          .update({ 
            position: newPosition,
            estimated_wait_time: newEstimatedTime
          })
          .eq('queue_number', queueNumber)
          .select();
        
        if (error) throw error;
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            queueEntry: data[0],
            message: 'Queue position and estimated time updated'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } 
      else if (estimatedWaitTime) {
        // Just update the estimated wait time
        const { data, error } = await supabaseClient
          .from('queue_entries')
          .update({ estimated_wait_time: estimatedWaitTime })
          .eq('queue_number', queueNumber)
          .select();
        
        if (error) throw error;
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            queueEntry: data[0],
            message: 'Estimated wait time updated'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  } catch (error) {
    console.error('Queue operations error:', error);
    
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
