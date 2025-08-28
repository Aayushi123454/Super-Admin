import React, { useState } from 'react';
import { useEffect } from 'react';

const History = () => {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const[paymentData,setPaymentData]=useState([]);
  const[paymenterror,setPaymenterror]=useState(null);
  const[paymentloading,setPaymentloading]=useState(true);
  const[paymentstatus,setpaymentstatus]=useState(false)
 const[payStatus, setPayStatus] = useState('')
 
  const filteredHistory = paymentData?.filter((item) => {
  const matchStatus = statusFilter === 'all' || item.status === statusFilter;
   const matchMethod = methodFilter === 'all' || item.method === methodFilter;
  return  matchStatus && matchMethod;
});


const filteredStatus = filteredHistory.filter((item, index) => {
    if(paymentstatus === true){
      item.payment_status = payStatus;
    }
})
console.log(filteredStatus,"stATUS.............");


const handlepayment=async()=>{

  setpaymentstatus(false)
}

 const totalAmount = paymentData.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
const pending = paymentData
  .filter((item) => item.payment_status === 'pending')
  .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

const refunded = paymentData
  .filter((item) => item.payment_status === 'Refunded')
  .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);


  const exportToCSV = () => {
    const headers = ['Payment ID', 'User', 'Amount', 'Method', 'Date', 'Status'];
    const rows = paymentData.map(item => [
      item.transactionId,
      item.user,
      item.amount,
      item.method,
      item.date,
      item.status
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'payment_history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const getpaymentlist= async()=>{

    try{
  const getpaymentlist = await fetch('https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/payment/')
  const data= await getpaymentlist.json();
  setPaymentData(data);
  console.log(data,"datya")


    }
    catch (err) {
      console.error(err.message);
      setPaymenterror('Something went wrong while fetching data.');
  }
  finally{
    setPaymentloading(false)
  }
  };

useEffect(()=>{
  getpaymentlist();
},[])
const handlepaymentdelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await fetch(`https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/customer/${id}/`, {
        method: 'DELETE',
      });
      setPaymentData(paymentData.filter((c) => c.id !== id));
    } catch {
      alert('Failed to delete');
    }
  };

  const handleStatusChange = (e) =>{
const{value} = e.target;

setPayStatus(value);
}
  return (
    <>
      <div className="page-header">
        <h2>Payment History</h2>

        <div className="history-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by user or payment ID..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-controls">
            <select className="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="Success">Success</option>
              <option value="Pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="Refund">Refund</option>
              <option value="processing">Processing</option>
          
            </select>

            <select className="status-filter" value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
              <option value="all">All Methods</option>
              <option value="upi">UPI</option>
              <option value="card">Credit Card</option>
              <option value="net_banking">Net Banking</option>
              <option value="wallet">Wallet</option>
               <option value="cash_on_delivery">Cash on Delivery</option> 
            </select>

            <button className="export-btn" onClick={exportToCSV}>Export Vendors</button>
          </div>
        </div>

        <div className="vendors-stats">
          <div className="stat-card">
            <h3>Total Payment</h3>
            <div className="stat-value">₹{totalAmount.toFixed(2)}
</div>
          </div>
          <div className="stat-card">
            <h3>Pending Amount</h3>
            <div className="stat-value">₹{pending.toFixed(2)}</div>
          </div>
          <div className="stat-card">
            <h3>Refunded</h3>
            <div className="stat-value">₹{refunded.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <table className="customers-table">
        <thead>
          <tr>
            <th>Payment ID</th>
            <th>User</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
<tbody>
  {paymentloading ? (
    <tr><td colSpan="7">Loading payment data...</td></tr>
  ) : paymenterror ? (
    <tr><td colSpan="7" style={{ color: "red" }}>{paymenterror}</td></tr>
  ) : (
    filteredHistory.map((item) => (
      <tr key={item.id}>
        <td>{item.transaction_id}</td>
        <td>{item.customer}</td>
        <td>₹{item.amount}</td>
        <td>{item.payment_method}</td>
        <td>{item.created_at}</td>
        <td style={{ color: 'blue', cursor: 'pointer' }}onClick={()=>setpaymentstatus(true)}>{item.payment_status }</td>
        <td>
          <div className='action-buttons'>
            <button className="action-btn view" onClick={() => setSelectedPayment(item)}>👁</button>
            <button className="action-btn edit">✏️</button>
            <button className='action-btn delete' onClick={() => handlepaymentdelete(item.id)}>🗑</button>
          </div>
        </td>
      </tr>
    ))
  )}
</tbody>


      </table>

      {selectedPayment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Payment Details</h2>
            <p><strong>Payment ID:</strong> {selectedPayment.transaction_id}</p>
            <p><strong>User:</strong> {selectedPayment.customer}</p>
            <p><strong>Amount:</strong> ₹{selectedPayment.amount}</p>
            <p><strong>Method:</strong> {selectedPayment.payment_method}</p>
            <p><strong>Date:</strong> {selectedPayment.created_at}</p>
            <p><strong>Status:</strong> {selectedPayment.payment_status}</p>
            <button className="close-btn" onClick={() => setSelectedPayment(null)}>Close</button>
          </div>
        </div>
      )}
      {
        paymentstatus&&(
          <div className='modal-overlay'>
            <div className='modal-content'>
              <h2> status Change</h2>
              <select onChange={handleStatusChange} value={paymentstatus}>
                <option value="all">All Status</option>
              <option value="Success">Success</option>
              <option value="Pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="Refund">Refund</option>
              <option value="processing">Processing</option>
            
              </select>
              <div className='form-button'>
                <button className='close-btn'onClick={handlepayment}> close</button>
             
              </div>
              
            </div>
          </div>
        )
      }
    </>
  );
};

export default History;
