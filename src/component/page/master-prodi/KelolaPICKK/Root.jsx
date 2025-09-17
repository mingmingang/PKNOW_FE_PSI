import { useState } from "react";
import MasterKelolaPICKK from "./KelolaPICKK";
import MasterTambahPICKK from "./TambahPICKK";
import MasterLihatKK from "../../master-pic-pknow/KelolaKK/LihatKKPublish";
import SweetAlert from "../../../util/SweetAlert";

export default function MasterKelolaPIC() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterKelolaPICKK onChangePage={handleSetPageMode} />;
      case "add":
        return (
          <MasterTambahPICKK onChangePage={handleSetPageMode} withID={dataID} />
        );
      case "detailPublish":
        return (
          <MasterLihatKK onChangePage={handleSetPageMode} withID={dataID} />
        );
      case "edit":
        SweetAlert("Error", "Maaf, anda tidak memiliki akses!", "warning");
        setPageMode("index");
        return null;
    }
  }

  function handleSetPageMode(mode) {
    setPageMode(mode);
  }

  function handleSetPageMode(mode, withID) {
    setDataID(withID);
    setPageMode(mode);
  }

  return <div>{getPageMode()}</div>;
}
