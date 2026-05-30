import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/redux/store/store";
import { registerAdmin } from "@/redux/thunks/superadmin/adminThunks";
import { toast } from "sonner";
import { Info, User, ShieldCheck, Plus, Loader2, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

const INITIAL_STATE = {
  firstname: "",
  lastname: "",
  email: "",
  password: "",
  role: "ADMIN",
  university: {
    name: "",
    code: "",
    city: "",
    state: "",
    country: "India",
  },
};

export const CreateAdminModal = ({ open, onClose, onSuccess }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isSubmitting } = useSelector((state: any) => state.superAdmin);
  const [form, setForm] = useState(INITIAL_STATE);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [obj, key] = name.split(".");
      setForm((prev) => ({
        ...prev,
        [obj]: { ...prev[obj as keyof typeof prev] as object, [key]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(registerAdmin(form)).unwrap();
      toast.success("Administrator registered successfully");
      onSuccess?.();
      setForm(INITIAL_STATE);
      onClose();
    } catch (err: any) {
      toast.error(err || "Failed to register administrator");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl h-[90vh] p-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-2xl flex flex-col">

        {/* Header */}
        <div className="px-6 lg:px-10 py-6 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900 z-10">
          <div>
            <DialogTitle className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
              Register New Administrator
            </DialogTitle>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 lg:p-10 xl:p-12 space-y-10 custom-scrollbar bg-white dark:bg-slate-900">

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-12">

              {/* Admin Details Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-700/50">
                  <div className="size-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
                    <User className="size-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                    Admin Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">First Name</Label>
                    <Input
                      name="firstname"
                      placeholder=""
                      value={form.firstname}
                      onChange={handleChange}
                      required
                      className="h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Last Name</Label>
                    <Input
                      name="lastname"
                      placeholder=""
                      value={form.lastname}
                      onChange={handleChange}
                      required
                      className="h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Email Address</Label>
                  <Input
                    name="email"
                    type="email"
                    placeholder=""
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Access Password</Label>
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder=""
                      value={form.password}
                      onChange={handleChange}
                      required
                      className="h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
              </section>

              {/* Institutional Details Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-700/50">
                  <div className="size-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/30">
                    <ShieldCheck className="size-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                    Institutional Details
                  </h3>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">University Name</Label>
                  <Input
                    name="university.name"
                    placeholder=""
                    value={form.university.name}
                    onChange={handleChange}
                    required
                    className="h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Institutional Code</Label>
                    <Input
                      name="university.code"
                      placeholder=""
                      value={form.university.code}
                      onChange={handleChange}
                      required
                      className="h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl uppercase focus:bg-white dark:focus:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">City</Label>
                    <Input
                      name="university.city"
                      placeholder=""
                      value={form.university.city}
                      onChange={handleChange}
                      required
                      className="h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">State</Label>
                    <Input
                      name="university.state"
                      placeholder=""
                      value={form.university.state}
                      onChange={handleChange}
                      required
                      className="h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 ml-1">Country</Label>
                    <Input
                      name="university.country"
                      value={form.university.country}
                      onChange={handleChange}
                      required
                      className="h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Protocol Info Box */}
            <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 p-5 flex gap-4 items-start border-l-4 border-l-blue-600">
              <div className="size-10 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20">
                <Info className="size-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Register Admin Protocol</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Registering this administrator will activate secure access for the selected university portal.
                  The administrator will be able to manage institutional operations, users, and platform settings immediately after deployment.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 lg:px-10 py-5 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/80 dark:bg-slate-800/50 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 shrink-0">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="w-full sm:w-auto px-8 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-all font-medium"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-10 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 transition-all gap-2 font-bold"
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Add Administrator
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};