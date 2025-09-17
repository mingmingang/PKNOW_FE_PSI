import { useState } from "react";
import PengajuanIndex from "./PengajuanAnggotaKeahlian";
import MasterGabungKelompokKeahlian from "./GabungKelompokKeahlian";
import PengajuanDetail from "./Detail";
import KKDetailPublish from "./DetailKK";

export default function MasterTenagaPendidik() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <PengajuanIndex onChangePage={handleSetPageMode} />;
      case "add":
        return (
          <MasterGabungKelompokKeahlian
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "detailPengajuan":
        return (
          <PengajuanDetail onChangePage={handleSetPageMode} withID={dataID} />
        );
      case "detailKK":
        return (
          <KKDetailPublish onChangePage={handleSetPageMode} withID={dataID} />
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
