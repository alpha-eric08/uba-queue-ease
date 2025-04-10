import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Clock, Users, Bell, BellOff, MapPin, User, Phone, CheckCircle2, ArrowUp, ArrowDown } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface QueueData {
  id: string;
  queue_number: string;
  name: string;
  phone: string;
  branch: string;
  service_type: string;
  status: string;
  position: number;
  estimated_wait_time: number;
  created_at: string;
  totalAhead: number;
  progress: number;
}

const TrackQueue = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [queueNumber, setQueueNumber] = useState(searchParams.get('queue') || '');
  const [trackingData, setTrackingData] = useState<QueueData | null>(null);
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const queueParam = searchParams.get('queue');
    if (queueParam) {
      setQueueNumber(queueParam);
      handleSearch(null, queueParam);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent | null, queueParam?: string) => {
    if (e) e.preventDefault();
    
    const queueToSearch = queueParam || queueNumber;
    
    if (!queueToSearch) {
      toast.error('Please enter a queue number');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('queue-operations', {
        body: {
          action: 'track',
          queueData: { queueNumber: queueToSearch }
        }
      });
      
      if (error) throw error;
      
      if (data && data.success) {
        setTrackingData(data.queueData);
        setSearchParams({ queue: queueToSearch });
      } else {
        throw new Error(data?.message || 'Queue number not found');
      }
    } catch (error: any) {
      console.error('Error tracking queue:', error);
      toast.error(`Error: ${error.message || 'Failed to track queue'}`);
      setTrackingData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotifyToggle = (checked: boolean) => {
    setNotifyEnabled(checked);
    
    if (checked) {
      toast.success('Notification Enabled', {
        description: 'We will notify you when you are 5 spots away from your turn.'
      });
    } else {
      toast.info('Notification Disabled', {
        description: 'You will not receive notifications about your queue position.'
      });
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!trackingData?.queue_number) return;

    try {
      setIsUpdating(true);
      const { data, error } = await supabase.functions.invoke('queue-operations', {
        body: {
          action: 'update_status',
          queueData: { 
            queueNumber: trackingData.queue_number,
            status
          }
        }
      });
      
      if (error) throw error;
      
      if (data && data.success) {
        if (status === 'served') {
          toast.success('Thank you for using our services!');
          setTrackingData(null);
        } else if (status === 'serving') {
          setTrackingData({
            ...trackingData,
            status: 'serving',
            position: 1,
            estimated_wait_time: 5,
            totalAhead: 0,
            progress: 95
          });
          toast.success('Your turn now! Please proceed to the counter.');
        } else {
          setTrackingData({
            ...trackingData,
            status: data.queueEntry?.status || status
          });
          toast.success(data.message || `Status updated to ${status}`);
        }
      } else {
        throw new Error(data?.message || 'Failed to update status');
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(`Error: ${error.message || 'Failed to update status'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTimeAdjustment = async (adjustment: 'prioritize' | 'increase' | 'decrease') => {
    if (!trackingData?.queue_number) return;

    try {
      setIsUpdating(true);
      let newTime = trackingData.estimated_wait_time;
      let newPriority = trackingData.position;
      
      if (adjustment === 'prioritize') {
        newPriority = Math.max(1, trackingData.position - 3);
        newTime = Math.max(5, newTime - 10);
      } else if (adjustment === 'increase') {
        newTime = newTime + 5;
      } else if (adjustment === 'decrease') {
        newTime = Math.max(1, newTime - 5);
      }

      const { data, error } = await supabase.functions.invoke('queue-operations', {
        body: {
          action: 'adjust_time',
          queueData: { 
            queueNumber: trackingData.queue_number,
            priority: adjustment === 'prioritize' ? newPriority : null,
            estimatedWaitTime: newTime
          }
        }
      });
      
      if (error) throw error;
      
      if (data && data.success) {
        const updatedData = {
          ...trackingData,
          estimated_wait_time: data.queueEntry.estimated_wait_time,
          position: data.queueEntry.position
        };
        
        let totalAhead = updatedData.position - 1;
        let progress = Math.max(0, Math.min(100, 100 - (totalAhead / 10) * 100));
        
        if (updatedData.status === 'serving') {
          totalAhead = 0;
          progress = 95;
        }
        
        setTrackingData({
          ...updatedData,
          totalAhead,
          progress
        });
        
        toast.success(data.message || 'Wait time updated');
      } else {
        throw new Error(data?.message || 'Failed to update wait time');
      }
    } catch (error: any) {
      console.error('Error adjusting time:', error);
      toast.error(`Error: ${error.message || 'Failed to adjust wait time'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const getServiceName = (serviceType: string) => {
    const serviceMap: Record<string, string> = {
      'deposit': 'Cash Deposit',
      'withdrawal': 'Cash Withdrawal',
      'account': 'Account Services',
      'loan': 'Loan Inquiries',
      'card': 'Card Services',
      'other': 'Other Inquiries'
    };
    
    return serviceMap[serviceType] || serviceType;
  };
  
  const formatPhone = (phone: string) => {
    return phone.length === 10 
      ? `(${phone.slice(0,3)}) ${phone.slice(3,6)}-${phone.slice(6)}`
      : phone;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Layout>
      <div className="container my-12">
        <h1 className="text-3xl font-bold text-uba-gray mb-8">Track Your Queue</h1>

        <div className="max-w-3xl mx-auto">
          {!trackingData ? (
            <div className="bg-white rounded-lg shadow p-6">
              <form onSubmit={handleSearch} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="queueNumber" className="block text-sm font-medium text-gray-700">
                    Enter Your Queue Number
                  </label>
                  <div className="flex gap-3">
                    <Input
                      id="queueNumber"
                      value={queueNumber}
                      onChange={(e) => setQueueNumber(e.target.value)}
                      placeholder="e.g. A12"
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      className="bg-uba-red hover:bg-uba-red/90"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Searching...' : 'Track Queue'}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow">
              <div className="border-b p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-uba-gray">Queue Status</h2>
                  <Button 
                    variant="outline" 
                    className="text-sm" 
                    onClick={() => setTrackingData(null)}
                  >
                    Search Another
                  </Button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="bg-uba-lightgray rounded-lg p-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <User size={18} className="text-uba-red" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Name</div>
                      <div className="font-medium">{trackingData.name}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Phone</div>
                      <div className="font-medium">{formatPhone(trackingData.phone)}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Queue Created</div>
                      <div className="font-medium">{formatDate(trackingData.created_at)}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-500">Status</div>
                      <div className="font-medium capitalize">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          trackingData.status === 'waiting' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : trackingData.status === 'serving' 
                            ? 'bg-green-100 text-green-800'
                            : trackingData.status === 'served'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {trackingData.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                  <div>
                    <div className="text-sm text-gray-500">Your Queue Number</div>
                    <div className="text-4xl font-bold text-uba-red">{trackingData.queue_number}</div>
                  </div>
                  
                  <div className="flex flex-col md:items-end">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={16} />
                      <span>{trackingData.branch}</span>
                    </div>
                    <div className="font-medium">{getServiceName(trackingData.service_type)}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div className="bg-uba-lightgray p-4 rounded-lg">
                    <div className="flex gap-3">
                      <div className="bg-white p-2 rounded text-uba-red">
                        <Users size={20} />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Your Position</div>
                        <div className="text-xl font-semibold">
                          {trackingData.position}<span className="text-sm text-gray-500"> in line</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-uba-lightgray p-4 rounded-lg">
                    <div className="flex gap-3">
                      <div className="bg-white p-2 rounded text-uba-red">
                        <Clock size={20} />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Estimated Wait</div>
                        <div className="flex items-center gap-2">
                          <div className="text-xl font-semibold">
                            ~{trackingData.estimated_wait_time}<span className="text-sm text-gray-500"> minutes</span>
                          </div>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => handleTimeAdjustment('decrease')}
                              className="text-gray-500 hover:text-uba-red p-1 rounded"
                              disabled={isUpdating}
                            >
                              <ArrowDown size={16} />
                            </button>
                            <button 
                              onClick={() => handleTimeAdjustment('increase')}
                              className="text-gray-500 hover:text-uba-red p-1 rounded"
                              disabled={isUpdating}
                            >
                              <ArrowUp size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-uba-lightgray p-4 rounded-lg">
                    <div className="flex gap-3">
                      <div className="bg-white p-2 rounded text-uba-red">
                        <Users size={20} />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Customers Ahead</div>
                        <div className="text-xl font-semibold">
                          {trackingData.totalAhead}<span className="text-sm text-gray-500"> people</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{trackingData.progress}%</span>
                  </div>
                  <Progress value={trackingData.progress} />
                </div>
                
                {trackingData.status === 'waiting' && (
                  <div className="border-t pt-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {notifyEnabled ? (
                          <Bell size={20} className="text-uba-red" />
                        ) : (
                          <BellOff size={20} className="text-gray-400" />
                        )}
                        <span className="font-medium">Notify me when I'm 5 spots away</span>
                      </div>
                      <Switch 
                        checked={notifyEnabled} 
                        onCheckedChange={handleNotifyToggle} 
                      />
                    </div>
                  </div>
                )}
                
                {trackingData.status === 'serving' && (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertTitle className="text-green-800">It's your turn!</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Please proceed to the service counter. Your number is being called.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <div className="bg-uba-lightgray p-6">
                <div className="flex flex-wrap justify-center md:justify-between gap-4">
                  {trackingData.status === 'waiting' && (
                    <Button 
                      onClick={() => handleTimeAdjustment('prioritize')}
                      variant="outline" 
                      className="border-uba-gray bg-white"
                      disabled={isUpdating}
                    >
                      Prioritize Me
                    </Button>
                  )}
                  
                  {trackingData.status === 'serving' && (
                    <Button 
                      onClick={() => handleStatusUpdate('served')}
                      className="bg-uba-red hover:bg-uba-red/90 flex items-center gap-2"
                      disabled={isUpdating}
                    >
                      <CheckCircle2 size={18} />
                      Mark as Served
                    </Button>
                  )}
                  
                  {trackingData.status !== 'served' && (
                    <Button 
                      variant="outline" 
                      className="border-uba-gray bg-white"
                      onClick={() => handleSearch(null, trackingData.queue_number)}
                      disabled={isUpdating || isLoading}
                    >
                      Refresh Status
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TrackQueue;
