
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { 
  BarChart3,
  Users, 
  Clock, 
  Search, 
  Filter, 
  Flag, 
  ChevronUp, 
  ChevronDown,
  ArrowUpDown,
  LogOut
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AdminUserManagement from '@/components/admin/AdminUserManagement';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QueueEntry } from '@/types/queue';
import { format } from 'date-fns';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { signOut, profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterService, setFilterService] = useState('all');
  
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

  // Fetch service statistics
  const { data: serviceStats = [] } = useQuery({
    queryKey: ['serviceStats'],
    queryFn: async () => {
      const { data: entries, error } = await supabase
        .from('queue_entries')
        .select('service_type');

      if (error) {
        toast.error(`Failed to fetch service statistics: ${error.message}`);
        return [];
      }

      // Group entries by service type and count occurrences
      const stats = entries.reduce((acc: Record<string, number>, entry) => {
        const service = entry.service_type;
        acc[service] = (acc[service] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(stats).map(([service, count]) => ({
        service,
        count,
        avgWait: Math.floor(Math.random() * 20) + 5 // Placeholder for average wait time
      }));
    }
  });

  const availableDesks = 4; // Static data for now
  const occupiedDesks = 2; // Static data for now
  const totalCustomers = queueEntries.length;
  const avgWaitTime = queueEntries.length > 0 
    ? Math.round(queueEntries.reduce((sum, entry) => sum + entry.estimated_wait_time, 0) / queueEntries.length) 
    : 0;

  // Handle priority change
  const handlePriorityChange = async (id: string, newPriority: string) => {
    try {
      // In a real implementation, we would update a priority field in the database
      // For now, we'll just show a toast notification
      toast.success(`Changed priority to ${newPriority} for customer ${id}`);
      
      // Refetch queue data
      refetchQueue();
    } catch (error) {
      toast.error('Failed to update priority');
    }
  };

  // Handle moving customer in queue
  const handleMoveCustomer = async (id: string, direction: 'up' | 'down') => {
    try {
      const currentIndex = queueEntries.findIndex(customer => customer.id === id);
      if (
        (direction === 'up' && currentIndex === 0) || 
        (direction === 'down' && currentIndex === queueEntries.length - 1)
      ) {
        return;
      }

      const currentEntry = queueEntries[currentIndex];
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      const otherEntry = queueEntries[newIndex];
      
      // Swap positions
      const { error: error1 } = await supabase
        .from('queue_entries')
        .update({ position: otherEntry.position })
        .eq('id', currentEntry.id);
      
      const { error: error2 } = await supabase
        .from('queue_entries')
        .update({ position: currentEntry.position })
        .eq('id', otherEntry.id);

      if (error1 || error2) {
        throw new Error('Failed to update positions');
      }

      toast.success('Queue position updated');
      refetchQueue();
    } catch (error) {
      toast.error('Failed to update position');
    }
  };

  // Handle serving a customer
  const handleServeCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('queue_entries')
        .update({ status: 'serving' })
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Customer is now being served');
      refetchQueue();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredQueueEntries = queueEntries.filter(entry => 
    (entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     entry.queue_number.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterService === 'all' || entry.service_type === filterService)
  );

  // Get unique service types for filter dropdown
  const serviceTypes = Array.from(new Set(queueEntries.map(entry => entry.service_type)));

  const getPriorityBadge = (status: string) => {
    // Using status as priority for now
    switch (status) {
      case 'vip':
        return <Badge className="bg-blue-500">VIP</Badge>;
      case 'emergency':
        return <Badge className="bg-red-500">Emergency</Badge>;
      default:
        return <Badge className="bg-gray-500">Regular</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'serving':
        return <Badge className="bg-green-500">Serving</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge className="bg-yellow-500">Waiting</Badge>;
    }
  };

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Customers in Queue</p>
                    <p className="text-3xl font-bold text-uba-gray">{totalCustomers}</p>
                  </div>
                  <div className="bg-uba-red/10 p-3 rounded-full text-uba-red">
                    <Users size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Average Wait Time</p>
                    <p className="text-3xl font-bold text-uba-gray">{avgWaitTime} mins</p>
                  </div>
                  <div className="bg-uba-red/10 p-3 rounded-full text-uba-red">
                    <Clock size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Service Desks Available</p>
                    <p className="text-3xl font-bold text-green-600">{availableDesks}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full text-green-600">
                    <Users size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Service Desks Occupied</p>
                    <p className="text-3xl font-bold text-uba-red">{occupiedDesks}</p>
                  </div>
                  <div className="bg-uba-red/10 p-3 rounded-full text-uba-red">
                    <Users size={24} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 size={20} />
                  Service Type Analytics
                </h2>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customers
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avg. Wait
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {serviceStats.map((stat, idx) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {stat.service}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stat.count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stat.avgWait} mins
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 text-center">
                  <Button variant="outline">Export Data</Button>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Service Status</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Queue Flow Rate</span>
                    <span className="text-green-600">Good</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Current Load</span>
                    <span className="text-yellow-600">Medium</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Staff Performance</span>
                    <span className="text-green-600">Good</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Customer Satisfaction</span>
                    <span className="text-green-600">High</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium mb-4">Peak Hours Today</h3>
                  <div className="h-40 bg-gray-100 flex items-center justify-center rounded">
                    <p className="text-gray-500">Chart visualization would go here</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="queue">
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-6 border-b">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold">Queue Management</h2>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <Input 
                        placeholder="Search customer or number..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <select 
                        className="border rounded px-3 py-2 text-sm"
                        value={filterService}
                        onChange={(e) => setFilterService(e.target.value)}
                      >
                        <option value="all">All Services</option>
                        {serviceTypes.map((service, index) => (
                          <option key={index} value={service}>{service}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              {isLoadingQueue ? (
                <div className="p-8 text-center">
                  <p>Loading queue data...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-1">
                            Number
                            <ArrowUpDown size={14} />
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center gap-1">
                            Wait Time
                            <ArrowUpDown size={14} />
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredQueueEntries.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                            No customers in queue matching your criteria
                          </td>
                        </tr>
                      ) : (
                        filteredQueueEntries.map((entry) => (
                          <tr key={entry.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-uba-red">{entry.queue_number}</div>
                              <div className="text-xs text-gray-500">
                                {format(new Date(entry.created_at), 'h:mm a')}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {entry.name}
                              <div className="text-xs text-gray-500">{entry.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {entry.service_type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900">{entry.estimated_wait_time} mins</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(entry.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex gap-2 items-center">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleMoveCustomer(entry.id, 'up')}
                                >
                                  <ChevronUp size={16} />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleMoveCustomer(entry.id, 'down')}
                                >
                                  <ChevronDown size={16} />
                                </Button>
                                <Button 
                                  variant="default" 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleServeCustomer(entry.id)}
                                  disabled={entry.status === 'serving'}
                                >
                                  {entry.status === 'serving' ? 'Serving' : 'Serve'}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              
              {filteredQueueEntries.length === 0 && !isLoadingQueue && (
                <div className="p-8 text-center text-gray-500">
                  No customers match your search criteria
                </div>
              )}
            </div>
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
