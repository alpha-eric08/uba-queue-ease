
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const HeroSection = () => {
  const [selectedBranch, setSelectedBranch] = useState("");
  const branches = [
    "Adum Branch, Kumasi",
    "Asafo Branch, Kumasi", 
    "Circle Branch, Accra",
    "Lapaz Branch, Accra",
    "Campus Branch, Tanoso",
    "Ring Road Branch, Sunyani"
  ];

  return (
    <section className="bg-gradient-to-r from-uba-lightgray to-white relative overflow-hidden">
      <div className="container mx-auto py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-uba-gray">
              Skip the Queue, <span className="text-uba-red">Save Time!</span>
            </h1>
            <p className="text-lg md:text-xl text-uba-gray">
              Join the virtual queue and get served without waiting in long lines.
            </p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="branch-select" className="block text-sm font-medium text-uba-gray mb-1">
                  Select a Branch
                </label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger id="branch-select" className="w-full">
                    <SelectValue placeholder="Select a branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/join-queue" className={`btn-primary flex-1 text-center ${!selectedBranch && 'opacity-75 cursor-not-allowed'}`}>
                  Join Queue
                </Link>
                <Link to="/track-queue" className="btn-secondary flex-1 text-center">
                  Track My Queue
                </Link>
              </div>
            </div>
          </div>
          
          <div className="relative hidden lg:block">
            <div className="w-full h-[400px] bg-uba-red/10 rounded-lg overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80" 
                alt="Bank queue illustration" 
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-uba-gray/50 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 flex justify-center">
        <a 
          href="#how-it-works" 
          className="text-uba-gray p-2 animate-bounce"
          aria-label="Scroll to How it Works"
        >
          <ChevronDown size={36} />
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
