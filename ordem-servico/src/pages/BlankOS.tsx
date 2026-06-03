import { useState } from "react";
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
  const [numero, setNumero] = useState(getNextNumber);

  const handlePrint = () => {
    incrementCounter(numero);
    setNumero(numero + 1);
    window.print();
  };

  const line = "border-b border-black w-full";
  const cell = "border border-black px-2 py-1 text-[10px] leading-tight";
  const cellBold = "border border-black px-2 py-1 text-[10px] font-bold bg-gray-100 leading-tight";

  const label = "font-bold text-[11px]";

  return (
    <div>
      <div className="no-print mb-4 flex gap-3 items-center">
        <button onClick={handlePrint} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 min-h-[44px]">
          <Printer className="h-4 w-4" /> Imprimir OS Nº {numero}
        </button>
        <span className="text-sm text-slate-500">Após imprimir, o número avança automaticamente.</span>
      </div>

      <style>{`
        @page { size: A4; margin: 12mm 10mm; }
        @media print {
          body * { visibility: hidden; }
          #blank-os-print, #blank-os-print * { visibility: visible; }
          #blank-os-print { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; border: none; box-shadow: none; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div id="blank-os-print" className="bg-white" style={{ width: "190mm", margin: "0 auto" }}>
        <table className="w-full border-collapse">
          {/* Cabeçalho */}
          <tr>
            <td colSpan={7} className="border border-black p-1">
              <table className="w-full">
                <tr>
                  <td className="w-24 p-1 align-middle">
                    <img src="/logo.png" alt="Raitz" className="h-10 object-contain" />
                  </td>
                  <td className="text-base font-bold text-center align-middle">ORDEM DE SERVIÇO</td>
                  <td className="w-24 p-1 text-right align-middle">
                    <span className="text-base font-bold">Nº {numero}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          {/* Motivo */}
          <tr>
            <td colSpan={7} className="border border-black p-1">
              <span className={label}>Motivo:</span>
              <div className={line} />
            </td>
          </tr>

          {/* Tipo de serviço */}
          <tr>
            <td colSpan={7} className="border border-black p-1">
              <span className={label}>Tipo de serviço:</span>
              <span className="ml-2 text-[11px]"><input type="checkbox" /> Corretiva</span>
              <span className="ml-2 text-[11px]"><input type="checkbox" /> Preventiva</span>
              <span className="ml-2 text-[11px]"><input type="checkbox" /> Melhoria</span>
              <span className="ml-2 text-[11px]"><input type="checkbox" /> Predial</span>
            </td>
          </tr>

          {/* Descrição do equipamento */}
          <tr>
            <td colSpan={7} className="border border-black p-1">
              <span className={label}>Descrição do equipamento:</span>
              <div className={`${line} min-h-[18px]`} />
              <div className={`${line} min-h-[18px]`} />
            </td>
          </tr>

          {/* Descrição do serviço a ser realizado */}
          <tr>
            <td colSpan={7} className="border border-black p-1">
              <span className={label}>Descrição do serviço a ser realizado:</span>
              <div className={`${line} min-h-[18px]`} />
              <div className={`${line} min-h-[18px]`} />
            </td>
          </tr>

          {/* Descrição do serviço realizado */}
          <tr>
            <td colSpan={7} className="border border-black p-1">
              <span className={label}>Descrição do serviço realizado:</span>
              <div className={`${line} min-h-[18px]`} />
              <div className={`${line} min-h-[18px]`} />
              <div className={`${line} min-h-[18px]`} />
              <div className={`${line} min-h-[18px]`} />
            </td>
          </tr>

          {/* Solicitante / Turno */}
          <tr>
            <td colSpan={4} className="border border-black p-1">
              <span className={label}>Solicitante:</span>
              <div className={`${line} min-h-[18px]`} />
            </td>
            <td colSpan={3} className="border border-black p-1">
              <span className={label}>Turno:</span>
              <div className={`${line} min-h-[18px]`} />
            </td>
          </tr>

          {/* Datas */}
          <tr>
            <td colSpan={2} className={cellBold}>Início da ocorrência</td>
            <td colSpan={2} className={cellBold}>Início do conserto</td>
            <td colSpan={2} className={cellBold}>Fim do conserto</td>
            <td colSpan={1} className={cellBold}>Fim da ocorrência</td>
          </tr>
          <tr>
            <td colSpan={2} className="border border-black p-1 text-[10px]">
              Data: <span className="inline-block border-b border-black w-14 ml-1" />&nbsp;
              Hora: <span className="inline-block border-b border-black w-10 ml-1" />
            </td>
            <td colSpan={2} className="border border-black p-1 text-[10px]">
              Data: <span className="inline-block border-b border-black w-14 ml-1" />&nbsp;
              Hora: <span className="inline-block border-b border-black w-10 ml-1" />
            </td>
            <td colSpan={2} className="border border-black p-1 text-[10px]">
              Data: <span className="inline-block border-b border-black w-14 ml-1" />&nbsp;
              Hora: <span className="inline-block border-b border-black w-10 ml-1" />
            </td>
            <td colSpan={1} className="border border-black p-1 text-[10px]">
              Data: <span className="inline-block border-b border-black w-8 ml-1" />&nbsp;
              Hora: <span className="inline-block border-b border-black w-8 ml-1" />
            </td>
          </tr>

          {/* Técnico / Líder */}
          <tr>
            <td colSpan={4} className="border border-black p-1">
              <span className={label}>Técnico Responsável:</span>
              <div className={`${line} min-h-[18px]`} />
            </td>
            <td colSpan={3} className="border border-black p-1">
              <span className={label}>Líder Responsável:</span>
              <div className={`${line} min-h-[18px]`} />
            </td>
          </tr>

          {/* Assinaturas */}
          <tr>
            <td colSpan={4} className="border border-black p-1">
              <span className={label}>Ass:</span>
              <div className={`${line} min-h-[24px]`} />
            </td>
            <td colSpan={3} className="border border-black p-1">
              <span className={label}>Ass:</span>
              <div className={`${line} min-h-[24px]`} />
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
