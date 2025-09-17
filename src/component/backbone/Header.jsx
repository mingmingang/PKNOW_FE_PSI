import { useEffect, useState } from "react";
import logo from "../../assets/logoAstratech.png";
import "../../style/Header.css";
import Konfirmasi from "../part/Konfirmasi";
import {
  API_LINK,
  APPLICATION_ID,
  BASE_ROUTE,
  ROOT_LINK,
} from "../util/Constants";
import UseFetch from "../util/UseFetch";
import { useLocation } from "react-router-dom";

export default function Header({
  showMenu = false,
  userProfile = {},
  listMenu,
  konfirmasi = "Konfirmasi",
  pesanKonfirmasi = "Apakah Anda yakin ingin keluar?",
  showUserInfo = true,
}) {
  const [activeMenu, setActiveMenu] = useState("beranda");
  const [isProfileDropdownVisible, setProfileDropdownVisible] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [countNotifikasi, setCountNotifikasi] = useState("");
  const iconMapping = {
    "Kelola Kelompok Keahlian": "fas fa-cogs",
    "Kelola Anggota": "fas fa-users",
    "Daftar Pustaka": "fas fa-book",
    Materi: "fas fa-graduation-cap",
    "PIC Kelompok Keahlian": "fas fa-users",
    "Persetujuan Anggota Keahlian": "fas fa-check",
    "Pengajuan Kelompok Keahlian": "fas fa-paper-plane",
    "Riwayat Pengajuan": "fas fa-history",
    "Kelola Program": "fas fa-tasks",
    "Kelola Materi": "fas fa-book-open",
    "Class Repository": "fas fa-book-open",
    "LJ Create": "fas fa-book-open",
  };

  const location = useLocation();
  const activeURL =
    ROOT_LINK + location.pathname.replace(BASE_ROUTE, "").substring(1);

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.split(" ");
    return parts
      .map((part) => part[0]?.toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const handleConfirmYes = () => {
    window.location.replace("/logout");
    setShowConfirmation(false);
  };

  const handleConfirmNo = () => {
    setShowConfirmation(false);
  };

  const handleLogoutClick = () => {
    setShowConfirmation(true);
  };

  const handleNotification = () => {
    window.location.replace("/notifications");
  };

  const handleSSO = () => {
    window.location.replace("/halaman_sso");
  };

  useEffect(() => {
    if (showMenu) {
      const activeMenuItem = listMenu.find((menu) => activeURL === menu.link);
      if (activeMenuItem) {
        setActiveMenu(activeMenuItem.head);
      }
    }
  }, [activeURL, listMenu, showMenu]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await UseFetch(
          API_LINK + "Utilities/GetDataCountingNotifikasi",
          { application: APPLICATION_ID }
        );

        if (data === "ERROR") {
          throw new Error();
        } else {
          setCountNotifikasi(data[0].counting);
        }
      } catch {
        setCountNotifikasi("");
      }
    };
    fetchData();
  }, []);

  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const closeNav = () => {
    setIsNavOpen(false);
  };

  return (
    <div>
      <nav>
        <div className="logo">
          <img src={logo} alt="Logo ASTRAtech" title="Logo ASTRAtech" />
        </div>

        {showMenu && (
          <div className="menu-profile-container">
            <div className="menu">
              <ul className="menu-center">
                {listMenu.map((menu) => {
                  if (menu.isHidden) return null;

                  const isParentActive = activeURL === menu.link;
                  const isChildActive =
                    menu.sub && menu.sub.some((sub) => activeURL === sub.link);
                  const isActive = isParentActive || isChildActive;

                  return (
                    <li key={menu.headkey} className={isActive ? "active" : ""}>
                      <a
                        href={menu.link}
                        onClick={() => setActiveMenu(menu.head)}
                      >
                        <div className="menu-item">
                          {menu.icon && <i className={menu.icon}></i>}
                          <span>{menu.head}</span>
                          {menu.sub && menu.sub.length > 0 && (
                            <i
                              className="fas fa-chevron-down"
                              aria-hidden="true"
                            ></i>
                          )}
                        </div>
                      </a>

                      {menu.sub && menu.sub.length > 0 && (
                        <ul className="dropdown-content">
                          {menu.sub.map((sub) => {
                            const iconClass = iconMapping[sub.title] || "";
                            const isSubActive = activeURL === sub.link;

                            return (
                              <li
                                key={sub.link}
                                className={isSubActive ? "active-sub" : ""}
                              >
                                <a
                                  href={sub.link}
                                  onClick={() =>
                                    setActiveMenu(`${menu.head} - ${sub.title}`)
                                  }
                                >
                                  {iconClass && <i className={iconClass}></i>}
                                  <span>{sub.title}</span>
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        <div className="profile">
          {showUserInfo && (
            <>
              <div className="pengguna">
                <h3>{userProfile.name}</h3>
                <h4>{userProfile.role}</h4>
                <p>Terakhir Masuk: {userProfile.lastLogin}</p>
              </div>
            </>
          )}

          <div
            className="fotoprofil"
            onMouseEnter={() => setProfileDropdownVisible(true)}
            onMouseLeave={() => setProfileDropdownVisible(false)}
          >
            {showUserInfo && (
              <>
                {userProfile.photo ? (
                  <img src={userProfile.photo} alt="Profile" />
                ) : (
                  <div
                    className="menu-profil-img"
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      backgroundColor: "#e0e7ff",
                      color: "#1a73e8",
                      fontWeight: "bold",
                      fontSize: "24px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      margin: "0 auto 10px",
                      position: "relative",
                    }}
                  >
                    {getInitials(userProfile.name)}
                    {countNotifikasi > 0 && (
                      <span className="notification-badge"></span>
                    )}
                  </div>
                )}
              </>
            )}
            {isProfileDropdownVisible && (
              <ul className="profile-dropdown">
                <li>
                  <span
                    onClick={handleNotification}
                    style={{ cursor: "pointer" }}
                  >
                    <i className="fas fa-bell" style={{ color: "#0A5EA8" }}></i>{" "}
                    <span style={{ color: "#0A5EA8" }}>
                      Notifikasi{" "}
                      {countNotifikasi > 0 && (
                        <span className="notif">{countNotifikasi}</span>
                      )}
                    </span>
                  </span>
                </li>
                <li>
                  <span onClick={handleSSO} style={{ cursor: "pointer" }}>
                    <i
                      className="fas fa-home"
                      style={{ color: "#0A5EA8", marginLeft: "-4px" }}
                    ></i>{" "}
                    <span style={{ color: "#0A5EA8" }}>Halaman SSO</span>
                  </span>
                </li>
                <li>
                  <span
                    onClick={handleLogoutClick}
                    className="keluar"
                    style={{ cursor: "pointer" }}
                  >
                    <i
                      className="fas fa-sign-out-alt"
                      style={{ color: "red" }}
                    ></i>{" "}
                    <span style={{ color: "red" }}>Logout</span>
                  </span>
                </li>
              </ul>
            )}
          </div>

          {showUserInfo && (
            <div className="hamburger" onClick={toggleNav}>
              <i className={`fas fa-${isNavOpen ? "times" : "bars"}`}></i>{" "}
            </div>
          )}
        </div>
      </nav>

      {isNavOpen && (
        <div className="nav-overlay">
          <div className="close-btn" onClick={closeNav}>
            <i className="fas fa-times"></i>
          </div>

          <div className="menu-profile-container">
            <div className="menu">
              <ul className="menu-vertical">
                {listMenu.map((menu) => {
                  if (menu.isHidden) return null;
                  const isActive = activeURL === menu.link;

                  return (
                    <li key={menu.headkey} className={isActive ? "active" : ""}>
                      <a
                        href={menu.link}
                        onClick={() => setActiveMenu(menu.head)}
                      >
                        <div className="menu-item">
                          {menu.icon && <i className={menu.icon}></i>}
                          <span>{menu.head}</span>
                          {menu.sub && menu.sub.length > 0 && (
                            <i
                              className="fas fa-chevron-down ml-2"
                              aria-hidden="true"
                            ></i>
                          )}
                        </div>
                      </a>

                      {menu.sub && menu.sub.length > 0 && (
                        <ul className="dropdown-combobox">
                          {menu.sub.map((sub) => {
                            const iconClass = iconMapping[sub.title] || "";

                            return (
                              <li key={sub.link}>
                                <a
                                  href={sub.link}
                                  onClick={() =>
                                    setActiveMenu(`${menu.head} - ${sub.title}`)
                                  }
                                >
                                  {iconClass && <i className={iconClass}></i>}
                                  <span>{sub.title}</span>
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}

      {showConfirmation && (
        <Konfirmasi
          title={konfirmasi}
          pesan={pesanKonfirmasi}
          onYes={handleConfirmYes}
          onNo={handleConfirmNo}
        />
      )}
    </div>
  );
}
