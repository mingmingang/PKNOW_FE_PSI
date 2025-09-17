import { useState } from "react";
import MasterPersetujuanAnggotaKK from "./PersetujuanAnggotaKK";
import MasterDetailPersetujuan from "./DetailPersetujuan";

export default function MasterPersetujuan() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterPersetujuanAnggotaKK onChangePage={handleSetPageMode} />;
      case "detail":
        return (
          <MasterDetailPersetujuan
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
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
