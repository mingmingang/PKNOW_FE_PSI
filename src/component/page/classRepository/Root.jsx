import { useState } from "react";
import MasterClassRepositoryIndex from "./Index";
import MasterDetailKelas from "./DetailKelas";
import MasterPublikasiKelas from "./FormPublikasi";

export default function MasterClassRepository() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <MasterClassRepositoryIndex onChangePage={handleSetPageMode} />;
      case "detail":
        return (
          <MasterDetailKelas onChangePage={handleSetPageMode} withID={dataID} />
        );
      case "publikasi":
        return (
          <MasterPublikasiKelas
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
