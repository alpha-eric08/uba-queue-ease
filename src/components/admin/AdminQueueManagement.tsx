
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Filter, ChevronUp, ChevronDown, ArrowUpDown, FastForward, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QueueEntry } from '@/types/queue';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  
  // Handle prioritizing a customer
  const handlePrioritizeCustomer = async (entry: QueueEntry) => {
    try {
      const newPosition = Math.max(1, entry.position - 3);
      const newWaitTime = Math.max(5, entry.estimated_wait_time - 10);
      
      const { data, error } = await supabase.functions.invoke('queue-operations', {
        body: {
          action: 'adjust_time',
          queueData: { 
            queueNumber: entry.queue_number,
            priority: newPosition,
            estimatedWaitTime: newWaitTime
          }
        }
      });
      
      if (error) throw error;
      
      if (data && data.success) {
        toast.success('Customer prioritized successfully');
        refetchQueue();
      } else {
        throw new Error(data?.message || 'Failed to prioritize customer');
      }
    } catch (error: any) {
      console.error('Error prioritizing customer:', error);
      toast.error(`Error: ${error.message || 'Failed to prioritize customer'}`);
    }
  };
  
  // Handle adjusting customer wait time
  const handleAdjustWaitTime = async (entry: QueueEntry, adjustment: number) => {
    try {
      const newWaitTime = Math.max(1, entry.estimated_wait_time + adjustment);
      
      const { data, error } = await supabase.functions.invoke('queue-operations', {
        body: {
          action: 'adjust_time',
          queueData: { 
            queueNumber: entry.queue_number,
            estimatedWaitTime: newWaitTime
          }
        }
      });
      
      if (error) throw error;
      
      if (data && data.success) {
        toast.success('Wait time adjusted successfully');
        refetchQueue();
      } else {
        throw new Error(data?.message || 'Failed to adjust wait time');
      }
    } catch (error: any) {
      console.error('Error adjusting wait time:', error);
      toast.error(`Error: ${error.message || 'Failed to adjust wait time'}`);
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div className="flex items-center gap-1">
                    Number
                    <ArrowUpDown size={14} />
                  </div>
                </TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    Wait Time
                    <ArrowUpDown size={14} />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQueueEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    No customers in queue matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredQueueEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="font-medium text-uba-red">{entry.queue_number}</div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(entry.created_at), 'h:mm a')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{entry.name}</div>
                      <div className="text-xs text-gray-500">{entry.phone}</div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {entry.service_type}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-900">{entry.estimated_wait_time} mins</span>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={() => handleAdjustWaitTime(entry, -5)}
                          >
                            <ArrowDown size={14} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={() => handleAdjustWaitTime(entry, 5)}
                          >
                            <ArrowUp size={14} />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(entry.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">{entry.position}</span>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={() => handleMoveCustomer(entry.id, 'up')}
                          >
                            <ChevronUp size={14} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={() => handleMoveCustomer(entry.id, 'down')}
                          >
                            <ChevronDown size={14} />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 items-center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => handlePrioritizeCustomer(entry)}
                        >
                          <FastForward size={14} />
                          Prioritize
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
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
