import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  BarChart3,
  Users, 
  Clock, 
  Search, 
  Filter, 
  Flag, 
  ChevronUp, 
  ChevronDown,
  ArrowUpDown,
  LogOut
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AdminUserManagement from '@/components/admin/AdminUserManagement';

// Mock customer data
const mockCustomers = [
  { 
    id: 1, 
    name: 'John Smith', 
    number: 'A12', 
    service: 'Cash Withdrawal',
    time: '10:15 AM',
    wait: 20,
    status: 'waiting',
    priority: 'regular'
  },
  { 
    id: 2, 
    name: 'Amara Okafor', 
    number: 'A13', 
    service: 'Account Services',
    time: '10:20 AM',
    wait: 15,
    status: 'waiting',
    priority: 'vip'
  },
  { 
    id: 3, 
    name: 'Ibrahim Mohammed', 
    number: 'A14', 
    service: 'Loan Inquiries',
    time: '10:25 AM',
    wait: 12,
    status: 'waiting',
    priority: 'regular'
  },
  { 
    id: 4, 
    name: 'Sarah Johnson', 
    number: 'A15', 
    service: 'Cash Deposit',
    time: '10:30 AM',
    wait: 10,
    status: 'waiting',
    priority: 'regular'
  },
  { 
    id: 5, 
    name: 'Oluwaseun Adeyemi', 
    number: 'A16', 
    service: 'Card Services',
    time: '10:35 AM',
    wait: 8,
    status: 'waiting',
    priority: 'emergency'
  },
];

const serviceStats = [
  { service: 'Cash Deposit', count: 45, avgWait: 12 },
  { service: 'Cash Withdrawal', count: 37, avgWait: 15 },
  { service: 'Account Services', count: 22, avgWait: 18 },
  { service: 'Loan Inquiries', count: 8, avgWait: 25 },
  { service: 'Card Services', count: 15, avgWait: 10 },
];

const AdminDashboard = () => {
  const { signOut, profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterService, setFilterService] = useState('all');
  const [customers, setCustomers] = useState(mockCustomers);
  
  const availableDesks = 4;
  const occupiedDesks = 2;
  const totalCustomers = customers.length;
  const avgWaitTime = 12;

  const handlePriorityChange = (id: number, newPriority: string) => {
    const updatedCustomers = customers.map(customer => 
      customer.id === id ? { ...customer, priority: newPriority } : customer
    );
    setCustomers(updatedCustomers);
  };

  const handleMoveCustomer = (id: number, direction: 'up' | 'down') => {
    const currentIndex = customers.findIndex(customer => customer.id === id);
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === customers.length - 1)
    ) {
      return;
    }
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const updatedCustomers = [...customers];
    const [movedCustomer] = updatedCustomers.splice(currentIndex, 1);
    updatedCustomers.splice(newIndex, 0, movedCustomer);
    
    setCustomers(updatedCustomers);
  };

  const filteredCustomers = customers.filter(customer => 
    (customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     customer.number.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterService === 'all' || customer.service === filterService)
  );

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'vip':
        return <Badge className="bg-blue-500">VIP</Badge>;
      case 'emergency':
        return <Badge className="bg-red-500">Emergency</Badge>;
      default:
        return <Badge className="bg-gray-500">Regular</Badge>;
    }
  };

  return (
    <Layout>
      <div className="container my-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-uba-gray">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            {profile && (
              <div className="text-right">
                <p className="font-medium">{profile.full_name || profile.email}</p>
                <p className="text-sm text-gray-500 capitalize">{profile.role}</p>
              </div>
            )}
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => signOut()}
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="dashboard">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="queue">Queue Management</TabsTrigger>
            <TabsTrigger value="admins">Admin Users</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
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
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      {serviceStats.map((stat, idx) => (
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
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Service Status</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Queue Flow Rate</span>
                    <span className="text-green-600">Good</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Current Load</span>
                    <span className="text-yellow-600">Medium</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Staff Performance</span>
                    <span className="text-green-600">Good</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Customer Satisfaction</span>
                    <span className="text-green-600">High</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium mb-4">Peak Hours Today</h3>
                  <div className="h-40 bg-gray-100 flex items-center justify-center rounded">
                    <p className="text-gray-500">Chart visualization would go here</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="queue">
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
                      <Button variant="outline" className="flex items-center gap-2">
                        <Filter size={16} />
                        <span>Filter</span>
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Flag size={16} />
                        <span>Priority</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          Number
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          Wait Time
                          <ArrowUpDown size={14} />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-uba-red">{customer.number}</div>
                          <div className="text-xs text-gray-500">{customer.time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {customer.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {customer.service}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{customer.wait} mins</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getPriorityBadge(customer.priority)}
                            <select 
                              className="text-xs border rounded p-1"
                              value={customer.priority}
                              onChange={(e) => handlePriorityChange(customer.id, e.target.value)}
                            >
                              <option value="regular">Regular</option>
                              <option value="vip">VIP</option>
                              <option value="emergency">Emergency</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2 items-center">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleMoveCustomer(customer.id, 'up')}
                            >
                              <ChevronUp size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleMoveCustomer(customer.id, 'down')}
                            >
                              <ChevronDown size={16} />
                            </Button>
                            <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">
                              Serve
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredCustomers.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No customers match your search criteria
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="admins">
            <AdminUserManagement />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
