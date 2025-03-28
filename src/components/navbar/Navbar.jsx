import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../ThemeContext";
import "./navbar.css";
import bell from "../../assets/images/Navbar/bell.svg";
 
import profile from "../../assets/images/Navbar/profile.svg";
import logo from "../../assets/images/logo.svg";
import dashboardicon from "../../assets/images/Sidebar/dashboard.svg";
import { useNavigate } from "react-router-dom";
import companies from "../../assets/images/Navbar/company.svg";
import subscribers from "../../assets/images/Navbar/subscribers.svg";
import subscriptions from "../../assets/images/Navbar/subscription.svg";
import changepswd from "../../assets/images/Navbar/changepaswd.svg";
import logout from "../../assets/images/Navbar/logout.svg";
import dropdownicon from "../../assets/images/Navbar/dropdown.svg";
import closeIcon from "../../assets/images/Navbar/closeicon.svg";
import menuicons from "../../assets/images/Navbar/menu.svg";
import navfooter from "../../assets/images/Navbar/navfooter.svg";
import profileicon from "../../assets/images/Navbar/profile icon.svg";
import sunIcon from "../../assets/images/Navbar/sun.svg";
import moonIcon from "../../assets/images/Navbar/moon.svg";
import { BASE_URL } from "../../Utils/Config";
import axios from "axios";
import AdminProfilePhotoModal from "./AdminProfilePhotoModal";
const Navbar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [isSubscribersOpen, setIsSubscribersOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  // State for profile photo modal
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [adminId, setAdminId] = useState(null);
  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch admin details from API
  useEffect(() => {
    const fetchAdminDetails = async () => {
      try {
        const token = localStorage.getItem("adminAuthToken");
        if (!token) {
          navigate("/");
          return;
        }
        
        const response = await axios.get(`${BASE_URL}/accounts/admins-detail/`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const adminData = Array.isArray(response.data) 
          ? response.data[0] 
          : response.data;

        if (adminData) {
          setUserEmail(adminData.email || "");
          setUserName(adminData.username || "");
          setAdminId(adminData.id || null);
          
          // Set profile photo directly from API, fallback to default
          setProfilePhotoUrl(adminData.profile_photo || profile);

          // Update localStorage with admin details (excluding profile photo)
          localStorage.setItem("adminDetails", JSON.stringify({
            email: adminData.email,
            username: adminData.username,
            id: adminData.id
          }));
        }
      } catch (error) {
        console.error("Error fetching admin details:", error);

        // Fallback to localStorage if API call fails
        try {
          const adminDetails = JSON.parse(localStorage.getItem("adminDetails") || "{}");
          
          if (adminDetails) {
            setUserEmail(adminDetails.email || "");
            setUserName(adminDetails.username || "");
            setAdminId(adminDetails.id || null);
          }
          
          
          setProfilePhotoUrl(profile);
        } catch (localStorageError) {
          console.error("Error reading from localStorage:", localStorageError);
       
          setProfilePhotoUrl(profile);
        }
      }
    };

    fetchAdminDetails();
  }, [navigate]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleDropdowns = () => {
    setIsSubscribersOpen((prev) => !prev);
    setIsSubscriptionOpen(false);
  };

  const toggleDropdownsubscription = () => {
    setIsSubscriptionOpen((prev) => !prev);
    setIsSubscribersOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuthToken");
    localStorage.removeItem('logoutTime');
    navigate("/");
  };

  const handleChangePassword = () => {
    navigate("/changepassword");
  };

  const handleItemClick = (path) => {
    setIsDropdownOpen(false);
    navigate(path);
  };

  // Function to open profile photo modal
  const handleChangeProfilePhoto = () => {
    setIsProfileModalOpen(true);
  };

  // Update handleProfilePhotoSuccess to store in localStorage
  const handleProfilePhotoSuccess = (newPhotoUrl) => {
    // Update state with new photo URL from server
    setProfilePhotoUrl(newPhotoUrl);
    setIsDropdownOpen(false);

    // Store in localStorage
    localStorage.setItem('adminProfilePhoto', newPhotoUrl);

    // Update adminDetails in localStorage
    try {
      const adminDetails = JSON.parse(localStorage.getItem("adminDetails") || "{}");
      adminDetails.profile_photo = newPhotoUrl;
      localStorage.setItem("adminDetails", JSON.stringify(adminDetails));
    } catch (error) {
      console.error("Error updating localStorage:", error);
    }
  };

  // Trigger rotation on theme change
  const handleThemeToggle = () => {
    setIsRotating(true);
    toggleTheme();
  };

  // Reset rotation animation after it's completed
  useEffect(() => {
    if (isRotating) {
      const timer = setTimeout(() => {
        setIsRotating(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isRotating]);

  const handleDashboard = () => {
    navigate("/admin/dashboard");
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
  };

  return (
    <div
      className={`navbar h-20 flex items-center justify-between relative ${theme}`}
    >
      {/* Left Section */}
      <div className="flex flex-col -space-y-1">
        <span className="text-[#677487] span1">Welcome Back,</span>
        <span
          className={`span2 ${theme === "dark" ? "dark" : "light"} duration-100`}
        >
          Logged in as Super Admin
        </span>
        <img src={logo} alt="" className="navlogo" onClick={handleDashboard} />
      </div>
      {/* Right Section */}
      <div className="flex items-center space-x-3 icons justify-end">
        <button
          aria-label="Toggle Theme"
          className={`icon-button rotate outline-none toggle-theme-btn ${theme === "dark" ? "dark" : "light"}`}
          onClick={handleThemeToggle}
        >
          <img
            src={theme === "dark" ? sunIcon : moonIcon}
            alt="Theme Icon"
            className={`theme-icon ${isRotating ? "rotate" : ""}`}
          />
        </button>
        <button
          aria-label="Notifications"
          className={`icon-button bellicon ${theme === "dark" ? "dark" : "light"} duration-200`}
        >
          <img src={bell} alt="bell icon" className="bellimg" />
        </button>
        <div
          className={`divider ${theme === "dark" ? "dark" : "light"} duration-100`}
        />
        <div className="relative">
          <div
            className="flex items-center lg:space-x-2 cursor-pointer"
            onClick={toggleDropdown}
          >
            <img
              src={profilePhotoUrl}
              alt="Profile Avatar"
              className="w-10 h-10 rounded-full profileicon object-cover"
            />
            <button
              aria-label="Dashboard"
              className={`dashboardicon ${theme === "dark" ? "dark" : "light"} ${isDropdownOpen ? "rotate" : ""}`}
            >
              <img
                src={menuicons}
                alt="dashboard icon"
                className="imgdashicon"
              />
            </button>
            <div className="lg:flex flex-col -space-y-1 adminname navbaritem">
              <span
                className={`span3 ${theme === "dark" ? "dark" : "light"} duration-100`}
              >
                {userName}
              </span>
              <span className="text-[#677487] span4">{userEmail}</span>
            </div>
          </div>
          <div
            ref={dropdownRef}
            className={`dropdown-menu absolute right-0 mt-2 shadow-lg rounded-lg w-56 ${isDropdownOpen ? "show" : ""} ${theme === "dark" ? "dark" : "light"}`}
          >
            <ul className="py-2 changpswdlogout">
              <div className="px-4 py-3 border-b border-[#383840] text-center">
                <div className="flex flex-col items-center">
                  <img
                    src={profilePhotoUrl}
                    alt="Profile"
                    className="w-16 h-16 rounded-full mb-2 border-2 border-gray-600 object-cover"
                  />
                  <button
                    className="text-sm text-white mt-1 mb-1 transition-colors duration-200 change-profile"
                    onClick={handleChangeProfilePhoto}
                  >
                    Change Profile Photo
                  </button>
                </div>
              </div>
              <li
                className="px-4 py-2 cursor-pointer text-sm chngepaswd md:flex md:gap-4 mt-2"
                onClick={handleChangePassword}
              >
                <img src={changepswd} alt="" className="desktopchangepswdimg" />
                Change Password
              </li>
              <li
                className="px-4 py-2 cursor-pointer text-sm logoutbtn md:flex md:gap-5"
                onClick={handleLogout}
              >
                <img src={logout} alt="" className="desktoplogoutimg" />
                Logout
              </li>
            </ul>
            {/* Rest of the dropdown menu */}
            <ul className="pb-2 sidebarmenus flex flex-col">
              <li className="flex justify-end items-center pb-2">
                <button
                  className="close-dropdown-btn"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <img
                    src={closeIcon}
                    alt="Close Dropdown"
                    className="w-4 h-4 closeicon"
                  />
                </button>
              </li>
              <div className="menubars">
                {/* Menu items remain the same */}
                <li
                  className={`flex cursor-pointer text-sm gap-5 sidebarmenustext py-8 ${activeMenu === "Dashboard" ? "active" : ""}`}
                  onClick={() => {
                    handleItemClick("/admin/dashboard");
                    handleMenuClick("Dashboard");
                  }}
                >
                  <img src={dashboardicon} alt="" className="dropiconsmenu" />
                  Dashboard
                </li>
                {/* Other menu items... */}
                <li
                  className={`flex  cursor-pointer text-sm gap-5 sidebarmenustext  py-8 ${activeMenu === "Companies" ? "active" : ""}`}
                  onClick={() => {
                    handleItemClick("/admin/companies");
                    handleMenuClick("Companies");
                  }}
                >
                  <img src={companies} alt="" className="dropiconsmenu" />
                  Companies
                </li>
                <li
                  className={`flex cursor-pointer text-sm gap-5 sidebarmenustext py-8 items-center ${isSubscribersOpen ? "subscribers-open" : ""} ${activeMenu === "Subscribers" ? "active" : ""}`}
                  onClick={() => {
                    toggleDropdowns();
                    handleMenuClick("Subscribers");
                  }}
                >
                  <img src={subscribers} alt="" className="dropiconsmenu" />
                  Subscribers
                  <img
                    src={dropdownicon}
                    alt="Dropdown Icon"
                    className={`transition-transform duration-300 navdropicon ml-auto ${isSubscribersOpen ? "rotate-180" : ""}`}
                  />
                </li>
                {isSubscribersOpen && (
                  <ul
                    className={`pl-[60px] subscriber-dropdown space-y-5 pb-5 dropdown-content ${isSubscribersOpen ? "show" : ""}`}
                    style={{ listStyleType: "disc" }}
                  >
                    <li
                      className={`cursor-pointer text-sm sidebarmenustexts ${activeMenu === "add-Subscriberr" ? "active" : ""}`}
                      onClick={() => {
                        handleItemClick("/admin/add-subscriber");
                        handleMenuClick("add-Subscriberr");
                      }}
                    >
                      Add Subscribers
                    </li>
                    <li
                      className={`cursor-pointer text-sm sidebarmenustexts ${activeMenu === "manage-Subscriberr" ? "active" : ""}`}
                      onClick={() => {
                        handleItemClick("/admin/manage-subscriber");
                        handleMenuClick("manage-Subscriberr");
                      }}
                    >
                      Manage Subscribers
                    </li>
                  </ul>
                )}
                <li
                  className={`flex cursor-pointer text-sm gap-5 sidebarmenustext py-8 items-center ${isSubscriptionOpen ? "subscriptions-open" : ""} ${activeMenu === "Subscriptions" ? "active" : ""}`}
                  onClick={() => {
                    toggleDropdownsubscription();
                    handleMenuClick("Subscriptions");
                  }}
                >
                  <img src={subscriptions} alt="" className="dropiconsmenu" />
                  Subscriptions
                  <img
                    src={dropdownicon}
                    alt="Dropdown Icon"
                    className={`transition-transform duration-300 navdropicon ml-auto ${isSubscriptionOpen ? "rotate-180" : ""}`}
                  />
                </li>
                {isSubscriptionOpen && (
                  <ul
                    className={`pl-[60px] subscription-dropdown space-y-5 pb-5 dropdown-content ${isSubscriptionOpen ? "show" : ""}`}
                    style={{ listStyleType: "disc" }}
                  >
                    <li
                      className={`cursor-pointer text-sm sidebarmenustexts ${activeMenu === "add-subscriptionn" ? "active" : ""}`}
                      onClick={() => {
                        handleItemClick("/admin/add-subscription-plan");
                        handleMenuClick("add-subscriptionn");
                      }}
                    >
                      Add Subscription Plan
                    </li>
                    <li
                      className={`cursor-pointer text-sm sidebarmenustexts ${activeMenu === "manage-subscriptionn" ? "active" : ""}`}
                      onClick={() => {
                        handleItemClick("/admin/manage-subscription");
                        handleMenuClick("manage-subscriptionn");
                      }}
                    >
                      Manage Subscription
                    </li>
                  </ul>
                )}
                <li
                  className="flex cursor-pointer text-sm gap-5 sidebarmenustext py-8"
                  onClick={handleChangePassword}
                >
                  <img src={changepswd} alt="" className="dropiconsmenu" />
                  Change Password
                </li>
                <li
                  className="flex  cursor-pointer text-sm gap-5 sidebarmenustext py-8"
                  onClick={handleLogout}
                >
                  <img src={logout} alt="" className="dropiconsmenu" />
                  Logout
                </li>
              </div>
            </ul>
            <div className="navfooters">
              <img src={navfooter} alt="Footer logo" />
              <p className="navfooter">© 2024 All rights reserved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Photo Modal */}
      <AdminProfilePhotoModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSuccess={handleProfilePhotoSuccess}
        currentPhoto={profilePhotoUrl}
        adminId={adminId}
      />
    </div>
  );
};
export default Navbar;