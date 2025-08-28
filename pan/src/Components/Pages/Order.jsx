

import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OrderModal = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Order Details</h2>
        <p><strong>Name:</strong> {order.customer_name}</p>
        <p><strong>Date:</strong> {order.created_at}</p>
        <p><strong>Address:</strong> {order.deliveryaddress}</p>
        <p><strong>Amount:</strong> ₹{order.total_amount}</p>
        <p><strong>Status:</strong> {order.order_status}</p>
        <p><strong>Payment Status:</strong> {order.payment_status}</p>
        <button onClick={onClose} className="close-btn">Close</button>
      </div>
    </div>
  );
};

const Order = () => {
  const [orderData, setOrderData] = useState([]);
  const [orderloading, setOrderloading] = useState(true);
  const [ordererror, setOrderError] = useState(null);
  const [searchOrderTerm, setSearchOrderTerm] = useState('');
  const [statusOrderFilter, setStatusOrderFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal1, setShowModal] = useState(false);
  const [SelectedDate, SetSelectedDate] = useState('');
  const [isModal, setIsModal] = useState('')
  const [deleteModal, setDeleteModal] = useState(false); 
  const [orderToDelete, setOrderToDelete] = useState(null);



  const getOrderList = async () => {
    try {
      
      const response = await fetch('https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/order/', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log("data----->",data.data)
      setOrderData(data.data);
      localStorage.setItem('OrderData', data)
       
    } catch (err) {
      console.error(err.message);
      setOrderError('Something went wrong while fetching data.');
            toast.error("Failed to fetch orders!");

    } finally {
      setOrderloading(false);
    }
  };

  useEffect(() => {
    getOrderList();
  }, []);



  const handleDeleteOrder = async (id) => {
   
    try {
      const response = await fetch(`https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/order/${id}/`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setOrderData((prevOrders) => prevOrders.filter((order) => order.id !== id));
         toast.success("Order deleted successfully!");
      } else {
        toast.error('Failed to delete order');
      }
    } catch (err) {
      console.error(err.message);
      toast.error('Something went wrong while deleting the order');
    }
  };
  const exportToCSV = (orders) => {
    const headers = [
      "Customer Name", "Date", "Address",
      "Amount", "Payment Status", "Order Status"
    ];

    const rows = orders.map(order => [
   
    order.customer_name,
    order.created_at ? new Date(order.created_at).toISOString().split("T")[0] : "",
    `${order.delivery_address_details?.house_details || ""}, ${order.delivery_address_details?.city || ""}, ${order.delivery_address_details?.pincode || ""}`,
    `₹${order.total_amount}`,
    order.payment_status,
    order.order_status
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'orders.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleStatusChange = async (id, newStatus) => {
    console.log("newsartes", id, newStatus)

    try {
      const response = await fetch(`https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/order/${id}/`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_status: newStatus }),
      });

      if (response.ok) {

        setOrderData((prevOrders) =>
          prevOrders.map((order) =>
            order.id === id ? { ...order, order_status: newStatus } : order
          )
        );
          toast.success(`Order status updated to ${newStatus}`);
        setIsModal(false);
      } else {
         toast.error("Failed to update status!");
      }
    } catch (error) {
      console.error(error);
      toast.error('Error updating status');
    }
  };


  const filteredOrder = orderData.filter((order) => {
  
    const matchesStatus = statusOrderFilter === 'all' || order.order_status === statusOrderFilter;
    const matchesDate = SelectedDate === '' || order.created_at.slice(0, 10) === SelectedDate;
    return matchesStatus && matchesDate
  });

  const handleStatusClick = (order) => {
    setSelectedOrder(order);
    setIsModal(true);
  };

  const handleModalClose = () => {
    setIsModal(false);
    setSelectedOrder(null);
  };

  return (
    <>

      <div className="page-header">
        <h1>Order List</h1>
      </div>

      <div className="order-controls1">
      
        <input
          type="text"
          placeholder="Search order..."
          value={searchOrderTerm}
          onChange={(e) => setSearchOrderTerm(e.target.value)}
          className="search-input1"
        />
       
      <div className='filter-controls'>
        <input
          type="date"
          value={SelectedDate}
          onChange={(e) => SetSelectedDate(e.target.value)}
          className='status-filter' />


        <select
          value={statusOrderFilter}
          onChange={(e) => setStatusOrderFilter(e.target.value)}
          title="filter"
          className="status-filter"
        >
          <option value="all">All Status</option>
          <option value="placed">Placed</option>
          <option value="oonfirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
         <option value="returned">Returned</option>
         <option value="refunded"> Refunded</option>
         <option value="confirmed"> Confirmed</option>
        </select>
        <button className="export-btn" onClick={() => exportToCSV(filteredOrder)}>
          Export Details
        </button>
        </div>
     
      </div>

      <div className="order-stats">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <div className="stat-value">{orderData.length}</div>
        </div>
        <div className="stat-card">
          <h3>Active Orders</h3>
          <div className="stat-value">
            {orderData.filter((o) => o.order_status === 'on_the_way').length}
          </div>

        </div>
        <div className="stat-card">
          <h3>Sucessful order</h3>
          <div className="stat-value">
            {orderData.filter((o) => o.order_status === 'delivered').length}
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="order-table">
          <thead>

            
            <tr>
              <th>Order Id</th>
              <th>Customer </th>
              <th>Date</th>
              <th>Address</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orderloading ? (
  <tr>
    <td colSpan="8">Loading Order data...</td>
  </tr>
) : ordererror ? (
  <tr>
    <td colSpan="8" style={{ color: 'red' }}>{ordererror}</td>
  </tr>
) : filteredOrder.length > 0 ? (
  filteredOrder.map((order,index) => (
    <tr key={order.id}>
      <td>{index+1}</td>
      <td>{order.customer_name}</td>
    
      <td>
        {order.created_at
          ? new Date(order.created_at).toISOString().split("T")[0]
          : ""}
      </td>
      <td>
  {order.delivery_address_details?.house_details},   
  {order.delivery_address_details?.city}, 
  {order.delivery_address_details?.pincode}
  
</td>

      
      <td>₹{order.total_amount}</td>
      <td>{order.payment_status}</td>
      <td
        onClick={() => handleStatusClick(order)}
        style={{ color: 'blue', cursor: 'pointer' }}
      >
        {order.order_status}
      </td>
      <td>
        <div className='action-buttons'>
          <button
  className="action-btn delete"
  title="Delete"
  onClick={() => {
    setOrderToDelete(order); 
    setDeleteModal(true);    
  }}
>
  🗑
</button>
          <button
            className="action-btn view"
            title="View"
            onClick={() => {
              setSelectedOrder(order);
              setShowModal(true);
            }}
          >
            👁
          </button>
        </div>
      </td>
    </tr>
  ))
) : (
  <tr>
    <td colSpan="8" style={{ textAlign: 'center' }}>No Data Found</td>
  </tr>
)}

          </tbody>
        </table>
      </div>

      {showModal1 && (
        <OrderModal
          order={selectedOrder}
          onClose={() => {
            setShowModal(false);
            setSelectedOrder(null);
          }}

        />
      )}
      {isModal && selectedOrder && (
        <div className='modal-overlay'>
          <div class="modal-content">
            <h2>Edit Order Status</h2>
            <select value={selectedOrder.order_status} onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)
            }>
              <option value="packed">Packing</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Placed </option>
              <option value="returned">Returned</option>

            </select>
            <button onClick={handleModalClose} className='close-btn'>Close</button>
          </div>
        </div>
      )}


      {deleteModal && (
  <div className="modal">
    <div className="modal-content">
      <h3>Are you sure you want to delete this order details?</h3>
      <div className="form-buttons">
        <button 
          onClick={() => handleDeleteOrder(orderToDelete.id)} 
          className="otp-btn verify-btn">
          Yes
        </button>
        <button 
          onClick={() => setDeleteModal(false)} 
          >
          No
        </button>
      </div>
    </div>
  </div>
)}
<ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          closeButton
        />

    </>
  );
};

export default Order;
