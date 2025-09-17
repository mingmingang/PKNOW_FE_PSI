import Button from "./Button copy";
import Icon from "./Icon";
import "../../style/KelompokKeahlian.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faUser,
  faArrowRight,
  faPeopleGroup,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { API_LINK } from "../util/Constants";
import Input from "./Input";
import { decode } from "he";

function CardKelompokKeahlian({
  config = { footer: "", icon: "", className: "", label: "", page: "" },
  data = {
    id: "",
    title: "",
    prodi: { key: "", nama: "" },
    pic: { key: "", nama: "" },
    desc: "",
    status: "",
    gambar: "",
  },
  ketButton,
  colorCircle,
  iconClass,
  showDropdown = true,
  showStatusText = true,
  showProdi = true,
  showUserProdi = true,
  anggota,
  statusPersetujuan,
  onClick,
  onChangePage,
  onChangeStatus,
  onDelete,
  title,
  showMenu = true,
  link,
}) {
  const handleStatusChange = (newStatus, status) => {
    if (onChangeStatus) {
      onChangeStatus(newStatus, status);
    }
  };

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(data.id);
    }
  };

  let footerStatus;
  if (data.status === "Draft" && !data.pic.key) {
    footerStatus = (
      <p className="mb-0 text-secondary">
        <i
          className="fas fa-circle"
          icon="circle"
          style={{
            color: colorCircle,
            marginRight: "20px",
            width: "10px",
          }}
        />
        Draft - Belum dikirimkan ke Prodi
      </p>
    );
  } else if (data.status === "Draft" && data.pic.key) {
    footerStatus = (
      <p className="mb-0 text-secondary">
        <i
          className="fas fa-circle"
          icon="circle"
          style={{
            color: colorCircle,
            marginRight: "20px",
            width: "10px",
          }}
        />
        Draft - Belum dipublikasi
      </p>
    );
  } else if (data.status === "Menunggu") {
    footerStatus = (
      <p className="mb-0 text-secondary">
        <i
          className="fas fa-circle"
          icon="circle"
          style={{
            color: colorCircle,
            marginRight: "20px",
            width: "10px",
          }}
        />
        Menunggu PIC dari Prodi
      </p>
    );
  } else if (data.status === "Aktif" && data.pic.key) {
    if (link == "program") {
      footerStatus = (
        <div>
          <Button
            iconName="info"
            classType={`${config.className} py-2 rounded-3`}
            label="Detail Kelas"
            onClick={() => onChangePage("detail", data)}
            style={{ border: "none", fontSize: "11px" }}
          />
        </div>
      );
    } else if (link == "dapus") {
      footerStatus = (
        <div>
          <Button
            iconName="info"
            classType={`${config.className} py-2 mt-3`}
            label="Detail Keahlian"
            onClick={() => onChangePage("detail", data)}
            style={{ border: "none" }}
          />
        </div>
      );
    } else {
      footerStatus = (
        <p className="mb-0 text-secondary">
          <i
            className="fas fa-circle"
            icon="circle"
            style={{
              color: colorCircle,
              marginRight: "20px",
              width: "10px",
            }}
          />
          <span>Aktif</span>
        </p>
      );
    }
  } else if (data.status === "Tidak Aktif" && data.pic.key) {
    footerStatus = (
      <p className="mb-0 text-secondary">
        <i
          className="fas fa-circle"
          icon="circle"
          style={{
            color: "red",
            marginRight: "20px",
            width: "10px",
          }}
        />
        Tidak Aktif
      </p>
    );
  }

  let personInCharge;
  if (data.status === "Draft" && !data.pic.key) {
    personInCharge = (
      <div className=" d-flex" style={{ justifyContent: "space-between" }}>
        <FontAwesomeIcon
          icon={showUserProdi ? faUser : faClock}
          className="icon-style"
        />
        <p className="text-gray-700" style={{ fontSize: "15px" }}>
          {" "}
          PIC : Belum ada PIC KK
        </p>
      </div>
    );
  } else {
    personInCharge = (
      <div className="d-flex">
        <FontAwesomeIcon
          icon={showUserProdi ? faUser : faClock}
          className="icon-style person-icon mt-2"
        />
        <p className="text-gray-700 pic-value" style={{ fontSize: "15px" }}>
          PIC :{" "}
          {data.pic.key ? (
            data.pic.nama
          ) : (
            <span
              className=" "
              style={{ fontSize: "15px", color: "black", fontWeight: "600" }}
            >
              Menunggu PIC dari Prodi
            </span>
          )}
        </p>
      </div>
    );
  }

  let cardContent;
  if (config.footer === "Btn") {
    cardContent = (
      <div className="d-flex justify-content-between">
        <div className=""></div>
        <div className="">
          <Button
            iconName={config.icon}
            classType={config.className + "py-2 mt-3"}
            label={config.label}
            onClick={() => onChangePage("add", data)}
            style={{ border: "none" }}
          />
        </div>
      </div>
    );
  } else if (config.footer === "Draft") {
    cardContent = (
      <div className="d-flex justify-content-between">
        {showStatusText ? (
          <div className="">
            <span style={{ fontSize: "14px" }}>{footerStatus}</span>
          </div>
        ) : (
          <a
            href="#selengkapnya"
            className="text-blue-600"
            style={{ textDecoration: "none" }}
          >
            Selengkapnya <FontAwesomeIcon icon={faArrowRight} />
          </a>
        )}
        <div
          className="d-flex justify-content-end"
          style={{ marginTop: "17px", marginLeft: "-20px" }}
        >
          <Icon
            name="edit"
            type="Bold"
            cssClass="btn px-2 py-0 text-primary"
            title="Ubah data"
            onClick={() => onChangePage("edit", data)}
            style={{ border: "none" }}
          />
          <Icon
            name="trash"
            type="Bold"
            cssClass="btn px-2 py-0 text-primary"
            title="Hapus data permanen"
            onClick={() => handleDeleteClick(data)}
            style={{ border: "none" }}
          />
          <Icon
            name="list"
            type="Bold"
            cssClass="btn px-2 py-0 text-primary"
            title="Lihat detail Kelompok Keahlian"
            onClick={() => onChangePage("detailDraft", data)}
            style={{ border: "none" }}
          />
          {data.pic.key ? (
            <Icon
              name="paper-plane"
              type="Bold"
              cssClass="btn px-1 py-0 text-primary"
              title="Publikasi Kelompok Keahlian"
              onClick={() => handleStatusChange(data, "Aktif")}
              style={{ border: "none" }}
            />
          ) : (
            <Icon
              name="paper-plane"
              type="Bold"
              cssClass="btn px-1 py-0 text-primary"
              title="Kirim ke Prodi bersangkutan untuk menentukan PIC"
              onClick={() => handleStatusChange(data, "Menunggu")}
              style={{ border: "none" }}
            />
          )}
        </div>
      </div>
    );
  } else if (config.footer === "Menunggu") {
    cardContent = (
      <div className="d-flex justify-content-between align-items-center w-100">
        {showStatusText ? (
          <div className="d-flex align-items-center">{footerStatus}</div>
        ) : (
          <a
            href="#selengkapnya"
            className="text-blue-600"
            style={{ textDecoration: "none" }}
          >
            Selengkapnya <FontAwesomeIcon icon={faArrowRight} />
          </a>
        )}

        <div className="d-flex justify-content-end align-items-center">
          <Icon
            name="edit"
            type="Bold"
            cssClass="btn px-2 py-0 text-primary"
            title="Ubah data"
            onClick={() => onChangePage("edit", data)}
          />
          <Icon
            name="list"
            type="Bold"
            cssClass="btn px-2 py-0 text-primary"
            title="Lihat detail Kelompok Keahlian"
            onClick={() => onChangePage("detailDraft", data)}
          />
          {data.pic.key && (
            <Icon
              name="paper-plane"
              type="Bold"
              cssClass="btn px-1 py-0 text-primary"
              title="Kirim ke Prodi bersangkutan untuk menentukan PIC"
            />
          )}
        </div>
      </div>
    );
  } else {
    cardContent = (
      <div
        className="d-flex justify-content-between"
        style={{ width: "100%", gap: "60px" }}
      >
        {showStatusText ? (
          <div className="" style={{ width: "100%" }}>
            <span style={{ fontSize: "14px" }}>{footerStatus}</span>
          </div>
        ) : (
          <a
            href="#selengkapnya"
            className="text-blue-600"
            style={{ textDecoration: "none" }}
          >
            Selengkapnya <FontAwesomeIcon icon={faArrowRight} />
          </a>
        )}
        <div className="icon-kk d-flex">
          {showMenu ? (
            <>
              <Icon
                name="edit"
                type="Bold"
                cssClass="btn px-2 py-0 text-primary"
                title="Ubah data"
                onClick={() => onChangePage("edit", data)}
              />
              <Icon
                name="list"
                type="Bold"
                cssClass="btn px-2 py-0 text-primary"
                title="Lihat detail Kelompok Keahlian"
                onClick={() => onChangePage("detailPublish", data)}
              />
              <div
                className="form-check form-switch py-0 ms-2"
                style={{ width: "fit-content" }}
              >
                <Input
                  type="checkbox"
                  title="Aktif / Nonaktif"
                  className="form-check-input"
                  checked={data.status === "Aktif"}
                  onChange={() =>
                    handleStatusChange(
                      data,
                      data.status === "Aktif" ? "Tidak Aktif" : "Aktif"
                    )
                  }
                />
                <label
                  className="form-check-label"
                  htmlFor="flexSwitchCheckDefault"
                ></label>
              </div>
            </>
          ) : (
            <div className="">
              {" "}
              {ketButton && (
                <button
                  className="d-flex align-items-center justify-content-center bg-primary text-white rounded-3 px-4 py-2"
                  style={{
                    minWidth: "160px",
                    fontWeight: "bold",
                    fontSize: "11px",
                  }}
                  aria-label={`Action for ${title}`}
                  onClick={() => onChangePage(link, data)}
                >
                  <i
                    className="fas fa-users me-2"
                    style={{ marginTop: "1px" }}
                  ></i>
                  {ketButton}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="kelompokKeahlian">
      <div className="bg-white-kk">
        <img
          alt={`${title} image`}
          className="cover-daftar-kk"
          height="200"
          src={`${API_LINK}Upload/GetFile/${data.gambar}`}
          width="300"
        />
        <div className="content">
          <div className="d-flex justify-content-between align-items-center mt-2">
            <h3
              className="text-xl font-bold text-blue-600"
              style={{
                fontSize: "16px",
                textAlign: "justify",
                lineHeight: "30px",
              }}
            >
              {data.title
                ? decode(data.title).length > 21
                  ? decode(data.title).slice(0, 30) + "..."
                  : decode(data.title)
                : "Default Title"}
            </h3>
          </div>
        </div>

        <div className="pemilik ">
          <div
            className="d-flex align-items-center mb-1"
            style={{ fontSize: "14px", justifyContent: "left" }}
          >
            <FontAwesomeIcon
              icon={showProdi ? faGraduationCap : faPeopleGroup}
              className="me-2 text-dark"
            />
            <span
              style={{ fontSize: "15px", color: "#2c2c2c", fontWeight: "600" }}
            >
              {showProdi
                ? data?.prodi?.nama?.length > 35
                  ? `${data.prodi.nama.slice(0, 35)}...`
                  : data?.prodi?.nama || ""
                : anggota}
            </span>
          </div>
          <div className="userProdi">{personInCharge}</div>
        </div>

        <div
          className="deskripsi-container "
          style={{ alignItems: "center", width: "100%" }}
        >
          <p className="deskripsi descni" style={{ marginBottom: "10px" }}>
            {decode(data.desc).substring(0, 100)}
            {data.desc.length > 100 && "..."}
          </p>
        </div>

        <div className="card-footer status-open mb-2">
          <div className="card-content" style={{ alignItems: "center" }}>
            {cardContent}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardKelompokKeahlian;
