import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Slider from "react-slick";
import "../../../style/BerandaProdi.css";
import maskotP4 from "../../../assets/backBeranda/MaskotP4.png";
import maskotTPM from "../../../assets/backBeranda/maskotTPM.png";
import maskotMI from "../../../assets/backBeranda/MaskotMI.png";
import maskotMO from "../../../assets/backBeranda/MaskotMO.png";
import maskotMK from "../../../assets/backBeranda/MaskotMK.png";
import maskotTKBG from "../../../assets/backBeranda/MaskotTKBG.png";
import maskotTRPAB from "../../../assets/backBeranda/MaskotTRPAB.png";
import maskotTRL from "../../../assets/backBeranda/MaskotTRL.png";
import maskotTRPL from "../../../assets/backBeranda/MaskotTRPL.png";
import backgroundP4 from "../../../assets/BackBeranda/BackgroundP4.png";
import backgroundTPM from "../../../assets/BackBeranda/BackgroundTPM.png";
import backgroundMI from "../../../assets/BackBeranda/BackgroundMI.png";
import backgroundMO from "../../../assets/BackBeranda/BackgroundMO.png";
import backgroundMK from "../../../assets/BackBeranda/BackgroundMK.png";
import backgroundTKBG from "../../../assets/BackBeranda/BackgroundTKBG.png";
import backgroundTRPAB from "../../../assets/BackBeranda/BackgroundTRPAB.png";
import backgroundTRL from "../../../assets/BackBeranda/BackgroundTRL.png";
import backgroundTRPL from "../../../assets/BackBeranda/BackgroundTRPL.png";
import iconAstra from "../../../assets/iconAstra.png";
import perusahaan from "../../../assets/perusahaan.png";
import logo from "../../../assets/logo.png";
import "../../../style/Beranda.css";
import maskotBoyGirl from "../../../assets/maskotAstraBoyGirl.png";

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

export default function Prodi() {
  const handleKnowledgeDatabase = () => {
    window.location.replace("/daftar_pustaka");
  };

  const slidesData = [
    {
      title: "Program Studi Teknik Produksi Dan Proses Manufaktur",
      subtitle:
        "“Sistem Manajemen Pengetahuan ini akan membantu Anda belajar lebih efisien. Mari kita mulai dengan menjelajahi fitur-fitur yang tersedia dengan mengakses menu yang disediakan.Tingkatkan efisiensi pembelajaran Anda dengan memanfaatkan Sistem Manajemen Pengetahuan yang dirancang untuk memudahkan akses ke berbagai informasi dan fitur yang relevan. ”",
      buttonText: "Knowledge Database",
      backgroundImage: backgroundP4,
      mascot: maskotP4,
    },
    {
      title: "Teknik Produksi dan Proses Manufaktur",
      subtitle:
        "Sistem Manajemen Pengetahuan ini akan membantu Anda belajar lebih efisien. Mari kita mulai dengan menjelajahi fitur-fitur yang tersedia dengan mengakses menu yang disediakan.Tingkatkan efisiensi pembelajaran Anda dengan memanfaatkan Sistem Manajemen Pengetahuan yang dirancang untuk memudahkan akses ke berbagai informasi dan fitur yang relevan. ”",
      buttonText: "Knowledge Database",
      backgroundImage: backgroundTPM,
      mascot: maskotTPM,
    },
    {
      title: "Manajemen Informatika",
      subtitle:
        "Sistem Manajemen Pengetahuan ini akan membantu Anda belajar lebih efisien. Mari kita mulai dengan menjelajahi fitur-fitur yang tersedia dengan mengakses menu yang disediakan.Tingkatkan efisiensi pembelajaran Anda dengan memanfaatkan Sistem Manajemen Pengetahuan yang dirancang untuk memudahkan akses ke berbagai informasi dan fitur yang relevan. ”",
      buttonText: "Knowledge Database",
      backgroundImage: backgroundMI,
      mascot: maskotMI,
    },
    {
      title: "Mesin Otomotif",
      subtitle:
        "Sistem Manajemen Pengetahuan ini akan membantu Anda belajar lebih efisien. Mari kita mulai dengan menjelajahi fitur-fitur yang tersedia dengan mengakses menu yang disediakan.Tingkatkan efisiensi pembelajaran Anda dengan memanfaatkan Sistem Manajemen Pengetahuan yang dirancang untuk memudahkan akses ke berbagai informasi dan fitur yang relevan. ”",
      buttonText: "Knowledge Database",
      backgroundImage: backgroundMO,
      mascot: maskotMO,
    },
    {
      title: "Mekatronika",
      subtitle:
        "“Sistem Manajemen Pengetahuan ini akan membantu Anda belajar lebih efisien. Mari kita mulai dengan menjelajahi fitur-fitur yang tersedia dengan mengakses menu yang disediakan.Tingkatkan efisiensi pembelajaran Anda dengan memanfaatkan Sistem Manajemen Pengetahuan yang dirancang untuk memudahkan akses ke berbagai informasi dan fitur yang relevan. ”",
      buttonText: "Knowledge Database",
      backgroundImage: backgroundMK,
      mascot: maskotMK,
    },
    {
      title: "Teknologi Konstruksi Bangunan Gedung",
      subtitle:
        "“Sistem Manajemen Pengetahuan ini akan membantu Anda belajar lebih efisien. Mari kita mulai dengan menjelajahi fitur-fitur yang tersedia dengan mengakses menu yang disediakan.Tingkatkan efisiensi pembelajaran Anda dengan memanfaatkan Sistem Manajemen Pengetahuan yang dirancang untuk memudahkan akses ke berbagai informasi dan fitur yang relevan. ”",
      buttonText: "Knowledge Database",
      backgroundImage: backgroundTKBG,
      mascot: maskotTKBG,
    },
    {
      title: "Teknologi Rekayasa Pemeliharaan Alat Berat",
      subtitle:
        "“Sistem Manajemen Pengetahuan ini akan membantu Anda belajar lebih efisien. Mari kita mulai dengan menjelajahi fitur-fitur yang tersedia dengan mengakses menu yang disediakan.Tingkatkan efisiensi pembelajaran Anda dengan memanfaatkan Sistem Manajemen Pengetahuan yang dirancang untuk memudahkan akses ke berbagai informasi dan fitur yang relevan. ”",
      buttonText: "Knowledge Database",
      backgroundImage: backgroundTRPAB,
      mascot: maskotTRPAB,
    },
    {
      title: "Teknologi Rekayasa Logistik",
      subtitle:
        "“Sistem Manajemen Pengetahuan ini akan membantu Anda belajar lebih efisien. Mari kita mulai dengan menjelajahi fitur-fitur yang tersedia dengan mengakses menu yang disediakan.Tingkatkan efisiensi pembelajaran Anda dengan memanfaatkan Sistem Manajemen Pengetahuan yang dirancang untuk memudahkan akses ke berbagai informasi dan fitur yang relevan. ”",
      buttonText: "Knowledge Database",
      backgroundImage: backgroundTRL,
      mascot: maskotTRL,
    },
    {
      title: "Teknologi Rekayasa Perangkat Lunak",
      subtitle:
        "“Sistem Manajemen Pengetahuan ini akan membantu Anda belajar lebih efisien. Mari kita mulai dengan menjelajahi fitur-fitur yang tersedia dengan mengakses menu yang disediakan.Tingkatkan efisiensi pembelajaran Anda dengan memanfaatkan Sistem Manajemen Pengetahuan yang dirancang untuk memudahkan akses ke berbagai informasi dan fitur yang relevan. ”",
      buttonText: "Knowledge Database",
      backgroundImage: backgroundTRPL,
      mascot: maskotTRPL,
    },
  ];

  const settings = {
    dots: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 1300,
  };

  return (
    <>
      <AnimatedSection>
        <div className="slider-container">
          <Slider {...settings}>
            {slidesData.map((slide, index) => (
              <div key={index} className="slide">
                <div
                  className="content-wrapper"
                  style={{
                    backgroundImage: `url(${slide.backgroundImage})`,
                    height: "100vh",
                  }}
                >
                  <div className="text-content">
                    <h1>{slide.title}</h1>
                    <p>{slide.subtitle}</p>
                    <button
                      className="action-button"
                      onClick={handleKnowledgeDatabase}
                    >
                      {slide.buttonText}
                    </button>
                  </div>
                  <div className="mascot">
                    <img src={slide.mascot} alt="Mascot" />
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        <section
          className="sec4"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <h4
            style={{
              textAlign: "center",
              color: "white",
              paddingTop: "60px",
              fontWeight: "bold",
            }}
          >
            Penasaran dengan kampus ASTRAtech?
          </h4>
          <p style={{ textAlign: "center", color: "white" }} className="mt-4">
            ASTRAtech adalah value chain industri untuk penyediaan SDM unggul
            sekaligus kontribusi sosial mencerdaskan Bangsa. ASTRAtech memiliki
            banyak program studi yang memenuhi kebutuhan industri untuk melatih
            peserta didik dalam lingkungan kerja.
          </p>
          <div style={{ textAlign: "center" }}>
            <button
              style={{
                border: "none",
                padding: "15px",
                borderRadius: "10px",
                backgroundColor: "white",
                color: "#0A5EA8",
                fontWeight: "600",
              }}
            >
              Tentang ASTRAtech
            </button>
          </div>
          <div style={{ textAlign: "center", marginTop: "auto" }}>
            <img src={iconAstra} alt="Icon ASTRA" />
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection>
        <section className="sec5">
          <div className="company">
            <div className="perusahaan">
              <h3 style={{ color: "#0A5EA8", fontWeight: "700" }}>
                P-KNOW telah bekerja sama dengan Perusahaan ASTRA yang tersebar
                diseluruh Indonesia
              </h3>
              <p>
                P-KNOW adalah platform pendidikan teknologi yang diciptakan oleh
                kampus ASTRAtech untuk menyediakan konten pembelajaran
                keterampilan digital dengan metode “blended-learning”.
              </p>
              <h4>Partner Perusahaan yang Bekerja Sama dengan ASTRAtech</h4>
              <img src={perusahaan} alt="Perusahaan ASTRA" />
              <div className="mt-3">
                <button
                  style={{
                    borderRadius: "10px",
                    backgroundColor: "#0A5EA8",
                    color: "white",
                  }}
                >
                  Lihat Selengkapnya
                </button>
              </div>
            </div>
            <div
              className="logoAstratech"
              style={{ marginTop: "90px", marginRight: "100px" }}
            >
              <img src={logo} alt="Logo ASTRAtech" width="300px" />
            </div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection>
        <section className="sec6">
          <div className="ucapan2">
            <h3>Strategic Talent Development</h3>
            <h1>Build Your Talent, Expand Your Growth</h1>
            <p>
              Unlock your organizations full potential through our comprehensive
              talent development ecosystem. We architect customized growth
              frameworks that align individual capabilities.
            </p>
          </div>

          <div className="imgMaskot">
            <img
              className="maskot"
              src={maskotBoyGirl}
              alt="Ilustrasi Cewek VR"
            />
          </div>
        </section>
      </AnimatedSection>
    </>
  );
}
