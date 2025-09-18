import ReactPlayer from "react-player";
import { useState, useEffect } from "react";
import { API_LINK } from "../util/Constants";
import Alert from "./Alert";
import Loading from "./Loading";
import axios from "axios";
import AppContext_test from "../page/master-test/TestContext";
import UseFetch from "../util/UseFetch";

export default function KMS_VideoViewer({ videoFileName }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);

  useEffect(() => {
  if (AppContext_test.urlMateri) {
    const fetchVideoFile = async () => {
      setIsLoading(true);
      setIsError(false);

      const blobResult = await UseFetch(
        `${API_LINK}Upload/GetFile`,          
        { namaFile: AppContext_test.urlMateri }, 
        "GET",                               
        "blob"                                 
      );
      
      if (blobResult === "ERROR") {
        setIsError(true);
      } else {
        const url = URL.createObjectURL(blobResult);
        setVideoUrl(url);
      }
      
      setIsLoading(false);
    };

    fetchVideoFile();
  } else {
    setIsError(true);
    setIsLoading(false);
  }
}, [AppContext_test.urlMateri]);

  return (
    <>
      <div className="d-flex flex-column">
        {isError && (
          <div className="flex-fill">
            <Alert
              type="warning"
              message="Terjadi kesalahan: Gagal mengambil data video."
            />
          </div>
        )}
        <div className="flex-fill"></div>
        <div className="mt-3">
          {isLoading ? (
            <Loading />
          ) : (
            <>
              {videoUrl && (
                <ReactPlayer
                  url={videoUrl}
                  controls
                  width="100%"
                  height="100%"
                />
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
