import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDF = (report: any) => {
  try {
    const doc = new jsPDF();

    // Header
    doc.setFillColor(218, 240, 238); // Teal header
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(22);
    doc.text("MEDLAB", 14, 15);
    doc.setFontSize(10);
    doc.text("Laboratory Management System", 14, 23);

    // Patient Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text("Patient Information:", 14, 50);
    doc.setFontSize(10);
    doc.text(`Patient Name: ${report.patient_name || 'N/A'}`, 14, 58);
    doc.text(`Report Date: ${new Date(report.created_at).toLocaleDateString()}`, 14, 64);

    // Table
    const tableColumn = ["Test Name", "Result", "Reference Range", "Status"];
    const tableRows = (report.items || []).map((item: any) => [
      item.test_name || 'N/A',
      item.result_value || 'N/A',
      item.normal_min && item.normal_max ? `${item.normal_min} - ${item.normal_max}` : 'N/A',
      item.status || 'N/A'
    ]);

    autoTable(doc, {
      startY: 75,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { 
        fillColor: [218, 240, 238],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        3: { fontStyle: 'bold' }
      },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 3) {
          const status = data.cell.raw;
          if (status === 'HIGH') {
            data.cell.styles.textColor = [220, 38, 38]; // Red
          } else if (status === 'LOW') {
            data.cell.styles.textColor = [234, 179, 8]; // Yellow/Orange
          } else {
            data.cell.styles.textColor = [22, 163, 74]; // Green
          }
        }
      }
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.save(`LabReport_${report.patient_name}.pdf`);
  } catch (error) {
    console.error('PDF generation error:', error);
    alert('Error generating PDF: ' + (error as any).message);
  }
};
