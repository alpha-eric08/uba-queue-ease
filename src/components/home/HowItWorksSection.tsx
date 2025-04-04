
import { Check, Building, Calendar, Clock } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      id: 1,
      title: 'Select a Bank Branch',
      description: 'Choose your nearest UBA branch from our network across Nigeria.',
      icon: Building,
    },
    {
      id: 2,
      title: 'Choose Service Type & Get a Queue Number',
      description: 'Tell us what you need - deposits, withdrawals, account opening, or inquiries. Get your virtual queue number instantly.',
      icon: Calendar,
    },
    {
      id: 3,
      title: 'Track Your Queue & Arrive When It\'s Your Turn',
      description: 'Monitor your position in real-time and arrive just in time for your turn. No more waiting in long lines!',
      icon: Clock,
    },
  ];

  return (
    <section id="how-it-works" className="section bg-white">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-uba-gray mb-4">How It Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our queue management system makes your banking experience smooth and efficient.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.id} className="bg-uba-lightgray p-6 rounded-lg relative">
              <div className="bg-uba-red text-white w-10 h-10 rounded-full flex items-center justify-center absolute -top-3 -left-3">
                {step.id}
              </div>
              <div className="flex flex-col items-center text-center pt-4">
                <div className="bg-white p-3 rounded-full mb-4 text-uba-red">
                  <step.icon size={32} />
                </div>
                <h3 className="text-xl font-semibold text-uba-gray mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
