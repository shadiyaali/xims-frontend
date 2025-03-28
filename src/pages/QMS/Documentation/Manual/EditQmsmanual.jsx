import React, { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react';
import file from "../../../../assets/images/Company Documentation/file-icon.svg"
import "./addqmsmanual.css"
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from "../../../../Utils/Config";

const EditQmsmanual = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [manualDetails, setManualDetails] = useState(null);
    const [corrections, setCorrections] = useState([]); 
    const [previewAttachment, setPreviewAttachment] = useState(null);
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const [selectedFile, setSelectedFile] = useState(null);
    const [fileObject, setFileObject] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const [formData, setFormData] = useState({
        title: '',
        written_by: null,
        no: '',
        checked_by: null,
        rivision: '',
        approved_by: null,
        document_type: 'System',
        date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`,
        review_frequency_year: '',
        review_frequency_month: '',
        publish: false,
        send_notification: false
    });

    const [openDropdowns, setOpenDropdowns] = useState({
        written_by: false,
        checked_by: false,
        approved_by: false,
        document_type: false,
        day: false,
        month: false,
        year: false
    });
   

  
    const closeAttachmentPreview = () => {
        setPreviewAttachment(null);
    };
// Add a method to handle attachment preview
const handleAttachmentPreview = () => {
    // If there's an existing attachment from the manual details
    if (manualDetails && manualDetails.upload_attachment) {
        setPreviewAttachment(manualDetails.upload_attachment);
    } 
    // If a new file is selected
    else if (fileObject) {
        // Create a URL for the selected file
        const fileUrl = URL.createObjectURL(fileObject);
        setPreviewAttachment(fileUrl);
    }
};

// You can call this method after file selection or when manual details are loaded
useEffect(() => {
    if (manualDetails && manualDetails.upload_attachment) {
        handleAttachmentPreview();
    }
}, [manualDetails]);

// Modify file change handler to trigger preview
const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        setSelectedFile(file.name);
        setFileObject(file);
        // Create a preview URL for the newly selected file
        const fileUrl = URL.createObjectURL(file);
        setPreviewAttachment(fileUrl);
    }
};
    const getUserCompanyId = () => {
        const storedCompanyId = localStorage.getItem("company_id");
        if (storedCompanyId) return storedCompanyId;

        const userRole = localStorage.getItem("role");
        if (userRole === "user") {
            const userData = localStorage.getItem("user_company_id");
            if (userData) {
                try {
                    return JSON.parse(userData);
                } catch (e) {
                    console.error("Error parsing user company ID:", e);
                    return null;
                }
            }
        }
        return null;
    };

    const companyId = getUserCompanyId();

    // Populate form data when manual details are loaded
    useEffect(() => {
        if (manualDetails) {
            setFormData({
                title: manualDetails.title || '',
                written_by: manualDetails.written_by?.id || null,
                no: manualDetails.no || '',
                checked_by: manualDetails.checked_by?.id || null,
                rivision: manualDetails.rivision || '',
                approved_by: manualDetails.approved_by?.id || null,
                document_type: manualDetails.document_type || 'System',
                date: manualDetails.date || formData.date,
                review_frequency_year: manualDetails.review_frequency_year || '',
                review_frequency_month: manualDetails.review_frequency_month || '',
                publish: manualDetails.publish || false,
                send_notification: manualDetails.send_notification || false
            });
        }
    }, [manualDetails]);

    useEffect(() => {
        if (companyId) {
            fetchUsers();
        }
    }, [companyId])

    useEffect(() => {
        if (companyId && id) {
            fetchManualDetails();
            fetchManualCorrections();
        }
    }, [companyId, id]);

    const fetchUsers = async () => {
        try {
            if (!companyId) return;

            const response = await axios.get(`${BASE_URL}/company/users/${companyId}/`);

            if (Array.isArray(response.data)) {
                setUsers(response.data);
            } else {
                setUsers([]);
                console.error("Unexpected response format:", response.data);
                setError("Unable to load users");
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            setError("Failed to load users. Please check your connection and try again.");
            setUsers([]);
        }
    };

    const fetchManualDetails = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/qms/manual-detail/${id}/`);
            setManualDetails(response.data);
            setIsInitialLoad(false);
            console.log("Manual Details:", response.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching manual details:", err);
            setError("Failed to load manual details");
            setIsInitialLoad(false);
            setLoading(false);
        }
    };

    const fetchManualCorrections = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/qms/manuals/${id}/corrections/`);
            setCorrections(response.data);
            console.log("Fetched Manual Corrections:", response.data);
        } catch (error) {
            console.error("Error fetching manual corrections:", error);
        }
    };

    const getDaysInMonth = (month, year) => {
        return new Date(year, month, 0).getDate();
    };

    const parseDate = () => {
        const dateObj = new Date(formData.date);
        return {
            day: dateObj.getDate(),
            month: dateObj.getMonth() + 1,
            year: dateObj.getFullYear()
        };
    };

    const dateParts = parseDate();

    const days = Array.from(
        { length: getDaysInMonth(dateParts.month, dateParts.year) },
        (_, i) => i + 1
    );

    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const years = Array.from(
        { length: 21 },
        (_, i) => currentYear - 10 + i
    );

    const documentTypes = [
        'System',
        'Paper',
        'External',
        'Work Instruction'
    ];

    const toggleDropdown = (dropdown) => {
        setOpenDropdowns(prev => ({
            ...prev,
            [dropdown]: !prev[dropdown]
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

   
    const handleDropdownChange = (e, dropdown) => {
        const value = e.target.value;

        if (dropdown === 'day' || dropdown === 'month' || dropdown === 'year') {
            const dateObj = parseDate();

            dateObj[dropdown] = parseInt(value, 10);

            const newDate = `${dateObj.year}-${String(dateObj.month).padStart(2, '0')}-${String(dateObj.day).padStart(2, '0')}`;

            setFormData(prev => ({
                ...prev,
                date: newDate
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [dropdown]: value
            }));
        }

        setOpenDropdowns(prev => ({ ...prev, [dropdown]: false }));
    };

    const handleCancelClick = () => {
        navigate('/company/qms/manual')
    }

    const handleUpdateClick = async () => {
        try {
            setLoading(true);

            const companyId = getUserCompanyId();
            if (!companyId) {
                setError('Company ID not found. Please log in again.');
                setLoading(false);
                return;
            }

            const submitData = new FormData();
            submitData.append('company', companyId);

            // Add all form data
            Object.keys(formData).forEach(key => {
                submitData.append(key, formData[key]);
            });

            // Add file if new file is selected
            if (fileObject) {
                submitData.append('upload_attachment', fileObject);
            }

            const response = await axios.put(`${BASE_URL}/qms/manuals/${id}/update/`, submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setLoading(false);
            alert('Manual updated successfully!');
            navigate('/company/qms/manual');
        } catch (err) {
            setLoading(false);
            setError('Failed to update manual');
            console.error('Error updating manual:', err);
        }
    };

    const getMonthName = (monthNum) => {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return monthNames[monthNum - 1];
    };

    const formatUserName = (user) => {
        return `${user.first_name} ${user.last_name}`;
    };

    // Render loading state
    if (isInitialLoad) {
        return <div className="text-white">Loading...</div>;
    }
    const renderAttachmentPreview = () => {
        // If there's a preview attachment from existing manual or newly selected file
        if (previewAttachment) {
            const attachmentName = selectedFile || manualDetails?.upload_attachment_name || 'Attachment';
            
            return (
                <div className="mt-4 p-4 bg-[#2C2C35] rounded-lg flex flex-col items-center">
                    <div className="text-white flex items-center space-x-4">
                        <span>{attachmentName}</span>
                        <button 
                            onClick={() => window.open(previewAttachment, '_blank')}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition duration-300"
                        >
                            View File
                        </button>
                    </div>
                </div>
            );
        }
        return null;
    };
    
    return (
        <div className="bg-[#1C1C24] rounded-lg text-white">
            <div>
                <h1 className="add-manual-sections">Edit Manual Sections</h1>

                {error && (
                    <div className="mx-[18px] px-[104px] mt-4 p-2 bg-red-500 rounded text-white">
                        {error}
                    </div>
                )}

                <div className="border-t border-[#383840] mx-[18px] pt-[22px] px-[104px]">
                    <div className="grid md:grid-cols-2 gap-5">
                        <div>
                            <label className="add-qms-manual-label">
                                Section Name/Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full add-qms-manual-inputs"
                            />
                        </div>

                        <div>
                            <label className="add-qms-manual-label">
                                Written/Prepare By <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full add-qms-manual-inputs appearance-none cursor-pointer"
                                    name="written_by"
                                    value={formData.written_by || ''}
                                    onFocus={() => toggleDropdown('written_by')}
                                    onChange={(e) => handleDropdownChange(e, 'written_by')}
                                    onBlur={() => setOpenDropdowns(prev => ({ ...prev, written_by: false }))}
                                >
                                    <option value="">Select User</option>
                                    {users.map(user => (
                                        <option key={`written-${user.id}`} value={user.id}>
                                            {formatUserName(user)}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown
                                    className={`absolute right-3 top-7 h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out ${openDropdowns.written_by ? 'rotate-180' : ''}`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="add-qms-manual-label">
                                Section Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="no"
                                value={formData.no}
                                onChange={handleChange}
                                className="w-full add-qms-manual-inputs"
                            />
                        </div>

                        <div>
                            <label className="add-qms-manual-label">
                                Checked by <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full add-qms-manual-inputs appearance-none cursor-pointer"
                                    name="checked_by"
                                    value={formData.checked_by || ''}
                                    onFocus={() => toggleDropdown('checked_by')}
                                    onChange={(e) => handleDropdownChange(e, 'checked_by')}
                                    onBlur={() => setOpenDropdowns(prev => ({ ...prev, checked_by: false }))}
                                >
                                    <option value="">Select User</option>
                                    {users.map(user => (
                                        <option key={`checked-${user.id}`} value={user.id}>
                                            {formatUserName(user)}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown
                                    className={`absolute right-3 top-7 h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out ${openDropdowns.checked_by ? 'rotate-180' : ''}`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="add-qms-manual-label">
                                Revision
                            </label>
                            <input
                                type="text"
                                name="rivision"
                                value={formData.rivision}
                                onChange={handleChange}
                                className="w-full add-qms-manual-inputs"
                            />
                        </div>

                        <div>
                            <label className="add-qms-manual-label">
                                Approved by <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full add-qms-manual-inputs appearance-none cursor-pointer"
                                    name="approved_by"
                                    value={formData.approved_by || ''}
                                    onFocus={() => toggleDropdown('approved_by')}
                                    onChange={(e) => handleDropdownChange(e, 'approved_by')}
                                    onBlur={() => setOpenDropdowns(prev => ({ ...prev, approved_by: false }))}
                                >
                                    <option value="">Select User</option>
                                    {users.map(user => (
                                        <option key={`approved-${user.id}`} value={user.id}>
                                            {formatUserName(user)}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown
                                    className={`absolute right-3 top-7 h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out ${openDropdowns.approved_by ? 'rotate-180' : ''}`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="add-qms-manual-label">
                                Document Type
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full add-qms-manual-inputs appearance-none cursor-pointer"
                                    name="document_type"
                                    value={formData.document_type}
                                    onFocus={() => toggleDropdown('document_type')}
                                    onChange={(e) => handleDropdownChange(e, 'document_type')}
                                    onBlur={() => setOpenDropdowns(prev => ({ ...prev, document_type: false }))}
                                >
                                    {documentTypes.map(type => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown
                                    className={`absolute right-3 top-7 h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out ${openDropdowns.document_type ? 'rotate-180' : ''}`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="add-qms-manual-label">
                                Date
                            </label>
                            <div className="flex space-x-5">
                                <div className="relative w-1/3">
                                    <select
                                        className="w-full add-qms-manual-inputs appearance-none cursor-pointer"
                                        value={dateParts.day}
                                        onFocus={() => toggleDropdown('day')}
                                        onChange={(e) => handleDropdownChange(e, 'day')}
                                        onBlur={() => setOpenDropdowns(prev => ({ ...prev, day: false }))}
                                    >
                                        {days.map(day => (
                                            <option key={`day-${day}`} value={day}>
                                                {day < 10 ? `0${day}` : day}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        className={`absolute right-3 top-7 h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out ${openDropdowns.day ? 'rotate-180' : ''}`}
                                    />
                                </div>
                                <div className="relative w-1/3">
                                    <select
                                        className="w-full add-qms-manual-inputs appearance-none cursor-pointer"
                                        value={dateParts.month}
                                        onFocus={() => toggleDropdown('month')}
                                        onChange={(e) => handleDropdownChange(e, 'month')}
                                        onBlur={() => setOpenDropdowns(prev => ({ ...prev, month: false }))}
                                    >
                                        {months.map(month => (
                                            <option key={`month-${month}`} value={month}>
                                                {month < 10 ? `0${month}` : month} - {getMonthName(month).substring(0, 3)}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        className={`absolute right-3 top-7 h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out ${openDropdowns.month ? 'rotate-180' : ''}`}
                                    />
                                </div>
                                <div className="relative w-1/3">
                                    <select
                                        className="w-full add-qms-manual-inputs appearance-none cursor-pointer"
                                        value={dateParts.year}
                                        onFocus={() => toggleDropdown('year')}
                                        onChange={(e) => handleDropdownChange(e, 'year')}
                                        onBlur={() => setOpenDropdowns(prev => ({ ...prev, year: false }))}
                                    >
                                        {years.map(year => (
                                            <option key={`year-${year}`} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        className={`absolute right-3 top-7 h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out ${openDropdowns.year ? 'rotate-180' : ''}`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="add-qms-manual-label">
                                Attach Document
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    id="fileInput"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <button
                                    type="button"
                                    className="w-full add-qmsmanual-attach"
                                    onClick={() => document.getElementById('fileInput').click()}
                                >
                                    <span className="file-input">
                                        {selectedFile ? selectedFile : "Choose File"}
                                    </span>
                                    <img src={file} alt="File Icon" />
                                </button>
                                {!selectedFile && <p className="text-right no-file">No file chosen</p>}
                            </div>
                            {renderAttachmentPreview()}
 
                        </div>

                        <div>
                            <label className='add-qms-manual-label'>
                                Review Frequency
                            </label>
                            <div className="flex space-x-5">
                                <input
                                    type="text"
                                    name="review_frequency_year"
                                    placeholder='Years'
                                    value={formData.review_frequency_year}
                                    onChange={handleChange}
                                    className="w-full add-qms-manual-inputs"
                                />
                                <input
                                    type="text"
                                    name="review_frequency_month"
                                    placeholder='Months'
                                    value={formData.review_frequency_month}
                                    onChange={handleChange}
                                    className="w-full add-qms-manual-inputs"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center mt-[22px] justify-between">
                        <div className='mb-6'>
                            <button
                                className="request-correction-btn duration-200"
                            >
                                Save as Draft
                            </button>
                        </div>
                        <div className='flex gap-[22px] mb-6'>
                            <button
                                className="cancel-btn duration-200"
                                onClick={handleCancelClick}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                className="save-btn duration-200"
                                onClick={handleUpdateClick}
                                disabled={loading}
                            >
                                {loading ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditQmsmanual