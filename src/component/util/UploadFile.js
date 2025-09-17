import Cookies from "js-cookie";
import { API_LINK } from "./Constants";

const uploadFile = async (file) => {
  if (file != null) {
    const data = new FormData();
    const jwtToken = Cookies.get("jwtToken");
    data.append("file", file.files[0]);

    try {
      const response = await fetch(API_LINK + "Upload/UploadFile", {
        method: "POST",
        body: data,
        headers: {
          Authorization: "Bearer " + jwtToken,
        },
      });
      const result = await response.json();
      if (response.ok) {
        return result;
      } else {
        return "ERROR";
      }
    } catch (err) {
      return "ERROR";
    }
  } else return "";
};

export default uploadFile;
