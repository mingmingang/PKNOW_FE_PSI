import "../../style/Alert.css";

export default function Alert({ type, message }) {
  return (
    <div className={`alert-${type} custom-alerting`} role="alert">
      {message}
    </div>
  );
}
