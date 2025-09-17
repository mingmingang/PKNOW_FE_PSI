import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Loading from "../../../part/Loading";
import Alert from "../../../part/Alert";
import { API_LINK } from "../../../util/Constants";
import UseFetch from "../../../util/UseFetch";
import BackPage from "../../../../assets/backPage.png";
import Konfirmasi from "../../../part/Konfirmasi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import { decode } from "he";

const AnimatedSection = ({ children, delay = 0 }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay,
        ease: "easeOut",
      },
    },
    hidden: {
      opacity: 0,
      y: 50,
    },
  };
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
    >
      {children}
    </motion.div>
  );
};

export default function KKDetailDraft({ onChangePage, withID }) {
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listAnggota, setListAnggota] = useState([]);
  const [listProgram, setListProgram] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBackAction, setIsBackAction] = useState(false);

  const handleGoBack = () => {
    setIsBackAction(true);
    setShowConfirmation(true);
  };

  const handleConfirmYes = () => {
    setShowConfirmation(false);
    onChangePage("index");
  };

  const handleConfirmNo = () => {
    setShowConfirmation(false);
  };

  const [formData, setFormData] = useState({
    key: "",
    nama: "",
    programStudi: "",
    personInCharge: "",
    deskripsi: "",
    status: "",
    members: [],
    memberCount: "",
    gambar: "",
  });

  const getListAnggota = async () => {
    setIsError({ error: false, message: "" });
    setIsLoading(true);

    try {
      while (true) {
        let data = await UseFetch(API_LINK + "AnggotaKK/GetAnggotaKK", {
          page: 1,
          query: "",
          sort: "[Nama Anggota] asc",
          status: "Aktif",
          kke_id: withID.id,
        });

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil daftar anggota.");
        } else if (data === "data kosong") {
          setListAnggota([]);
          setIsLoading(false);
          break;
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          setListAnggota(data);
          setIsLoading(false);
          break;
        }
      }
    } catch (e) {
      setIsLoading(false);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: e.message,
      }));
    }
  };

  const getListProgram = async () => {
    setIsError({ error: false, message: "" });
    setIsLoading(true);

    try {
      while (true) {
        let data = await UseFetch(API_LINK + "Program/GetProgram", {
          page: 1,
          query: "",
          sort: "[Nama Program] ASC",
          status: "Aktif",
          KKid: withID.id,
        });

        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal mengambil data program.");
        } else if (data === "data kosong") {
          setListProgram([]);
          setIsLoading(false);
          break;
        } else if (data.length === 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          const updatedListProgram = await Promise.all(
            data.map(async (program) => {
              try {
                while (true) {
                  let data = await UseFetch(
                    API_LINK + "KategoriProgram/GetKategoriByProgram",
                    {
                      page: 1,
                      query: "",
                      sort: "[Nama Kategori] asc",
                      status: "Aktif",
                      kkeID: program.Key,
                    }
                  );

                  if (data === "ERROR") {
                    throw new Error(
                      "Terjadi kesalahan: Gagal mengambil data kategori."
                    );
                  } else if (data === "data kosong") {
                    return { ...program, kategori: [] };
                  } else if (data.length === 0) {
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                  } else {
                    return { ...program, kategori: data };
                  }
                }
              } catch (e) {
                setIsError({ error: true, message: e.message });
                return { ...program, kategori: [] };
              }
            })
          );

          setListProgram(updatedListProgram);
          setIsLoading(false);
          break;
        }
      }
    } catch (e) {
      setIsLoading(false);
      setIsError({ error: true, message: e.message });
    }
  };

  useEffect(() => {
    if (withID) {
      setFormData({
        key: withID.id,
        nama: withID.title,
        programStudi: withID.prodi.nama,
        personInCharge: withID.pic.nama,
        deskripsi: withID.desc,
        status: withID.status,
        members: withID.members,
        memberCount: withID.memberCount,
        gambar: withID.gambar,
      });
      getListAnggota();
      getListProgram();
    }
  }, [withID]);

  if (isLoading) return <Loading />;

  return (
    <>
      <AnimatedSection>
        {isError.error && (
          <div className="flex-fill">
            <Alert type="danger" message={isError.message} />
          </div>
        )}
        <div
          className="container mb-4"
          style={{ display: "flex", marginTop: "100px" }}
        >
          <button
            style={{ backgroundColor: "transparent", border: "none" }}
            onClick={handleGoBack}
          >
            <img src={BackPage} alt="" />
          </button>
          <h4
            style={{
              color: "#0A5EA8",
              fontWeight: "bold",
              fontSize: "30px",
              marginTop: "10px",
              marginLeft: "20px",
            }}
          >
            Kelompok Keahlian
          </h4>
        </div>
        <div className="ket-draft"></div>
        <div className="container mb-4">
          <div className="card">
            <div className="card-body">
              <div className="row pt-2">
                <div className="col-lg-7 px-4">
                  <h3
                    className="mb-3 fw-semibold"
                    style={{
                      fontSize: "30px",
                      color: "#0A5EA8",
                      fontWeight: "bold",
                    }}
                  >
                    {decode(formData.nama)}
                  </h3>
                  <h5 className="fw-semibold">
                    <FontAwesomeIcon
                      icon={faGraduationCap}
                      className="icon-style"
                      style={{ marginRight: "10px" }}
                    />
                    {formData.programStudi}
                  </h5>
                  <h4 className="fw-semibold" style={{ marginTop: "30px" }}>
                    Tentang Kelompok Keahlian
                  </h4>
                  <p className="py-2" style={{ textAlign: "justify" }}>
                    {decode(formData.deskripsi)}
                  </p>
                  <div className="">
                    <i className="fas fa-user"></i>
                    <span style={{ marginLeft: "10px", fontWeight: "bold" }}>
                      PIC : {formData.personInCharge}
                    </span>
                  </div>
                </div>
                <div className="col-lg-5">
                  <img
                    alt={`image`}
                    className="cover-daftar-kk"
                    height="200"
                    src={`${API_LINK}Upload/GetFile/${formData.gambar}`}
                    style={{
                      borderRadius: "20px",
                      width: "100%",
                      objectFit: "cover",
                      backgroundSize: "cover",
                    }}
                  />
                </div>
              </div>
            </div>
            <div style={{ marginTop: "40px", marginBottom: "60px" }}>
              <h4
                style={{
                  fontWeight: "bold",
                  color: "#0A5EA8",
                  textAlign: "center",
                }}
              >
                Status Kelompok Keahlian ini : {formData.status}
              </h4>
            </div>
          </div>
        </div>

        {showConfirmation && (
          <Konfirmasi
            title={isBackAction ? "Konfirmasi Kembali" : "Konfirmasi Simpan"}
            pesan={
              isBackAction
                ? "Apakah anda ingin kembali?"
                : "Anda yakin ingin simpan data?"
            }
            onYes={handleConfirmYes}
            onNo={handleConfirmNo}
          />
        )}
      </AnimatedSection>
    </>
  );
}
