
import { Clock, Smartphone, Zap } from 'lucide-react';

const BenefitsSection = () => {
  const benefits = [
    {
      icon: Clock,
      title: 'No Long Waiting Times',
      description: 'Join virtually and arrive just before your turn, saving you valuable time.',
    },
    {
      icon: Smartphone,
      title: 'Real-time Queue Tracking',
      description: 'Monitor your position in the queue from anywhere through our app.',
    },
    {
      icon: Zap,
      title: 'Quick and Efficient Banking Service',
      description: 'Streamlined process ensures you get served faster and more efficiently.',
    },
  ];

  return (
    <section className="section bg-uba-lightgray">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-uba-gray mb-4">Why Use QueueEase?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our system provides several benefits to make your banking experience better.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="bg-uba-red/10 p-4 rounded-full mb-4 text-uba-red">
                  <benefit.icon size={32} />
                </div>
                <h3 className="text-xl font-semibold text-uba-gray mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
