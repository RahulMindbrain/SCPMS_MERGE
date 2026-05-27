import React, { useState, useEffect } from 'react';
import { Search, Building2, Briefcase, Users, UserCheck, Hash, Layers, Download } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchScheduleApplications, fetchSchedules } from '@/redux/thunks/interviewThunk';
import type { RootState, AppDispatch } from '@/redux/store/store';
import { useParams, useNavigate } from "react-router-dom";
import Loader from '@/components/Loader';
import { AdminPageLayout } from '@/components/layout/AdminPageLayout';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';

import { fetchCompanies } from '@/redux/thunks/companyThunk';
import { FilterX } from 'lucide-react';

const ApplicationsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { applications = [], schedules = [], meta, loading } = useSelector((state: RootState) => state.interview);
  const { companies = [] } = useSelector((state: RootState) => state.company);
  const { id } = useParams<{ id?: string }>();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  const scheduleId = id ? Number(id) : null;

  // Handle automatic redirection to first schedule if no ID is present
  useEffect(() => {
    if (!id && schedules.length > 0) {
      navigate(`/admin/applications/${schedules[0].id}`, { replace: true });
    }
  }, [id, schedules, navigate]);

  // Fetch companies on mount
  useEffect(() => {
    dispatch(fetchCompanies({ limit: 100 }));
  }, [dispatch]);

  // Fetch schedules when company changes or on mount
  useEffect(() => {
    dispatch(fetchSchedules(selectedCompanyId ? Number(selectedCompanyId) : undefined));
  }, [dispatch, selectedCompanyId]);

  // Reset page whenever schedule changes
  useEffect(() => {
    setPage(1);
  }, [scheduleId]);

  // Automatically fetch applications when scheduleId or page changes
  useEffect(() => {
    if (scheduleId && Number.isFinite(scheduleId)) {
      dispatch(
        fetchScheduleApplications({
          id: scheduleId,
          page,
          limit,
        })
      );
    }
  }, [dispatch, scheduleId, page, limit]);

  const applicationList = applications;

  const filteredApplications = applicationList.filter((app: any) =>
    app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.department?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.applicationId?.toString().includes(searchTerm)
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'SELECTED': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'SHORTLISTED': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'OFFER_ACCEPTED': return 'bg-teal-500/10 text-teal-600 border-teal-500/20';
      case 'OFFER_REJECTED': return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      case 'REJECTED': return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      default: return 'bg-muted/30 text-muted-foreground border-border';
    }
  };

  const handleScheduleChange = (val: string) => {
    navigate(`/admin/applications/${val}`);
  };

  const handleCompanyChange = (val: string) => {
    setSelectedCompanyId(val);
    navigate('/admin/applications', { replace: true });
  };

  const handleReset = () => {
    setSelectedCompanyId("");
    setSearchTerm("");
    navigate('/admin/applications');
  };

  const handleExport = () => {
    if (filteredApplications.length === 0) return;

    const headers = ["Application ID", "Student ID", "Name", "Email", "Job Title", "Department", "Current Round", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredApplications.map(app => [
        app.applicationId,
        app.studentId,
        `"${app.name}"`,
        app.email,
        `"${app.jobTitle}"`,
        `"${app.department?.name}"`,
        `"${app.currentRound || 'Screening'}"`,
        app.status
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Applications_Export_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminPageLayout>
      <PageHeader
        title="Applications Management"
        description="Monitor student application stages and track candidate progress across drives."
        badge="Talent Pipeline"
        icon={UserCheck}
        variant="indigo"
      />

      <div className="space-y-6">
        {/* Filters & Actions Bar */}
        {/* Filters & Actions Bar */}
        <div className="relative overflow-visible rounded-[32px] border border-border/50 bg-gradient-to-br from-background via-background to-muted/20 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">

          {/* Top Header */}
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 px-6 lg:px-8 py-6 border-b border-border/40">

            {/* Left */}
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 shadow-sm">
                <Layers className="size-7 text-primary" />
              </div>

              <div>
                <h2 className="text-xl font-black tracking-tight text-foreground">
                  Application Pipeline
                </h2>

                <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground font-bold mt-1">
                  Admin Management Console
                </p>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 w-full xl:w-auto">

              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="h-12 px-6 rounded-2xl border-border/60 bg-background hover:bg-rose-50 hover:border-rose-200 transition-all duration-300"
              >
                <FilterX className="size-4 text-rose-500 mr-2" />
                <span className="font-black text-[11px] uppercase tracking-[0.2em]">
                  Reset
                </span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={filteredApplications.length === 0}
                className="h-12 px-7 rounded-2xl bg-primary/5 border-primary/10 text-primary hover:bg-primary hover:text-white transition-all duration-300"
              >
                <Download className="size-4 mr-2" />
                <span className="font-black text-[11px] uppercase tracking-[0.2em]">
                  Export
                </span>
              </Button>

              {meta && (
                <div className="hidden 2xl:flex h-12 items-center rounded-2xl border border-primary/10 bg-primary/5 px-6">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">
                    Total Applications : {meta.total}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 lg:p-8">

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-end">

              {/* Search */}
              <div className="xl:col-span-4 space-y-2">
                <label className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                  Candidate Search
                </label>

                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-primary/40 group-focus-within:text-primary transition-colors" />

                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-14 rounded-2xl border-border/50 bg-background/80 pl-12 text-sm shadow-sm transition-all duration-300 hover:border-primary/30 focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                </div>
              </div>

      {/* Company */}
      <div className="xl:col-span-3 space-y-2">
        <label className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">
          Hiring Partner
        </label>

        <Select value={selectedCompanyId} onValueChange={handleCompanyChange}>
          <SelectTrigger className="
h-14
w-full
rounded-2xl
border-border/50
bg-background/80
px-4
text-[11px]
font-black
uppercase
tracking-[0.18em]
shadow-sm
hover:border-primary/30
overflow-visible
">
            <div className="flex items-center gap-2 truncate">
              <Building2 className="size-4 text-primary/50 shrink-0" />
              <SelectValue placeholder="All Companies" />
            </div>
          </SelectTrigger>

          <SelectContent
            position="popper"
            align="start"
            className="w-[var(--radix-select-trigger-width)] min-w-[240px] rounded-2xl border-border bg-background/95 backdrop-blur-xl shadow-2xl p-2"
          >
            <SelectItem value="all" className="rounded-xl py-3">
              ALL COMPANIES
            </SelectItem>

            {companies.map((c: any) => (
              <SelectItem
                key={c.id}
                value={c.id.toString()}
                className="rounded-xl py-3"
              >
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Schedule */}
      <div className="xl:col-span-5 space-y-2">
        <label className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">
          Interview Drive
        </label>

        <Select
          value={scheduleId?.toString() || ""}
          onValueChange={handleScheduleChange}
          disabled={schedules.length === 0}
        >
          <SelectTrigger className="
h-14
w-full
rounded-2xl
border-border/50
bg-background/80
px-4
text-[11px]
font-black
uppercase
tracking-[0.18em]
shadow-sm
hover:border-primary/30
overflow-visible
">
            <div className="flex items-center gap-2 truncate">
              <Briefcase className="size-4 text-primary/50 shrink-0" />
              <SelectValue
                placeholder={loading ? "Loading..." : "Select Schedule"}
              />
            </div>
          </SelectTrigger>

          <SelectContent
            position="popper"
            align="start"
            className="
w-[var(--radix-select-trigger-width)]
min-w-[240px]
max-w-[420px]
rounded-2xl
border
border-border/50
bg-background/95
backdrop-blur-xl
shadow-2xl
p-2
"
          >
            {schedules.map((s: any) => (
              <SelectItem
                key={s.id}
                value={s.id.toString()}
                className="rounded-xl py-3"
              >
                <div className="min-w-0 flex flex-col">
                  <span className="block truncate font-bold text-[12px]">
                    {s.title}
                  </span>

                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1 truncate">
                    {s.companyName}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="py-32 flex justify-center">
            <Loader text="Retrieving application records..." />
          </div>
        )}

        {!loading && scheduleId && (
          <>
            <div className="hidden md:block saas-card p-0 overflow-visible">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">ID</th>
                      <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Student Information</th>
                      <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Target Role</th>
                      <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Current Stage</th>
                      <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredApplications.map((app: any) => (
                      <tr key={app.applicationId} className="hover:bg-muted/20 transition-colors group">
                        <td className="px-6 py-5 text-center">
                          <span className="text-[10px] font-black text-muted-foreground bg-muted px-2 py-1 rounded-md">
                            #{app.applicationId}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                              {app.name?.charAt(0) || "S"}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">{app.name}</p>
                                <span className="text-[9px] font-black text-muted-foreground/50">ID: {app.studentId}</span>
                              </div>
                              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{app.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                              <Briefcase className="size-3.5 text-muted-foreground" />
                              {app.jobTitle}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
                              <Building2 className="size-3" />
                              {app.department?.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <Layers className="size-3.5 text-muted-foreground" />
                            <span className="text-sm font-semibold text-foreground">
                              {app.currentRound || "Initial Screening"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <Badge className={cn("px-4 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm", getStatusStyle(app.status))}>
                            {app.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredApplications.map((app: any) => (
                <div key={app.applicationId} className="saas-card p-6 space-y-5">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                        {app.name?.charAt(0) || "S"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-foreground truncate">{app.name}</h3>
                          <span className="text-[10px] font-black text-muted-foreground/40 bg-muted px-1.5 py-0.5 rounded">#{app.applicationId}</span>
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate">{app.email}</p>
                      </div>
                    </div>
                    <Badge className={cn("px-3 py-1 rounded-xl text-[8px] font-black border uppercase tracking-widest", getStatusStyle(app.status))}>
                      {app.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <Briefcase className="size-3" /> Role
                      </p>
                      <p className="text-xs font-bold text-foreground truncate">{app.jobTitle}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <Layers className="size-3" /> Stage
                      </p>
                      <p className="text-xs font-bold text-foreground truncate">{app.currentRound || "Screening"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <Building2 className="size-3" /> Dept
                      </p>
                      <p className="text-xs font-bold text-foreground truncate">{app.department?.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                        <Hash className="size-3" /> Student ID
                      </p>
                      <p className="text-xs font-bold text-foreground truncate">{app.studentId}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination UI Integration */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 bg-background p-4 rounded-xl border border-border shadow-sm">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-xl font-bold text-[10px] uppercase tracking-widest h-9 px-4"
                >
                  Previous
                </Button>

                <div className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                  Page <span className="text-foreground">{meta.page}</span> of <span className="text-foreground">{meta.totalPages}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-xl font-bold text-[10px] uppercase tracking-widest h-9 px-4"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {!loading && !scheduleId && (
          <div className="py-32 text-center saas-card border-dashed bg-muted/10">
            <div className="size-20 bg-muted/30 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
              <Users className="size-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No Active Application</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Please select or create an interview schedule to monitor recruitment applications.
            </p>
          </div>
        )}

        {!loading && scheduleId && filteredApplications.length === 0 && (
          <div className="py-32 text-center saas-card border-dashed bg-muted/10">
            <div className="size-20 bg-muted/30 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
              <Search className="size-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No matches found</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              We couldn't find any applications matching your current search parameters.
            </p>
          </div>
        )}
      </div>
    </AdminPageLayout>
  );
};

export default ApplicationsManagement;