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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-green-200 px-4">
      <div className="w-full max-w-4xl bg-green-500 bg-opacity-90 rounded-2xl shadow-2xl p-6 font-sans">
        <h2 className="text-3xl font-bold mb-6 text-center text-white p-5">
          Registro de Pontos
        </h2>

        {isCameraActive ? (
          <div className="text-center mb-6">
            <video
              ref={cameraRef}
              autoPlay
              width={320}
              height={240}
              className="mx-auto rounded-lg shadow-lg"
            />
            <button
              className="mt-4 px-6 py-2 text-white font-semibold bg-green-600 rounded-xl shadow-md hover:bg-green-700 hover:shadow-lg transition"
              onClick={capturarFoto}
            >
              Registrar
            </button>
          </div>
        ) : (
          <div className="text-center mb-6">
            <button
              className="px-6 py-2 text-black font-semibold bg-gradient-to-r from-pink-500 to-blue-500 rounded-xl shadow-md hover:shadow-lg transition"
              onClick={abrirCamera}
            >
              Registre seu ponto
            </button>
          </div>
        )}

        <div className="text-white mb-4">
          <h3 className="text-base font-semibold">
            Data: {new Date().toLocaleDateString()}
          </h3>
          <h3 className="text-base font-semibold mb-2">Registro de Ponto</h3>
        </div>

        <div className="flex justify-center overflow-x-auto">
          <table className="table-auto border-collapse mb-4 text-sm text-gray-800 bg-white rounded shadow overflow-hidden min-w-[320px]">
            <thead>
              <tr className="bg-gray-200">
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
                        className="mx-auto rounded shadow-md mb-2"
                      />
                    )}
                    <button
                      className="px-3 py-1 text-xs bg-gradient-to-r from-purple-400 to-indigo-500 rounded shadow hover:shadow-md transition"
                      onClick={() => toggleFoto(index)}
                    >
                      👁️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h4 className="text-right font-semibold mt-4 text-white">
          Horas Trabalhadas: {calcularHorasTrabalhadas()}
        </h4>
      </div>
    </div>
  );
};

export default Ponto;
