import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/redux/store/store";
import type { RootState } from "@/redux/reducers/rootReducer";
import { ShieldCheck, User, Mail, Lock, Building2, MapPin, Globe, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminPageLayout } from "@/components/layout/AdminPageLayout";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";
import { registerAdmin } from "@/redux/thunks/superadmin/adminThunks";

import { fetchUniversities } from "@/redux/thunks/superadmin/universityThunks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";



const AdminRegister = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { universities, isSubmitting: loading } = useSelector((state: RootState) => state.superAdmin);
  const [isNewUniversity, setIsNewUniversity] = useState(true);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    role: "ADMIN",
    university: {
      id: undefined as number | undefined,
      name: "",
      code: "",
      city: "",
      state: "",
      country: "India"
    }
  });

  useEffect(() => {
    dispatch(fetchUniversities());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev: any) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUniversitySelect = (id: string) => {
    const selectedUni = universities.find((u: any) => u.id.toString() === id);
    if (selectedUni) {
      setFormData((prev) => ({
        ...prev,
        university: {
          id: selectedUni.id,
          name: selectedUni.name,
          code: selectedUni.code,
          city: selectedUni.city,
          state: selectedUni.state,
          country: selectedUni.country
        }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create a clean payload
      const payload = {
        ...formData,
        university: isNewUniversity 
          ? { ...formData.university, id: undefined }
          : { id: formData.university.id, name: formData.university.name } // Only need ID and Name for existing
      };

      await dispatch(registerAdmin(payload)).unwrap();
      toast.success("Administrator and University registered successfully!");
      
      setTimeout(() => {
        navigate("/superadmin/admins");
      }, 1500);
    } catch (error: any) {
      toast.error(error || "Failed to register administrator.");
    }
  };


  return (
    <AdminPageLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-xl border border-border/50 bg-card/50"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <PageHeader
            title="Register Administrator"
            description="Create a new tactical administrator node and associate it with a university."
            badge="Onboarding"
            icon={ShieldCheck}
            variant="indigo"
          />
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="saas-card p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                <User className="size-4" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest">Personal Details</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstname" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">First Name</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="firstname"
                      name="firstname"
                      placeholder="e.g. Rahul"
                      required
                      value={formData.firstname}
                      onChange={handleChange}
                      className="pl-11 h-12 bg-muted/30 border-border/50 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastname" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Last Name</Label>
                  <Input
                    id="lastname"
                    name="lastname"
                    placeholder="e.g. Sharma"
                    required
                    value={formData.lastname}
                    onChange={handleChange}
                    className="h-12 bg-muted/30 border-border/50 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@university.edu"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-11 h-12 bg-muted/30 border-border/50 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Security Key</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-11 h-12 bg-muted/30 border-border/50 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* University Information */}
          <div className="saas-card p-8 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                  <Building2 className="size-4" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest">Institutional Node</h3>
              </div>
              
              <div className="flex p-1 bg-muted/50 rounded-xl border border-border/50">
                <button
                  type="button"
                  onClick={() => setIsNewUniversity(true)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                    isNewUniversity ? 'bg-card text-indigo-600 shadow-sm border border-border/50' : 'text-muted-foreground'
                  }`}
                >
                  New
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewUniversity(false)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                    !isNewUniversity ? 'bg-card text-indigo-600 shadow-sm border border-border/50' : 'text-muted-foreground'
                  }`}
                >
                  Existing
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {!isNewUniversity ? (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Select University</Label>
                  <Select onValueChange={handleUniversitySelect}>
                    <SelectTrigger className="h-12 bg-muted/30 border-border/50 rounded-xl">
                      <SelectValue placeholder="Choose a university node..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/50 shadow-xl">
                      {universities.map((uni: any) => (
                        <SelectItem key={uni.id} value={uni.id.toString()} className="text-xs font-bold py-3 rounded-lg focus:bg-indigo-50">
                          {uni.name} ({uni.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {formData.university.id && (
                    <div className="mt-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 space-y-2">
                       <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-muted-foreground uppercase tracking-widest">Location</span>
                          <span className="text-indigo-600">{formData.university.city}, {formData.university.state}</span>
                       </div>
                       <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-muted-foreground uppercase tracking-widest">Institution Code</span>
                          <span className="text-indigo-600">{formData.university.code}</span>
                       </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="university.name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">University Name</Label>
                    <Input
                      id="university.name"
                      name="university.name"
                      placeholder="e.g. KIIT University"
                      required
                      value={formData.university.name}
                      onChange={handleChange}
                      className="h-12 bg-muted/30 border-border/50 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="university.code" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Institution Code</Label>
                    <Input
                      id="university.code"
                      name="university.code"
                      placeholder="e.g. KIIT001"
                      required
                      value={formData.university.code}
                      onChange={handleChange}
                      className="h-12 bg-muted/30 border-border/50 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="university.city" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">City</Label>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="university.city"
                          name="university.city"
                          placeholder="City"
                          required
                          value={formData.university.city}
                          onChange={handleChange}
                          className="pl-11 h-12 bg-muted/30 border-border/50 rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="university.state" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">State</Label>
                      <Input
                        id="university.state"
                        name="university.state"
                        placeholder="State"
                        required
                        value={formData.university.state}
                        onChange={handleChange}
                        className="h-12 bg-muted/30 border-border/50 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="university.country" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Country</Label>
                    <div className="relative group">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="university.country"
                        name="university.country"
                        placeholder="Country"
                        required
                        value={formData.university.country}
                        onChange={handleChange}
                        className="pl-11 h-12 bg-muted/30 border-border/50 rounded-xl"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>


          <div className="md:col-span-2 flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[11px]"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-12 px-12 rounded-xl font-black uppercase tracking-widest text-[11px] gap-2 shadow-lg shadow-indigo-500/20"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Initializing...
                </>
              ) : (
                "Deploy Administrator"
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminPageLayout>
  );
};

export default AdminRegister;
