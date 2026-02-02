import React, { useState } from 'react';

/**
 * SavingsRateSlider Component
 * Interactive slider for adjusting savings rate (0-100%)
 * Matches the design from dashboard_main_view.png
 */
export const SavingsRateSlider = ({
    value = 50,
    onChange,
    onUpdate
}) => {
    const [localValue, setLocalValue] = useState(value);
    const [hasChanged, setHasChanged] = useState(false);

    const handleChange = (e) => {
        const newValue = parseInt(e.target.value);
        setLocalValue(newValue);
        setHasChanged(newValue !== value);
        if (onChange) onChange(newValue);
    };

    const handleUpdate = () => {
        if (onUpdate) {
            onUpdate(localValue);
            setHasChanged(false);
        }
    };

    // Calculate gradient fill for slider track
    const gradientStyle = {
        background: `linear-gradient(to right, 
      var(--primary-purple) 0%, 
      var(--primary-blue) ${localValue}%, 
      var(--bg-tertiary) ${localValue}%, 
      var(--bg-tertiary) 100%)`
    };

    return (
        <div className="savings-rate-control animate-slide-up">
            <div className="card-label">Savings Rate</div>

            <div className="slider-container">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={localValue}
                    onChange={handleChange}
                    className="slider-input"
                    style={gradientStyle}
                />
            </div>

            <div className="slider-value">{localValue}%</div>

            {/* Visual split preview */}
            <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-secondary">Savings: {localValue}%</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-secondary">Spending: {100 - localValue}%</span>
                </div>
            </div>

            {hasChanged && (
                <button
                    onClick={handleUpdate}
                    className="btn-primary w-full mt-4"
                >
                    Update to {localValue}%
                </button>
            )}
        </div>
    );
};

export default SavingsRateSlider;
