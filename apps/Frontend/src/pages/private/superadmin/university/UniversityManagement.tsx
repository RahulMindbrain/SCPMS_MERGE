import { useEffect, useState } from "react";
import {
  Building2,
  Search,
  MapPin,
  ChevronRight,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch } from "@/redux/store/store";
import type { RootState } from "@/redux/reducers/rootReducer";

import { fetchUniversities } from "@/redux/thunks/superadmin/universityThunks";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { AdminPageLayout } from "@/components/layout/AdminPageLayout";
import { PageHeader } from "@/components/PageHeader";

import Loader from "@/components/Loader";

type University = {
  id: number;
  name: string;
  code: string;
  city: string;
  state: string;
  country: string;
  status: string;
  createdAt: string;
};

const UniversityManagement = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { universities, loading } = useSelector(
    (state: RootState) => state.superAdmin
  ) as {
    universities: University[];
    loading: boolean;
  };

  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchUniversities());
  }, [dispatch]);

  const filteredUniversities: University[] = universities.filter(
    (u: University) =>
      u.name.toLowerCase().includes(search.trim().toLowerCase()) ||
      u.code.toLowerCase().includes(search.trim().toLowerCase()) ||
      u.city.toLowerCase().includes(search.trim().toLowerCase()) ||
      u.state.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <AdminPageLayout>
      <PageHeader
        title="University Registry"
        description="Global directory of participating academic institutions and university nodes."
        badge="Node Management"
        icon={Building2}
        variant="blue"
      />

      <div className="space-y-8 pb-10">
        {/* Search */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />

            <Input
              placeholder="Search universities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 bg-card border-border/50 rounded-2xl shadow-sm focus:ring-primary/10 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="saas-card overflow-hidden border border-border/50 rounded-3xl">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="w-20 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-5 pl-8">
                    #
                  </TableHead>

                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-5">
                    University
                  </TableHead>

                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-5">
                    Status
                  </TableHead>

                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-5">
                    Location
                  </TableHead>

                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-5 text-right pr-8">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-24 text-center">
                      <Loader text="Retrieving institutional records..." />
                    </TableCell>
                  </TableRow>
                ) : filteredUniversities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-40">
                        <Building2 className="w-12 h-12" />

                        <span className="text-xs font-black uppercase tracking-widest">
                          No universities registered
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUniversities.map(
                    (uni: University, index: number) => (
                      <TableRow
                        key={uni.id}
                        className="border-border/50 hover:bg-muted/30 transition-all group"
                      >
                        {/* Index */}
                        <TableCell className="font-bold text-muted-foreground py-5 pl-8 tabular-nums">
                          {String(index + 1).padStart(2, "0")}
                        </TableCell>

                        {/* University */}
                        <TableCell className="py-5">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                              <Building2 className="size-5" />
                            </div>

                            <div>
                              <span className="font-black text-foreground group-hover:text-blue-600 transition-colors block leading-tight">
                                {uni.name}
                              </span>

                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                {uni.code}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-5">
                          <div className="flex flex-col">
                            <span
                              className={`text-xs font-black uppercase tracking-wide px-3 py-1 rounded-full w-fit ${
                                uni.status === "ACTIVE"
                                  ? "bg-emerald-500/10 text-emerald-600"
                                  : "bg-red-500/10 text-red-500"
                              }`}
                            >
                              {uni.status}
                            </span>

                            <span className="text-[10px] text-muted-foreground mt-1">
                              University Status
                            </span>
                          </div>
                        </TableCell>

                        {/* Location */}
                        <TableCell className="py-5">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                            <MapPin className="size-3.5" />

                            <span>
                              {uni.city}, {uni.state}, {uni.country}
                            </span>
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right py-5 pr-8">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-9 rounded-xl text-muted-foreground hover:bg-muted"
                            >
                              <ChevronRight className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  )
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AdminPageLayout>
  );
};

export default UniversityManagement;