import jsPDF from "jspdf";
import { OrdemServico } from "@/types";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

function resolve(collection: string, id: string): string {
  if (!id) return "-";
  const item = db.get<any>(collection, id);
  if (!item) return "-";
  return item.nome || item.codigo || `Revisão ${item.numero}` || "-";
}

async function loadLogo(): Promise<HTMLCanvasElement | null> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise<void>((resolve) => {
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = "/logo.png";
  });
  return canvas.width > 0 ? canvas : null;
}

function renderOSContent(
  doc: jsPDF,
  os: OrdemServico,
  margin: number,
  pageW: number,
  logoCanvas: HTMLCanvasElement | null,
  showTitle: boolean
) {
  let y = 20;

  if (logoCanvas) {
    doc.addImage(logoCanvas, "PNG", margin, 8, 14, 14);
  }

  if (showTitle) {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    const titulo = os.tipo === "corretiva" ? "ORDEM DE SERVIÇO" : "CHECK LIST MANUTENÇÃO PREVENTIVA";
    doc.text(titulo, pageW / 2, y, { align: "center" });
    y += 7;
    if (os.numero) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Nº ${os.numero}`, pageW / 2, y, { align: "center" });
      y += 8;
    } else {
      y += 10;
    }
  }

  const equip = resolve("equipamentos", os.equipamentoId);
  const setor = resolve("setores", os.setorId);
  const tem = resolve("tems", os.temId);
  const temData = db.get<any>("tems", os.temId);
  const temDate = temData?.createdAt ? formatDate(temData.createdAt) : "-";
  const rev = resolve("revisoes", os.revisaoId);
  const criador = db.get<any>("users", os.criadorId)?.nome || "-";

  doc.setDrawColor(200);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  const field = (label: string, value: string) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    const valX = margin + doc.getTextWidth(label + ": ") + 2;
    doc.text(label + ":", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(value || "-", valX, y);
    y += 6;
  };

  field("Equipamento", equip);
  field("Setor", setor);
  field("Data", formatDate(os.data));
  field("Início da Manutenção", formatDate(os.inicioManutencao));
  field("Seg. Início", os.segurancaEquipamento === "CONF" ? "CONF." : os.segurancaEquipamento === "NAO_CONF" ? "NÃO CONF." : "-");
  field("Conclusão da Manutenção", formatDate(os.conclusaoManutencao));
  field("Seg. Conclusão", os.conclusaoSeguranca === "CONF" ? "CONF." : os.conclusaoSeguranca === "NAO_CONF" ? "NÃO CONF." : "-");

  y += 4;
  doc.setDrawColor(200);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  if (os.atividades.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("Atividades:", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    for (const osAtv of os.atividades) {
      const tmpl = db.get<any>("atividades", osAtv.templateId);
      if (!tmpl) continue;
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.text(tmpl.nome, margin + 2, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      for (const osItem of osAtv.itens) {
        if (y > 270) { doc.addPage(); y = 20; }
        const itemDef = tmpl.itens.find((i: any) => i.id === osItem.itemId);
        if (!itemDef) continue;
        const status = osItem.concluido ? "OK" : "NÃO OK";
        doc.text(`${status} ${itemDef.nome}`, margin + 6, y);
        y += 5;
      }
      y += 3;
    }
    y += 4;
  }

  doc.setDrawColor(200);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  doc.setFontSize(10);
  field("Subst. Peças", os.substituicaoPecas === "sim" ? "Sim" : "Não");
  if (os.substituicaoPecas === "sim" && os.substituicaoPecasDescricao) {
    y += 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Descrição:", margin + 4, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(os.substituicaoPecasDescricao, pageW - margin * 2 - 8);
    lines.forEach((l: string) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(l, margin + 8, y);
      y += 4.5;
    });
    y += 3;
  }

  field("Outra Manutenção", os.outraManutencao === "sim" ? "Sim" : "Não");
  if (os.outraManutencao === "sim" && os.outraManutencaoDescricao) {
    y += 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Descrição:", margin + 4, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(os.outraManutencaoDescricao, pageW - margin * 2 - 8);
    lines.forEach((l: string) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(l, margin + 8, y);
      y += 4.5;
    });
    y += 3;
  }

  if (os.observacao) {
    if (y > 260) { doc.addPage(); y = 20; }
    y += 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Observação:", margin, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(os.observacao, pageW - margin * 2);
    lines.forEach((l: string) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(l, margin + 4, y);
      y += 4.5;
    });
    y += 5;
  }

  if (y > 240) { doc.addPage(); y = 20; }
  y += 10;
  const lineMid1 = margin + (pageW / 2 - 5 - margin) / 2;
  const lineMid2 = (pageW / 2 + 5) + (pageW - margin - (pageW / 2 + 5)) / 2;
  doc.setDrawColor(0);
  doc.line(margin, y, pageW / 2 - 5, y);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Assinatura do Responsável", lineMid1, y + 4, { align: "center" });
  doc.line(pageW / 2 + 5, y, pageW - margin, y);
  doc.text("Assinatura", lineMid2, y + 4, { align: "center" });

  y = 280;
  doc.setDrawColor(200);
  doc.line(margin, y, pageW - margin, y);
  y += 5;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Código: ${tem} | Revisão: ${rev} | Data TEM: ${temDate}`, margin, y);
  doc.text(`Criador: ${criador} | Aprovador: ${os.aprovador || "-"} | Setor: ${setor}`, margin, y + 4);

  const equipClean = equip.replace(/\s+/g, "_");
  return { equipClean, filename: `OS_${equipClean}_${os.data}.pdf` };
}

export async function exportToPdf(os: OrdemServico) {
  const doc = new jsPDF("p", "mm", "a4");
  const margin = 15;
  const pageW = 210;
  const logoCanvas = await loadLogo();
  const { filename } = renderOSContent(doc, os, margin, pageW, logoCanvas, true);
  doc.save(filename);
}

export async function gerarRelatorioPdf(lista: OrdemServico[], dataInicio: string, dataFim: string, statusLabel?: string) {
  if (lista.length === 0) return;

  const doc = new jsPDF("p", "mm", "a4");
  const margin = 15;
  const pageW = 210;
  const logoCanvas = await loadLogo();

  // Capa do relatório
  let y = 20;
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("RELATÓRIO DE ORDENS DE SERVIÇO", pageW / 2, y, { align: "center" });
  y += 15;
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(`Período: ${formatDate(dataInicio)} a ${formatDate(dataFim)}`, pageW / 2, y, { align: "center" });
  y += 10;
  if (statusLabel) {
    doc.text(`Filtro: ${statusLabel}`, pageW / 2, y, { align: "center" });
    y += 10;
  }
  doc.text(`Total de OS: ${lista.length}`, pageW / 2, y, { align: "center" });
  y += 8;
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, pageW / 2, y, { align: "center" });

  for (let i = 0; i < lista.length; i++) {
    doc.addPage();
    renderOSContent(doc, lista[i], margin, pageW, logoCanvas, true);
  }

  doc.save(`Relatorio_OS_${dataInicio}_a_${dataFim}.pdf`);
}
