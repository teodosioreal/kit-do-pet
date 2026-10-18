// Desenho de patinha usado nos ícones gerados (compatível com ImageResponse).
export function PawArt({ size }: { size: number }) {
  const u = size / 100;
  const toe = (left: number, top: number, w: number, h: number) => (
    <div
      style={{
        position: "absolute",
        left: left * u,
        top: top * u,
        width: w * u,
        height: h * u,
        borderRadius: "50%",
        background: "white",
      }}
    />
  );
  return (
    <div
      style={{
        width: size,
        height: size,
        background: "#f97316",
        display: "flex",
        position: "relative",
      }}
    >
      {toe(20, 30, 15, 20)}
      {toe(36, 18, 13, 19)}
      {toe(51, 18, 13, 19)}
      {toe(65, 30, 15, 20)}
      {toe(31, 46, 38, 32)}
    </div>
  );
}
