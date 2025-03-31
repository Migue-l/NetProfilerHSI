import React, { useState, useEffect } from 'react';
import './PromptModal.css';

const PromptModal = ({
    title = "Notification",
    message = "",
    defaultValue = "",
    onConfirm,
    onCancel,
    show = true,
    showInput = true // Add this new prop
}) => {
    const [inputValue, setInputValue] = useState(defaultValue);
    const [isVisible, setIsVisible] = useState(show);

    useEffect(() => {
        if (show) {
            setInputValue(defaultValue || "");
        }
    }, [show, defaultValue]);

    useEffect(() => {
        setIsVisible(show);
    }, [show]);

    const handleConfirm = () => {
        setIsVisible(false);
        onConfirm(showInput ? inputValue : true); // Only pass value if showInput is true
    };

    const handleCancel = () => {
        setIsVisible(false);
        onCancel();
    };

    if (!isVisible) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>{title}</h3>
                <p>{message}</p>

                {/* Conditionally render input field */}
                {showInput && (
                    <input
                        className="input-name"
                        type="text"
                        placeholder="Card Name"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                        autoFocus
                    />
                )}

                <div className="modal-buttons">
                    {showInput && ( // Only show Cancel button when there's input
                        <button className="modal-cancel" onClick={handleCancel}>
                            Cancel
                        </button>
                    )}
                    <button className="modal-confirm" onClick={handleConfirm}>
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PromptModal;