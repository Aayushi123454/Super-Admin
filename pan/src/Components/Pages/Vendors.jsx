
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useRef } from "react"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { countries, statesByCountry } from "../data/locationData"


const userId = localStorage.getItem("USER_ID")

const initialFormState = {
  user: userId,
  store_name: "",
  verified_phone_number: "",
  is_approved: false,
  profile_picture: null,
}
const intialAddressform = {
  pincode: "",
  country: "",
  state: "",
  city: "",
  address_line1: "",
  address_line2: "",
}

const Vendors = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [vendorData, setVendorData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(initialFormState)
  const [viewVendor, setViewVendor] = useState(null)
  const [vendorverifiedmodal, setVendorverifiedModal] = useState(false)
  const [vendorotp, setVendorotp] = useState(false)
  const [AddModal, setAddModal] = useState(false)
  const [Addform, setAddform] = useState(intialAddressform)

  const [addressVendorId, setAddressVendorId] = useState(null)
  const [addressEditingId, setAddressEditingId] = useState(null)
  const [ISUserID, setISUserID] = useState(false)
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""])
  const otpRefs = useRef([])
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false)
  const [selectedVendorId, setSelectedVendorId] = useState(null)
  const [addressErrors, setAddressErrors] = useState({})
  const [formErrors, setFormErrors] = useState({})
  const [phoneErrors, setPhoneErrors] = useState({})
  const [otpErrors, setOtpErrors] = useState({})

  const handleOtpDigitChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, "")
    if (value.length <= 1) {
      const updated = [...otpDigits]
      updated[index] = value
      setOtpDigits(updated)
      if (value && index < otpRefs.current.length - 1) {
        otpRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const navigate = useNavigate()

  useEffect(() => {
    getVendorList()
  }, [])

  const getVendorList = async () => {
    try {
      const res = await fetch("https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/vendor/")
      const data = await res.json()
      console.log("vendorlistss", data)
      setVendorData(data.data)
    } catch (err) {
      console.error(err.message)
      setError("Something went wrong while fetching data.")
    } finally {
      setLoading(false)
    }
  }

  


  const exportToCSV = () => {
    const headers = ["Store Name", "Address", "Contact Number", "Status"]
    const rows = vendorData.map((v) => [
      v.store_name,
      v.address,
      v.contact_number,
      v.is_approved ? "Approved" : "Pending",
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((val) => `"${val}"`).join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "vendors_export.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleNavigate = (id) => {
    console.log(id)
    navigate(`/vendorproduct/${id}`)
  }

  const validateAddressForm = () => {
    const errors = {}

    if (!Addform.pincode || !/^\d{6}$/.test(Addform.pincode)) {
      errors.pincode = "Pincode must be exactly 6 digits"
    }

    if (!Addform.country) {
      errors.country = "Please select a country"
    }

    if (!Addform.state) {
      errors.state = "Please select a state"
    }

    if (!Addform.city) {
      errors.city = "Please select a city"
    }

    if (!Addform.address_line1 || Addform.address_line1.trim().length < 5) {
      errors.address_line1 = "Address line 1 must be at least 5 characters long"
    }

    setAddressErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateVendorForm = () => {
    const errors = {}

    if (!form.store_name || form.store_name.trim().length < 2) {
      errors.store_name = "Store name must be at least 2 characters long"
    }

    // if (!form.verified_phone_number || !/^\d{10}$/.test(form.verified_phone_number)) {
    //   errors.verified_phone_number = "Phone number must be exactly 10 digits"
    // }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validatePhoneNumber = () => {
    const errors = {}

    if (!form.verified_phone_number || !/^\d{10}$/.test(form.verified_phone_number)) {
      errors.verified_phone_number = "Phone number must be exactly 10 digits"
    }

    setPhoneErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateOTP = () => {
    const errors = {}
    const otpValue = otpDigits.join("")

    if (!otpValue || otpValue.length !== 4) {
      errors.otp = "Please enter complete 4-digit OTP"
    }

    if (!/^\d{4}$/.test(otpValue)) {
      errors.otp = "OTP must contain only numbers"
    }

    setOtpErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleStatusChange = async (vendorId, newStatus) => {
    try {
      const response = await fetch(`https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/vendor/${vendorId}/`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_approved: newStatus === "approved" ? true : false,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      setVendorData((prev) =>
        prev.map((vendor) =>
          vendor.id === vendorId ? { ...vendor, is_approved: newStatus === "approved" ? true : false } : vendor,
        ),
      )
    } catch (err) {
      console.error(err)
      toast.error("Error updating vendor status")
    }
  }

const updateVendor = (updatedVendor) => {
  setVendorData((prevVendors) =>
    prevVendors.map((v) => (v.id === updatedVendor.id ? updatedVendor : v))
  )
}



  const handleDelete = async (id) => {
    try {
      await fetch(`https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/vendor/${id}/`, {
        method: "DELETE",
      })
      setVendorData(vendorData.filter((v) => v.id !== id))
      toast.success("Vendor deleted successfully")
    } catch {
      toast.error("Failed to delete vendor")
    }
  }

  const handleAddaddress = async (e) => {
    const { name, value } = e.target
    setAddform((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (addressErrors[name]) {
      setAddressErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }

    if (phoneErrors[name]) {
      setPhoneErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setForm((prev) => ({
        ...prev,
        profile_picture: file,
      }))
    }
  }

  const handleAddressSubmit = async (e) => {
    e.preventDefault()

    if (!validateAddressForm()) {
      toast.error("Please Enter valid Input")
      return
    }

    const { ...rest } = Addform
    const finalData = {
      vendor: addressVendorId,
      ...rest,
    }

    if (!addressVendorId) {
      toast.error("Vendor not selected for address")
      return
    }

    const method = addressEditingId ? "PUT" : "POST"
    const url =
      addressEditingId === null
        ? "https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/vendoraddress/"
        : `https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/vendoraddress/${addressEditingId}/`

    console.log(finalData, "id")

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalData),
      })

      if (!response.ok) throw new Error("Server responded with an error.")

      await getVendorList()
      handleCloseAdddModal()
      toast.success(`Address ${addressEditingId ? "updated" : "added"} successfully`)
    } catch (err) {
      console.error("Submit Error:", err)
      toast.error("Failed to save address")
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    if (!validateVendorForm()) {
      toast.error("Please enter valid information")
      return
    }

    const formData = new FormData()
    formData.append("store_name", form.store_name)
  formData.append("mobile_number", `+91${form.verified_phone_number}`)
    if (form.profile_picture && typeof form.profile_picture !== "string") {
      formData.append("profile_picture", form.profile_picture)
    }

    const method = editingId ? "PUT" : "POST"
    console.log("method", method)

    if (method === "POST") {
      formData.append("user", userId)
    }

    const url = editingId
      ? `https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/vendor/${editingId}/`
      : "https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/vendor/"

    try {
      const response = await fetch(url, {
        method,
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Server responded with an error.")
      }
const data = await response.json();

    if (editingId) {
     
      updateVendor(data);
    } else {
      
      setVendorData((prev) => [...prev, data]);
    }

    await getVendorList();
      handleCloseModal()
      toast.success(`Vendor ${editingId ? "updated" : "added"} successfully`)
    } catch (err) {
      console.error("Submit Error:", err)
      toast.error("Failed to save vendor")
      handleCloseModal()
    }
  }

  const handleCloseAdddModal = () => {
    setAddModal(false)
    setAddform(intialAddressform)
    setAddressEditingId(null)
    setAddressVendorId(null)
  }

  const handlevendorverifiedSubmit = async (e) => {
    e.preventDefault()

    if (!validatePhoneNumber()) {
      toast.error("Please enter a valid 10-digit phone number")
      return
    }

    try {
      const response = await fetch("https://q8f99wg9-8000.inc1.devtunnels.ms/user/send-otp/", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone_number: `+91${form.verified_phone_number}` }),
      })

      const dataverified = await response.json()

      console.log("dataverified", dataverified)

      if (response.ok) {
        setISUserID(dataverified.is_new_user)
        setVendorverifiedModal(false)
        setVendorotp(true)
        toast.success("OTP sent successfully")
      } else {
        toast.error(dataverified.message || "Failed to send OTP. Please try again.")
      }
    } catch (err) {
      toast.error("Network error while sending OTP. Please check your internet.")
      console.error(err)
    }
  }

  const handlevendorotpsubmit = async (e) => {
    e.preventDefault()

    if (!validateOTP()) {
      toast.error("Please enter a valid 4-digit OTP")
      return
    }

    const otpValue = otpDigits.join("")

    try {
      let response
      const payload = {
        phone_number: `+91${form.verified_phone_number}`,
        otp: otpValue.trim(),
      }
      if (ISUserID) {
        response = await fetch("https://q8f99wg9-8000.inc1.devtunnels.ms/user/register/", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
      } else {
        response = await fetch("https://q8f99wg9-8000.inc1.devtunnels.ms/user/vendorlogin/", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
      }

      const data = await response.json()
      console.log("dataaresposne", data)

      if (response.ok) {
        localStorage.setItem("USER_ID", data.user_id)
        if (!data.is_new_vendor) {
          toast.error("Vendor is already created with this number")
          setVendorotp(false)
          setOtpDigits(["", "", "", ""])
        } else {
          setVendorotp(false)
          setModalOpen(true)
          setVendorverifiedModal(false)
          setOtpDigits(["", "", "", ""])
          toast.success("OTP verified! Please complete registration")
        }
      } else {
        toast.error(data.message || "Failed to verify OTP.")
      }
    } catch (err) {
      toast.error("Failed to verify OTP")
      console.error(err)
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingId(null)
    setForm(initialFormState)
    setFormErrors({})
  }

  const filteredVendors = vendorData.filter((vendor) => {
    const matchesSearch =
      vendor?.store_name === null || vendor?.store_name?.toLowerCase().includes(searchTerm?.toLowerCase())



    return matchesSearch
   
  })
  const availableStates = statesByCountry[Addform.country] || []

  return (
    <>
      <div className="page-header">
        <h2>Vendors List</h2>

        <div className="vendors-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search vendors by storename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-controls">
            <button className="add-vendor-btn" onClick={() => setVendorverifiedModal(true)}>
              + Add Vendor
            </button>
            <button className="export-btn" onClick={exportToCSV}>
              Export Vendors
            </button>
          </div>
        </div>
        <div className="vendors-stats">
          <div className="stat-card">
            <h3>Total Vendors</h3>
            <div className="stat-value">{vendorData.length}</div>
          </div>
          <div className="stat-card">
            <h3>Active Vendors</h3>
            <div className="stat-value">{vendorData.filter((v) => v.is_approved === true).length}</div>
          </div>
          <div className="stat-card">
            <h3>Pending Approval</h3>
            <div className="stat-value">{vendorData.filter((v) => v.is_approved === false).length}</div>
          </div>
        </div>
        <table className="vendors-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Profile</th>
              <th>Store Name</th>
              {/* <th>Vendor Name </th> */}
              <th>Location</th>
              <th>Phone Number</th>
              <th>Action</th>
              <th>Status</th>
            </tr>
          </thead>
          {loading ? (
            <p>Loading vendor data...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : (
            <tbody>
              {filteredVendors.sort((a,b)=>a.id-b.id).map((vendor,index) => (
                <tr key={vendor.id}>
                  <td className="id1">{index+1}</td>
                  <td>
                    {vendor.profile_picture ? (
                      <img
                        src={vendor.profile_picture || "/placeholder.svg"}
                        alt="profile"
                        style={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover" }}
                      />
                    ) : (
                      "No Image"
                    )}
                  </td>
                   
                  <td>{vendor.store_name ?? "NA"}</td>
                  <td>
                    {vendor.pickup_locations?.map(
                      (loc) =>
                        `${loc.pincode + "," + loc.country + " ," + loc.state + "," + loc.city + "" + loc.address_line1 + "," + loc.address_line2}`,
                    )}
                  </td>
                  <td>{vendor.verified_phone_number}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view" title="View" onClick={() => handleNavigate(vendor.id)}>
                        👁
                      </button>
                      <button
                        className="action-btn edit"
                        onClick={() => {
                         
setForm({
  store_name: vendor.store_name || "",
  verified_phone_number: vendor.verified_phone_number
    ? vendor.verified_phone_number.startsWith("+91")
      ? vendor.verified_phone_number.slice(3) 
      : vendor.verified_phone_number
    : "",
  profile_picture: vendor.profile_picture || null,
})


                          setEditingId(vendor.id)
                          setModalOpen(true)
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        className="action-btn delete"
                        title="Delete"
                        onClick={() => {
                          setSelectedVendorId(vendor.id)
                          setDeleteConfirmModal(true)
                        }}
                      >
                        🗑
                      </button>
                      {vendor.pickup_locations.length <= 0 && (
                        <button
                          className="action-btn edit"
                          title="Add Address"
                          onClick={() => {
                            setAddModal(true)
                            setAddressVendorId(vendor.id)
                            setAddform(intialAddressform)
                            setAddressEditingId(null)
                          }}
                        >
                          ➕
                        </button>
                      )}
                      <button
                        className="action-btn edit"
                        onClick={() => {
                          const addr = vendor.pickup_locations?.[0]
                          setAddModal(true)
                          setAddressVendorId(vendor.id)
                          if (addr) {
                            setAddressEditingId(addr.id)
                            setAddform({
                              pincode: addr.pincode ?? "",
                              country: addr.country ?? "",
                              state: addr.state ?? "",
                              city: addr.city ?? "",
                              address_line1: addr.address_line1 ?? "",
                              address_line2: addr.address_line2 ?? "",
                            })
                          } else {
                            setAddressEditingId(null)
                            setAddform(intialAddressform)
                          }
                        }}
                      >
                        📍
                      </button>
                    </div>
                  </td>
                  <td>
                    <select
                      value={vendor.is_approved ? "approved" : "pending"}
                      onChange={(e) => handleStatusChange(vendor.id, e.target.value)}
                      className="status-dropdown"
                    >
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>

        {modalOpen && (
          <div className="modal">
            <form className="customer-form" onSubmit={handleFormSubmit}>
              <h3>{editingId ? "Edit Vendor" : "Add Vendor"}</h3>

              <label>Store Name:</label>
              <input
                name="store_name"
                value={form.store_name}
                onChange={handleInputChange}
                style={{ borderColor: formErrors.store_name ? "red" : "" }}
                
              />
              {formErrors.store_name && <span style={{ color: "red", fontSize: "12px" }}>{formErrors.store_name}</span>}

              <label>Contact Number:</label>
              <input
                type="text"
                disabled
                name="verified_phone_number"
                value={form.verified_phone_number}
                onChange={handleInputChange}
                style={{ borderColor: formErrors.verified_phone_number ? "red" : "" }}
                
              />
              {formErrors.verified_phone_number && (
                <span style={{ color: "red", fontSize: "12px" }}>{formErrors.verified_phone_number}</span>
              )}

              <label>Profile Picture:</label>
              <input type="file" onChange={handleImageUpload} accept="image/*" />

              <div className="form-buttons">
                <button type="submit">Save</button>
                <button type="button" onClick={handleCloseModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {viewVendor && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Vendor Details</h3>

              <p>
                <strong>ID:</strong> {viewVendor.id}
              </p>
              <p>
                <strong>Store Name:</strong> {viewVendor.store_name}
              </p>
              <p>
                <strong>Address:</strong>
                {viewVendor.pickup_locations?.map(
                  (loc) => `${loc.city + " " + loc.state + " " + loc.country + "" + loc.pincode}`,
                )}
              </p>
              <p>
                <strong>Contact Number:</strong> {viewVendor.mobile_number}
              </p>
              <p>
                <strong>Status:</strong> {viewVendor.is_approved ? "Approved" : "Pending"}
              </p>

              <p>
                <strong>Profile:</strong>
                {viewVendor.profile_picture ? (
                  <img
                    src={viewVendor.profile_picture || "/placeholder.svg"}
                    alt="profile"
                    style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8 }}
                  />
                ) : (
                  "No Image"
                )}
              </p>
              <button className="close-btn" onClick={() => setViewVendor(null)}>
                Close
              </button>
            </div>
          </div>
        )}
        {vendorverifiedmodal && (
          <div className="modal">
            <form className="customer-form" onSubmit={handlevendorverifiedSubmit}>
              <h2> Enter your phone number</h2>
              <input
                type="number"
                name="verified_phone_number"
                placeholder="Enter your phone Number"
                value={form.verified_phone_number}
                onChange={handleInputChange}
                style={{ borderColor: phoneErrors.verified_phone_number ? "red" : "" }}
               
              />
              {phoneErrors.verified_phone_number && (
                <span style={{ color: "red", fontSize: "12px" }}>{phoneErrors.verified_phone_number}</span>
              )}
              <div className="form-buttons">
                <button type="submit">Save</button>
                <button
                  type="button"
                  onClick={() => {
                    setVendorverifiedModal(false)
                    setPhoneErrors({})
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        {vendorotp && (
          <div className="otp-modal-overlay">
            <div className="otp-modal">
              <form onSubmit={handlevendorotpsubmit} className="otp-form">
                <h2 className="otp-title">Enter Your OTP</h2>

                <div className="otp-input-group">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      inputMode="numeric"
                      className="otp-input"
                      autoFill="off"
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(e, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      ref={(el) => (otpRefs.current[index] = el)}
                      style={{ borderColor: otpErrors.otp ? "red" : "" }}
                    />
                  ))}
                </div>
                {otpErrors.otp && (
                  <span
                    style={{ color: "red", fontSize: "12px", textAlign: "center", display: "block", marginTop: "5px" }}
                  >
                    {otpErrors.otp}
                  </span>
                )}

                <div className="otp-button-group">
                  <button type="submit" className="otp-btn verify-btn">
                    Verify
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVendorotp(false)
                      setOtpDigits(["", "", "", ""])
                      setOtpErrors({})
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {deleteConfirmModal && (
          <div className="modal">
            <div className="modal-content">
              <h3>Are you sure you want to delete this vendor?</h3>
              <div className="form-buttons">
                <button
                  className="otp-btn verify-btn"
                  onClick={() => {
                    handleDelete(selectedVendorId)
                    setDeleteConfirmModal(false)
                  }}
                >
                  Yes
                </button>
                <button onClick={() => setDeleteConfirmModal(false)}>No</button>
              </div>
            </div>
          </div>
        )}
{AddModal && (
  <div className="modal">
    <form className="address-form" onSubmit={handleAddressSubmit}>
      <h3>{addressEditingId ? "Edit Address" : "Add Address"}</h3>

      <label>Pincode:</label>
      <input
        type="text"
        name="pincode"
        placeholder="Enter your pincode"
        value={Addform.pincode}
        onChange={handleAddaddress}
        style={{ borderColor: addressErrors.pincode ? "red" : "" }}
      />
      {addressErrors.pincode && <span>{addressErrors.pincode}</span>}

      <label>Country:</label>
      <select
        name="country"
        
        value={Addform.country}
        onChange={handleAddaddress}
        style={{ borderColor: addressErrors.country ? "red" : "" }}
      >
        <option value="">Select Country</option>
        {countries.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </select>
      {addressErrors.country && <span>{addressErrors.country}</span>}

      <label>State:</label>
      <select
        name="state"
        value={Addform.state}
        onChange={handleAddaddress}
        disabled={!Addform.country}
        style={{ borderColor: addressErrors.state ? "red" : "" }}
      >
        <option value="">Select State</option>
        {availableStates.map((state) => (
          <option key={state} value={state}>
            {state}
          </option>
        ))}
      </select>
      {addressErrors.state && <span>{addressErrors.state}</span>}

      <label>City:</label>
      <input
        type="text"
        name="city"
        placeholder="Enter your City"
        value={Addform.city}
        onChange={handleAddaddress}
        style={{ borderColor: addressErrors.city ? "red" : "" }}
      />
      {addressErrors.city && <span>{addressErrors.city}</span>}

      <label>Address 1:</label>
      <input
        type="text"
        name="address_line1"
        placeholder="Enter your address"
        value={Addform.address_line1}
        onChange={handleAddaddress}
        style={{ borderColor: addressErrors.address_line1 ? "red" : "" }}
      />
      {addressErrors.address_line1 && <span>{addressErrors.address_line1}</span>}

      <label>Address 2:</label>
      <input
        type="text"
        name="address_line2"
        placeholder="Enter your address"
        value={Addform.address_line2}
        onChange={handleAddaddress}
      />

      <div className="address-buttons">
        <button type="submit">Save</button>
        <button type="button" onClick={handleCloseAdddModal}>
          Cancel
        </button>
      </div>
    </form>
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
      </div>
    </>
  )
}

export default Vendors

