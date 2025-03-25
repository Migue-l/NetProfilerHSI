import React, { useState, useEffect } from 'react';
import './PromptModal.css'; // We'll create this next

const PromptModal = ({
    title = "Enter Information",
    message = "Please provide the required information:",
    defaultValue = "",
    onConfirm,
    onCancel,
    show = true
}) => {
    const [inputValue, setInputValue] = useState(defaultValue);
    const [isVisible, setIsVisible] = useState(show);

    useEffect(() => {
        setIsVisible(show);
    }, [show]);

    const handleConfirm = () => {
        setIsVisible(false);
        onConfirm(inputValue);
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
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                    autoFocus
                />
                <div className="modal-buttons">
                    <button className="modal-cancel" onClick={handleCancel}>
                        Cancel
                    </button>
                    <button className="modal-confirm" onClick={handleConfirm}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PromptModal;