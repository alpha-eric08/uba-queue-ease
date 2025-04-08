
const AdminServiceStatus = () => {
  return (
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
  );
};

export default AdminServiceStatus;
