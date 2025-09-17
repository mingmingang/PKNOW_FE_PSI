import { useState } from "react";
import MasterDaftarPustakaIndex from "./Index";
import MasterTambahDaftarPustaka from "./KelolaDaftarPustaka/TambahDaftarPustaka";
import MasterLihatDaftarPustaka from "./KelolaDaftarPustaka/LihatDaftarPustaka";
import MasterEditDaftarPustaka from "./KelolaDaftarPustaka/EditDaftarPustaka";
import MasterKelompokKeahlian from "./KelompokKeahlian";

export default function MasterDaftarPustaka() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterDaftarPustakaIndex onChangePage={handleSetPageMode} />;
      case "dapus":
        return (
          <MasterDaftarPustakaIndex
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "kk":
        return <MasterKelompokKeahlian onChangePage={handleSetPageMode} />;
      case "add":
        return (
          <MasterTambahDaftarPustaka
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "detail":
        return (
          <MasterLihatDaftarPustaka
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "edit":
        return (
          <MasterEditDaftarPustaka
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
