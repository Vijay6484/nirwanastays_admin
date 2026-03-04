import React from 'react';

const RecentBookingsTable: React.FC = () => {
  const bookings = [
    {
      id: 'B12345',
      guest: 'Rahul Sharma',
      accommodation: 'Lake View Villa',
      checkIn: '2025-05-22',
      checkOut: '2025-05-25',
      amount: '₹38,500',
      status: 'Confirmed',
    },
    {
      id: 'B12346',
      guest: 'Priya Patel',
      accommodation: 'Garden Suite',
      checkIn: '2025-05-23',
      checkOut: '2025-05-27',
      amount: '₹25,200',
      status: 'Pending',
    },
    {
      id: 'B12347',
      guest: 'Amit Singh',
      accommodation: 'Mountain View Cottage',
      checkIn: '2025-05-24',
      checkOut: '2025-05-26',
      amount: '₹18,900',
      status: 'Confirmed',
    },
    {
      id: 'B12348',
      guest: 'Neha Gupta',
      accommodation: 'Family Bungalow',
      checkIn: '2025-05-25',
      checkOut: '2025-05-30',
      amount: '₹52,000',
      status: 'Confirmed',
    },
    {
      id: 'B12349',
      guest: 'Vikram Mehta',
      accommodation: 'Luxury Tent',
      checkIn: '2025-05-26',
      checkOut: '2025-05-28',
      amount: '₹22,000',
      status: 'Pending',
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Booking ID
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Guest
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
            >
              Accommodation
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
            >
              Check In
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
            >
              Check Out
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Amount
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bookings.map((booking) => (
            <tr key={booking.id} className="hover:bg-gray-50">
              <td className="px-4 py-4 text-sm text-blue-600 font-medium">
                {booking.id}
              </td>
              <td className="px-4 py-4 text-sm text-gray-900">
                {booking.guest}
              </td>
              <td className="px-4 py-4 text-sm text-gray-500 hidden md:table-cell">
                {booking.accommodation}
              </td>
              <td className="px-4 py-4 text-sm text-gray-500 hidden sm:table-cell">
                {booking.checkIn}
              </td>
              <td className="px-4 py-4 text-sm text-gray-500 hidden sm:table-cell">
                {booking.checkOut}
              </td>
              <td className="px-4 py-4 text-sm font-medium text-gray-900">
                {booking.amount}
              </td>
              <td className="px-4 py-4 text-sm">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    booking.status === 'Confirmed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {booking.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentBookingsTable;