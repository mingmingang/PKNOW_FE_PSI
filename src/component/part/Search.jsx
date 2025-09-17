import "../../style/Search.css";

export default function Search({
  title,
  description,
  placeholder,
  showInput = true,
  ref,
  forInput,
  value,
}) {
  return (
    <div className="backSearch">
      <h1>{title}</h1>
      <p>{description}</p>
      {showInput && (
        <div className="input-wrapper">
          <button style={{ border: "none", background: "transpatent" }}>
            <i className="fas fa-search search-icon"></i>
          </button>
          <input
            type="text"
            className="search"
            placeholder={placeholder}
            ref={ref}
            id={forInput}
            name={forInput}
            value={value}
          />
        </div>
      )}
    </div>
  );
}
