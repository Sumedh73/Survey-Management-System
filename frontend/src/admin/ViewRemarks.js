import { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function SurveyReportPage() {
  const [surveyorList, setSurveyorList] = useState([]);
  const [selectedSurveyor, setSelectedSurveyor] = useState('');
  const [reports, setReports] = useState([]);

  const supervisorId = sessionStorage.getItem('supervisorId'); // Or decode from token

  useEffect(() => {
    axios.get(`/get-surveyors-by-supervisor/${supervisorId}`)
      .then(res => setSurveyorList(res.data))
      .catch(err => console.error(err));
  }, [supervisorId]);

  const fetchReports = () => {
    axios.get(`/get-survey-reports/${supervisorId}?surveyorId=${selectedSurveyor}`)
      .then(res => setReports(res.data))
      .catch(err => console.error(err));
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Survey Report", 14, 10);

    const tableData = reports.map(r => [
      r.surveyor_name,
      r.area_name,
      r.survey_type,
      r.date,
      r.status,
      Object.entries(r.form_data).map(([k, v]) => `${k}: ${v}`).join(", ")
    ]);

    doc.autoTable({
      head: [["Surveyor", "Area", "Survey Type", "Date", "Status", "Form Summary"]],
      body: tableData,
      startY: 20,
    });

    doc.save("survey_report.pdf");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Survey Report Generation</h2>

      <select
        className="border p-2 mb-4"
        value={selectedSurveyor}
        onChange={e => setSelectedSurveyor(e.target.value)}
      >
        <option value="">-- Select Surveyor --</option>
        {surveyorList.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <button onClick={fetchReports} className="bg-blue-500 text-white px-4 py-2 rounded ml-2">
        Generate Report
      </button>

      {reports.length > 0 && (
        <>
          <table className="w-full mt-6 border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Surveyor</th>
                <th className="border p-2">Area</th>
                <th className="border p-2">Type</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Form Summary</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <tr key={i}>
                  <td className="border p-2">{r.surveyor_name}</td>
                  <td className="border p-2">{r.area_name}</td>
                  <td className="border p-2">{r.survey_type}</td>
                  <td className="border p-2">{r.date}</td>
                  <td className="border p-2">{r.status}</td>
                  <td className="border p-2 text-sm">
                    {Object.entries(r.form_data).map(([k, v]) => `${k}: ${v}`).join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={downloadPDF} className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
            Download PDF
          </button>
        </>
      )}
    </div>
  );
}
