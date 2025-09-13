import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PackagePlus, Users, ClipboardList, Box, Megaphone } from 'lucide-react';

const OwnerDashboard = () => {
  const navigate = useNavigate();

  const dashboardItems = [
    { title: 'Add Products', icon: <PackagePlus size={32} />, path: '/add-products' },
    { title: 'Add Stockist', icon: <Users size={32} />, path: '/add-stockist' },
    { title: 'Manage Orders', icon: <ClipboardList size={32} />, path: '/manage-orders' },
    { title: 'Manage Products', icon: <Box size={32} />, path: '/manage-products' },
    { title: 'Add Advertisements', icon: <Megaphone size={32} />, path: '/add-ads' },
  ];

  return (
    <div className="w-[100vw] min-h-[100vh] bg-[var(--primary_clr)] p-12 flex flex-col items-center">
      <h1 className="text-4xl text-white font-bold mb-12">Owner Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {dashboardItems.map((item) => (
          <div
            key={item.title}
            onClick={() => navigate(item.path)}
            className="cursor-pointer bg-white rounded-3xl p-8 flex flex-col items-center gap-4 shadow-lg hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="w-[70px] h-[70px] bg-[var(--secondary_clr)] text-white rounded-full flex items-center justify-center">
              {item.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 text-center">{item.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OwnerDashboard;
