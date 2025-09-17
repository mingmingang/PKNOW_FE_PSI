import Button from "./Button copy";

export default function Filter({ children, handleSearch, name = "Filter" }) {
  return (
    <>
      <Button
        iconName="apps-sort"
        classType=" px-3 custom-add py-2 add-button fw-semibold rounded-4 "
        title="Saring atau Urutkan Data"
        data-bs-toggle="dropdown"
        data-bs-auto-close="outside"
        label="Filter"
        style={{
          backgroundColor: "white",
          color: "black",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.223)",
        }}
      />
      <div className="dropdown-menu p-4" style={{ width: "350px" }}>
        {children}
      </div>
    </>
  );
}
