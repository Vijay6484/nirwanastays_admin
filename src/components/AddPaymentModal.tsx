import React, { useState } from 'react';
import { X, DollarSign, CreditCard, Smartphone, Tag, AlertCircle } from 'lucide-react';

interface Booking {
  id: number;
  bookingId: string;
  guest: string;
  email: string;
  phone: string;
  accommodation: string;
  amount: string;
  paidAmount: string;
  paymentStatus: string;
}

interface AddPaymentModalProps {
  booking: Booking;
  onClose: () => void;
  onPaymentAdded?: () => void;
  apiBaseUrl?: string;
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({ 
  booking, 
  onClose, 
  onPaymentAdded,
  apiBaseUrl = 'https://api.nirwanastays.com/admin'
}) => {
  const [paymentType, setPaymentType] = useState<'full' | 'partial'>('full');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract numeric value from formatted price string (e.g., "₹38,500" -> 38500)
  const getTotalAmount = () => {
    const numericString = booking.amount.replace(/[^\d]/g, '');
    return parseInt(numericString, 10);
  };

  const getPaidAmount = () => {
    const numericString = booking.paidAmount.replace(/[^\d]/g, '');
    return parseInt(numericString, 10);
  };

  const getRemainingAmount = () => {
    return getTotalAmount() - getPaidAmount();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Commented out API call - using mock payment processing
    // try {
    //   const paymentAmount = paymentType === 'full' ? getRemainingAmount() : parseInt(amount);
    //   
    //   if (!paymentAmount || paymentAmount <= 0) {
    //     throw new Error('Please enter a valid payment amount');
    //   }

    //   if (paymentAmount > getRemainingAmount()) {
    //     throw new Error('Payment amount cannot exceed remaining balance');
    //   }

    //   const paymentData = {
    //     amount: paymentAmount,
    //     payment_method: paymentMethod,
    //     transaction_id: transactionId || undefined,
    //     notes: notes || undefined
    //   };

    //   const response = await fetch(`${apiBaseUrl}/bookings/${booking.id}/payments`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(paymentData),
    //   });

    //   if (!response.ok) {
    //     const errorData = await response.json().catch(() => ({}));
    //     throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    //   }

    //   const result = await response.json();
    //   
    //   if (result.success) {
    //     // Call the callback to refresh the bookings list
    //     if (onPaymentAdded) {
    //       onPaymentAdded();
    //     }
    //     onClose();
    //   } else {
    //     throw new Error(result.message || 'Failed to add payment');
    //   }
    // } catch (err) {
    //   console.error('Error adding payment:', err);
    //   setError(err instanceof Error ? err.message : 'Failed to add payment');
    // } finally {
    //   setLoading(false);
    // }
    
    // Mock payment processing
    setTimeout(() => {
      const paymentAmount = paymentType === 'full' ? getRemainingAmount() : parseInt(amount);
      
      if (!paymentAmount || paymentAmount <= 0) {
        setError('Please enter a valid payment amount');
        setLoading(false);
        return;
      }

      if (paymentAmount > getRemainingAmount()) {
        setError('Payment amount cannot exceed remaining balance');
        setLoading(false);
        return;
      }
      
      // Mock success
      if (onPaymentAdded) {
        onPaymentAdded();
      }
      onClose();
      setLoading(false);
    }, 1000);
  };

  // Update amount when payment type changes
  React.useEffect(() => {
    if (paymentType === 'full') {
      setAmount(getRemainingAmount().toString());
    } else {
      setAmount('');
    }
  }, [paymentType]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    <DollarSign className="h-5 w-5 text-green-500 mr-1" />
                    Add Payment for {booking.bookingId}
                  </h3>
                  <button
                    onClick={onClose}
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    disabled={loading}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="mt-2 mb-4">
                  <p className="text-sm text-gray-500">
                    Guest: <span className="font-medium text-gray-700">{booking.guest}</span>
                  </p>
                  <div className="flex justify-between mt-1">
                    <p className="text-sm text-gray-500">
                      Total: <span className="font-medium text-gray-700">{booking.amount}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Paid: <span className="font-medium text-gray-700">{booking.paidAmount}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Remaining: <span className="font-medium text-green-600">₹{getRemainingAmount().toLocaleString()}</span>
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-red-700">{error}</div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Payment Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Type
                    </label>
                    <div className="flex space-x-4">
                      <div className="flex items-center">
                        <input
                          id="full-payment"
                          name="payment-type"
                          type="radio"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          checked={paymentType === 'full'}
                          onChange={() => setPaymentType('full')}
                          disabled={loading}
                        />
                        <label htmlFor="full-payment" className="ml-2 block text-sm text-gray-700">
                          Full Payment (₹{getRemainingAmount().toLocaleString()})
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="partial-payment"
                          name="payment-type"
                          type="radio"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          checked={paymentType === 'partial'}
                          onChange={() => setPaymentType('partial')}
                          disabled={loading}
                        />
                        <label htmlFor="partial-payment" className="ml-2 block text-sm text-gray-700">
                          Partial Payment
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method *
                    </label>
                    <select
                      id="payment-method"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                      disabled={loading}
                    >
                      <option value="">Select Payment Method</option>
                      <option value="card">Credit/Debit Card</option>
                      <option value="gpay">Google Pay</option>
                      <option value="phonepe">PhonePe</option>
                      <option value="paytm">Paytm</option>
                      <option value="cash">Cash</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="upi">UPI</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (₹) *
                    </label>
                    <input
                      type="number"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="1"
                      max={getRemainingAmount()}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                      disabled={loading || paymentType === 'full'}
                      placeholder={paymentType === 'full' ? 'Full remaining amount' : 'Enter amount'}
                    />
                    {paymentType === 'partial' && (
                      <p className="mt-1 text-xs text-gray-500">
                        Maximum: ₹{getRemainingAmount().toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Transaction ID */}
                  <div>
                    <label htmlFor="transaction-id" className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction ID/Reference
                    </label>
                    <input
                      type="text"
                      id="transaction-id"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      disabled={loading}
                      placeholder="Optional reference number"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      disabled={loading}
                      placeholder="Optional notes about this payment"
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || !paymentMethod || !amount}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Recording...
                </>
              ) : (
                'Record Payment'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPaymentModal;