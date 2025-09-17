import DetailDaftarPustaka from "../../../part/DetailDaftarPustaka";

export default function LihatDaftarPustaka({ onChangePage, withID }) {
  return (
    <div className="">
      <main>
        <DetailDaftarPustaka
          onChangePage={onChangePage}
          withID={withID}
        ></DetailDaftarPustaka>
      </main>
    </div>
  );
}
