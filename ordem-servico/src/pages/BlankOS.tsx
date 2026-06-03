import { useState, useRef } from "react";
import { Printer } from "lucide-react";

const COUNTER_KEY = "os:blank_os_counter";
const DEFAULT_START = 1071;

function getNextNumber(): number {
  const raw = localStorage.getItem(COUNTER_KEY);
  if (!raw) return DEFAULT_START;
  const num = parseInt(raw, 10);
  return isNaN(num) ? DEFAULT_START : num;
}

function incrementCounter(current: number) {
  localStorage.setItem(COUNTER_KEY, String(current + 1));
}

export function getBlankCounter(): number {
  return getNextNumber();
}

export function setBlankCounter(val: number) {
  localStorage.setItem(COUNTER_KEY, String(val));
}

export default function BlankOS() {
  const [numero] = useState(getNextNumber);
  const ref = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    incrementCounter(numero);
    window.print();
  };

  const line = "border-b border-black min-h-[28px] w-full";
  const cell = "border border-black px-2 py-1 text-xs";
  const cellBold = `border border-black px-2 py-1 text-xs font-bold bg-gray-100`;

  return (
    <div>
      <div className="no-print mb-4 flex gap-3 items-center">
        <button onClick={handlePrint} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 min-h-[44px]">
          <Printer className="h-4 w-4" /> Imprimir OS Nº {numero}
        </button>
        <span className="text-sm text-slate-500">Após imprimir, o número avança automaticamente.</span>
      </div>

      <div ref={ref} className="bg-white p-6 sm:p-8 shadow-sm border border-slate-200" style={{ maxWidth: "210mm", margin: "0 auto" }}>
        <table className="w-full border-collapse">
          {/* Cabeçalho */}
          <tr>
            <td colSpan={7} className="border border-black p-0">
              <table className="w-full">
                <tr>
                  <td className="w-24 p-1 align-middle">
                    <img src="/logo.png" alt="Raitz" className="h-10 object-contain" />
                  </td>
                  <td className="text-lg font-bold text-center align-middle">ORDEM DE SERVIÇO</td>
                  <td className="w-24 p-1 text-right align-middle">
                    <span className="text-lg font-bold">Nº {numero}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          {/* Motivo */}
          <tr>
            <td colSpan={7} className="border border-black p-1">
              <span className="font-bold text-sm">Motivo:</span>
              <div className={line} />
            </td>
          </tr>

          {/* Tipo de serviço */}
          <tr>
            <td colSpan={7} className="border border-black p-1">
              <span className="font-bold text-sm">Tipo de serviço:</span>
              <span className="ml-2 text-sm"> <input type="checkbox" /> Corretiva</span>
              <span className="ml-2 text-sm"> <input type="checkbox" /> Preventiva</span>
              <span className="ml-2 text-sm"> <input type="checkbox" /> Melhoria</span>
              <span className="ml-2 text-sm"> <input type="checkbox" /> Predial</span>
            </td>
          </tr>

          {/* Descrição do equipamento */}
          <tr>
            <td colSpan={7} className="border border-black p-1">
              <span className="font-bold text-sm">Descrição do equipamento:</span>
              <div className={line} />
              <div className={line} />
            </td>
          </tr>

          {/* Descrição do serviço a ser realizado */}
          <tr>
            <td colSpan={7} className="border border-black p-1">
              <span className="font-bold text-sm">Descrição do serviço a ser realizado:</span>
              <div className={line} />
              <div className={line} />
            </td>
          </tr>

          {/* Descrição do serviço realizado */}
          <tr>
            <td colSpan={7} className="border border-black p-1">
              <span className="font-bold text-sm">Descrição do serviço realizado:</span>
              <div className={line} />
              <div className={line} />
              <div className={line} />
              <div className={line} />
            </td>
          </tr>

          {/* Solicitante / Turno */}
          <tr>
            <td colSpan={4} className="border border-black p-1">
              <span className="font-bold text-sm">Solicitante:</span>
              <div className={line} />
            </td>
            <td colSpan={3} className="border border-black p-1">
              <span className="font-bold text-sm">Turno:</span>
              <div className={line} />
            </td>
          </tr>

          {/* Datas */}
          <tr>
            <td colSpan={2} className="border border-black p-1 text-sm font-bold">Início da ocorrência</td>
            <td colSpan={2} className="border border-black p-1 text-sm font-bold">Início do conserto</td>
            <td colSpan={2} className="border border-black p-1 text-sm font-bold">Fim do conserto</td>
            <td colSpan={1} className="border border-black p-1 text-sm font-bold">Fim da ocorrência</td>
          </tr>
          <tr>
            <td colSpan={2} className="border border-black p-1">
              <span className="text-xs">Data:</span><div className="inline-block border-b border-black w-16 ml-1 h-4" />
              <span className="text-xs ml-2">Hora:</span><div className="inline-block border-b border-black w-12 ml-1 h-4" />
            </td>
            <td colSpan={2} className="border border-black p-1">
              <span className="text-xs">Data:</span><div className="inline-block border-b border-black w-16 ml-1 h-4" />
              <span className="text-xs ml-2">Hora:</span><div className="inline-block border-b border-black w-12 ml-1 h-4" />
            </td>
            <td colSpan={2} className="border border-black p-1">
              <span className="text-xs">Data:</span><div className="inline-block border-b border-black w-16 ml-1 h-4" />
              <span className="text-xs ml-2">Hora:</span><div className="inline-block border-b border-black w-12 ml-1 h-4" />
            </td>
            <td colSpan={1} className="border border-black p-1">
              <span className="text-xs">Data:</span><div className="inline-block border-b border-black w-12 ml-1 h-4" />
              <span className="text-xs ml-1">Hora:</span><div className="inline-block border-b border-black w-10 ml-1 h-4" />
            </td>
          </tr>

          {/* Técnico / Líder */}
          <tr>
            <td colSpan={4} className="border border-black p-1">
              <span className="font-bold text-sm">Técnico Responsável:</span>
              <div className={line} />
            </td>
            <td colSpan={3} className="border border-black p-1">
              <span className="font-bold text-sm">Líder Responsável:</span>
              <div className={line} />
            </td>
          </tr>

          {/* Assinaturas */}
          <tr>
            <td colSpan={4} className="border border-black p-1">
              <span className="font-bold text-sm">Ass:</span>
              <div className={line} />
            </td>
            <td colSpan={3} className="border border-black p-1">
              <span className="font-bold text-sm">Ass:</span>
              <div className={line} />
            </td>
          </tr>

          {/* Rodapé - cabeçalho da tabela */}
          <tr>
            <td className={cellBold}>Código</td>
            <td className={cellBold}>Planta</td>
            <td className={cellBold}>Revisão</td>
            <td className={cellBold}>Data</td>
            <td className={cellBold}>Criador</td>
            <td className={cellBold}>Aprovador</td>
            <td className={cellBold}>Setor</td>
          </tr>

          {/* Rodapé - valores */}
          <tr>
            <td className={cell}>&nbsp;</td>
            <td className={cell}>&nbsp;</td>
            <td className={cell}>&nbsp;</td>
            <td className={cell}>&nbsp;</td>
            <td className={cell}>&nbsp;</td>
            <td className={cell}>&nbsp;</td>
            <td className={cell}>&nbsp;</td>
          </tr>
        </table>
      </div>
    </div>
  );
}
