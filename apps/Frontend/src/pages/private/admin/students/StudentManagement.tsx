import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Search, UserCheck, CheckCircle2, XCircle, Check, X, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { fetchStudents, fetchInactiveStudents, activateStudents } from '@/redux/thunks/studentThunk';
import { fetchDepartments } from '@/redux/thunks/departmentThunk';
import type { AppDispatch } from '@/redux/store/store';
import type { RootState } from '@/redux/reducers/rootReducer';
import Loader from '@/components/Loader';
import { AdminPageLayout } from '@/components/layout/AdminPageLayout';
import { PageHeader } from '@/components/PageHeader';

const StudentManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { students: reduxStudents, inactiveStudents: reduxInactiveStudents, loading, error } = useSelector((state: RootState) => state.student);
  const { departments } = useSelector((state: RootState) => state.department);

  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, _setSelectedDept] = useState('All Depts');
  const [selectedStatus, _setSelectedStatus] = useState('All Status');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchStudents({}));
    dispatch(fetchInactiveStudents({}));
    dispatch(fetchDepartments());
  }, [dispatch]);

  const students = useMemo(() => {
    const currentList = activeTab === 'active' ? reduxStudents : reduxInactiveStudents;
    const tabScopedList = currentList.filter((s: any) =>
      activeTab === 'active' ? s.status === 'ACTIVE' : s.status !== 'ACTIVE'
    );

    return tabScopedList.map((s: any) => {
      const isVerified = s.status === 'ACTIVE';
      const departmentName = s.student?.department?.name || '';

      return {
        id: s.id,
        name: s.firstname ? `${s.firstname} ${s.lastname || ''}` : 'Unknown',
        email: s.email || '',
        cgpa: s.student?.cgpa !== undefined && s.student?.cgpa !== null ? s.student.cgpa : 'N/A',
        passingYear: s.student?.passingYear || 'N/A',
        year: s.student?.year || 'N/A',
        dept: departmentName,
        deptId: s.student?.department?.id || null,
        verified: isVerified,
        status: s.status === 'ACTIVE' ? 'approved' : (s.status === 'REJECTED' ? 'rejected' : 'pending'),
      };
    });
  }, [reduxStudents, reduxInactiveStudents, activeTab]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = selectedDept === 'All Depts' || student.dept === selectedDept;
      const matchesStatus = selectedStatus === 'All Status' || student.status === selectedStatus.toLowerCase();
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [students, searchTerm, selectedDept, selectedStatus]);

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(" add new student records.");
    setIsAddModalOpen(false);
  };

  const handleApprove = async (id: number) => {
    const toastId = toast.loading("Approving student account...");
    try {
      await dispatch(activateStudents([id])).unwrap();
      toast.success("Student approved successfully!", { id: toastId });
      dispatch(fetchStudents({}));
      dispatch(fetchInactiveStudents({}));
    } catch (err: any) {
      toast.error(err || "Failed to approve student", { id: toastId });
    }
  };

  const handleReject = (_id: number) => {
    toast.error("Student rejection functionality is coming soon.");
  };

  const handleActivateAll = async () => {
    const allIds = reduxInactiveStudents.map((s: any) => s.id);
    if (allIds.length === 0) {
      toast.info("No inactive students to activate.");
      return;
    }
    const toastId = toast.loading(`Activating all ${allIds.length} students...`);
    try {
      await dispatch(activateStudents(allIds)).unwrap();
      toast.success(`${allIds.length} student(s) activated successfully!`, { id: toastId });
      dispatch(fetchStudents({}));
      dispatch(fetchInactiveStudents({}));
    } catch (err: any) {
      toast.error(err || "Failed to activate all students", { id: toastId });
    }
  };

  if (loading && reduxStudents.length === 0) {
    return <Loader text="Fetching student records..." />;
  }

  if (error) {
    return (
      <AdminPageLayout>
        <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
          <p className="text-destructive font-bold uppercase tracking-widest">{error}</p>
          <Button onClick={() => dispatch(fetchStudents({}))}>Retry</Button>
        </div>
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout>
      <PageHeader
        title="Student Directory"
        description="Manage and verify student accounts across all departments."
        badge="Account Verification"
        icon={GraduationCap}
        variant="sky"
      >
        <div className="relative w-full sm:w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search students..."
            className="pl-9 bg-background border-border h-10 w-full focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
          
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black tracking-tight">Register New Student</DialogTitle>
              <DialogDescription className="font-medium">
                Add a student record to the placement database.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddStudent} className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="saas-label">Full Name</label>
                  <Input required placeholder="Ex: John Doe" className="saas-input" />
                </div>
                <div className="space-y-2">
                  <label className="saas-label">Department</label>
                  <Select>
                    <SelectTrigger className="saas-input">
                      <SelectValue placeholder="Select Dept" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept: any) => (
                        <SelectItem key={dept.id} value={dept.name || dept.deptName}>
                          {dept.name || dept.deptName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="saas-label">CGPA</label>
                  <Input type="number" step="0.01" required placeholder="0.00" className="saas-input" />
                </div>
                <div className="space-y-2">
                  <label className="saas-label">Roll Number</label>
                  <Input required placeholder="24CS001" className="saas-input" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-primary font-bold text-white">
                  {loading ? (
                    <span className="flex items-center gap-2"><Loader size="sm" /> Creating...</span>
                  ) : "Create Record"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Students", value: reduxStudents.length + reduxInactiveStudents.length, icon: Users, color: "indigo" },
          { label: "Verified Students", value: reduxStudents.length, icon: CheckCircle2, color: "emerald" },
          { label: "Pending Verification", value: reduxInactiveStudents.length, icon: UserCheck, color: "amber" },
          { label: "Rejected Applications", value: students.filter((s: any) => s.status === 'rejected').length, icon: XCircle, color: "rose" },
        ].map((stat, idx) => (
          <div key={idx} className={`premium-stat-card stat-glow-${stat.color} group`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-${stat.color === 'indigo' ? 'primary' : stat.color}-500/10 text-${stat.color === 'indigo' ? 'primary' : stat.color}-500`}>
                <stat.icon className="size-5" />
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/5 border border-primary/10">
                 <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                 <span className="text-[9px] font-bold text-primary uppercase">Live</span>
              </div>
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            <h2 className="text-3xl font-black text-foreground mt-1 tracking-tight">{stat.value}</h2>
          </div>
        ))}
      </div>

      {/* Tabs and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border pb-6">
        <div className="flex items-center gap-1 bg-muted/30 border border-border rounded-2xl p-1.5 w-fit">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === 'active'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            Active Directory
            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
            }`}>
              {reduxStudents.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('inactive')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === 'inactive'
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            Pending List
            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'inactive' ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
            }`}>
              {reduxInactiveStudents.length}
            </span>
          </button>
        </div>

        {activeTab === 'inactive' && reduxInactiveStudents.length > 0 && (
          <Button
            onClick={handleActivateAll}
            disabled={loading}
            className="h-12 bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/20 font-black text-sm px-8 rounded-2xl transition-all active:scale-95"
          >
            <UserCheck className="w-5 h-5 mr-2" />
            {loading ? "Activating..." : `Approve All (${reduxInactiveStudents.length})`}
          </Button>
        )}
      </div>

      {/* Data Table */}
      <div className="saas-table-container">
        <Table className="saas-table">
          <TableHeader>
            <TableRow>
              <TableHead className="pl-8">Student Info</TableHead>
              <TableHead>Department & Year</TableHead>
              <TableHead className="text-center">CGPA</TableHead>
              <TableHead className="text-center">Passing Year</TableHead>
              <TableHead className="text-center">Verification Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="py-6 pl-8">
                  <div className="flex flex-col">
                    <span className="font-bold text-base text-foreground tracking-tight">{student.name}</span>
                    <span className="text-xs text-muted-foreground font-medium">{student.email}</span>
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-foreground">{student.dept || "Department Not Assigned"}</span>
                    <span className="text-xs text-muted-foreground font-medium">Year {student.year}</span>
                  </div>
                </TableCell>
                <TableCell className="py-6 text-center">
                  <span className="font-bold text-sm bg-primary/5 text-primary px-3 py-1 rounded-lg border border-primary/10">
                    {student.cgpa}
                  </span>
                </TableCell>
                <TableCell className="py-6 text-center text-sm font-semibold text-muted-foreground">
                  {student.passingYear}
                </TableCell>
                <TableCell className="py-6 text-center">
                  <div className="flex items-center justify-center gap-3">
                    {student.status === 'pending' ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(student.id)}
                          className="h-9 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-500/10 flex items-center gap-2 font-bold text-xs"
                        >
                          <Check className="w-4 h-4" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(student.id)}
                          className="h-9 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-md shadow-rose-500/10 flex items-center gap-2 font-bold text-xs"
                        >
                          <X className="w-4 h-4" /> Reject
                        </Button>
                      </>
                    ) : student.status === 'approved' ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 text-[10px] font-black uppercase tracking-widest">
                        <XCircle className="w-3.5 h-3.5" /> Declined
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredStudents.length === 0 && (
          <div className="py-32 text-center">
            <div className="bg-muted/50 size-20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <p className="font-bold text-lg text-foreground tracking-tight">No students found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search terms or filters.</p>
          </div>
        )}
      </div>
    </AdminPageLayout>
  );
};

export default StudentManagement;
