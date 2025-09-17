import { useState } from "react";
import "./uploader.css";

function KMS_Uploader() {
  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState("No selected file");

  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const img = document.createElement("img");
      const canvas = document.createElement("canvas");
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
        img.onload = () => {
          const ctx = canvas.getContext("2d");
          const max_width = 200;
          const max_height = 250;

          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > max_width) {
              height *= max_width / width;
              width = max_width;
            }
          } else {
            if (height > max_height) {
              width *= max_height / height;
              height = max_height;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              resolve(blob);
            },
            file.type,
            1
          );
        };
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (files) => {
    if (files[0]) {
      const fileType = files[0].type;
      if (fileType.startsWith("image/")) {
        const resizedImageBlob = await resizeImage(files[0]);
        const resizedImageUrl = URL.createObjectURL(resizedImageBlob);
        setImage(resizedImageUrl);
        setFileName(files[0].name);
      } else {
        setImage(null);
        setFileName(files[0].name);
      }
    }
  };

  return (
    <main>
      <div className="column-container">
        <form
          className="form-file-upload-kms"
          onClick={() => document.querySelector(".input-field").click()}
        >
          <input
            type="file"
            accept="image/*, .zip"
            className="input-field"
            hidden
            onChange={({ target: { files } }) => handleFileChange(files)}
          />
          {image ? (
            <img src={image} alt={fileName} />
          ) : fileName.endsWith(".zip") ? (
            <>
              <p>Uploaded: {fileName}</p>
            </>
          ) : (
            <>
              <p>Browse Files to upload</p>
            </>
          )}
        </form>

        <section className="uploaded-row" style={{ maxWidth: "51%" }}>
          <span className="upload-content">{fileName} -</span>
        </section>
      </div>
    </main>
  );
}

export default KMS_Uploader;
