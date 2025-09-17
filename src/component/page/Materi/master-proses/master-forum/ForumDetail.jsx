import { useState, useEffect } from "react";
import Button from "../../../part/Button";
import { Stepper } from "react-form-stepper";
import UseFetch from "../../../util/UseFetch";
import AppContext_test from "../MasterContext";
import { API_LINK } from "../../../util/Constants";
import Alert from "../../../part/Alert";

export default function MasterDetailForum({ onChangePage }) {
  const [forumData, setForumData] = useState(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const Materi = AppContext_test.DetailMateri;

  useEffect(() => {
    const fetchData = async () => {
      setIsError(false);
      setIsLoading(true);

      try {
        const data = await UseFetch(API_LINK + "Forum/GetDataForumByMateri", {
          p1: Materi.Key,
        });

        if (data === "ERROR") {
          setIsError(true);
        } else {
          setForumData(data.length > 0 ? data[0] : null);
        }
      } catch (error) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [Materi]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching data.</div>;
  }

  return (
    <>
      <div>
        <Stepper
          steps={[
            { label: "Materi", onClick: () => onChangePage("courseAdd") },
            { label: "Pretest", onClick: () => onChangePage("pretestAdd") },
            {
              label: "Sharing Expert",
              onClick: () => onChangePage("sharingDetail"),
            },
            { label: "Forum", onClick: () => onChangePage("forumDetail") },
            {
              label: "Post Test",
              onClick: () => onChangePage("posttestDetail"),
            },
          ]}
          activeStep={3}
          styleConfig={{
            activeBgColor: "#67ACE9",
            activeTextColor: "#FFFFFF",
            completedBgColor: "#67ACE9",
            completedTextColor: "#FFFFFF",
            inactiveBgColor: "#E0E0E0",
            inactiveTextColor: "#000000",
            size: "2em",
            circleFontSize: "1rem",
            labelFontSize: "0.875rem",
            borderRadius: "50%",
            fontWeight: 500,
          }}
          connectorStyleConfig={{
            completedColor: "#67ACE9",
            activeColor: "#67ACE9",
            disabledColor: "#BDBDBD",
            size: 1,
            stepSize: "2em",
            style: "solid",
          }}
        />
      </div>

      <div className="card" style={{ borderColor: "#67ACE9" }}>
        <div
          className="card-header fw-medium text-white"
          style={{ backgroundColor: "#67ACE9" }}
        >
          Detail Forum
        </div>
        <div className="card-body">
          {forumData ? (
            <div className="row">
              <div className="col-lg-12">
                <div className="mb-4">
                  <h6 className="mb-0">Materi Forum</h6>
                  <p>{forumData["Judul Materi"]}</p>
                </div>
                <div className="mb-4">
                  <h6 className="mb-0">Judul Forum</h6>
                  <p>{forumData["Nama Forum"]}</p>
                </div>
                <div className="mb-4">
                  <h6 className="mb-0">Pembahasan Forum</h6>
                  <div
                    dangerouslySetInnerHTML={{ __html: forumData["Isi Forum"] }}
                  />
                </div>
                <div className="mb-0">
                  <h6 className="mb-0">Penanggung Jawab</h6>
                  <p>{forumData.PIC}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="card-body">
              <Alert
                type="warning"
                message={
                  <span>
                    Data Forum belum ditambahkan.{" "}
                    <a
                      onClick={() => onChangePage("forumDetailNot")}
                      className="text-primary"
                    >
                      Tambah Data
                    </a>
                  </span>
                }
              />
            </div>
          )}
        </div>
      </div>

      <div className="float my-4 mx-1">
        <Button
          classType="btn btn-outline-secondary me-2 px-4 py-2"
          label="Kembali"
          onClick={() => onChangePage("sharingDetail")}
        />
        <Button
          classType="btn btn-dark ms-3 px-4 py-2"
          label="Berikutnya"
          onClick={() => onChangePage("posttestDetail")}
        />
      </div>
    </>
  );
}
