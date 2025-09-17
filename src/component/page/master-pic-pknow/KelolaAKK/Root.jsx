import { useState } from "react";
import MasterKelolaAnggotaKelompokKeahlian from "./KelolaAKK";
import MasterTambahAnggotaKelompokKeahlian from "./TambahAKK";

export default function MasterPICPKNOW() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return (
          <MasterKelolaAnggotaKelompokKeahlian
            onChangePage={handleSetPageMode}
          />
        );
      case "add":
        return (
          <MasterTambahAnggotaKelompokKeahlian
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
