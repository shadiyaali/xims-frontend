import React from 'react'
import policy from "../../../../assets/images/Company-Sidebar/policy.svg";
import manual from "../../../../assets/images/Company-Sidebar/manual.svg";
import procedure from "../../../../assets/images/Company-Sidebar/manual.svg";
import record from "../../../../assets/images/Company-Sidebar/record-format.svg";
import { useNavigate, useLocation } from "react-router-dom";

const AMSSupplierSubmenu = () => {
    const navigate = useNavigate();
        const location = useLocation();
    
        const categories = [
            {
                id: "add-supplier",
                label: "Add Supplier",
                icon: <img src={policy} alt="Policy" className="w-[15px] h-[15px]" />,
                // path: "/company/qms/policy",
            },
            {
                id: "enter-supplier-problems",
                label: "Enter Supplier Problems",
                icon: <img src={manual} alt="Manual" className="w-[15px] h-[15px]" />,
                // path: "/company/qms/manual",
            },
            {
                id: "supplier-problem-log",
                label: "Supplier Problem Log",
                icon: (
                    <img src={procedure} alt="Procedure" className="w-[15px] h-[15px]" />
                ),
                // path: "/company/qms/procedure",
            },
            {
                id: "supplier-evaluation",
                label: "Supplier Evaluation",
                icon: (
                    <img src={record} alt="Record Format" className="w-[15px] h-[15px]" />
                ),
                // path: "/company/qms/record-format",
            },
        ]
    
        const isActive = (category) => {
            return location.pathname === category.path;
        };
    
        // Handle clicking on a submenu item
        const handleCategoryClick = (category) => {
            if (props && props.handleItemClick) {
                props.handleItemClick(category.id, category.path, "amssuppliermanagement");
            } else {
                navigate(category.path);
            }
        };

  return (
    <div className="grid grid-cols-3 gap-[10px] bg-[#1C1C24] p-5 w-[555px] absolute top-16 border-t border-r border-b border-[#383840]">
            {categories.map((category) => {
                const active = isActive(category);
                return (
                    <div
                        key={category.id}
                        className="flex flex-col items-center justify-center py-[10px] rounded-md bg-[#DD6B0610] transition-colors duration-200 cursor-pointer h-[100px] gap-[10px] documentation-submenu-cards"
                        onClick={() => handleCategoryClick(category)}
                    >
                        <div className="bg-[#5B5B5B] rounded-full p-[5px] w-[26px] h-[26px] flex justify-center items-center">
                            {category.icon}
                        </div>
                        <span
                            className={`text-center ${active ? "text-white" : "text-[#5B5B5B]"
                                } documentation-submenu-label duration-200`}
                        >
                            {category.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default AMSSupplierSubmenu
