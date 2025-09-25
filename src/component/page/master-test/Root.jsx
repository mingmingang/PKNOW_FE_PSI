import { useState, useEffect } from "react";
import MasterTestIndex from "./Index";
import MasterTestPostTest from "./PostTest";
import MasterTestPreTest from "./PreTest";
import MasterTestPengerjaanTest from "./Test";
import MasterTestDetailTest from "./DetailTest";
import MasterTestForum from "./Forum";
import MasterTestMateriPDF from "./MateriPDF";
import MasterTestMateriVideo from "./MateriVideo";
import MasterTestPengenalan from "./Pengenalan";
import MasterTestSharingPDF from "./SharingPDF";
import MasterTestSharingVideo from "./SharingVideo";
import MasterKelompokKeahlian from "./KelompokKeahlian";
import MasterDetail from "./LihatKKPublish";
import MasterProgram from "./ProgramKK";
import MasterDetailKelas from "./DetailKelas";

export default function MasterTest() {
  const [pageMode, setPageMode] = useState("index");
  const [marginRight, setMarginRight] = useState("40vh");
  const [isDataReady, setIsDataReady] = useState(false);
  const [materiId, setMateriId] = useState();
  const [durasi, setDurasi] = useState("");
  const [quizId, setQuizId] = useState("");
  const [quizType, setQuizType] = useState("");
  const [isOpen, setIsOpen] = useState();
  const [refreshKey, setRefreshKey] = useState(0);
  const [dataID, setDataID] = useState();

  useEffect(() => {
    if (
      pageMode === "index" ||
      pageMode === "pengerjaantest" ||
      pageMode === "detailtest"
    ) {
      setMarginRight("0vh");
      setIsOpen(false);
    } else {
      setMarginRight("43vh");
      setIsOpen(true);
    }
  }, [pageMode]);

  function getPageMode() {
    const key = `${pageMode}-${refreshKey}`;

    switch (pageMode) {
      case "kelompokkeahlian":
        return (
          <MasterTestIndex onChangePage={handleSetPageMode} isOpen={isOpen} />
        );
      case "index":
        return (
          <MasterKelompokKeahlian
            onChangePage={handleSetPageMode}
            isOpen={isOpen}
          />
        );
      case "detail":
        return (
          <MasterDetail
            onChangePage={handleSetPageMode}
            isOpen={isOpen}
            withID={dataID}
          />
        );
      case "program":
        return (
          <MasterProgram
            onChangePage={handleSetPageMode}
            isOpen={isOpen}
            withID={dataID}
          />
        );
      case "detailprogram":
        return (
          <MasterDetailKelas onChangePage={handleSetPageMode} withID={dataID} />
        );
      case "pengenalan":
        return (
          <MasterTestPengenalan
            onChangePage={handleSetPageMode}
            CheckDataReady={isDataReady}
            materiId={materiId}
            isOpen={isOpen}
          />
        );
      case "pretest":
        return (
          <MasterTestPreTest
            onChangePage={handleSetPageMode}
            CheckDataReady={isDataReady}
            materiId={materiId}
            isOpen={isOpen}
          />
        );
      case "posttest":
        return (
          <MasterTestPostTest
            onChangePage={handleSetPageMode}
            CheckDataReady={isDataReady}
            materiId={materiId}
            isOpen={isOpen}
          />
        );
      case "pengerjaantest":
        return (
          <MasterTestPengerjaanTest
            onChangePage={handleSetPageMode}
            quizId={quizId}
            materiId={materiId}
            quizType={quizType}
            durasi={durasi}
          />
        );
      case "detailtest":
        return (
          <MasterTestDetailTest
            onChangePage={handleSetPageMode}
            quizType={quizType}
            materiId={materiId}
            quizId={quizId}
          />
        );
      case "forum":
        return (
          <MasterTestForum onChangePage={handleSetPageMode} isOpen={isOpen} />
        );
      case "materipdf":
        return (
          <MasterTestMateriPDF
            onChangePage={handleSetPageMode}
            CheckDataReady={isDataReady}
            materiId={materiId}
            isOpen={isOpen}
          />
        );
      case "materivideo":
        return (
          <MasterTestMateriVideo
            onChangePage={handleSetPageMode}
            CheckDataReady={isDataReady}
            materiId={materiId}
            isOpen={isOpen}
          />
        );
      case "sharingPDF":
        return (
          <MasterTestSharingPDF
            onChangePage={handleSetPageMode}
            CheckDataReady={isDataReady}
            materiId={materiId}
            isOpen={isOpen}
          />
        );
      case "sharingVideo":
        return (
          <MasterTestSharingVideo
            onChangePage={handleSetPageMode}
            CheckDataReady={isDataReady}
            materiId={materiId}
            isOpen={isOpen}
          />
        );
    }
  }

  function handleSetPageMode(
    newPageMode,
    dataReady = false,
    key = "",
    isOpen = false,
    quizType = "",
    quizKey = "",
    durasi = ""
  ) {
    setPageMode(newPageMode);
    setIsDataReady(dataReady);
    setMateriId(key);
    setIsOpen(isOpen);
    setQuizType(dataReady);
    setQuizId(isOpen);
    setDurasi(durasi);
    setDataID(dataReady);
  }

  return <div style={{ marginRight: "0" }}>{getPageMode()}</div>;
}
