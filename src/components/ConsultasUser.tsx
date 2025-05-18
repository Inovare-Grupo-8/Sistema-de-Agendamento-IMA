import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getUserNavigationPath } from "@/utils/userNavigation";
// Import other necessary components

const ConsultasUser = () => {
  const location = useLocation();
  
  // Component state and logic
  // ...

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 pt-24 md:pt-10">
      {/* Add breadcrumb navigation at the top of the content */}
      {getUserNavigationPath(location.pathname)}
      
      {/* Rest of the component content */}
      <h1 className="text-2xl md:text-3xl font-bold text-indigo-900 dark:text-gray-100 mb-2">
        Minhas Consultas
      </h1>
      {/* ...rest of the component */}
    </div>
  );
};

export default ConsultasUser;
