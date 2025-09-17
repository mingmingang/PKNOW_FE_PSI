import React from "react";
import bgSertifikat from "../../assets/bgSertifikat.png";

const Certificate = React.forwardRef(({ nama, skorQuiz, program }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        width: "2000px",
        height: "1414px",
        position: "absolute",
        textAlign: "center",
        fontFamily: "'Open Sauce', sans-serif",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "2000px",
          height: "1414px",
          backgroundImage: `url(${bgSertifikat})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "100px",
          color: "#033a7e",
        }}
      >
        <h2
          style={{
            fontFamily: "'TAN Headline', serif",
            fontSize: "80pt",
            fontWeight: "bold",
            paddingTop: "160px",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          {nama}
        </h2>

        <h3
          style={{
            fontFamily: "'Open Sauce', sans-serif",
            fontSize: "42.8pt",
            fontWeight: "bold",
            marginTop: "60px",
          }}
        >
          {program}
        </h3>

        <p
          style={{
            fontSize: "22pt",
            marginBottom: "40px",
            color: "#12116a",
          }}
        >
          Skor Quiz: <strong>{skorQuiz}</strong>
        </p>

        <p
          style={{
            fontSize: "20.4pt",
            maxWidth: "1500px",
            margin: "0 auto 20px auto",
            lineHeight: "1.5",
            color: "#12116a",
          }}
        >
          Sertifikat ini diberikan sebagai bentuk apresiasi kepada{" "}
          <strong>{nama}</strong> atas partisipasinya dalam program pelatihan{" "}
          <strong>{program}</strong> yang diselenggarakan oleh ASTRAtech melalui
          platform P-KNOW. <br />
          Sertifikat ini ditandatangani secara elektronik oleh pihak
          penyelenggara.
        </p>

        <p
          style={{
            fontSize: "20pt",
            color: "#12116a",
          }}
        >
          {new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
});

export default Certificate;
