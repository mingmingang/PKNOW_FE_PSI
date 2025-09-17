import { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Header from "../../backbone/Header";
import Footer from "../../backbone/Footer";
import "../../../style/Login.css";
import logoPknow from "../../../assets/pknow.png";
import Cookies from "js-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import maskot from "../../../assets/loginMaskotTMS.png";
import { API_LINK, ROOT_LINK } from "../../util/Constants";
import { validateAllInputs, validateInput } from "../../util/ValidateForm";
import { encryptId } from "../../util/Encryptor";
import UseFetch from "../../util/UseFetch";
import Loading from "../../part/Loading";
import Alert from "../../part/AlertLogin";
import Modal from "../../part/Modal";
import Input from "../../part/Input";
import { object, string } from "yup";

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

export default function Login() {
  const [errors, setErrors] = useState({});
  const [isError, setIsError] = useState({ error: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [listRole, setListRole] = useState([]);
  const [captchaImage, setCaptchaImage] = useState(null);

  const loadCaptcha = () => {
    setCaptchaImage(API_LINK + `Utilities/GetCaptcha?rand=${Math.random()}`);
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  const [captchaNumber, setCaptchaNumber] = useState("");
  const [userCaptchaInput, setUserCaptchaInput] = useState("");

  const generateCaptcha = () => {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    setCaptchaNumber(randomNumber.toString());
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const formDataRef = useRef({
    username: "",
    password: "",
  });

  const modalRef = useRef();

  const userSchema = object({
    username: string().max(50, "Maksimum 50 karakter").required("Harus diisi"),
    password: string().required("Nama Pengguna dan Kata Sandi Wajib Diisi!"),
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const validationError = validateInput(name, value, userSchema);
    formDataRef.current[name] = value;
    setErrors((prevErrors) => ({
      ...prevErrors,
      [validationError.name]: validationError.error,
    }));
  };

  const handleLoginClick = async (e) => {
    e.preventDefault();
    if (userCaptchaInput.trim() === "") {
      setIsError({ error: true, message: "Harap masukkan CAPTCHA!" });
      return;
    }

    const validationErrors = await validateAllInputs(
      formDataRef.current,
      userSchema,
      setErrors
    );

    if (Object.values(validationErrors).every((error) => !error)) {
      setIsLoading(true);
      setIsError((prevError) => ({ ...prevError, error: false }));
      setErrors({});

      const loginData = {
        username: formDataRef.current.username,
        password: formDataRef.current.password,
        captcha: userCaptchaInput,
      };

      try {
        const response = await fetch(`${API_LINK}Utilities/Login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
          credentials: "include",
        });
        const data = await response.json();
        if (data === "ERROR") {
          throw new Error("Terjadi kesalahan: Gagal melakukan autentikasi.");
        } else if (data.error === "Captcha tidak valid.") {
          throw new Error("Captcha yang dimasukan tidak sesuai.");
        } else if (data[0].Status === "LOGIN FAILED") {
          throw new Error("Nama akun atau kata sandi salah.");
        } else {
          setListRole(data);
          await handleLoginWithAllRoles(data);
        }
      } catch (error) {
        window.scrollTo(0, 0);
        setIsError((prevError) => ({
          ...prevError,
          error: true,
          message: error.message,
        }));
        loadCaptcha();
      } finally {
        setIsLoading(false);
      }
    } else {
      window.scrollTo(0, 0);
      loadCaptcha();
    }
  };

  async function handleLoginWithAllRoles(roles) {
    try {
      const ipAddress = await fetch("https://api.ipify.org/?format=json")
        .then((response) => response.json())
        .then((data) => data.ip)
        .catch((error) => {});

      if (ipAddress === "ERROR") {
        throw new Error("Terjadi kesalahan: Gagal mendapatkan alamat IP.");
      }

      const defaultRole = roles[0];

      const token = await UseFetch(API_LINK + "Utilities/CreateJWTToken", {
        username: formDataRef.current.username,
        password: formDataRef.current.password,
        role: defaultRole.RoleID,
        nama: defaultRole.Nama,
        prodi: defaultRole.Pro_ID,
      });

      if (token === "ERROR") {
        throw new Error(
          "Terjadi kesalahan: Gagal mendapatkan token autentikasi."
        );
      }

      Cookies.set("jwtToken", token.Token, {
        sameSite: "Strict",
      });

      localStorage.setItem("availableRoles", JSON.stringify(roles));

      const userInfo = {
        username: formDataRef.current.username,
        password: formDataRef.current.password,
        role: defaultRole.RoleID,
        nama: defaultRole.Nama,
        peran: defaultRole.Role,
        prodi: defaultRole.Pro_ID,
        lastLogin: null,
        allRoles: roles,
      };

      let user = encryptId(JSON.stringify(userInfo));

      const OneHourFromNow = new Date(new Date().getTime() + 60 * 60 * 1000);
      Cookies.set("activeUser", user, { expires: OneHourFromNow });

      window.location.href = ROOT_LINK + "halaman_sso";
    } catch (error) {
      window.scrollTo(0, 0);
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
    }
  }

  async function handleLoginWithRole(role, nama, peran, prodi) {
    try {
      const ipAddress = await fetch("https://api.ipify.org/?format=json")
        .then((response) => response.json())
        .then((data) => data.ip)
        .catch((error) => {});

      if (ipAddress === "ERROR") {
        throw new Error("Terjadi kesalahan: Gagal mendapatkan alamat IP.");
      }

      const token = await UseFetch(API_LINK + "Utilities/CreateJWTToken", {
        username: formDataRef.current.username,
        password: formDataRef.current.password,
        role: role,
        nama: nama,
        prodi: prodi,
      });

      if (token === "ERROR") {
        throw new Error(
          "Terjadi kesalahan: Gagal mendapatkan token autentikasi."
        );
      }

      Cookies.set("jwtToken", token.Token, {
        sameSite: "Strict",
      });

      const userInfo = {
        username: formDataRef.current.username,
        role: role,
        nama: nama,
        peran: peran,
        prodi: prodi,
        lastLogin: null,
      };

      let user = encryptId(JSON.stringify(userInfo));

      const OneHourFromNow = new Date(new Date().getTime() + 60 * 60 * 1000);
      Cookies.set("activeUser", user, { expires: OneHourFromNow });

      if (
        userInfo.peran === "PIC P-KNOW" ||
        userInfo.peran === "PIC KELOMPOK KEAHLIAN" ||
        userInfo.peran === "DOSEN"
      ) {
        window.location.href = ROOT_LINK + "beranda_utama";
      } else if (userInfo.peran === "PRODI") {
        window.location.href = ROOT_LINK + "beranda_prodi";
      } else if (userInfo.peran === "KARYAWAN") {
        window.location.href = ROOT_LINK + "beranda_tenaga_kependidikan";
      } else if (userInfo.peran === "MAHASISWA") {
        window.location.href = ROOT_LINK + "beranda_mahasiswa";
      }
    } catch (error) {
      window.scrollTo(0, 0);
      modalRef.current.close();
      setIsError((prevError) => ({
        ...prevError,
        error: true,
        message: error.message,
      }));
    }
  }

  if (Cookies.get("activeUser")) {
    window.location.href = "/";
  } else {
    return (
      <div>
        {isLoading && <Loading />}
        {isError.error && (
          <div className="flex-fill m-3">
            <Alert type="danger" message={isError.message} />
          </div>
        )}

        <Header showUserInfo={false} />
        <AnimatedSection>
          <main>
            <section className="login-background">
              <div className="login-container">
                <div
                  className="maskotlogin mr-5"
                  style={{ color: "#0A5EA8", marginLeft: "-30px" }}
                >
                  <h1
                    className="fw-bold"
                    style={{ width: "750px", textAlign: "center" }}
                  >
                    Mulai langkah awal pembelajaranmu dengan P-KNOW
                  </h1>
                  <img src={maskot} alt="" width="750px" />
                </div>

                <div className="login-box">
                  <img
                    src={logoPknow}
                    className="pknow"
                    alt="Logo ASTRAtech"
                    title="Logo ASTRAtech"
                    width="290px"
                    height="43px"
                  />
                  <form className="login-form" onSubmit={handleLoginClick}>
                    <Input
                      type="text"
                      forInput="username"
                      placeholder="Nama Pengguna"
                      isRequired
                      value={formDataRef.current.username}
                      onChange={handleInputChange}
                      style={{ marginTop: "20px" }}
                    />
                    <Input
                      type="password"
                      forInput="password"
                      placeholder="Kata Sandi"
                      isRequired
                      value={formDataRef.current.password}
                      onChange={handleInputChange}
                      errorMessage={errors.password}
                      style={{ marginTop: "20px" }}
                    />

                    <div className="mt-4">
                      <p style={{ textAlign: "left" }}>
                        Captcha <span style={{ color: "red" }}>*</span>
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: "5px",
                      }}
                    >
                      <img
                        src={captchaImage}
                        alt="Captcha"
                        style={{ height: "50px", marginRight: "10px" }}
                      />

                      <div className="d-flex">
                        <div className="ml-3">
                          <input
                            type="text"
                            placeholder="Masukkan Captcha"
                            value={userCaptchaInput}
                            onChange={(e) =>
                              setUserCaptchaInput(e.target.value)
                            }
                            required
                            style={{
                              width: "100%",
                              padding: "10px",
                              borderRadius: "5px 0px 0px 5px",
                              border: "1px solid #ccc",
                              height: "44px",
                            }}
                          />
                        </div>
                        <div className="">
                          <button
                            type="button"
                            onClick={loadCaptcha}
                            style={{
                              padding: "10px",
                              width: "50px",
                              border: "none",
                              backgroundColor: "#0A5EA8",
                              borderRadius: "0px 5px 5px 0px",
                              cursor: "pointer",
                              color: "white",
                            }}
                          >
                            <FontAwesomeIcon icon={faSyncAlt} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      className="login-button"
                      style={{
                        border: "none",
                        width: "100%",
                        backgroundColor: "#0E6DFE",
                        height: "40px",
                        color: "white",
                        marginTop: "20px",
                        borderRadius: "10px",
                      }}
                      type="submit"
                      label="MASUK"
                    >
                      Masuk
                    </button>
                  </form>
                </div>
              </div>
            </section>
          </main>
        </AnimatedSection>
        <Footer />

        <div style={{ display: "none" }}>
          <Modal title="Pilih Peran" ref={modalRef} size="small">
            <div className="">
              {listRole.map((value, index) => (
                <div
                  key={index}
                  className="d-flex justify-content-between mr-2 ml-2 fw-normal mb-3"
                >
                  <button
                    type="button"
                    className="list-group-item list-group-item-action"
                    onClick={() =>
                      handleLoginWithRole(
                        value.RoleID,
                        value.Nama,
                        value.Role,
                        value.Pro_ID
                      )
                    }
                  >
                    Masuk sebagai {value.Role}
                  </button>
                  <input
                    type="radio"
                    name={`role-${index}`}
                    id={`role-${index}`}
                    style={{ cursor: "pointer", width: "20px" }}
                    onClick={() =>
                      handleLoginWithRole(
                        value.RoleID,
                        value.Nama,
                        value.Role,
                        value.Pro_ID
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </Modal>
        </div>
      </div>
    );
  }
}
