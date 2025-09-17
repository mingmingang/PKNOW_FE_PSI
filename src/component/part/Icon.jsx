export default function Icon({ type = "Bold", name, cssClass = "", ...props }) {
  const iconClass =
    "fi fi-" + (type === "Bold" ? "b" : "r") + "r-" + name + " " + cssClass;

  return <i className={iconClass} {...props}></i>;
}
