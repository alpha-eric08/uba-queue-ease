
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle2 } from 'lucide-react';

const serviceTypes = [
  { id: 'deposit', name: 'Cash Deposit' },
  { id: 'withdrawal', name: 'Cash Withdrawal' },
  { id: 'account', name: 'Account Services' },
  { id: 'loan', name: 'Loan Inquiries' },
  { id: 'card', name: 'Card Services' },
  { id: 'other', name: 'Other Inquiries' },
];

const JoinQueue = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    serviceType: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [queueNumber, setQueueNumber] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (value: string) => {
    setFormData((prev) => ({ ...prev, serviceType: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.phone || !formData.serviceType) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    // Generate a random queue number (in real app, this would come from backend)
    const random = Math.floor(Math.random() * 100);
    const generatedQueueNumber = `A${random}`;
    
    // Set queue number and show confirmation
    setQueueNumber(generatedQueueNumber);
    setIsSubmitted(true);

    toast({
      title: 'Queue Number Generated',
      description: `Your queue number is ${generatedQueueNumber}`,
    });
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

                <Button type="submit" className="w-full bg-uba-red hover:bg-uba-red/90">
                  Get Queue Number
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
                  <div className="text-4xl font-bold text-uba-red">{queueNumber}</div>
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
                      onClick={() => window.location.href = '/track-queue'}
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
