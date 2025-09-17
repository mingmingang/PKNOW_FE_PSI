import "../../style/Alert.css";

export default function Alert({ type, message }) {
  return (
    <div className={`alert alert-${type} custom-alert`} role="alert">
      {message}
    </div>
  );
}
