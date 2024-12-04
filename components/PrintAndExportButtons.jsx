import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { printEventTable, exportToCSV } from "@/utils/eventUtils";

export default function PrintButtons({ filteredEvents }) {
  return (
    <div className="flex gap-4">
      <Button
        size="sm"
        onClick={() => printEventTable(filteredEvents, true)}
        variant="secondary"
        className="gap-2">
        <Printer className="w-4 h-4" />
        Print Current Page
      </Button>
      <Button
        size="sm"
        onClick={() => printEventTable(filteredEvents, false)}
        variant="secondary"
        className="gap-2">
        <Printer className="w-4 h-4" />
        Print All Pages
      </Button>
      <Button
        size="sm"
        onClick={() => exportToCSV(filteredEvents)}
        variant="secondary"
        className="gap-2">
        <Download className="w-4 h-4" />
        Export CSV
      </Button>
    </div>
  );
}
