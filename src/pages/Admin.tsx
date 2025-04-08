
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import AdminUserManagement from '@/components/admin/AdminUserManagement';
import AdminDashboardStats from '@/components/admin/AdminDashboardStats';
import AdminServiceAnalytics from '@/components/admin/AdminServiceAnalytics';
import AdminServiceStatus from '@/components/admin/AdminServiceStatus';
import AdminQueueManagement from '@/components/admin/AdminQueueManagement';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QueueEntry } from '@/types/queue';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { signOut, profile } = useAuth();
  
  // Fetch queue entries from Supabase
  const { data: queueEntries = [], isLoading: isLoadingQueue, refetch: refetchQueue } = useQuery({
    queryKey: ['queueEntries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('queue_entries')
        .select('*')
        .order('position', { ascending: true });

      if (error) {
        toast.error(`Failed to fetch queue entries: ${error.message}`);
        return [];
      }

      return data as QueueEntry[];
    }
  });

  // Static data for now, in a real app these would come from an API
  const availableDesks = 4;
  const occupiedDesks = 2;

  return (
    <Layout>
      <div className="container my-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-uba-gray">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            {profile && (
              <div className="text-right">
                <p className="font-medium">{profile.full_name || profile.email}</p>
                <p className="text-sm text-gray-500 capitalize">{profile.role}</p>
              </div>
            )}
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => signOut()}
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="dashboard">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="queue">Queue Management</TabsTrigger>
            <TabsTrigger value="admins">Admin Users</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <AdminDashboardStats 
              queueEntries={queueEntries} 
              availableDesks={availableDesks} 
              occupiedDesks={occupiedDesks} 
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AdminServiceAnalytics />
              <AdminServiceStatus />
            </div>
          </TabsContent>
          
          <TabsContent value="queue">
            <AdminQueueManagement
              queueEntries={queueEntries}
              isLoadingQueue={isLoadingQueue}
              refetchQueue={refetchQueue}
            />
          </TabsContent>

          <TabsContent value="admins">
            <AdminUserManagement />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
