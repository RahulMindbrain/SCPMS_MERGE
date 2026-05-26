import { useState } from "react";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import { Upload, GraduationCap, Calendar } from "lucide-react";
import Loader from "@/components/Loader";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CertificateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddCertificate: (certificate: any) => void;
};

const CertificateModal = ({ isOpen, onClose, onAddCertificate }: CertificateModalProps) => {
  const [certificate, setCertificate] = useState({
    title: "",
    issuer: "",
    issuedDate: "",
    certificateUrl: ""
  });
  const [file, setFile] = useState<File | null>(null);

  const { upload: uploadToCloudinary, isUploading } = useCloudinaryUpload();

  const handleSubmit = async () => {
    if (!certificate.title.trim() || !certificate.issuer.trim()) return;

    let finalUrl = certificate.certificateUrl;

    if (file) {
      const url = await uploadToCloudinary(file, "certificates");
      if (url) finalUrl = url;
    }

    onAddCertificate({ ...certificate, certificateUrl: finalUrl });
    onClose();
    setCertificate({
      title: "",
      issuer: "",
      issuedDate: "",
      certificateUrl: ""
    });
    setFile(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] rounded-2xl p-0 overflow-hidden bg-white dark:bg-slate-900 border-none shadow-2xl flex flex-col">
        <DialogHeader className="p-8 pb-4 bg-[#fbfdff] dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-500/10 rounded-lg">
              <GraduationCap className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-800 dark:text-white">Add Credential</DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm">Add your certifications and professional achievements</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Certificate Title</Label>
            <Input
              id="title"
              placeholder="e.g. AWS Certified Solutions Architect"
              className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 focus:ring-blue-500"
              value={certificate.title}
              onChange={(e) => setCertificate({ ...certificate, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="issuer" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Issuing Organization</Label>
            <Input
              id="issuer"
              placeholder="e.g. Coursera, Microsoft, Google"
              className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 focus:ring-blue-500"
              value={certificate.issuer}
              onChange={(e) => setCertificate({ ...certificate, issuer: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Issue Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
              <Input
                id="date"
                type="date"
                className="pl-10 h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 focus:ring-blue-500"
                value={certificate.issuedDate}
                onChange={(e) => setCertificate({ ...certificate, issuedDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Certificate Document</Label>
            <div className="flex items-center gap-4">
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:border-amber-500 dark:hover:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/5 transition-all group">
                {isUploading ? <Loader size="sm" /> : <Upload size={18} className="text-slate-400 group-hover:text-amber-600" />}
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400 group-hover:text-amber-700 dark:group-hover:text-amber-400">
                  {file ? file.name : 'Upload PDF (Max 10MB)'}
                </span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e: any) => setFile(e.target.files[0])}
                />
              </label>
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 bg-[#fbfdff] dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1 rounded-xl h-12 font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isUploading}
            className="flex-1 rounded-xl h-12 font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            {isUploading ? <Loader size="sm" /> : "Verify & Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CertificateModal;
