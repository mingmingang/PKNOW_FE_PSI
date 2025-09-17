import { useState } from "react";
import ProgramIndex from "./KelolaProgram";
import ProgramAdd from "./AddProgram";
import KategoriProgramAdd from "./AddKategoriProgram";
import ProgramEdit from "./EditProgram";
import KategoriProgramEdit from "./EditKategoriProgram";
import KKDetailProgram from "./DetailKK";
import MasterProsesIndex from "../../Materi/master-proses/Index";
import PengenalanAdd from "../../Materi/master-proses/master-materi/PengenalanAdd";
import PengenalanEdit from "../../Materi/master-proses/master-materi/PengenalanEdit";
import PengenalanBefore from "../../Materi/master-proses/master-materi/PengenalanBefore";
import MasterTestPengenalan from "../../Materi/master-test/Pengenalan";

import MasterPreTestAdd from "../../Materi/master-proses/master-pretest/PreTestAdd";
import MasterPreTestEdit from "../../Materi/master-proses/master-pretest/PreTestEdit";
import MasterPreTestEditNot from "../../Materi/master-proses/master-pretest/PreTestEditNot";

import MasterMateriAdd from "../../Materi/master-proses/master-materi/MateriAdd";
import MasterMateriEdit from "../../Materi/master-proses/master-materi/MateriEdit";
import MasterMateriReviewJawaban from "../../Materi/master-proses/master-materi/MateriReviewJawaban";

import MasterSharingAdd from "../../Materi/master-proses/master-sharing/SharingAdd";
import MasterSharingEditNot from "../../Materi/master-proses/master-sharing/SharingEditNot";
import MasterSharingEdit from "../../Materi/master-proses/master-sharing/SharingEdit";

import MasterForumAdd from "../../Materi/master-proses/master-forum/ForumAdd";
import MasterForumBefore from "../../Materi/master-proses/master-forum/ForumBefore";
import MasterForumEdit from "../../Materi/master-proses/master-forum/ForumEdit";

import MasterPostTestAdd from "../../Materi/master-proses/master-posttest/PostTestAdd";
import MasterPostTestEdit from "../../Materi/master-proses/master-posttest/PostTestEdit";
import MasterPostTestEditNot from "../../Materi/master-proses/master-posttest/PostTestEditNot";

import MasterTestDetailTest from "../../Materi/master-test/DetailTest";
import MasterTestForum from "../../Materi/master-test/Forum";
import MasterTestMateriPDF from "../../Materi/master-test/MateriPDF";
import MasterTestMateriVideo from "../../Materi/master-test/MateriVideo";
import MasterTestSharingPDF from "../../Materi/master-test/SharingPDF";
import MasterTestSharingVideo from "../../Materi/master-test/SharingVideo";
import MasterTestPostTest from "../../Materi/master-test/PostTest";
import MasterTestPreTest from "../../Materi/master-test/PreTest";
import MasterTestPengerjaanTest from "../../Materi/master-test/Test";

export default function Program() {
  const [pageMode, setPageMode] = useState("index");
  const [dataID, setDataID] = useState();
  const [dataID2, setDataID2] = useState();
  const [isDataReady, setIsDataReady] = useState(false);
  const [materiId, setMateriId] = useState("");
  const [durasi, setDurasi] = useState("");
  const [quizId, setQuizId] = useState("");
  const [quizType, setQuizType] = useState("");
  const [isOpen, setIsOpen] = useState();

  function getPageMode() {
    switch (pageMode) {
      case "index":
        return <ProgramIndex onChangePage={handleSetPageMode} />;
      case "kk":
        return <ProgramIndex onChangePage={handleSetPageMode} />;
      case "add":
        return <ProgramAdd onChangePage={handleSetPageMode} withID={dataID} />;
      case "addKategori":
        return (
          <KategoriProgramAdd
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "detailPublish":
        return (
          <KKDetailProgram onChangePage={handleSetPageMode} withID={dataID} />
        );
      case "edit":
        return <ProgramEdit onChangePage={handleSetPageMode} withID={dataID} />;
      case "editKategori":
        return (
          <KategoriProgramEdit
            onChangePage={handleSetPageMode}
            withID={dataID}
          />
        );
      case "materi":
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
    }
  }

  function handleSetPageMode(mode) {
    setPageMode(mode);
  }

  function handleSetPageMode(mode, withID) {
    setDataID(withID);
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
    setQuizType(quizType);
    setMateriId(key);
    setQuizId(quizKey);
    setDurasi(durasi);
    setDataID(quizType);
  }

  return <div>{getPageMode()}</div>;
}
