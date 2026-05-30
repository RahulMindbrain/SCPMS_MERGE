import { useEffect, useState } from "react"
import { Briefcase, Building2, Mail, MapPin, Pencil, Save, Users, X } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import {
  fetchCompanyProfile,
  updateCompanyProfile,
  fetchCompanyJobs,
  fetchJobApplications,
} from "@/redux/thunks/companyThunk"
import { Button } from "@/components/ui/button"
import type { AppDispatch } from "@/redux/store/store"
import type { RootState } from "@/redux/reducers/rootReducer"
import Loader from "@/components/Loader"

interface ProfileFormData {
  name: string
  description: string
}

const CompanyProfile = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { profile, jobs, applications, loading } = useSelector((state: RootState) => state.company)
  const { user } = useSelector((state: RootState) => state.auth)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>()
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    dispatch(fetchCompanyProfile())
      .unwrap()
      .then((data) => {
        const prof = data?.data || data
        if (prof) {
          setValue("name", prof.name || "")
          setValue("description", prof.description || "")
        }
      })
    
    // Fetch stats dynamically
    dispatch(fetchCompanyJobs({ page: 1, limit: 100 }))
    dispatch(fetchJobApplications({ page: 1 }))
  }, [dispatch, setValue])

  useEffect(() => {
    if (profile) {
      const prof = profile.data || profile
      setValue("name", prof.name || "")
      setValue("description", prof.description || "")
    }
  }, [profile, setValue])

  const isApproved = user?.status === 'ACTIVE'

  const onSubmit = async (data: ProfileFormData) => {
    if (!isApproved) return toast.error("Your account is pending verification.")
    try {
      await dispatch(updateCompanyProfile(data)).unwrap()
      toast.success("Profile updated successfully!")
      setIsEditing(false)
      dispatch(fetchCompanyProfile())
    } catch (error: any) {
      toast.error(error?.message || "Failed to save profile")
    }
  }

  if (loading && !profile) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Hero Banner Section */}
      <section className="company-hero-banner relative overflow-hidden">
        <div className="hero-mesh">
          <div className="bubble-primary"></div>
          <div className="bubble-secondary"></div>
        </div>
        <div className="hero-texture"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="h-28 w-28 md:h-36 md:w-36 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-2xl animate-in zoom-in duration-700">
            <Building2 size={64} className="opacity-90" />
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="hero-badge bg-white/20 border-white/30 text-white">
              Official Profile
            </div>
            <h1 className="hero-title text-3xl md:text-5xl lg:text-6xl font-black">
              {(profile?.data?.name || profile?.name) || "Your Company"}
            </h1>
            <p className="hero-description text-blue-50/80 max-w-2xl">
              {(profile?.data?.description || profile?.description)
                ? ((profile?.data?.description || profile?.description).length > 150 ? (profile?.data?.description || profile?.description).substring(0, 150) + "..." : (profile?.data?.description || profile?.description))
                : "Complete your company profile to start posting jobs and attracting top talent from across the globe."}
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col items-center min-w-[120px] transition-transform hover:scale-105 duration-300">
              <Briefcase size={20} className="text-blue-200 mb-2" />
              <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Active Jobs</span>
              <span className="text-3xl font-black text-white">{jobs?.length || 0}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col items-center min-w-[120px] transition-transform hover:scale-105 duration-300">
              <Users size={20} className="text-blue-200 mb-2" />
              <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Applicants</span>
              <span className="text-3xl font-black text-white">{applications?.length || 0}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="saas-card overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Profile Strength</h3>
              <span className="text-xs font-bold text-primary">
                {(() => {
                  const prof = profile?.data || profile;
                  const fields = ['name', 'description'];
                  const filled = fields.filter(f => prof?.[f]).length;
                  return Math.round((filled / fields.length) * 100) + "%";
                })()}
              </span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-primary transition-all duration-1000 ease-out"
                style={{
                  width: (() => {
                    const prof = profile?.data || profile;
                    const fields = ['name', 'description'];
                    const filled = fields.filter(f => prof?.[f]).length;
                    return (filled / fields.length) * 100 + "%";
                  })()
                }}
              ></div>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
              {(profile?.data?.name || profile?.name) && (profile?.data?.description || profile?.description)
                ? "Your profile is looking great! Complete all fields to maximize visibility."
                : "Complete your profile details to increase your visibility to candidates."}
            </p>
          </div>

          <div className="saas-card overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">At a Glance</h3>
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Mail size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Support Email</p>
                  <p className="text-sm font-semibold truncate">
                    {(profile?.data?.user?.email || profile?.user?.email) || user?.email || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Building2 size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Administrator</p>
                  <p className="text-sm font-semibold truncate">
                    {(profile?.data?.user?.firstname || profile?.user?.firstname) || user?.firstname || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <MapPin size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Member Since</p>
                  <p className="text-sm font-semibold truncate">
                    {(profile?.data?.createdAt || profile?.createdAt) ? new Date(profile?.data?.createdAt || profile?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form Section */}
        <div className="lg:col-span-2">
          <div className="saas-card p-0 overflow-hidden border-none shadow-2xl">
            <div className="p-6 border-b border-border/50 bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Edit Profile</h2>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Company Identity</p>
                </div>
              </div>

              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-primary/20 hover:border-primary hover:bg-primary/5 text-primary gap-2 font-bold"
                  disabled={!isApproved}
                >
                  <Pencil size={14} />
                  Edit Details
                </Button>
              )}
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-8 md:p-10 space-y-8">
                <div className="space-y-2">
                  <label className="saas-label">Company Name</label>
                  <div className="relative group">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" size={18} />
                    <input
                      id="name"
                      className="saas-input saas-input-with-icon h-12"
                      disabled={!isEditing}
                      placeholder="e.g. Acme Corporation"
                      {...register("name", { required: "Company name is required" })}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs font-bold text-destructive mt-1 flex items-center gap-1">
                      <X size={12} /> {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="saas-label">About the Company</label>
                  <textarea
                    id="description"
                    rows={8}
                    className="saas-input py-4 resize-none min-h-[200px]"
                    disabled={!isEditing}
                    placeholder="Tell prospective candidates about your company culture, mission, and what makes you unique..."
                    {...register("description", {
                      required: "Description is required",
                    })}
                  />
                  {errors.description && (
                    <p className="text-xs font-bold text-destructive mt-1 flex items-center gap-1">
                      <X size={12} /> {errors.description.message}
                    </p>
                  )}
                </div>
              </div>

              {isEditing && (
                <footer className="p-6 border-t border-border/50 bg-muted/10 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl font-bold px-6 border-border hover:bg-muted"
                    onClick={() => {
                      setIsEditing(false)
                      const prof = profile?.data || profile
                      setValue("name", prof?.name || "")
                      setValue("description", prof?.description || "")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="rounded-xl font-bold px-8 min-w-[160px] gap-2 shadow-lg shadow-primary/20">
                    {loading ? <Loader size="sm" /> : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </Button>
                </footer>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanyProfile
