// Converts event data to CSV format
export const convertToCSV = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.error("No data provided for CSV conversion");
    return "";
  }

  const headers = [
    "Event ID",
    "Category",
    "Date",
    "Time",
    "Team ID",
    "Member Name",
    "Object Confidence",
  ];

  const formatRow = (event) => {
    try {
      const date = new Date(event.date_time);
      return [
        event.event_id,
        event.category,
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        event.team_id,
        event.member_name || "N/A",
        event.object_confidence,
      ];
    } catch (error) {
      console.error("Error formatting row:", error);
      return Array(headers.length).fill("N/A");
    }
  };

  return [headers, ...data.map(formatRow)]
    .map((row) =>
      row
        .map((cell) => {
          if (cell === null || cell === undefined) return "";
          return `"${String(cell).replace(/"/g, '""')}"`;
        })
        .join(",")
    )
    .join("\n");
};

// Handles printing event table with custom styling
export const printEventTable = (data, currentPageOnly = false) => {
  if (!Array.isArray(data) || data.length === 0) {
    alert("No data available to print");
    return;
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow pop-ups to print the event log");
    return;
  }

  const formatTableRow = (event) => {
    try {
      const date = new Date(event.date_time);
      const category = event.category?.toLowerCase() || "";
      let rowClass = "";

      // Add highlighting classes based on category
      if (category === "person" && event.member_name === "Unrecognized") {
        rowClass = "highlight-amber";
      } else if (category === "gun") {
        rowClass = "highlight-red";
      } else if (category === "fire") {
        rowClass = "highlight-orange";
      }

      const shortenId = (id) =>
        id ? `${id.substring(0, 4)}...${id.slice(-4)}` : "N/A";
      return `
        <tr class="${rowClass}">
          <td>${event.event_id || "N/A"}</td>
          <td>${event.category || "N/A"}</td>
          <td>${date.toLocaleDateString()}</td>
          <td>${date.toLocaleTimeString()}</td>
          <td>${shortenId(event.team_id)}</td>
          <td>${event.member_name || "N/A"}</td>
          <td>${event.object_confidence || "N/A"}</td>
        </tr>
      `;
    } catch (error) {
      console.error("Error formatting table row:", error);
      return "";
    }
  };

  const currentDateTime = {
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
  };

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Event Log Print</title>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
          
          body { 
            font-family: 'Inter', sans-serif;
            padding: 40px;
            margin: 0;
            color: #333;
          }

          .header {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #eee;
          }

          .header h1 {
            font-size: 24px;
            font-weight: 600;
            color: #111;
            margin: 0 0 10px 0;
          }

          .header .metadata {
            font-size: 14px;
            color: #666;
          }

          table { 
            border-collapse: collapse; 
            width: 100%;
            margin: 20px 0;
            font-size: 14px;
          }

          th, td { 
            border: 1px solid #e5e7eb;
            padding: 12px 16px;
            text-align: left;
          }

          th { 
            background-color: #f9fafb;
            font-weight: 500;
            color: #111;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.05em;
          }

          tr:nth-child(even) { background-color: #f9fafb; }
          
          .highlight-amber { background-color: #fcd34d !important; }
          .highlight-red { background-color: #ef4444 !important; color: white; }
          .highlight-orange { background-color: #f97316 !important; color: white; }

          @media print {
            body { padding: 20px; }
            .header { margin-bottom: 20px; }
            table { page-break-inside: auto; }
            tr { 
              page-break-inside: avoid;
              page-break-after: auto;
            }
            thead { display: table-header-group; }
            .highlight-amber,
            .highlight-red,
            .highlight-orange {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }

          @page {
            margin: 1cm;
            size: A4 portrait;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Event Log Report</h1>
          <div class="metadata">
            Generated on: ${currentDateTime.date} at ${currentDateTime.time}
            <br>
            ${currentPageOnly ? "Current Page Events" : "All Events"}: ${data.length}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Category</th>
              <th>Date</th>
              <th>Time</th>
              <th>Team ID</th>
              <th>Member Name</th>
              <th>Object Confidence</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(formatTableRow).join("")}
          </tbody>
        </table>
        <div class="metadata" style="margin-top: 20px; font-size: 12px; color: #666;">
          End of report
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  setTimeout(() => printWindow.print(), 500);
};

// Exports data to CSV file
export const exportToCSV = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    alert("No data available to export");
    return;
  }

  try {
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const fileName = `event-log-${new Date().toISOString().split("T")[0]}.csv`;

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting CSV:", error);
    alert("Error exporting CSV file. Please try again.");
  }
};
