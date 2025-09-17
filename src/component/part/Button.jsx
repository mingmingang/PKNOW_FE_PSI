import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/Button.css";

export default function Button({
  buttons = [],
  filterOptions = [],
  filterFields = [],
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const navigate = useNavigate();

  const handleButtonClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <div className="button-container">
      {buttons.map((button, index) => (
        <div key={index} className="button-wrapper">
          {button.label === "Filter" ? (
            <>
              <button
                className={`custom-button ${button.className}`}
                onClick={toggleDropdown}
              >
                <i className={`${button.icon} icon`}></i> {button.label}
              </button>

              {showDropdown && (
                <div className="dropdown-filter">
                  <label htmlFor="sortSelect">Urutkan Berdasarkan:</label>
                  {filterFields.map((field, idx) => (
                    <div key={idx} className="filter-field">
                      <label htmlFor={field.id} style={{ fontWeight: "600" }}>
                        {field.label}
                      </label>
                      <select id={field.id} className="sort-select">
                        {field.options.map((option, index) => (
                          <option key={index} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <button
              className={`custom-button ${button.className}`}
              onClick={() => handleButtonClick(button.path)}
            >
              <i className={`${button.icon} icon`}></i> {button.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
