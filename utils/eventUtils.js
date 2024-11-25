// Converts event data to CSV format
export const convertToCSV = (data) => {
  const headers = [
    "Event ID",
    "Category",
    "Date",
    "Time",
    "Team ID",
    "Object Confidence",
  ];
  const csvRows = [headers];

  data.forEach((event) => {
    const row = [
      event.event_id,
      event.category,
      new Date(event.date_time).toLocaleDateString(),
      new Date(event.date_time).toLocaleTimeString(),
      event.team_id,
      event.object_confidence,
    ];
    csvRows.push(row);
  });

  return csvRows.map((row) => row.join(",")).join("\n");
};

// Handles printing event table with custom styling
export const printEventTable = (data, currentPageOnly = false) => {
  const printWindow = window.open("", "_blank");
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();

  let contentToPrint;
  if (currentPageOnly) {
    // Get only the visible rows from the current page
    const visibleRows = document.querySelectorAll("table tbody tr");
    contentToPrint = Array.from(visibleRows).map((row) => {
      const cells = row.querySelectorAll("td");
      return {
        event_id: cells[0].textContent,
        category: cells[1].textContent,
        date: cells[2].textContent,
        time: cells[3].textContent,
        team_id: cells[4].textContent,
        object_confidence: cells[5].textContent,
      };
    });
  } else {
    // Use all data
    contentToPrint = data;
  }

  const tableRows = contentToPrint
    .map((event) => {
      const date = event.date_time ? new Date(event.date_time) : null;

      return `
          <tr>
            <td>${event.event_id}</td>
            <td>${event.category}</td>
            <td>${event.date}</td>
            <td>${event.time}</td>
            <td>${event.team_id}</td>
            <td>${event.object_confidence}</td>
          </tr>
        `;
    })
    .join("");

  const tableHTML = `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Category</th>
            <th>Date</th>
            <th>Time</th>
            <th>Team ID</th>
            <th>Object Confidence</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;

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
  
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
  
            tr:hover {
              background-color: #f5f5f5;
            }
  
            @media print {
              body { 
                padding: 20px;
              }
              button { 
                display: none; 
              }
              .header {
                margin-bottom: 20px;
              }
              table { 
                page-break-inside: auto;
              }
              tr { 
                page-break-inside: avoid;
                page-break-after: auto;
              }
              thead {
                display: table-header-group;
              }
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
              Generated on: ${currentDate} at ${currentTime}
              <br>
              ${currentPageOnly ? "Current Page Events" : "All Events"}: ${contentToPrint.length}
            </div>
          </div>
          ${tableHTML}
          <div class="metadata" style="margin-top: 20px; font-size: 12px; color: #666;">
            End of report
          </div>
        </body>
      </html>
    `);

  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
  }, 150);
};

// Exports data to CSV file
export const exportToCSV = (data) => {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `event-log-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
