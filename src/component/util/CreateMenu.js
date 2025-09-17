import { ROOT_LINK, API_LINK, APPLICATION_ID } from "./Constants";
import UseFetch from "./UseFetch";

const CreateMenu = async (role, prodi) => {
  try {

    const data = await UseFetch(API_LINK + "Utilities/GetListMenu", {
      username: "",
      role: role,
      application: APPLICATION_ID,
      prodi : prodi
    });

    console.log("data menuuuus", {
      username: "",
      role: role,
      application: APPLICATION_ID,
      prodi : prodi
    })

    let lastHeadkey = "";
    const transformedMenu = [
      {
        head: "Notifikasi",
        headkey: "notifikasi",
        link: ROOT_LINK + "notifications",
        sub: [],
        isHidden: true,
      },
    ];

    data.forEach((item) => {
      if (item.parent === null || item.link === "#") {
        lastHeadkey = item.nama.toLowerCase().replace(/\s/g, "_");
        transformedMenu.push({
          head: item.nama,
          headkey: lastHeadkey,
          link: item.link === "#" ? item.link : ROOT_LINK +  item.link,
          sub: [],
        });
      } else {
        const parent = transformedMenu.find(
          (item) => item.headkey === lastHeadkey
        );
        if (parent) {
          parent.sub.push({
            title: item.nama,
            link:
              item.link === "lj_create"
                ? "https://www.ljcreatelms.com/"
                : ROOT_LINK +  item.link,
          });
        }
      }
    });    
    return transformedMenu;
  } catch (error) {
    console.error("Error occurred while fetching the menu:", error);
    return [];
  }
};

export default CreateMenu;
