import { useEffect, useRef } from "react";
import "select2/dist/css/select2.min.css";
import "select2/dist/js/select2.min.js";

function Select2Dropdown({
  arrData,
  type = "pilih",
  label = "",
  forInput,
  isRequired = false,
  isDisabled = false,
  errorMessage,
  showLabel = true,
  onChange,
  ...props
}) {
  const selectRef = useRef(null);

  useEffect(() => {
    const $ = window.$;
    $(selectRef.current);
    $(selectRef.current).on("change", (event) => {
      if (onChange) {
        onChange(event);
      }
    });

    return () => {
      $(selectRef.current);
    };
  }, [onChange]);

  let placeholder = "";

  switch (type) {
    case "pilih":
      placeholder = <option value="">{"-- Pilih " + label + " --"}</option>;
      break;
    case "semua":
      placeholder = <option value="">-- Semua --</option>;
      break;
    default:
      break;
  }

  return (
    <div className="mb-3">
      {showLabel && (
        <label htmlFor={forInput} className="form-label fw-bold">
          {label}
          {isRequired ? <span className="text-danger"> *</span> : ""}
          {errorMessage ? (
            <span className="fw-normal text-danger"> {errorMessage}</span>
          ) : (
            ""
          )}
        </label>
      )}
      <select
        id={forInput}
        name={forInput}
        ref={selectRef}
        style={{
          width: "100%",
          border: "1px solid #DFDFDF",
          borderRadius: "10px",
          padding: "5px 10px",
        }}
        disabled={isDisabled}
        {...props}
      >
        {placeholder}
        {arrData.map((option) => (
          <option key={option.Value} value={option.Value}>
            {option.Text}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Select2Dropdown;
