import { forwardRef } from "react";
import { FILE_LINK } from "../util/Constants";
import "../../index.css";

const FileUpload = forwardRef(function FileUpload(
  {
    formatFile = "",
    label = "",
    forInput = "",
    isRequired = false,
    isDisabled = false,
    errorMessage,
    hasExisting,
    maxFileSize = 10,
    ...props
  },
  ref
) {
  return (
    <>
      <div className="mb-3 mt-4 up">
        <label htmlFor={forInput} className="form-label fw-bold">
          {label}
          {isRequired ? <span className="text-danger"> *</span> : ""}
          {errorMessage ? (
            <span className="fw-normal text-danger">
              <br />
              {errorMessage}
            </span>
          ) : (
            ""
          )}
        </label>
        {!isDisabled && (
          <>
            <input
              className="form-control"
              type="file"
              id={forInput}
              name={forInput}
              accept={formatFile}
              ref={ref}
              {...props}
              required={isRequired}
            />
            <sub>Maksimum ukuran berkas adalah {maxFileSize} MB</sub>
            {hasExisting && (
              <sub>
                <br />
                Berkas saat ini:{" "}
                <a
                  href={FILE_LINK + hasExisting}
                  className="text-decoration-none"
                  rel="noopener noreferrer"
                  target="_blank"
                  download={hasExisting.split("/").pop()}
                >
                  [Unduh Berkas]
                </a>
                <br />
                Unggah ulang jika ingin mengganti berkas yang sudah ada
              </sub>
            )}
          </>
        )}
        {isDisabled && (
          <>
            <br />
            {hasExisting && (
              <a
                href={FILE_LINK + hasExisting}
                className="text-decoration-none"
                rel="noopener noreferrer"
              >
                Unduh berkas
              </a>
            )}
            {!hasExisting && "-"}
          </>
        )}
      </div>
    </>
  );
});

export default FileUpload;
