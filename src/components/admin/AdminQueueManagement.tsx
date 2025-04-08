
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Filter, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QueueEntry } from '@/types/queue';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface AdminQueueManagementProps {
  queueEntries: QueueEntry[];
  isLoadingQueue: boolean;
  refetchQueue: () => void;
}

const AdminQueueManagement = ({ queueEntries, isLoadingQueue, refetchQueue }: AdminQueueManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterService, setFilterService] = useState('all');

  // Get unique service types for filter dropdown
  const serviceTypes = Array.from(new Set(queueEntries.map(entry => entry.service_type)));

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
  );
};

export default AdminQueueManagement;
