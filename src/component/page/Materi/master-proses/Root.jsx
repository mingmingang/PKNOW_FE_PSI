import { useState } from "react";
import Cookies from "js-cookie";
import AppContext_test from "../master-test/TestContext";
import { decryptId } from "../../../util/Encryptor";
import MasterProsesIndex from "./Index";
import PengenalanAdd from "./master-materi/PengenalanAdd";
import PengenalanEdit from "./master-materi/PengenalanEdit";
import PengenalanBefore from "./master-materi/PengenalanBefore";
import MasterTestPengenalan from "../master-test/Pengenalan";
import MasterPreTestAdd from "./master-pretest/PreTestAdd";
import MasterPreTestEdit from "./master-pretest/PreTestEdit";
import MasterPreTestEditNot from "./master-pretest/PreTestEditNot";
import MasterMateriAdd from "./master-materi/MateriAdd";
import MasterMateriEdit from "./master-materi/MateriEdit";
import MasterMateriReviewJawaban from "./master-materi/MateriReviewJawaban";
import MasterSharingAdd from "./master-sharing/SharingAdd";
import MasterSharingEditNot from "./master-sharing/SharingEditNot";
import MasterSharingEdit from "./master-sharing/SharingEdit";
import MasterForumAdd from "./master-forum/ForumAdd";
import MasterForumBefore from "./master-forum/ForumBefore";
import MasterForumEdit from "./master-forum/ForumEdit";

import MasterPostTestAdd from "./master-posttest/PostTestAdd";
import MasterPostTestEdit from "./master-posttest/PostTestEdit";
import MasterPostTestEditNot from "./master-posttest/PostTestEditNot";

import PilihKelompokKeahlian from "./Kelompok_Keahlian";

import MasterTestDetailTest from "../master-test/DetailTest";
import MasterTestForum from "../master-test/Forum";
import MasterTestMateriPDF from "../master-test/MateriPDF";
import MasterTestMateriVideo from "../master-test/MateriVideo";
import MasterTestSharingPDF from "../master-test/SharingPDF";
import MasterTestSharingVideo from "../master-test/SharingVideo";
import MasterTestPostTest from "../master-test/PostTest";
import MasterTestPreTest from "../master-test/PreTest";
import MasterTestPengerjaanTest from "../master-test/Test";
import KKDetailProgram from "../../master-pic-kk/KelolaProgram/DetailKK";
import "../../../../style/Materi.css";
import ListPesertaProgram from "./ListPesertaProgram";

export default function MasterProses() {
  const [pageMode, setPageMode] = useState("kk");
  const [dataID, setDataID] = useState();
  const [dataID2, setDataID2] = useState();
  const [isDataReady, setIsDataReady] = useState(false);
  const [materiId, setMateriId] = useState("");
  const [durasi, setDurasi] = useState("");
  const [quizId, setQuizId] = useState("");
  const [quizType, setQuizType] = useState("");
  const [isOpen, setIsOpen] = useState();
  let activeUser = "";
  const cookie = Cookies.get("activeUser");
  if (cookie) activeUser = JSON.parse(decryptId(cookie)).username;
  AppContext_test.activeUser = activeUser;

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return (
          <MasterProsesIndex onChangePage={handleSetPageMode} withID={dataID} />
        );
      case "reviewjawaban":
        return (
          <MasterMateriReviewJawaban
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "listPeserta":
        return (
          <ListPesertaProgram
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "Pre-Test":
        return (
          <MasterPreTestAdd onChangePage={handleSetPageMode} withID={dataID} />
        );

      case "pretestEdit":
        return (
          <MasterPreTestEdit onChangePage={handleSetPageMode} withID={dataID} />
        );
      case "pretestEditNot":
        return (
          <MasterPreTestEditNot
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
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
      case "detailtest":
        return (
          <MasterTestDetailTest
            onChangePage={handleSetPageMode}
            quizType={quizType}
            materiId={materiId}
            quizId={quizId}
          />
        );
      case "pengenalanAdd":
        return (
          <PengenalanAdd onChangePage={handleSetPageMode} withID={dataID} />
        );
      case "pengenalanEdit":
        return (
          <PengenalanEdit onChangePage={handleSetPageMode} withID={dataID} />
        );
      case "pengenalanBefore":
        return (
          <PengenalanBefore onChangePage={handleSetPageMode} withID={dataID} />
        );
      case "materiAdd":
        return (
          <MasterMateriAdd onChangePage={handleSetPageMode} withID={dataID} />
        );
      case "materiEdit":
        return (
          <MasterMateriEdit onChangePage={handleSetPageMode} withID={dataID} />
        );
      case "Sharing Expert":
        return (
          <MasterSharingAdd onChangePage={handleSetPageMode} withID={dataID} />
        );
      case "sharingEdit":
        return (
          <MasterSharingEdit onChangePage={handleSetPageMode} withID={dataID} />
        );
      case "sharingEditNot":
        return (
          <MasterSharingEditNot
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "forumAdd":
        return (
          <MasterForumAdd onChangePage={handleSetPageMode} withID={dataID} />
        );
      case "forumBefore":
        return (
          <MasterForumBefore onChangePage={handleSetPageMode} withID={dataID} />
        );
      case "forumEdit":
        return (
          <MasterForumEdit onChangePage={handleSetPageMode} withID={dataID} />
        );
      case "Post-Test":
        return (
          <MasterPostTestAdd onChangePage={handleSetPageMode} withID={dataID} />
        );
      case "posttestEdit":
        return (
          <MasterPostTestEdit
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "posttestEditNot":
        return (
          <MasterPostTestEditNot
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "kk":
        return <PilihKelompokKeahlian onChangePage={handleSetPageMode} />;
      case "detailPublish":
        return (
          <KKDetailProgram onChangePage={handleSetPageMode} withID={dataID} />
        );
    }
  }

  function handleSetPageMode(mode) {
    setPageMode(mode);
  }

  function handleSetPageMode(mode, withID, withIDKategori) {
    setDataID(withID);
    setDataID2(withIDKategori);
    setPageMode(mode);
  }

  function handleSetPageMode(
    newPageMode,
    dataReady = false,
    key = "",
    isOpen = false,
    quizType = ""
  ) {
    setPageMode(newPageMode);
    setIsDataReady(dataReady);
    setMateriId(key);
    setIsOpen(isOpen);
    setQuizType(quizType);
    setDataID(dataReady);
  }

  function handleSetPageMode(
    newPageMode,
    quizType = "",
    key = "",
    quizKey = "",
    durasi = ""
  ) {
    setPageMode(newPageMode);
    setDataID(quizType);
    setQuizType(quizType);
    setMateriId(key);
    setQuizId(quizKey);
    setDurasi(durasi);
  }

  return <div>{getPageMode()}</div>;
}
