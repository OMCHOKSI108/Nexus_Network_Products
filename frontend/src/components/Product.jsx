import React from "react";

const Product = () => {
  const products = [
    {
      name: "Brass Cable Glands",
      description: "High-quality brass cable glands for electrical installations",
      image: "https://via.placeholder.com/300x200?text=Brass+Cable+Glands"
    },
    {
      name: "Brass Electrical Components",
      description: "Precision-engineered brass electrical components",
      image: "https://via.placeholder.com/300x200?text=Electrical+Components"
    },
    {
      name: "Brass Screws",
      description: "Durable brass screws for various applications",
      image: "https://via.placeholder.com/300x200?text=Brass+Screws"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto p-6">
        <h2 className="text-4xl font-bold text-center text-red-700 mb-8">
          Our Products
        </h2>
        <p className="text-center text-lg text-gray-600 mb-10">
          Discover our range of premium brass products
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-red-700 mb-3">
                  {product.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {product.description}
                </p>
                <button className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800 transition">
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Product;
