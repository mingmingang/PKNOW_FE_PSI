import { useEffect } from "react";
import Icon from "../part/Icon";

let active_menu;
const activeURL = location.protocol + "//" + location.host + location.pathname;
function setActiveMenu(menu) {
  active_menu = menu;
}

export default function Menu({ listMenu }) {
  useEffect(() => {
    if (document.getElementById("spanMenu")) {
      document.getElementById("spanMenu").innerHTML = active_menu;
    }
  }, [listMenu]);

  return (
    <nav>
      {listMenu.map((menu) => {
        if (activeURL === menu["link"]) setActiveMenu(menu["head"]);
        if (!menu.isHidden) {
          return (
            <div key={"#menucollapse" + menu["headkey"]}>
              <a
                className="text-decoration-none text-black fw-bold"
                data-bs-toggle={menu["link"] === "#" ? "collapse" : ""}
                href={
                  menu["link"] === "#"
                    ? "#menucollapse" + menu["headkey"]
                    : menu["link"]
                }
              >
                <div
                  className={
                    "w-100 px-4 py-2 d-flex" +
                    (activeURL === menu["link"] ? " bg-primary text-white" : "")
                  }
                >
                  <Icon
                    type="Bold"
                    name={checkIcon(menu["head"])}
                    cssClass="me-2"
                    style={{ marginTop: "2px" }}
                  />
                  <span>{menu["head"]}</span>
                </div>
              </a>
              <div
                className="collapse show"
                id={"menucollapse" + menu["headkey"]}
              >
                {menu["sub"].map((sub) => {
                  if (activeURL === sub["link"]) {
                    setActiveMenu(menu["head"] + " - " + sub["title"]);
                  }
                  return (
                    <a
                      className="text-decoration-none text-black"
                      href={sub["link"]}
                      key={"#menucollapse" + menu["headkey"] + sub["link"]}
                    >
                      <div
                        className={
                          "w-100 pe-4 py-1 d-flex fw-medium" +
                          (activeURL === sub["link"]
                            ? " bg-primary text-white"
                            : "")
                        }
                        style={{ paddingLeft: "45px" }}
                      >
                        <Icon name="minus-small" cssClass="me-2 mt-1" />
                        <span>{sub["title"]}</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          );
        }
      })}
    </nav>
  );
}
