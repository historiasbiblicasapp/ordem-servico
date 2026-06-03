import { useState } from "react";
import { Printer } from "lucide-react";

const COUNTER_KEY = "os:blank_os_counter";
const COUNTER_START_KEY = "os:blank_os_counter_start";
const COUNTER_END_KEY = "os:blank_os_counter_end";
const DEFAULT_START = 1071;

function ensureStart(): void {
  if (!localStorage.getItem(COUNTER_START_KEY)) {
    localStorage.setItem(COUNTER_START_KEY, String(DEFAULT_START));
  }
  if (!localStorage.getItem(COUNTER_KEY)) {
    localStorage.setItem(COUNTER_KEY, localStorage.getItem(COUNTER_START_KEY)!);
  }
}

function getStartNumber(): number {
  ensureStart();
  const raw = localStorage.getItem(COUNTER_START_KEY);
  const num = parseInt(raw || String(DEFAULT_START), 10);
  return isNaN(num) ? DEFAULT_START : num;
}

function getEndNumber(): number {
  const raw = localStorage.getItem(COUNTER_END_KEY);
  if (!raw) return 999999;
  const num = parseInt(raw, 10);
  return isNaN(num) ? 999999 : num;
}

function getNextNumber(): number {
  ensureStart();
  const raw = localStorage.getItem(COUNTER_KEY);
  const num = parseInt(raw || localStorage.getItem(COUNTER_START_KEY)!, 10);
  return isNaN(num) ? getStartNumber() : num;
}

function incrementCounter(current: number) {
  const end = getEndNumber();
  if (current >= end) return;
  localStorage.setItem(COUNTER_KEY, String(current + 1));
}

export function getBlankCounter(): number {
  return getNextNumber();
}

export function setBlankCounter(val: number) {
  localStorage.setItem(COUNTER_KEY, String(val));
}

export function resetBlankCounter(): number {
  const start = getStartNumber();
  localStorage.setItem(COUNTER_KEY, String(start));
  return start;
}

const cellBold = "border border-black px-2 py-1 text-[10px] font-bold bg-gray-100 text-center";

export default function BlankOS() {
  const [numero, setNumero] = useState(getNextNumber);

  const handlePrint = () => {
    incrementCounter(numero);
    setNumero(numero + 1);
    window.print();
  };

  const label = "font-bold text-[11px]";
  const fieldLine = "border-b border-black w-full mt-1 min-h-[22px]";
  const section = "border border-black p-2";

  return (
    <div>
      <div className="no-print mb-4 flex gap-3 items-center">
        <button onClick={handlePrint} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 min-h-[44px]">
          <Printer className="h-4 w-4" /> Imprimir OS Nº {numero}
        </button>
        <span className="text-sm text-slate-500">Após imprimir, o número avança automaticamente.</span>
      </div>

      <style>{`
        @page { size: A4; margin: 8mm 10mm; }
        @media print {
          body * { visibility: hidden; }
          #blank-os-print, #blank-os-print * { visibility: visible; }
          #blank-os-print { position: absolute; left: 0; top: 0; width: 100%; height: auto; min-height: 279mm; margin: 0; padding: 0; border: none !important; box-shadow: none; box-sizing: border-box !important; }
          #blank-os-print, #blank-os-print * { box-sizing: border-box !important; }
          .no-print { display: none !important; }
          .print-grow { flex: 1; }
        }
        #blank-os-print { display: flex; flex-direction: column; }
      `}</style>

      <div id="blank-os-print" className="bg-white border border-black" style={{ width: "190mm" }}>

        {/* Cabeçalho: Logo + Título + Nº */}
        <div className="flex items-center border-b border-black">
          <div className="w-24 p-1"><img src="/logo.png" alt="Raitz" className="h-10 object-contain" /></div>
          <div className="flex-1 text-center text-base font-bold">ORDEM DE SERVIÇO</div>
          <div className="w-24 p-1 text-right text-base font-bold">Nº {numero}</div>
        </div>

        {/* Motivo */}
        <div className={section}>
          <span className={label}>Motivo:</span>
          <div className={fieldLine} />
        </div>

        {/* Tipo de serviço */}
        <div className={section}>
          <span className={label}>Tipo de serviço:</span>
          <div className="inline-flex gap-3 ml-2 text-[11px]">
            <span><input type="checkbox" /> Corretiva</span>
            <span><input type="checkbox" /> Preventiva</span>
            <span><input type="checkbox" /> Melhoria</span>
            <span><input type="checkbox" /> Predial</span>
          </div>
        </div>

        {/* Descrição do equipamento */}
        <div className={section}>
          <span className={label}>Descrição do equipamento:</span>
          <div className={fieldLine} />
          <div className={fieldLine} />
        </div>

        {/* Descrição do serviço a ser realizado */}
        <div className={section}>
          <span className={label}>Descrição do serviço a ser realizado:</span>
          <div className={fieldLine} />
          <div className={fieldLine} />
        </div>

        {/* Descrição do serviço realizado - usa espaço flexível */}
        <div className={`${section} flex-1 print-grow flex flex-col`}>
          <span className={label}>Descrição do serviço realizado:</span>
          <div className={fieldLine} />
          <div className={fieldLine} />
          <div className={fieldLine} />
          <div className={fieldLine} />
          <div className={fieldLine} />
          <div className="flex-1" />
        </div>

        {/* Solicitante / Turno */}
        <div className="flex border-b border-black border-l border-r">
          <div className="flex-1 border-r border-black p-2">
            <span className={label}>Solicitante:</span>
            <div className={fieldLine} />
          </div>
          <div className="w-36 p-2">
            <span className={label}>Turno:</span>
            <div className={fieldLine} />
          </div>
        </div>

        {/* Datas */}
        <div className="grid grid-cols-4 border-b border-black border-l border-r">
          <div className="border-r border-black p-1 text-[10px] font-bold bg-gray-100 text-center">Início da ocorrência</div>
          <div className="border-r border-black p-1 text-[10px] font-bold bg-gray-100 text-center">Início do conserto</div>
          <div className="border-r border-black p-1 text-[10px] font-bold bg-gray-100 text-center">Fim do conserto</div>
          <div className="p-1 text-[10px] font-bold bg-gray-100 text-center">Fim da ocorrência</div>
        </div>
        <div className="grid grid-cols-4 border-b border-black border-l border-r">
          {[0, 0, 0, 0].map((_, i) => (
            <div key={i} className="border-r border-black p-1 text-[10px]">
              Data: <span className="inline-block border-b border-black w-12 ml-1" />
              Hora: <span className="inline-block border-b border-black w-10 ml-1" />
            </div>
          ))}
        </div>

        {/* Técnico / Líder */}
        <div className="flex border-b border-black border-l border-r">
          <div className="flex-1 border-r border-black p-2">
            <span className={label}>Técnico Responsável:</span>
            <div className={fieldLine} />
          </div>
          <div className="flex-1 p-2">
            <span className={label}>Líder Responsável:</span>
            <div className={fieldLine} />
          </div>
        </div>

        {/* Assinaturas */}
        <div className="flex border-b border-black border-l border-r">
          <div className="flex-1 border-r border-black p-2">
            <span className={label}>Ass:</span>
            <div className="border-b border-black w-full mt-1 min-h-[28px]" />
          </div>
          <div className="flex-1 p-2">
            <span className={label}>Ass:</span>
            <div className="border-b border-black w-full mt-1 min-h-[28px]" />
          </div>
        </div>

        {/* Rodapé */}
        <div className="grid grid-cols-7">
          {["Código", "Planta", "Revisão", "Data", "Criador", "Aprovador", "Setor"].map((h) => (
            <div key={h} className={cellBold}>{h}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {["TEM122", "Resende-RJ", "1", "11/03/2024", "Ayrton R.", "Leandro A.", "Manutenção"].map((val, i) => (
            <div key={i} className="border border-black px-2 py-1 text-[10px] min-h-[18px]">{val}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
