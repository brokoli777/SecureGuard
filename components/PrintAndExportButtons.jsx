import { Button } from "@/components/ui/button";
import { printEventTable, exportToCSV } from "@/utils/eventUtils";
import { Printer, FileSpreadsheet } from "lucide-react";

const PrintButtons = ({ currentPageEvents, allFilteredEvents }) => {
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => printEventTable(currentPageEvents, true)}
        className="flex items-center gap-2">
        <Printer className="w-4 h-4" />
        Print Current Page
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={() => printEventTable(allFilteredEvents, false)}
        className="flex items-center gap-2">
        <Printer className="w-4 h-4" />
        Print All Pages
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={() => exportToCSV(allFilteredEvents)}
        className="flex items-center gap-2">
        <FileSpreadsheet className="w-4 h-4" />
        Export CSV
      </Button>
    </div>
  );
};

export default PrintButtons;
