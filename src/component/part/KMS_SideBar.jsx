import { useState, useEffect } from "react";
import Button from "../part/Button copy";

export default function KMS_Sidebar({
  onChangePage,
  questionNumbers,
  selectedQuestion,
  setSelectedQuestion,
  answerStatus,
  checkMainContent,
  quizId,
  timeRemaining,
  setTimeRemaining,
  quizType,
}) {
  const [remainingTime, setRemainingTime] = useState(timeRemaining);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setTimeRemaining(true);
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  function exitReview() {
    if (quizType == "Pretest") {
      onChangePage("pretest", true, quizId);
    } else {
      onChangePage("posttest", true, quizId);
    }
  }

  return (
    <div className="ml-4 mt-4">
      {checkMainContent === "test" && (
        <div
          className=""
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            width: "240px",
            textAlign: "center",
            color: "#002B6C",
            fontWeight: "500",
          }}
        >
          <p className="">Waktu Tersisa: {formatTime(remainingTime)}</p>
        </div>
      )}

      <div
        className="grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "20px",
          padding: "20px",
          marginLeft: "-10px",
        }}
      >
        {[...Array(questionNumbers)].map((_, index) => (
          <button
            key={index}
            className={`box ${index + 1 === selectedQuestion ? "active" : ""}`}
            style={{
              border: "1px solid #87CCE9",
              borderRadius: "10px",
              padding: "15px",
              textAlign: "center",
              fontSize: "14px",
              cursor: "pointer",
              color:
                index + 1 === selectedQuestion
                  ? "white"
                  : answerStatus[index] === "correct"
                  ? "#1abc9c"
                  : answerStatus[index] === "incorrect"
                  ? "#e74c3c"
                  : answerStatus[index] === "none"
                  ? "black"
                  : answerStatus[index] === "answered"
                  ? "black"
                  : "black",

              backgroundColor:
                index + 1 === selectedQuestion
                  ? "#095DA8"
                  : answerStatus[index]
                  ? answerStatus[index] === "correct"
                    ? "#e9f7eb"
                    : answerStatus[index] === "incorrect"
                    ? "#ffe3e6"
                    : answerStatus[index] === "none"
                    ? "white"
                    : answerStatus[index] == "answered"
                    ? "#E7F5FB"
                    : "white"
                  : "white",
              borderColor:
                index + 1 === selectedQuestion
                  ? "#095DA8"
                  : answerStatus[index]
                  ? answerStatus[index] === "correct"
                    ? "#28a745"
                    : answerStatus[index] === "incorrect"
                    ? "#dc3545"
                    : answerStatus[index] === "none"
                    ? "lightgray"
                    : answerStatus[index] === "answered"
                    ? "#87CCE9"
                    : "lightgray"
                  : "lightgray",
            }}
            onClick={() => setSelectedQuestion(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {checkMainContent === "detail_test" && (
        <div className="mb-0 p-0 mx-auto" style={{ width: "90%" }}>
          <Button
            classType="py-2"
            style={{ backgroundColor: "red", color: "white" }}
            label="Keluar Review"
            onClick={exitReview}
          />
        </div>
      )}
    </div>
  );
}
