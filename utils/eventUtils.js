// Converts event data to CSV format
export const convertToCSV = (data) => {
  const headers = [
    "Event ID",
    "Category",
    "Date",
    "Time",
    "Team ID",
    "Member Name",
    "Object Confidence",
  ];

  const formatRow = (event) => [
    event.event_id,
    event.category,
    new Date(event.date_time).toLocaleDateString(),
    new Date(event.date_time).toLocaleTimeString(),
    event.team_id,
    event.member_name || "N/A",
    event.object_confidence,
  ];

  return [headers, ...data.map(formatRow)]
    .map((row) => row.join(","))
    .join("\n");
};

// Handles printing event table with custom styling
export const printEventTable = (data, currentPageOnly = false) => {
  const printWindow = window.open("", "_blank");

  // Get data to print
  let contentToPrint = data;
  if (currentPageOnly) {
    // Get all visible IDs from the current page
    const visibleIds = [];
    document.querySelectorAll("table tbody tr").forEach((row) => {
      const idCell = row.cells[0];
      if (idCell) {
        visibleIds.push(idCell.textContent.trim());
      }
    });

    // Filter the data to only include visible rows
    contentToPrint = data.filter((event) =>
      visibleIds.includes(String(event.event_id))
    );
  }

  const formatTableRow = (event) => `
    <tr>
      <td>${event.event_id}</td>
      <td>${event.category}</td>
      <td>${new Date(event.date_time).toLocaleDateString()}</td>
      <td>${new Date(event.date_time).toLocaleTimeString()}</td>
      <td>${event.team_id}</td>
      <td>${event.member_name || "N/A"}</td>
      <td>${event.object_confidence}</td>
    </tr>
  `;

  const currentDateTime = {
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
  };

  printWindow.document.write(`
    <html>
      <head>
        <title>Event Log Print</title>
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
          tr:hover { background-color: #f5f5f5; }

          @media print {
            body { padding: 20px; }
            button { display: none; }
            .header { margin-bottom: 20px; }
            table { page-break-inside: auto; }
            tr { 
              page-break-inside: avoid;
              page-break-after: auto;
            }
            thead { display: table-header-group; }
          }

          @page {
            margin: 1cm;
            size: A4;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Event Log Report</h1>
          <div class="metadata">
            Generated on: ${currentDateTime.date} at ${currentDateTime.time}
            <br>
            ${currentPageOnly ? "Current Page Events" : "All Events"}: ${contentToPrint.length}
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
            ${contentToPrint.map(formatTableRow).join("")}
          </tbody>
        </table>
        <div class="metadata" style="margin-top: 20px; font-size: 12px; color: #666;">
          End of report
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  setTimeout(() => printWindow.print(), 150);
};

// Exports data to CSV file
export const exportToCSV = (data) => {
  const blob = new Blob([convertToCSV(data)], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  const fileName = `event-log-${new Date().toISOString().split("T")[0]}.csv`;

  Object.assign(a, {
    href: url,
    download: fileName,
  });

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
