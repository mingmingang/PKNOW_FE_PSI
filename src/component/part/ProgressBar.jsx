const ProgressBar = ({ progress }) => {
  const progressBarContainerStyle = {
    width: "100%",
    backgroundColor: "#D0EBFF",
    borderRadius: "5px",
    overflow: "hidden",
    height: "10px",
    margin: "10px 0",
  };

  const progressBarStyle = {
    height: "100%",
    backgroundColor: "#3380FF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "width 0.5s ease-in-out",
    width: `${progress}%`,
    borderRadius: "5px",
    color: "#fff",
    fontSize: "12px",
  };

  return (
    <div style={progressBarContainerStyle}>
      <div style={progressBarStyle}></div>
    </div>
  );
};

export default ProgressBar;
