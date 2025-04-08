
import { BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ServiceStat {
  service: string;
  count: number;
  avgWait: number;
}

const AdminServiceAnalytics = () => {
  // Fetch service statistics
  const { data: serviceStats = [] } = useQuery({
    queryKey: ['serviceStats'],
    queryFn: async () => {
      const { data: entries, error } = await supabase
        .from('queue_entries')
        .select('service_type');

      if (error) {
        toast.error(`Failed to fetch service statistics: ${error.message}`);
        return [];
      }

      // Group entries by service type and count occurrences
      const stats = entries.reduce((acc: Record<string, number>, entry) => {
        const service = entry.service_type;
        acc[service] = (acc[service] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(stats).map(([service, count]) => ({
        service,
        count,
        avgWait: Math.floor(Math.random() * 20) + 5 // Placeholder for average wait time
      }));
    }
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <BarChart3 size={20} />
        Service Type Analytics
      </h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customers
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg. Wait
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {serviceStats.map((stat: ServiceStat, idx: number) => (
              <tr key={idx}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {stat.service}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stat.count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stat.avgWait} mins
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 text-center">
        <Button variant="outline">Export Data</Button>
      </div>
    </div>
  );
};

export default AdminServiceAnalytics;
