import { forwardRef, useRef, useEffect } from "react";

const Input = forwardRef(function Input(
  {
    label = "",
    forInput,
    type = "text",
    placeholder = "",
    isRequired = false,
    isDisabled = false,
    errorMessage,
    value,
    onChange,
    ...props
  },
  ref
) {
  const inputRef = useRef(null);
  const cursorPositionRef = useRef(0);

  const noSelectionTypes = [
    "checkbox",
    "radio",
    "file",
    "button",
    "submit",
    "reset",
    "number",
  ];

  const handleChange = (e) => {
    if (!noSelectionTypes.includes(type) && e.target.selectionStart !== null) {
      cursorPositionRef.current = e.target.selectionStart;
    }
    if (onChange) onChange(e);
  };

  useEffect(() => {
    if (
      inputRef.current &&
      !noSelectionTypes.includes(type) &&
      typeof cursorPositionRef.current === "number"
    ) {
      try {
        inputRef.current.setSelectionRange(
          cursorPositionRef.current,
          cursorPositionRef.current
        );
      } catch (error) {}
    }
  }, [value, type]);

  return (
    <>
      {label !== "" && (
        <div className="mb-3">
          <label htmlFor={forInput} className="form-label fw-bold">
            {label}
            {isRequired ? <span className="text-danger"> *</span> : ""}
            {errorMessage ? (
              <span className="fw-normal text-danger"> {errorMessage}</span>
            ) : (
              ""
            )}
          </label>
          {type === "textarea" ? (
            <textarea
              rows="5"
              id={forInput}
              name={forInput}
              className="form-control"
              placeholder={placeholder}
              ref={ref || inputRef}
              disabled={isDisabled}
              value={value}
              onChange={handleChange}
              {...props}
            ></textarea>
          ) : (
            <input
              id={forInput}
              name={forInput}
              type={type}
              className="form-control"
              placeholder={placeholder}
              ref={ref || inputRef}
              disabled={isDisabled}
              value={value}
              onChange={handleChange}
              {...props}
            />
          )}
        </div>
      )}
      {label === "" && (
        <>
          {errorMessage && (
            <span className="small ms-1 text-danger">{errorMessage}</span>
          )}
          {type === "textarea" ? (
            <textarea
              rows="5"
              id={forInput}
              name={forInput}
              className="form-control"
              placeholder={placeholder}
              ref={ref || inputRef}
              disabled={isDisabled}
              value={value}
              onChange={handleChange}
              {...props}
            ></textarea>
          ) : (
            <input
              id={forInput}
              name={forInput}
              type={type}
              className="form-control"
              placeholder={placeholder}
              ref={ref || inputRef}
              disabled={isDisabled}
              value={value}
              onChange={handleChange}
              {...props}
            />
          )}
        </>
      )}
    </>
  );
});

export default Input;
