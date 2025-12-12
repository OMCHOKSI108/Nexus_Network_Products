import React from "react";

const Quality = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto p-6">
        <h2 className="text-4xl font-bold text-center text-red-700 mb-8">
          Quality Assurance
        </h2>
        <p className="text-center text-lg text-gray-600 mb-10">
          Our commitment to excellence drives everything we do
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl font-semibold text-red-700 mb-4">
              Industry Standards
            </h3>
            <p className="text-gray-600 mb-4">
              All our products meet or exceed industry standards for quality and performance. 
              We follow strict manufacturing processes to ensure consistency and reliability.
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>ISO 9001:2015 Certified Manufacturing</li>
              <li>Rigorous Quality Control Testing</li>
              <li>Material Traceability</li>
              <li>Continuous Improvement Processes</li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-red-700 mb-4">
              Quality Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Customer Satisfaction</span>
                <span className="text-green-600 font-semibold">99.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">On-Time Delivery</span>
                <span className="text-green-600 font-semibold">98.8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Zero Defect Rate</span>
                <span className="text-green-600 font-semibold">99.2%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quality;
