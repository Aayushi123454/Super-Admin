
import { useState, useEffect, useRef } from "react"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useNavigate } from "react-router-dom"
const userId = localStorage.getItem("USER_ID")
console.log("userIduserIduserId", userId)

const intialDoctorform = {
  name: "",
  email: "",
  assured_muni: false,
  verified_phone_number: "",
  experience_years: "",
  address_line: "",
  specialization_ids: "",
  user: userId,
  consultation_fee: "",
  available_from: "",
  available_to: "",
}

const Doctor = () => {
  const [doctorsearch, setDoctorsearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [specializationfilter, setSpecilizationfilter] = useState("All")
  const [viewDoctor, setViewDoctor] = useState(null)
  const [Doctordata, setDoctorData] = useState([])
  const [DoctorModal, setDoctorModal] = useState(false)
  const [phonenumber, setPhonenumber] = useState("")
  const [error, setError] = useState()
  const [Loading, setLoading] = useState(true)
  const [verifiedDoctorModal, setVerifiedDoctorModal] = useState(false)
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""])
  const otpRefs = useRef([])

  const [phoneErrors, setPhoneErrors] = useState({})
  const [otpErrors, setOtpErrors] = useState({})
  const [doctorFormErrors, setDoctorFormErrors] = useState({})

  const [DoctorformModal, setDoctorformModal] = useState(false)
  const [Doctorform, setDoctorform] = useState(intialDoctorform)
  const [specialities, setSpecialities] = useState([])
  const [EditingDoctorId, setEditingDoctorId] = useState(null)
  const [spec, setSpecs] = useState([])
  const [Isuser, setISUser] = useState(false)
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false)
  const [selectedVendorId, setSelectedVendorId] = useState(null)
 const navigate=useNavigate();
  const validatePhoneNumber = (phone) => {
    const errors = {}

    if (!phone) {
      errors.phone = "Phone number is required"
    } else if (!/^\d{10}$/.test(phone)) {
      errors.phone = "Phone number must be exactly 10 digits"
    } else if (phone.startsWith("0")) {
      errors.phone = "Phone number should not start with 0"
    } else if (!/^[6-9]/.test(phone)) {
      errors.phone = "Phone number should start with 6, 7, 8, or 9"
    }

    return errors
  }

  const validateOTP = (otp) => {
    const errors = {}

    if (!otp || otp.length !== 4) {
      errors.otp = "Please enter the complete 4-digit OTP"
    } else if (!/^\d{4}$/.test(otp)) {
      errors.otp = "OTP must contain only numbers"
    }

    return errors
  }

  const validateDoctorForm = (formData, phoneNum) => {
    const errors = {}

  
    if (!formData.name.trim()) {
      errors.name = "Doctor name is required"
    } else if (formData.name.trim().length < 2) {
      errors.name = "Doctor name must be at least 2 characters"
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      errors.name = "Doctor name should only contain letters and spaces"
    } else if (formData.name.trim().length > 50) {
      errors.name = "Doctor name should not exceed 50 characters"
    }

   
    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address"
    }

    if (!formData.address_line.trim()) {
      errors.address_line = "Address is required"
    } else if (formData.address_line.trim().length < 10) {
      errors.address_line = "Address should be at least 10 characters"
    } else if (formData.address_line.trim().length > 200) {
      errors.address_line = "Address should not exceed 200 characters"
    }

   
    if (!formData.consultation_fee) {
      errors.consultation_fee = "Consultation fee is required"
    } else if (isNaN(formData.consultation_fee)) {
      errors.consultation_fee = "Consultation fee must be a valid number"
    } else if (Number.parseFloat(formData.consultation_fee) <= 0) {
      errors.consultation_fee = "Consultation fee must be greater than 0"
    } else if (Number.parseFloat(formData.consultation_fee) > 10000) {
      errors.consultation_fee = "Consultation fee should not exceed ₹10,000"
    }

  
    if (!formData.experience_years) {
      errors.experience_years = "Experience is required"
    } else if (isNaN(formData.experience_years)) {
      errors.experience_years = "Experience must be a valid number"
    } else if (Number.parseInt(formData.experience_years) < 0) {
      errors.experience_years = "Experience cannot be negative"
    } else if (Number.parseInt(formData.experience_years) > 60) {
      errors.experience_years = "Experience should not exceed 60 years"
    }

  
    if (!formData.specialization_ids) {
      errors.specialization_ids = "Please select a specialization"
    }

 
    if (!formData.available_from) {
      errors.available_from = "Available from time is required"
    }

    if (!formData.available_to) {
      errors.available_to = "Available to time is required"
    }

    if (formData.available_from && formData.available_to) {
      if (formData.available_from >= formData.available_to) {
        errors.available_to = "Available to time must be after available from time"
      }
    }

   
    if (!EditingDoctorId && phoneNum) {
      const phoneValidation = validatePhoneNumber(phoneNum)
      if (phoneValidation.phone) {
        errors.verified_phone_number = phoneValidation.phone
      }
    }

    return errors
  }

  const clearAllErrors = () => {
    setPhoneErrors({})
    setOtpErrors({})
    setDoctorFormErrors({})
  }


const handleNavigate = (id) => {
    console.log(id)
    navigate(`/Patient/${id}`)
  }


  const clearDoctorForm = () => {
    setDoctorform(intialDoctorform)
    setPhonenumber("")
    setOtpDigits(["", "", "", ""])
    setSpecs([])
    setEditingDoctorId(null)
  }

  const getdoctorlist = async () => {
    try {
      const response = await fetch("https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/doctor/", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()
      setDoctorData(data.data)
    } catch (err) {
      console.error(err.message)
      setError("Something went wrong while fetching data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getdoctorlist()
  }, [])

  const filteredDoctors = Doctordata.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(doctorsearch.toLowerCase()) ||
      doctor.specializations?.some((s) => s.name.toLowerCase().includes(doctorsearch.toLowerCase()))

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "verified" && doctor.assured_muni) ||
      (statusFilter === "unverified" && !doctor.assured_muni)

    const matchesSpecialization =
      specializationfilter === "All" || doctor.specializations?.some((s) => s.name === specializationfilter)

    return matchesSearch && matchesStatus && matchesSpecialization
  })

  const handleOtpDigitChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, "")
    if (value.length <= 1) {
      const updated = [...otpDigits]
      updated[index] = value
      setOtpDigits(updated)

      if (otpErrors.otp) {
        setOtpErrors({})
      }

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

  const handleDoctorDelete = async (id) => {
    try {
      await fetch(`https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/doctor/${id}/`, {
        method: "DELETE",
      })
      setDoctorData(Doctordata.filter((c) => c.id !== id))
      toast.success("Doctor deleted successfully")
    } catch {
      toast.error("Failed to delete")
    }
  }

  const handleCloseDoctorModal = () => {
    setDoctorModal(false)
    clearAllErrors()
    setPhonenumber("")
  }

  const handleDoctorformSubmit = async (e) => {
    e.preventDefault()

    const formErrors = validateDoctorForm(Doctorform, phonenumber)

    if (Object.keys(formErrors).length > 0) {
      setDoctorFormErrors(formErrors)
      toast.error("Please fix the validation errors")
      return
    }

    const method = EditingDoctorId ? "PUT" : "POST"
    const url = EditingDoctorId
      ? `https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/doctor/${EditingDoctorId}/`
      : "https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/doctor/"

    console.log(method, url, spec, "spec")

    const bodyData = {
      name: Doctorform.name.trim(),
      email: Doctorform.email.trim(),
      address_line: Doctorform.address_line.trim(),
      assured_muni: Doctorform.assured_muni,
      verified_phone_number: `+91${phonenumber}`,
      experience_years: Number.parseInt(Doctorform.experience_years),
      consultation_fee: Number.parseFloat(Doctorform.consultation_fee),
      specialization_ids: [Doctorform.specialization_ids],
      available_from: Doctorform.available_from,
      available_to: Doctorform.available_to,
    }

    if (!EditingDoctorId) {
      bodyData.user = userId
    }

    console.log("doctorbodyda----->", bodyData)

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(bodyData),
      })

      const result = await response.json()

      console.log("jjjjjjj", response)
      console.log("jjjjjjj", result)

      if (response.ok) {
        toast.success(EditingDoctorId ? "Doctor updated successfully" : "Doctor added successfully")
        setDoctorformModal(false)
        clearDoctorForm()
        clearAllErrors()
        getdoctorlist()
      } else {
        toast.error(result.message || "Failed to save doctor")
      }
    } catch (err) {
      console.error("Doctor save error:", err.message)
      toast.error("Error saving doctor")
    }
  }

  const handledoctorSubmit = async (e) => {
    e.preventDefault()

    const phoneValidation = validatePhoneNumber(phonenumber)

    if (Object.keys(phoneValidation).length > 0) {
      setPhoneErrors(phoneValidation)
      return
    }

    try {
      const doctor = await fetch("https://q8f99wg9-8000.inc1.devtunnels.ms/user/send-otp/", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone_number: `+91${phonenumber}` }),
      })

      console.log("doctor", doctor)
      const data = await doctor.json()

      if (doctor.ok) {
        console.log("OTP sent response:", data)
        setISUser(data.is_new_user)
        setDoctorModal(false)
        setVerifiedDoctorModal(true)
        setPhoneErrors({})
        toast.success("OTP sent successfully")
      } else {
        toast.error(data.message || "Failed to send OTP")
      }
    } catch (err) {
      console.error("OTP send error:", err)
      toast.error("Failed to send OTP")
    }
  }

  const handleDoctorinputchange = (e) => {
    const { name, value, type, checked } = e.target

    if (doctorFormErrors[name]) {
      setDoctorFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }

    setDoctorform((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    if (name === "specialization_ids") {
      setSpecs([Number.parseInt(value)])
    }
  }

  const handleVerifiedDoctorSubmit = async (e) => {
    e.preventDefault()
    const otp = otpDigits.join("")

    const otpValidation = validateOTP(otp)

    if (Object.keys(otpValidation).length > 0) {
      setOtpErrors(otpValidation)
      return
    }

    try {
      let response
      const payload = {
        phone_number: `+91${phonenumber}`,
        otp,
      }

      if (Isuser) {
        response = await fetch("https://q8f99wg9-8000.inc1.devtunnels.ms/user/register/", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
      } else {
        response = await fetch("https://q8f99wg9-8000.inc1.devtunnels.ms/user/doctorlogin/", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        })
      }

      const data = await response.json()
      console.log("serverreposne1111", response)
      console.log("dataaresposne", data)

      if (response.ok) {
        localStorage.setItem("USER_ID", data.user_id)
        if (!data.is_new_doctor) {
          toast.info("Doctor is already created with this number")
          setVerifiedDoctorModal(false)
          clearAllErrors()
          setPhonenumber("")
          setOtpDigits(["", "", "", ""])
        } else {
          setVerifiedDoctorModal(false)
          setDoctorformModal(true)
          setOtpErrors({})
          toast.success("Phone verified successfully")
        }
      } else {
        toast.error(data.message || "Invalid or expired OTP")
      }
    } catch (err) {
      console.error("Error during doctor verification:", err.message)
      toast.error(`Verification failed: ${err.message}`)
    }
  }

  const exportDoctorsToCSV = () => {
    if (Doctordata.length === 0) return

    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Address",
      "Verified",
      "Consultation Fee",
      "Available from",
      "Available to",
      "Specializations",
      "Experience",
    ]

    const rows = Doctordata.map((doctor) => [
      doctor.id,
      doctor.name,
      doctor.email,
      `'${doctor.verified_phone_number}'`,
      doctor.address_line,
      doctor.assured_muni ? "Yes" : "No",
      doctor.consultation_fee,
      doctor.available_from,
      doctor.available_to,
      doctor.specializations?.map((s) => s.name).join(", "),
      doctor.experience_years,
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "doctor_data.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleverifiedDoctor = () => {
    setVerifiedDoctorModal(false)
    setOtpErrors({})
    setOtpDigits(["", "", "", ""])
  }

  const fetchSpecilization = async () => {
    try {
      const verified = await fetch("https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/speciality/", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      const data = await verified.json()
      setSpecialities(data)
    } catch (error) {
      console.error("Error fetching specialities:", error)
    }
  }

  useEffect(() => {
    fetchSpecilization()
  }, [])

  return (
    <>
      <div className="page-header">
        <h1>Doctor</h1>
      </div>

      <div className="doctor-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search doctor by name or specialization..."
            value={doctorsearch}
            onChange={(e) => setDoctorsearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <select className="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>

          <select
            value={specializationfilter}
            onChange={(e) => setSpecilizationfilter(e.target.value)}
            className="status-filter"
          >
            <option value="All">All Specializations</option>
            {specialities.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          <button className="add-customer-btn" onClick={() => setDoctorModal(true)}>
            + Add Doctor
          </button>
          <button className="add-customer-btn" onClick={exportDoctorsToCSV}>
            Export Details
          </button>
        </div>
      </div>

      <div className="customers-stats">
        <div className="stat-card">
          <h3>Total Doctors</h3>
          <div className="stat-value">{Doctordata.length}</div>
        </div>
        <div className="stat-card">
          <h3>Verified Doctors</h3>
          <div className="stat-value">{Doctordata.filter((d) => d.assured_muni).length}</div>
        </div>
        <div className="stat-card">
          <h3>Unverified Doctors</h3>
          <div className="stat-value">{Doctordata.filter((d) => !d.assured_muni).length}</div>
        </div>
      </div>

      <table className="customers-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Status</th>
            <th>Consultation Fee</th>
            <th>Availability</th>
            <th>Specialization</th>
            <th>Experience</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Loading ? (
            <tr>
              <td colSpan="11">Loading Doctor data...</td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan="11" style={{ color: "red" }}>
                {error}
              </td>
            </tr>
          ) : filteredDoctors.length > 0 ? (
            filteredDoctors.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>{item.verified_phone_number}</td>
                <td>{item.address_line}</td>
                <td>{item.assured_muni ? "Verified Doctor" : "Unverified Doctor"}</td>
                <td>₹{item.consultation_fee}</td>
                <td style={{ color: "blue" }}>
                  {item.available_from} - {item.available_to}
                </td>
                <td>{item.specializations?.map((s) => s.name).join(", ")}</td>
                <td>{item.experience_years} years</td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn view" onClick={() => handleNavigate(item.id)}>
                      👁
                    </button>
                    <button
                      className="action-btn edit"
                      onClick={() => {
                        setDoctorform({
                          name: item.name,
                          email: item.email,
                          address_line: item.address_line,
                          assured_muni: item.assured_muni,
                          verified_phone_number: item.verified_phone_number,
                          experience_years: item.experience_years,
                          specialization_ids: item.specializations?.[0]?.id || "",
                          consultation_fee: item.consultation_fee,
                          available_from: item.available_from || "",
                          available_to: item.available_to || "",
                        })
                        setSpecs([item.specializations?.[0]?.id])
                        setPhonenumber(item.verified_phone_number?.replace("+91", ""))
                        setEditingDoctorId(item.id)
                        setDoctorformModal(true)
                        clearAllErrors()
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      className="action-btn delete"
                      title="Delete"
                      onClick={() => {
                        setSelectedVendorId(item.id)
                        setDeleteConfirmModal(true)
                      }}
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11" style={{ textAlign: "center" }}>
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>

     
      {DoctorModal && (
        <div className="modal">
          <form className="customer-form" onSubmit={handledoctorSubmit}>
            <h2>Enter your phone number</h2>
            <input
              type="text"
              value={phonenumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "")
                if (value.length <= 10) {
                  setPhonenumber(value)
                  if (phoneErrors.phone) {
                    setPhoneErrors({})
                  }
                }
              }}
              placeholder="Enter phone number without +91"
              maxLength={10}
              style={{ borderColor: phoneErrors.phone ? "red" : "" }}
            />
            {phoneErrors.phone && (
              <span style={{ color: "red", fontSize: "12px", display: "block", marginTop: "5px" }}>
                {phoneErrors.phone}
              </span>
            )}
            <div className="form-buttons">
              <button type="submit">Send OTP</button>
              <button type="button" onClick={handleCloseDoctorModal}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {verifiedDoctorModal && (
        <div className="otp-modal-overlay">
          <div className="otp-modal">
            <form onSubmit={handleVerifiedDoctorSubmit} className="otp-form">
              <h2 className="otp-title">Enter Your OTP</h2>

              <div className="otp-input-group">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    inputMode="numeric"
                    className="otp-input"
                    autoComplete="off"
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
                  style={{ color: "red", fontSize: "12px", display: "block", marginTop: "10px", textAlign: "center" }}
                >
                  {otpErrors.otp}
                </span>
              )}

              <div className="otp-button-group">
                <button type="submit" className="otp-btn verify-btn">
                  Verify
                </button>
                <button type="button" onClick={handleverifiedDoctor} className="otp-btn cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {DoctorformModal && (
        <div className="modal">
          <form className="product-form" onSubmit={handleDoctorformSubmit}>
            <h3>{EditingDoctorId ? "Edit Doctor" : "Add Doctor"}</h3>

            <div className="form-grid">
              <div className="form-column-1">
                <div className="form-field">
                  <label>Doctor Name: *</label>
                  <input
                    name="name"
                    value={Doctorform.name}
                    onChange={handleDoctorinputchange}
                    required
                    style={{ borderColor: doctorFormErrors.name ? "red" : "" }}
                  />
                  {doctorFormErrors.name && (
                    <span style={{ color: "red", fontSize: "12px", display: "block", marginTop: "3px" }}>
                      {doctorFormErrors.name}
                    </span>
                  )}
                </div>

                <div className="form-field">
                  <label>Email: *</label>
                  <input
                    name="email"
                    type="email"
                    value={Doctorform.email}
                    onChange={handleDoctorinputchange}
                   
                    style={{ borderColor: doctorFormErrors.email ? "red" : "" }}
                  />
                  {doctorFormErrors.email && (
                    <span style={{ color: "red", fontSize: "12px", display: "block", marginTop: "3px" }}>
                      {doctorFormErrors.email}
                    </span>
                  )}
                </div>

                <div className="form-field">
                  <label>Address: *</label>
                  <input
                    name="address_line"
                    value={Doctorform.address_line}
                    onChange={handleDoctorinputchange}
                    
                    style={{ borderColor: doctorFormErrors.address_line ? "red" : "" }}
                  />
                  {doctorFormErrors.address_line && (
                    <span style={{ color: "red", fontSize: "12px", display: "block", marginTop: "3px" }}>
                      {doctorFormErrors.address_line}
                    </span>
                  )}
                </div>

                <div className="form-field">
                  <label>Consultation Fee (₹): *</label>
                  <input
                    type="number"
                    name="consultation_fee"
                    value={Doctorform.consultation_fee}
                    onChange={handleDoctorinputchange}
                 
                    min="1"
                    max="10000"
                    style={{ borderColor: doctorFormErrors.consultation_fee ? "red" : "" }}
                  />
                  {doctorFormErrors.consultation_fee && (
                    <span style={{ color: "red", fontSize: "12px", display: "block", marginTop: "3px" }}>
                      {doctorFormErrors.consultation_fee}
                    </span>
                  )}
                </div>

                <div className="form-field">
                  <label>Specialization: *</label>
                  <select
                    name="specialization_ids"
                    value={Doctorform.specialization_ids}
                    onChange={handleDoctorinputchange}
                
                    style={{ borderColor: doctorFormErrors.specialization_ids ? "red" : "" }}
                  >
                    <option value="">-- Select Speciality --</option>
                    {specialities.map((spec) => (
                      <option key={spec.id} value={spec.id}>
                        {spec.name}
                      </option>
                    ))}
                  </select>
                  {doctorFormErrors.specialization_ids && (
                    <span style={{ color: "red", fontSize: "12px", display: "block", marginTop: "3px" }}>
                      {doctorFormErrors.specialization_ids}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-column-2">
                <div className="form-field">
                  <label>Experience (Years): *</label>
                  <input
                    type="number"
                    name="experience_years"
                    value={Doctorform.experience_years}
                    onChange={handleDoctorinputchange}
                  
                    min="0"
                    max="60"
                    style={{ borderColor: doctorFormErrors.experience_years ? "red" : "" }}
                  />
                  {doctorFormErrors.experience_years && (
                    <span style={{ color: "red", fontSize: "12px", display: "block", marginTop: "3px" }}>
                      {doctorFormErrors.experience_years}
                    </span>
                  )}
                </div>

                <div className="form-field">
                  <label>Available from: *</label>
                  <input
                    type="time"
                    name="available_from"
                    value={Doctorform.available_from}
                    onChange={handleDoctorinputchange}
                  
                    style={{ borderColor: doctorFormErrors.available_from ? "red" : "" }}
                  />
                  {doctorFormErrors.available_from && (
                    <span style={{ color: "red", fontSize: "12px", display: "block", marginTop: "3px" }}>
                      {doctorFormErrors.available_from}
                    </span>
                  )}
                </div>

                <div className="form-field">
                  <label>Available to: *</label>
                  <input
                    type="time"
                    name="available_to"
                    value={Doctorform.available_to}
                    onChange={handleDoctorinputchange}
                  
                    style={{ borderColor: doctorFormErrors.available_to ? "red" : "" }}
                  />
                  {doctorFormErrors.available_to && (
                    <span style={{ color: "red", fontSize: "12px", display: "block", marginTop: "3px" }}>
                      {doctorFormErrors.available_to}
                    </span>
                  )}
                </div>

                <div className="form-field">
                  <label>Verified:</label>
                  <input
                    type="checkbox"
                    name="assured_muni"
                    checked={Doctorform.assured_muni}
                    onChange={handleDoctorinputchange}
                  />
                </div>

                <div className="form-field">
                  <label>Phone Number:</label>
                  <input
                    type="text"
                    name="verified_phone_number"
                    value={phonenumber}
                    onChange={(e) => setPhonenumber(e.target.value)}
                    placeholder="Phone number without +91"
                    readOnly
                    style={{ borderColor: doctorFormErrors.verified_phone_number ? "red" : "" }}
                  />
                  {doctorFormErrors.verified_phone_number && (
                    <span style={{ color: "red", fontSize: "12px", display: "block", marginTop: "3px" }}>
                      {doctorFormErrors.verified_phone_number}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="form-buttons">
              <button type="submit">Save</button>
              <button
                type="button"
                onClick={() => {
                  setDoctorformModal(false)
                  clearDoctorForm()
                  clearAllErrors()
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteConfirmModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Are you sure you want to delete this doctor?</h3>
            <div className="form-buttons">
              <button
                className="otp-btn verify-btn"
                onClick={() => {
                  handleDoctorDelete(selectedVendorId)
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
  )
}

export default Doctor
