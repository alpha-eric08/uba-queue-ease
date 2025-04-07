
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const serviceTypes = [
  { id: 'deposit', name: 'Cash Deposit' },
  { id: 'withdrawal', name: 'Cash Withdrawal' },
  { id: 'account', name: 'Account Services' },
  { id: 'loan', name: 'Loan Inquiries' },
  { id: 'card', name: 'Card Services' },
  { id: 'other', name: 'Other Inquiries' },
];

const JoinQueue = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    serviceType: '',
    branch: 'Marina Branch, Lagos', // Default branch, could be made selectable
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [queueData, setQueueData] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (value: string) => {
    setFormData((prev) => ({ ...prev, serviceType: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.phone || !formData.serviceType) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Call the queue-operations function to join queue
      const { data, error } = await supabase.functions.invoke('queue-operations', {
        body: {
          action: 'join',
          queueData: formData
        }
      });
      
      if (error) throw error;
      
      if (data && data.success) {
        setQueueData(data.queueEntry);
        setIsSubmitted(true);
        
        toast.success(`Queue number generated: ${data.queueEntry.queue_number}`);
      } else {
        throw new Error('Failed to generate queue number');
      }
    } catch (error: any) {
      console.error('Error joining queue:', error);
      toast.error(`Error: ${error.message || 'Failed to join queue'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container my-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-uba-gray mb-8">Join the Queue</h1>

          {!isSubmitted ? (
            <div className="bg-white rounded-lg shadow p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4">Service Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name <span className="text-uba-red">*</span></Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number <span className="text-uba-red">*</span></Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Select Service Type <span className="text-uba-red">*</span></h2>
                  
                  <RadioGroup value={formData.serviceType} onValueChange={handleServiceChange} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {serviceTypes.map((service) => (
                      <div key={service.id} className="flex items-center space-x-2 border rounded-md p-3">
                        <RadioGroupItem value={service.id} id={service.id} />
                        <Label htmlFor={service.id} className="flex-1 cursor-pointer">{service.name}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-uba-red hover:bg-uba-red/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Get Queue Number"}
                </Button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                
                <h2 className="text-2xl font-bold text-uba-gray">Queue Confirmation</h2>
                
                <div className="bg-uba-lightgray px-8 py-4 rounded-lg my-4">
                  <div className="text-sm text-gray-600">Your Queue Number</div>
                  <div className="text-4xl font-bold text-uba-red">{queueData?.queue_number}</div>
                </div>
                
                <div className="space-y-2 text-center max-w-md">
                  <p className="text-gray-700">
                    We've sent a confirmation SMS to your phone number. 
                    You can track your queue position from the Track Queue page.
                  </p>
                  
                  <div className="mt-4 flex flex-wrap justify-center gap-4">
                    <Button 
                      variant="outline" 
                      className="border-uba-red text-uba-red hover:bg-uba-red hover:text-white"
                      onClick={() => setIsSubmitted(false)}
                    >
                      Join Another Queue
                    </Button>
                    <Button 
                      className="bg-uba-red hover:bg-uba-red/90"
                      onClick={() => navigate(`/track-queue?queue=${queueData?.queue_number}`)}
                    >
                      Track My Queue
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default JoinQueue;
