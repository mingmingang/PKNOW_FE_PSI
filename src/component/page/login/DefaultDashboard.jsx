import { useEffect, useState } from "react";
import Header from "../../backbone/Header";
import Footer from "../../backbone/Footer";
import Cookies from "js-cookie";
import { decryptId, encryptId } from "../../util/Encryptor";
import { API_LINK } from "../../util/Constants";
import UseFetch from "../../util/UseFetch";
import { useRef } from "react";
import maskot from "../../../assets/loginMaskotTMS.png";
import "../../../style/Login.css";

export default function DefaultDashboard() {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserInfo, setCurrentUserInfo] = useState(null);
  const modalRef = useRef();

  useEffect(() => {
    const userCookie = Cookies.get("activeUser");
    if (userCookie) {
      try {
        const userInfo = JSON.parse(decryptId(userCookie));
        setCurrentUserInfo(userInfo);

        const storedRoles = localStorage.getItem("availableRoles");
        let roles = [];

        if (storedRoles) {
          roles = JSON.parse(storedRoles);
        } else if (userInfo.allRoles) {
          roles = userInfo.allRoles;
        }

        setAvailableRoles(roles);

        if (roles.length > 0) {
          if (roles.length > 0) {
            setShowRoleModal(true);
            if (modalRef.current) {
              modalRef.current.open();
            }
          } else if (roles.length === 0) {
            handleRoleSelection(roles[0]);
          } else {
            window.location.href = "/login";
          }
        }
      } catch (error) {
        window.location.href = "/login";
      } finally {
        setIsLoading(false);
      }
    } else {
      window.location.href = "/login";
    }
  }, []);

  const redirectBasedOnRole = (userInfo) => {
    const role = userInfo.peran;

    if (
      role === "PIC P-KNOW" ||
      role === "PIC KELOMPOK KEAHLIAN" ||
      role === "DOSEN"
    ) {
      window.location.href = "/beranda_utama";
    } else if (role === "PRODI") {
      window.location.href = "/beranda_prodi";
    } else if (role === "KARYAWAN") {
      window.location.href = "/beranda_tenaga_kependidikan";
    } else if (role === "MAHASISWA") {
      window.location.href = "/beranda_mahasiswa";
    } else {
      window.location.href = "/";
    }
  };

  const handleRoleSelection = async (selectedRole) => {
    const user = Cookies.get("activeUser");
    const userInfo = JSON.parse(decryptId(user));

    try {
      const token = await UseFetch(API_LINK + "Utilities/CreateJWTToken", {
        username: userInfo.username,
        password: userInfo.password,
        role: selectedRole.RoleID,
        nama: selectedRole.Nama,
        prodi: selectedRole.Pro_ID,
      });

      if (token === "ERROR") {
        throw new Error(
          "Terjadi kesalahan: Gagal mendapatkan token autentikasi."
        );
      }

      Cookies.set("jwtToken", token.Token, {
        sameSite: "Strict",
      });

      const updatedUserInfo = {
        ...currentUserInfo,
        role: selectedRole.RoleID,
        peran: selectedRole.Role,
        prodi: selectedRole.Pro_ID,
        nama: selectedRole.Nama,
      };

      let user = encryptId(JSON.stringify(updatedUserInfo));
      const OneHourFromNow = new Date(new Date().getTime() + 60 * 60 * 1000);
      Cookies.set("activeUser", user, { expires: OneHourFromNow });

      redirectBasedOnRole(updatedUserInfo);
    } catch (error) {
      alert("Terjadi kesalahan saat memperbarui peran. Silakan coba lagi.");
    }
  };

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="text-center">
          <h3>Memuat...</h3>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (showRoleModal) {
    return (
      <>
        <Header showUserInfo={false} />
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

              <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "100vh", backgroundColor: "transparent" }}
              >
                <div
                  className="card shadow-lg"
                  style={{
                    maxWidth: "500px",
                    width: "100%",
                    borderRadius: "20px",
                  }}
                >
                  <div
                    className="card-header text-white text-center"
                    style={{ background: "rgb(10, 94, 168)" }}
                  >
                    <h5 className="mb-0">Pilih Peran</h5>
                  </div>
                  <div className="card-body">
                    <p className="text-center mb-4">
                      Silakan pilih peran yang ingin Anda gunakan:
                    </p>
                    <div className="d-grid gap-2">
                      {availableRoles.map((role, index) => (
                        <button
                          key={index}
                          type="button"
                          className="btn btn-outline-primary btn-lg text-start"
                          onClick={() => handleRoleSelection(role)}
                          style={{
                            padding: "15px 20px",
                            borderRadius: "8px",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#0d6efd";
                            e.target.style.color = "white";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                            e.target.style.color = "#0d6efd";
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <span style={{ fontSize: "17px" }}>
                              Masuk sebagai {role.Role || role.role}
                            </span>
                            <i className="fas fa-arrow-right ml-4"></i>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ height: "100vh" }}
    >
      <div className="text-center">
        <h3>Mengarahkan ke dashboard...</h3>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  );
}
