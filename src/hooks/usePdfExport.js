// src/hooks/usePdfExport.js
import { useRef, useCallback } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export function usePdfExport(filename = "fiche-personnage.pdf") {
  const exportRef = useRef(null);

  const exportPdf = useCallback(async () => {
    const element = exportRef.current;
    if (!element) return;

    // Optionnel : tu peux afficher un loader ici dans ton UI
    try {
      const canvas = await html2canvas(element, {
        scale: 2,       // meilleure qualité
        useCORS: true,  // au cas où tu utilises des images
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight <= pdfHeight) {
        // Une seule page
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      } else {
        // Gestion simple du cas où c’est plus grand qu’une page (scroll vertical)
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position -= pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
      }

      pdf.save(filename);
    } catch (error) {
      console.error("Erreur génération PDF :", error);
    }
  }, [filename]);

  return { exportRef, exportPdf };
}
