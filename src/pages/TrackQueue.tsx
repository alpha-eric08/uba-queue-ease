
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Clock, Users, Bell, BellOff, MapPin } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const TrackQueue = () => {
  const { toast } = useToast();
  const [queueNumber, setQueueNumber] = useState('');
  const [trackingData, setTrackingData] = useState<QueueData | null>(null);
  const [notifyEnabled, setNotifyEnabled] = useState(false);

  interface QueueData {
    number: string;
    branch: string;
    service: string;
    position: number;
    estimatedTime: number;
    totalAhead: number;
    progress: number;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!queueNumber) {
      toast({
        title: 'Error',
        description: 'Please enter a queue number',
        variant: 'destructive',
      });
      return;
    }
    
    // Mock data - in a real app, this would be fetched from an API
    const mockData: QueueData = {
      number: queueNumber,
      branch: 'Marina Branch, Lagos',
      service: 'Cash Withdrawal',
      position: 5,
      estimatedTime: 15,
      totalAhead: 4,
      progress: 55,
    };
    
    setTrackingData(mockData);
  };

  const handleNotifyToggle = (checked: boolean) => {
    setNotifyEnabled(checked);
    
    if (checked) {
      toast({
        title: 'Notification Enabled',
        description: 'We will notify you when you are 5 spots away from your turn.',
      });
    } else {
      toast({
        title: 'Notification Disabled',
        description: 'You will not receive notifications about your queue position.',
      });
    }
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
                    <Button type="submit" className="bg-uba-red hover:bg-uba-red/90">
                      Track Queue
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
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                  <div>
                    <div className="text-sm text-gray-500">Your Queue Number</div>
                    <div className="text-4xl font-bold text-uba-red">{trackingData.number}</div>
                  </div>
                  
                  <div className="flex flex-col md:items-end">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={16} />
                      <span>{trackingData.branch}</span>
                    </div>
                    <div className="font-medium">{trackingData.service}</div>
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
                        <div className="text-xl font-semibold">
                          ~{trackingData.estimatedTime}<span className="text-sm text-gray-500"> minutes</span>
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
              </div>
              
              <div className="bg-uba-lightgray p-6">
                <div className="flex flex-wrap justify-center md:justify-between gap-4">
                  <Button variant="outline" className="border-uba-gray bg-white">
                    Change Branch
                  </Button>
                  <Button className="bg-uba-red hover:bg-uba-red/90">
                    Confirm Arrival at Branch
                  </Button>
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
