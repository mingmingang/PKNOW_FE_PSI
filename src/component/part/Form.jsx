import { useState } from "react";
import "../../style/Form.css";
import imageNoSelected from "../../assets/NoImage.png";
import back from "../../assets/backPage.png";
import Konfirmasi from "./Konfirmasi";

const Form = ({
  title,
  fields,
  onSubmit,
  konfirmasi,
  pesanKonfirmasi,
  backPage,
  onChangePage,
  pesanKembali,
}) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);

  const handleGoBack = () => {
    setIsBackAction(true);
    setShowConfirmation(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsBackAction(false);
    setShowConfirmation(true);
  };

  const handleConfirmYes = () => {
    if (isBackAction) {
      onChangePage("index");
    } else {
      const formData = {};
      fields.forEach((fieldGroup) => {
        fieldGroup.forEach((field) => {
          formData[field.name] =
            field.type === "file"
              ? document.getElementById(field.name).files[0]
              : document.getElementById(field.name).value;
        });
      });
      onSubmit(formData);
    }
    setShowConfirmation(false);
  };

  const handleConfirmNo = () => {
    setShowConfirmation(false);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  return (
    <div className="form-layout">
      <div className="title-form">
        <div className="back-title-form">
          <button
            onClick={handleGoBack}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <img src={back} alt="Back" />
          </button>
          <h1>{title}</h1>
        </div>
        <div className="form-keterangan">
          <p>Draf</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="form-data">
        {fields.map((fieldGroup, groupIndex) => (
          <div key={groupIndex} className="form-row">
            {fieldGroup.map((field, index) => (
              <div
                key={index}
                className="form-group"
                style={{
                  width: field.width || "48%",
                  marginRight: index === fieldGroup.length - 1 ? "0" : "4%",
                }}
              >
                <label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span style={{ color: "red" }}>*</span>}
                </label>
                {field.type === "select" ? (
                  <div className="select-container">
                    <select
                      name={field.name}
                      id={field.name}
                      className="form-control"
                      required={field.required}
                      style={{ height: field.height || "auto" }}
                    >
                      {field.options.map((option, optionIndex) => (
                        <option
                          key={optionIndex}
                          value={option.value}
                          disabled={option.disabled}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <span className="dropdown-icon">&#9662;</span>
                  </div>
                ) : field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    id={field.name}
                    placeholder={field.placeholder}
                    className="form-control"
                    required={field.required}
                    style={{ height: field.height || "auto", width: "100%" }}
                  />
                ) : field.type === "file" ? (
                  <div
                    className="file-upload-container"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <div
                      className="image-preview"
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      {!imagePreview ? (
                        <img
                          src={imageNoSelected}
                          alt="Preview"
                          style={{
                            maxWidth: "100px",
                            maxHeight: "100px",
                            marginRight: "10px",
                          }}
                        />
                      ) : (
                        imagePreview && (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            style={{
                              maxWidth: "100px",
                              maxHeight: "100px",
                              marginRight: "10px",
                            }}
                          />
                        )
                      )}
                      <input
                        type="file"
                        name={field.name}
                        id={field.name}
                        accept="image"
                        className="form-control"
                        onChange={handleImageChange}
                        required={field.required}
                        style={{ marginRight: "10px" }}
                      />
                    </div>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "gray",
                        marginLeft: "10px",
                        alignItems: "center",
                      }}
                    >
                      Max size: 5MB
                    </p>
                  </div>
                ) : field.type === "document" ? (
                  <div
                    className="file-upload-container"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <input
                      type="file"
                      name={field.name}
                      id={field.name}
                      accept={field.accept}
                      className="form-control"
                      required={field.required}
                      style={{ marginRight: "10px" }}
                    />
                    <p
                      style={{
                        fontSize: "12px",
                        color: "gray",
                        marginLeft: "10px",
                        alignItems: "center",
                      }}
                    >
                      Max size: 5MB
                    </p>
                  </div>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    id={field.name}
                    placeholder={field.placeholder}
                    className="form-control"
                    required={field.required}
                    style={{ height: field.height || "auto" }}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
        <div className="form-submit">
          <button type="reset" className="btn btn-cancel">
            Batalkan
          </button>
          <button type="submit" className="btn btn-primary">
            Simpan
          </button>
        </div>
      </form>

      {showConfirmation && (
        <Konfirmasi
          title={isBackAction ? "Konfirmasi Kembali" : konfirmasi}
          pesan={isBackAction ? pesanKembali : pesanKonfirmasi}
          onYes={handleConfirmYes}
          onNo={handleConfirmNo}
        />
      )}
    </div>
  );
};

export default Form;
