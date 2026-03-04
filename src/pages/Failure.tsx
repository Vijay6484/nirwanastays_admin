import React from 'react';
import { XCircle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PaymentFailure: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-6">We couldn't process your payment. Please try again.</p>
        
        <button
          className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
          onClick={() => navigate('/')}
        >
          <Home className="w-4 h-4" />
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default PaymentFailure;