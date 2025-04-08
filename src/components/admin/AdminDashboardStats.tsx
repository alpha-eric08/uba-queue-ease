
import { Users, Clock } from 'lucide-react';
import { QueueEntry } from '@/types/queue';

interface AdminDashboardStatsProps {
  queueEntries: QueueEntry[];
  availableDesks: number;
  occupiedDesks: number;
}

const AdminDashboardStats = ({ 
  queueEntries, 
  availableDesks, 
  occupiedDesks 
}: AdminDashboardStatsProps) => {
  const totalCustomers = queueEntries.length;
  const avgWaitTime = queueEntries.length > 0 
    ? Math.round(queueEntries.reduce((sum, entry) => sum + entry.estimated_wait_time, 0) / queueEntries.length) 
    : 0;

  return (
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
  );
};

export default AdminDashboardStats;
