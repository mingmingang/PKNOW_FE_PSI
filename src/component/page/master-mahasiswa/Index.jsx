import BerandaPengguna from "../../backbone/BerandaPengguna";
import backgroundPengguna from "../../../assets/backgroundPengguna.png";
import maskotUser from "../../../assets/maskotUser.png";

export default function Mahasiswa() {
  return (
    <div className="">
      <main>
        <BerandaPengguna
          backgroundPengguna={backgroundPengguna}
          maskotUser={maskotUser}
        />
      </main>
    </div>
  );
}
