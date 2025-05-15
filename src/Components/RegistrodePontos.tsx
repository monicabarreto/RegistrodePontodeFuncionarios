import { useState, useRef, useEffect } from "react";

interface Registro {
  hora: string;
  foto: string | null;
  nome: string;
}

const NOME_REGISTROS = [
  "Entrada do Funcionário",
  "Saída para o Intervalo",
  "Entrada do Intervalo",
  "Fim do Expediente",
];

const Ponto = () => {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [fotoVisivel, setFotoVisivel] = useState<number | null>(null);
  const cameraRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isCameraActive) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          streamRef.current = stream;
          if (cameraRef.current) {
            cameraRef.current.srcObject = stream;
          }
        })
        .catch((error) => {
          console.error("Erro ao acessar a câmera: ", error);
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
    // Cleanup quando o componente desmontar
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraActive]);

  const capturarFoto = () => {
    const video = cameraRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");

    registrarPonto(dataUrl);
  };

  const registrarPonto = (fotoCapturada: string) => {
    if (registros.length >= 4) {
      alert("Você atingiu o limite de 4 registros por dia!");
      setIsCameraActive(false);
      return;
    }

    const horaAtual = new Date().toLocaleTimeString();
    const nome = NOME_REGISTROS[registros.length] || "Registro";

    setRegistros((prev) => [
      ...prev,
      {
        hora: horaAtual,
        foto: fotoCapturada,
        nome,
      },
    ]);
    setIsCameraActive(false);
  };

  const abrirCamera = () => setIsCameraActive(true);

  const toggleFoto = (index: number) =>
    setFotoVisivel((prev) => (prev === index ? null : index));

  const calcularHorasTrabalhadas = () => {
    if (registros.length < 4) return "--:--";

    // Convertendo para UTC para evitar problemas de timezone
    const parseHora = (hora: string) =>
      new Date(`1970-01-01T${hora}Z`).getTime();

    const [entrada, saidaIntervalo, entradaIntervalo, fimExpediente] = registros.map(
      (r) => parseHora(r.hora)
    );

    const tempoTrabalhado = entradaIntervalo - entrada + fimExpediente - saidaIntervalo;
    const horas = Math.floor(tempoTrabalhado / 3600000);
    const minutos = Math.floor((tempoTrabalhado % 3600000) / 60000);
    const segundos = Math.floor((tempoTrabalhado % 60000) / 1000);

    return `${horas}h ${minutos}m ${segundos}s`;
  };

 return (
  <div
    className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-green-200 px-4 pt-20"
    style={{ paddingTop: 80 }} // 80px só para garantir mais espaço que navbar
  >
    <div
      className="w-full max-w-4xl bg-blue-700 bg-opacity-90 rounded-2xl shadow-2xl p-8 font-sans"
      style={{ minHeight: 580 }}
    >
      
      <div className="text-white mb-6 px-2 text-center">
        <h2 className="text-3xl font-bold mb-8 text-center text-white">
        Registro de Pontos
      </h2>
        <h3 className="text-base font-semibold">
          Data: {new Date().toLocaleDateString()}
        </h3>
       
      </div>

      {/* Container fixo para câmera / botão */}
      <div
        className="flex flex-col items-center justify-center mb-8 rounded-xl shadow-lg"
        style={{ width: 360, height: 300, margin: "0 auto" }}
      >
        {isCameraActive ? (
          <>
            <video
              ref={cameraRef}
              autoPlay
              width={320}
              height={240}
              className="rounded-lg shadow-md border border-gray-300"
            />
            <button
              onClick={capturarFoto}
              className="mt-4 px-8 py-2 bg-green-600 text-white font-semibold rounded-xl shadow-md transition hover:bg-green-700 hover:shadow-lg cursor-pointer"
            >
              Registrar
            </button>
          </>
        ) : (
          <button
            onClick={abrirCamera}
            className="px-8 py-2 bg-green-600 text-white font-semibold rounded-xl shadow-md transition hover:bg-blue-700 hover:shadow-lg cursor-pointer"
            style={{ height: 56, width: 320 }}
          >
            Registre seu ponto
          </button>
        )}
      </div>


      <div className="flex justify-center overflow-x-auto px-2">
        <table className="table-auto border-collapse mb-6 text-sm text-gray-800 bg-white rounded-lg shadow overflow-hidden min-w-[320px]">
          <thead>
            <tr className="bg-gray-300">
              <th className="border px-4 py-2">Hora</th>
              <th className="border px-4 py-2">Tipo</th>
              <th className="border px-4 py-2">Foto</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((registro, index) => (
              <tr key={index} className="text-center align-middle">
                <td className="border px-4 py-2">{registro.hora}</td>
                <td className="border px-4 py-2">{registro.nome}</td>
                <td className="border px-4 py-2">
                  {fotoVisivel === index && registro.foto && (
                    <img
                      src={registro.foto}
                      alt="Foto do ponto"
                      width={100}
                      className="mx-auto rounded shadow-md mb-2 border border-gray-300"
                    />
                  )}
                  <button
                    onClick={() => toggleFoto(index)}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded shadow transition hover:bg-blue-700 hover:shadow-lg cursor-pointer"
                  >
                    👁️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h4 className="text-right flex justify-center font-semibold mt-4 text-white">
        Horas Trabalhadas: {calcularHorasTrabalhadas()}
      </h4>
    </div>
  </div>
);

};

export default Ponto;
