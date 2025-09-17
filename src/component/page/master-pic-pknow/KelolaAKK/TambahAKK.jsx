import DetailKK from "../../../part/DetailAKK";
import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

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

export default function LihatAKK({ onChangePage, withID }) {
  return (
    <div className="">
      <main>
        <AnimatedSection>
          <DetailKK
            title="Andorid Developer"
            deskripsi="Pengembang Android adalah profesional yang membuat aplikasi yang dapat digunakan pada smartphone atau tablet, baik dalam bentuk permainan maupun aplikasi lain yang memiliki berbagai fungsi. Mereka menggunakan bahasa pemrograman seperti Java atau Kotlin serta lingkungan pengembangan Android Studio untuk membangun aplikasi yang kompatibel dengan perangkat Android.
                    Selain itu, pengembang Android bertanggung jawab untuk memastikan aplikasi yang mereka buat berjalan dengan lancar, aman, dan sesuai dengan kebutuhan pengguna. Mereka juga sering melakukan pemeliharaan dan pembaruan aplikasi untuk meningkatkan fungsionalitas serta memperbaiki bug yang ditemukan setelah aplikasi dirilis."
            prodi="Manajemen Informatika"
            pic="Arie Kusumawati"
            withID={withID}
            onChangePage={onChangePage}
          />
        </AnimatedSection>
      </main>
    </div>
  );
}
