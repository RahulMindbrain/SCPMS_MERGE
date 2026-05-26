import React, { useEffect, useState } from "react"
import {
  Edit3,
  Trash2,
  Search,
  Plus,
  Briefcase,
  MapPin,
  Calendar,
  Sparkles,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useDispatch, useSelector } from "react-redux"
import { fetchCompanyJobs, deleteCompanyJob } from "@/redux/thunks/companyThunk"
import type { RootState } from "@/redux/reducers/rootReducer"
import type { AppDispatch } from "@/redux/store/store"
import { toast } from "sonner"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Link } from "react-router-dom"
import Loader from "@/components/Loader"

const ManageJobs: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { jobs, loading, meta } = useSelector(
    (state: RootState) => state.company
  )
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")

  // Modal States

  useEffect(() => {
    dispatch(fetchCompanyJobs({ page }))
  }, [dispatch, page])

  const handleDeleteJob = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this job drive?")) {
      try {
        await dispatch(deleteCompanyJob(id)).unwrap()
        toast.success("Job drive deleted successfully")
      } catch (error: any) {
        toast.error(error || "Failed to delete job drive")
      }
    }
  }



  const filteredJobs = jobs?.filter(
    (job: any) =>
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen animate-in pb-20 duration-700 fade-in">
      {/* Hero Header */}
      <div className="p-4 md:p-8">
        <div className="company-hero-banner group relative overflow-hidden">
          <div className="hero-mesh">
            <div className="bubble-primary" />
            <div className="bubble-secondary" />
          </div>
          <div className="hero-texture" />

          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="space-y-4">
              <div className="hero-badge">
                <Sparkles size={12} className="animate-pulse" />
                Management Console
              </div>
              <h1 className="hero-title text-3xl sm:text-4xl lg:text-5xl">
                Manage Your <br />
                <span>Job Drives</span>
              </h1>
              <p className="hero-description">
                Monitor active recruitment cycles, review candidate progress,
                and manage your organization's job postings in one place.
              </p>
            </div>

            <Link
              to="/company/post-job"
              className="group relative flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-xs font-black tracking-widest text-primary uppercase transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] active:translate-y-0"
            >
              Post New Drive{" "}
              <Plus
                size={16}
                className="transition-transform duration-300 group-hover:rotate-90"
              />
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-4 md:px-8">
        {/* Search & Stats Bar */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="group relative max-w-md flex-1">
            <Search
              className="absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by title or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="saas-input-with-icon w-full rounded-2xl border border-border bg-card py-3 pr-4 text-sm font-medium shadow-sm transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-6 py-2.5 shadow-sm">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                {meta?.total || jobs?.length || 0} Total Postings
              </span>
            </div>
          </div>
        </div>

        {/* Jobs Grid/List */}
        <div className="hidden md:block saas-card overflow-hidden border-none p-0 shadow-2xl shadow-primary/5">
          <div className="overflow-x-auto">
            <table className="saas-table border-collapse">
              <thead>
                <tr className="border-b border-border/50 bg-muted/5">
                  <th className="px-8 py-4">Job Role</th>
                  <th className="px-6 py-4">Target Departments</th>
                  <th className="px-6 py-4">Core Skills</th>
                  <th className="px-6 py-4">Posted On</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <Loader text="Fetching your recruitment drives..." />
                    </td>
                  </tr>
                ) : filteredJobs?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="rounded-full bg-muted/20 p-4">
                          <Briefcase
                            size={32}
                            className="text-muted-foreground"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Try adjusting your search or{" "}
                            <Link
                              to="/company/post-job"
                              className="font-bold text-primary hover:underline"
                            >
                              post a new drive
                            </Link>
                            .
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredJobs?.map((job: any) => (
                    <tr
                      key={job.id}
                      className="group transition-colors hover:bg-muted/5"
                    >
                      <td className="px-8 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-foreground transition-colors group-hover:text-primary">
                            {job.title}
                          </span>
                          <div className="flex items-center gap-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                            <span className="flex items-center gap-1">
                              <MapPin size={10} className="text-primary/60" /> {job.location}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-border" />
                            <span>ID: {String(job.id).slice(-4).toUpperCase()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-[180px]">
                          {job.eligibleDepartments?.slice(0, 2).map((dept: any) => (
                            <Badge key={dept.id} variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-[9px] font-bold px-2 py-0.5 whitespace-nowrap">
                              {dept.name}
                            </Badge>
                          ))}
                          {job.eligibleDepartments?.length > 2 && (
                            <span className="text-[9px] font-bold text-muted-foreground self-center ml-1">
                              +{job.eligibleDepartments.length - 2} more
                            </span>
                          )}
                          {!job.eligibleDepartments?.length && (
                            <span className="text-[10px] text-muted-foreground italic font-medium">All Depts</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-[180px]">
                          {job.skills?.slice(0, 3).map((skill: any) => (
                            <Badge key={skill.id} variant="outline" className="text-[9px] font-bold px-2 py-0.5 border-muted-foreground/20 text-muted-foreground whitespace-nowrap">
                              {skill.name}
                            </Badge>
                          ))}
                          {job.skills?.length > 3 && (
                            <span className="text-[9px] font-bold text-muted-foreground self-center ml-1">
                              +{job.skills.length - 3} more
                            </span>
                          )}
                          {!job.skills?.length && (
                            <span className="text-[10px] text-muted-foreground italic font-medium">General</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-medium text-muted-foreground">
                          <Calendar size={14} className="text-muted-foreground/50" />
                          <span className="text-[11px]">
                            {job.createdAt
                              ? new Date(job.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "2-digit",
                                  year: "numeric",
                                }
                              )
                              : "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/company/send-job-to-university?jobId=${job.id}`}
                            className="flex items-center gap-2 rounded-lg bg-blue-500/5 px-3 py-1.5 text-[9px] font-bold tracking-wider text-blue-600 uppercase transition-all hover:bg-blue-500 hover:text-white"
                            title="Send Job to University"
                          >
                            Send
                          </Link>
                          <Link
                            to={`/company/post-job?jobId=${job.id}`}
                            className="flex items-center gap-2 rounded-lg bg-emerald-500/5 px-3 py-1.5 text-[9px] font-bold tracking-wider text-emerald-600 uppercase transition-all hover:bg-emerald-500 hover:text-white"
                            title="Modify Drive"
                          >
                            <Edit3 size={12} /> Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="rounded-lg p-2 text-muted-foreground/40 transition-all hover:bg-rose-500/10 hover:text-rose-500"
                            title="Delete Drive"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile View */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader text="Loading drives..." />
            </div>
          ) : filteredJobs?.length === 0 ? (
            <div className="py-20 text-center saas-card border-dashed bg-muted/10">
              <p className="text-sm font-medium text-muted-foreground">No drives found matching your search.</p>
            </div>
          ) : (
            filteredJobs?.map((job: any) => (
              <div key={job.id} className="saas-card p-6 space-y-5">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-foreground text-base leading-tight">{job.title}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      <MapPin size={10} className="text-primary/60" />
                      {job.location}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
                      <Calendar size={12} className="text-muted-foreground/50" />
                      <span className="text-[10px]">
                        {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Departments</p>
                    <div className="flex flex-wrap gap-1">
                      {job.eligibleDepartments?.slice(0, 2).map((dept: any) => (
                        <Badge key={dept.id} variant="secondary" className="bg-primary/5 text-primary border-none text-[8px] font-bold px-1.5 py-0">
                          {dept.name}
                        </Badge>
                      ))}
                      {job.eligibleDepartments?.length > 2 && <span className="text-[8px] text-muted-foreground font-bold">+{job.eligibleDepartments.length - 2}</span>}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Key Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {job.skills?.slice(0, 2).map((skill: any) => (
                        <Badge key={skill.id} variant="outline" className="text-[8px] font-bold px-1.5 py-0 border-muted-foreground/20 text-muted-foreground">
                          {skill.name}
                        </Badge>
                      ))}
                      {job.skills?.length > 2 && <span className="text-[8px] text-muted-foreground font-bold">+{job.skills.length - 2}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-[10px] font-black text-primary uppercase tracking-widest">
                    ID: {String(job.id).slice(-4).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/company/send-job-to-university?jobId=${job.id}`}
                      className="h-9 px-4 flex items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all"
                    >
                      Send
                    </Link>
                    <Link
                      to={`/company/post-job?jobId=${job.id}`}
                      className="size-9 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all"
                    >
                      <Edit3 size={14} />
                    </Link>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="size-9 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="mt-12 flex justify-center pb-12">
            <Pagination>
              <PaginationContent className="rounded-2xl border border-border bg-card p-1 shadow-sm">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => {
                      e.preventDefault()
                      if (page > 1) setPage(page - 1)
                    }}
                    href="#"
                    className={`rounded-xl ${page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
                  />
                </PaginationItem>

                {[...Array(meta.totalPages)].map((_, i) => {
                  const pageNumber = i + 1
                  if (
                    pageNumber === 1 ||
                    pageNumber === meta.totalPages ||
                    (pageNumber >= page - 1 && pageNumber <= page + 1)
                  ) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          href="#"
                          isActive={page === pageNumber}
                          onClick={(e) => {
                            e.preventDefault()
                            setPage(pageNumber)
                          }}
                          className={`rounded-xl ${page === pageNumber ? "bg-primary text-white" : "cursor-pointer hover:bg-muted"}`}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  } else if (
                    pageNumber === page - 2 ||
                    pageNumber === page + 2
                  ) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  }
                  return null
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => {
                      e.preventDefault()
                      if (page < meta.totalPages) setPage(page + 1)
                    }}
                    href="#"
                    className={`rounded-xl ${page === meta.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* Modals */}

      {/* View & Edit modals removed as per user request to move logic to PostJob wizard */}
    </div>
  )
}

export default ManageJobs
