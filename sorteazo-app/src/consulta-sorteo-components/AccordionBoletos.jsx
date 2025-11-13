import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

export const AccordionBoletos = ({ title, available, children }) => {
    const [isOpen, setIsOpen] = useState(true); 
    return (
        <div className="border border-gray-200 rounded-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left bg-gray-50 hover:bg-gray-100"
            >
                <span className="font-afacad text-gray-600">{title}</span>
                <div className="flex items-center gap-4">
                    <span className="font-afacad text-sm text-gray-500">{available} disponibles</span>
                    {isOpen ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
                </div>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-200">
                    {children}
                </div>
            )}
        </div>
    );
};