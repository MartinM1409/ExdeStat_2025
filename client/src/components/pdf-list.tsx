import { useQuery } from "@tanstack/react-query";
import { Pdf, Department } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface PdfListProps {
  departmentSlug: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} bytes`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

export default function PdfList({ departmentSlug }: PdfListProps) {
  // Fetch department to get ID
  const { data: department, isLoading: departmentLoading } = useQuery<Department>({
    queryKey: [`/api/departments/${departmentSlug}`],
  });

  // Fetch PDFs for the department
  const { data: pdfs, isLoading: pdfsLoading, error } = useQuery<Pdf[]>({
    queryKey: ["/api/pdfs", departmentSlug],
    queryFn: async () => {
      const res = await fetch(`/api/pdfs?department=${departmentSlug}`);
      if (!res.ok) throw new Error("Failed to fetch PDFs");
      return res.json();
    },
    enabled: !!departmentSlug,
  });

  const isLoading = departmentLoading || pdfsLoading;

  const handleDownload = (pdfId: number) => {
    window.open(`/api/pdfs/${pdfId}/download`, "_blank");
  };

  if (!department && !isLoading) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 text-primary font-heading">Materiale PDF</h2>

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="animate-pulse flex justify-between items-center py-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-destructive">A apărut o eroare la încărcarea fișierelor PDF.</p>
          ) : pdfs && pdfs.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {pdfs.map((pdf) => (
                <li key={pdf.id} className="py-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{pdf.name || pdf.originalFilename}</h3>
                    {pdf.description && (
                      <p className="text-sm text-gray-600 mt-1">{pdf.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{formatFileSize(pdf.size)}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="text-primary hover:text-primary/90"
                    onClick={() => handleDownload(pdf.id)}
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Descarcă
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Nu există materiale PDF disponibile pentru această secțiune.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
