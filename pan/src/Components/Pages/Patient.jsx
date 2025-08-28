import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
const intialpatientform={
  name:"",
  age:"",
  gender:"",
  description:""

  
}
const Patient = () => {
const[Loading,setPatientLoading]=useState(true);
const[Error,setError]=useState(null);
const[PatientData,setPatientData]=useState([]);
const[SearchTerm,setSearchTerm]=useState();
const[ShowAddPatient,setShowAddPatient]=useState(false);
const[patientform,setPatientform]=useState(intialpatientform)
const[editingId,setEditingid]=useState()
 const params = useParams();
  const { PatientId } = params;


  const filteredPatients = PatientData.filter((item) =>
    item.name?.toLowerCase().includes(SearchTerm.toLowerCase())
  );

const getPatientlist = async ()=>{
    try{
 const response = await fetch(
        `https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/PatientsByDoctor/${PatientId}/`
      );
      console.log( "Response",response)
 const data = await response.json()
 setPatientData(data.data)
    }
    catch(err){
console.error(err.message);
      setError('Something went wrong while fetching data.');
            

    }
    finally{
        setPatientLoading(false);
    }
}
useEffect(()=>{
getPatientlist();
},[])

const handlepatientInputChange = (e) => {
  const { name, value } = e.target;
  setPatientform((prev) => ({
    ...prev,
    [name]: value,
  }));
};





  return (
    <>
<div className="page-header">
        <h1>Patient</h1>
      </div>

<div className="customers-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search  patient by name..."
            className="search-input"
            value={SearchTerm}
            onChange={setSearchTerm}
          />
        </div>
<div className="filter-controls">


          <button className="add-customer-btn">
            + Add Doctor
          </button>

          <button className="export-btn" >
            Export Details
          </button>
        </div>


        </div>

< table className="customers-table">
<thead>
    <th> Id</th>
    <th> Patient Name</th>
    <th> Gender</th>
    <th>Age </th>
    <th>Descripition </th>
    <th> Status</th>
</thead>
<tbody>
  {Loading ? (
    <tr>
      <td colSpan="6">Loading Patient Data...</td>
    </tr>
  ) : Error ? (
    <tr>
      <td colSpan="6" style={{ color: 'red' }}>{Error}</td>
    </tr>
  ) : filteredPatients.length > 0 ? (
    filteredPatients.map((item, index) => (
      <tr key={item.id}>
        <td>{index + 1}</td>
        <td>{item.name}</td>
        <td>{item.gender}</td>
        <td>{item.age}</td>
        <td>{item.description}</td>
        <td>
          <div className="action-buttons">
            <button className="action-btn edit">✏️</button>
            <button className="action-btn delete">🗑</button>
          </div>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="6" style={{ textAlign: 'center' }}>No Data Found</td>
    </tr>
  )}
</tbody>
</table>
{ShowAddPatient(
<div className='modal'>
<form className="customer-form">
            <h3>{editingId ? "Edit Patient" : "Add Patient"}</h3>

            <label htmlFor="name">First Name:</label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="Enter your  name"
              title="Only alphabets are allowed"
              value={patientform.first_name}
              onChange={handlepatientInputChange}

            />
            {/* {formErrors.first_name && (
              <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{formErrors.first_name}</div>
            )} */}

            <label htmlFor="gender">Email:</label>
            <input
              type="text"
              name="gender"
              placeholder="Enter your Gender"
              value={patientform.gender}
              onChange={handlepatientInputChange}
            />
            {/* {formErrors.email && (
              <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>{formErrors.email}</div>
            )} */}

            <label htmlFor="age">Mobile Number:</label>
            <input
              type="text"
              name="age"
              placeholder="Enter your phone number"
              value={patientform.age}
              onChange={handlepatientInputChange}
          
            />

            
            <div className="form-buttons">
              <button type="submit">Save</button>
              <button type="button" onClick={setShowAddPatient(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>


)}

    </>
  )
}

export default Patient;