import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDF = (report: any) => {
  try {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('MEDLAB REPORT', 14, 15);

    // Patient Info
    doc.setFontSize(10);
    doc.text(`Patient: ${report.patient_name || 'N/A'}`, 14, 28);
    doc.text(`Date: ${new Date(report.created_at).toLocaleDateString()}`, 14, 35);
    doc.text(`Report ID: ${report.id}`, 14, 42);

    // Table
    const tableColumn = ['Test Name', 'Result', 'Reference Range', 'Status'];
    const tableRows = (report.items || []).map((item: any) => [
      item.test_name || 'N/A',
      item.result_value || 'N/A',
      item.normal_min && item.normal_max ? `${item.normal_min} - ${item.normal_max}` : 'N/A',
      item.status || 'N/A',
    ]);

    autoTable(doc, {
      startY: 50,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [0, 0, 0],
        fontStyle: 'normal',
      },
      bodyStyles: {
        textColor: [0, 0, 0],
      },
      margin: { top: 50, right: 14, bottom: 14, left: 14 },
    });

    doc.save(`LabReport_${report.patient_name || 'report'}.pdf`);
  } catch (error) {
    console.error('PDF generation error:', error);
    alert('Error generating PDF: ' + (error as any).message);
  }
};
