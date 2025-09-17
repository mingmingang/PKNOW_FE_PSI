import { useEffect, useState } from "react";
import "../../style/Loading.css";

const Loading = ({ timeout = 3000 }) => {
  const [isTimeout, setIsTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimeout(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout]);

  return (
    <div className="loading-spinner">
      {isTimeout ? (
        <div className="timeout-message">
          <span>Loading took longer than expected...</span>
        </div>
      ) : (
        <div className="spinner"></div>
      )}
    </div>
  );
};

export default Loading;
