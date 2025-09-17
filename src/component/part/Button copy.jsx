import Icon from "./Icon";
import "../../style/Button.css";

export default function Button({
  classType = "custom-button",
  iconName,
  label = "",
  title = "",
  type = "button",
  isDisabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      className={"btn btn-" + classType}
      {...props}
      title={title}
      disabled={isDisabled}
    >
      {iconName && (
        <Icon
          name={iconName}
          cssClass={label === "" ? undefined : "pe-2"}
          style={{ marginTop: "5px" }}
        />
      )}
      {label}
    </button>
  );
}
