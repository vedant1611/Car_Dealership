import { createContext, useContext, useState } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);

    // Using addToast to match the test we wrote previously, acts exactly as showToast
    const addToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const closeToast = () => {
        setToast(null);
    };

    return (
        <ToastContext.Provider value={{ addToast, closeToast }}>
            {children}
            
            {toast && (
                <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
                    <div 
                        className={`bg-white rounded-lg shadow-lg border-l-4 p-4 min-w-[300px] flex items-start justify-between transition-all duration-300 transform translate-y-0 opacity-100 ${
                            toast.type === 'error' ? 'border-red-500' : 'border-green-500'
                        }`}
                        role="alert"
                    >
                        <div className="flex-1 mr-4 pt-0.5">
                            <p className="text-sm font-medium text-gray-900">
                                {toast.message}
                            </p>
                        </div>
                        <button
                            onClick={closeToast}
                            aria-label="Close"
                            className="flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
