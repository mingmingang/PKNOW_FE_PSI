import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import ceweVR from "../../assets/ceweVR_beranda.png";
import cowoTop from "../../assets/cowoTop_beranda.png";
import "../../style/Beranda.css";
import logo from "../../assets/logo.png";
import perusahaan from "../../assets/perusahaan.png";
import iconAstra from "../../assets/iconAstra.png";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../../style/Slider.css";
import maskotBoyGirl from "../../assets/maskotAstraBoyGirl.png";

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

export default function BerandaUtama() {
  const handleKnowledgeDatabase = () => {
    window.location.replace("/daftar_pustaka");
  };

  return (
    <div>
      <AnimatedSection>
        <section className="sec1">
          <div className="ucapan">
            <h3>Selamat Datang di</h3>
            <h1>Politeknik Astra Knowledge Novelty & Wisdom</h1>
            <p>
              “Sistem Manajemen Pengetahuan ini akan membantu Anda belajar lebih
              efisien. Mari kita mulai dengan menjelajahi fitur-fitur yang
              tersedia dengan mengakses menu yang disediakan.”
            </p>
            <button onClick={handleKnowledgeDatabase}>
              Knowledge Database
            </button>
          </div>

          <div className="imgDatang">
            <img className="ceweVR" src={ceweVR} alt="Ilustrasi Cewek VR" />
            <img className="cowoTop" src={cowoTop} alt="Ilustrasi Cowok" />
          </div>
        </section>
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

      <AnimatedSection delay={0.4}>
        <section className="sec5 mb-4">
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
              <img
                src={perusahaan}
                alt="Perusahaan ASTRA"
                className="cmp_astra"
              />
              <div className="mt-4">
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
            <div className="logoAstratech">
              <img src={logo} alt="Logo ASTRAtech" width="300px" />
            </div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection delay={0.6}>
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
              className="maskot2"
              src={maskotBoyGirl}
              alt="Ilustrasi Cewek VR"
            />
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
