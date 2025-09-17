import BerandaPengguna from "../../backbone/BerandaPengguna";
import backgroundPengguna from "../../../assets/backgroundPengguna.png";
import maskotUser from "../../../assets/MaskotTenagaKependidikan.png";

export default function TenagaKependidikan() {
  return (
    <div className="">
      <main>
        <BerandaPengguna
          backgroundPengguna={backgroundPengguna}
          maskotUser={maskotUser}
          paddingTop="39vh"
          width="10%"
          marginLeft="-180px"
        />
      </main>
    </div>
  );
}
