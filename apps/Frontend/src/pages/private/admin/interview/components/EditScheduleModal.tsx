import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Edit3, MapPin, 
  Calendar as CalendarIcon, 
  Briefcase,
  Clock
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/redux/store/store';
import { fetchCompanies, fetchJobsByCompanyId } from '@/redux/thunks/companyThunk';
import {
  createSchedule,
  updateSchedule,
  sendScheduleMessage
} from '@/redux/thunks/interviewThunk';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import Loader from '@/components/Loader';

interface EditModalProps {
  schedule: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
}

export const EditScheduleModal: React.FC<EditModalProps> = ({
  schedule,
  open,
  onOpenChange,
  mode
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { companies, jobs } = useSelector((state: RootState) => state.company);
  const isCreate = mode === 'create';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    companyId: "",
    jobIds: [] as number[],
    venue: "",
    startTime: "",
    endTime: "",
    message: ""
  });

  useEffect(() => {
    if (open) {
      dispatch(fetchCompanies({ page: 1, limit: 100 }));
      if (schedule && mode === 'edit') {
        setFormData({
          title: schedule.title || "",
          companyId: schedule.companyId?.toString() || "",
          jobIds: schedule.jobs?.map((j: any) => j.id) || [],
          venue: schedule.venue || "",
          startTime: schedule.startTime ? new Date(schedule.startTime).toISOString().slice(0, 16) : "",
          endTime: schedule.endTime ? new Date(schedule.endTime).toISOString().slice(0, 16) : "",
          message: ""
        });
        if (schedule.companyId) {
          dispatch(fetchJobsByCompanyId({ id: schedule.companyId, params: { status: 'APPROVED' } }));
        }
      } else if (mode === 'create') {
        setFormData({
          title: "",
          companyId: "",
          jobIds: [],
          venue: "",
          startTime: "",
          endTime: "",
          message: ""
        });
      }
    }
  }, [open, schedule, mode, dispatch]);

  const handleCompanyChange = (value: string) => {
    setFormData(prev => ({ ...prev, companyId: value, jobIds: [] }));
    dispatch(fetchJobsByCompanyId({ id: Number(value), params: { status: 'APPROVED' } }));
  };

  const handleJobToggle = (jobId: number) => {
    setFormData(prev => ({
      ...prev,
      jobIds: prev.jobIds.includes(jobId)
        ? prev.jobIds.filter(id => id !== jobId)
        : [...prev.jobIds, jobId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("Please provide a drive title");
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      toast.error("Please select both start and end times");
      return;
    }
    if (!formData.venue) {
      toast.error("Please provide a venue or link");
      return;
    }

    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      toast.error("End time must be after start time");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isCreate) {
        const payload = {
          ...formData,
          companyId: Number(formData.companyId),
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
        };
        const res = await dispatch(createSchedule(payload)).unwrap();
        
        if (res.success === false) {
          toast.error(res.message || "Time conflict detected or invalid schedule");
          return;
        }

        if (formData.message.trim()) {
          await dispatch(sendScheduleMessage({ id: res.data.id, message: formData.message }));
        }
        toast.success("Schedule created successfully");
      } else {
        const payload = {
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
          venue: formData.venue,
        };
        const res = await dispatch(updateSchedule({ id: schedule.id, scheduleData: payload })).unwrap();
        
        if (res.success === false) {
          toast.error(res.message || "Failed to update schedule");
          return;
        }

        if (formData.message.trim()) {
          await dispatch(sendScheduleMessage({ id: schedule.id, message: formData.message }));
        }
        toast.success("Schedule updated successfully");
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message || error?.toString() || "Unable to complete the request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => onOpenChange(false)}
      title={isCreate ? "Schedule New Drive" : "Drive Logistics"}
      subtitle={isCreate ? "Set up a new recruitment session" : "Finalize the interview schedule details"}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 py-2">
        <div className="space-y-3">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Drive Title</label>
          <div className="relative group">
            <Input
              placeholder="e.g. Campus Recruitment 2024"
              value={formData.title}
              disabled={!isCreate}
              className="h-14 rounded-2xl bg-[#F8FAFC] border-slate-200/60 font-medium focus:ring-[#1A6CFF]/10 text-slate-700 pl-12"
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
            <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-[#1A6CFF] transition-colors" />
          </div>
        </div>

        {isCreate && (
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Select Company</label>
            <Select value={formData.companyId} onValueChange={handleCompanyChange}>
              <SelectTrigger className="h-14 rounded-2xl bg-[#F8FAFC] border-slate-200/60 font-bold text-xs uppercase tracking-widest px-5 text-slate-600">
                <SelectValue placeholder="Select Company" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Start Time</label>
            <div className="relative group">
              <Input
                type="datetime-local"
                value={formData.startTime}
                className="h-14 rounded-2xl bg-[#F8FAFC] border-slate-200/60 font-medium text-slate-700 pl-12 [color-scheme:light]"
                onChange={(e) => {
                  const newStart = e.target.value;
                  setFormData(prev => {
                    const updates: any = { ...prev, startTime: newStart };
                    if (newStart && (!prev.endTime || prev.endTime <= newStart)) {
                      const startDate = new Date(newStart);
                      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
                      updates.endTime = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                    }
                    return updates;
                  });
                }}
              />
              <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-[#1A6CFF] transition-colors" />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">End Time</label>
            <div className="relative group">
              <Input
                type="datetime-local"
                value={formData.endTime}
                className="h-14 rounded-2xl bg-[#F8FAFC] border-slate-200/60 font-medium text-slate-700 pl-12 [color-scheme:light]"
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              />
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-[#1A6CFF] transition-colors" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Venue / Link</label>
          <div className="relative group">
            <Input
              placeholder="e.g. Main Auditorium or G-Meet Link"
              value={formData.venue}
              className="h-14 rounded-2xl bg-[#F8FAFC] border-slate-200/60 font-medium text-slate-700 pl-12"
              onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
            />
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-[#1A6CFF] transition-colors" />
          </div>
        </div>

        {isCreate && (
          <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1 flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Target Job Roles
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-3xl border border-slate-100 bg-[#F8FAFC]/50 max-h-[200px] overflow-y-auto custom-scrollbar">
              {jobs.length > 0 ? jobs.map((job) => (
                <div key={job.id} className="flex items-center space-x-3 p-4 rounded-2xl transition-all bg-white border border-slate-100 shadow-sm group hover:border-[#1A6CFF]/30">
                  <Checkbox
                    id={`job-${job.id}`}
                    checked={formData.jobIds.includes(job.id)}
                    onCheckedChange={() => handleJobToggle(job.id)}
                    className="rounded-md border-slate-300 data-[state=checked]:bg-[#1A6CFF] data-[state=checked]:border-[#1A6CFF]"
                  />
                  <label htmlFor={`job-${job.id}`} className="text-sm font-bold text-slate-700 cursor-pointer group-hover:text-[#1A6CFF] transition-colors truncate">
                    {job.title}
                  </label>
                </div>
              )) : (
                <div className="col-span-full py-6 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                    {formData.companyId ? "No approved jobs available" : "Select a company first"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1">Custom Instructions</label>
          <Textarea
            placeholder="Add any specific details or requirements..."
            value={formData.message}
            className="min-h-[120px] rounded-2xl bg-[#F8FAFC] border-slate-200/60 font-medium resize-none focus:ring-[#1A6CFF]/10 p-5 text-slate-700"
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          />
        </div>

        <div className="pt-4 space-y-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-[#1A6CFF] hover:bg-[#0055FF] text-white rounded-2xl font-black uppercase tracking-[0.15em] text-[11px] shadow-[0_12px_24px_rgba(26,108,255,0.3)] hover:shadow-[0_15px_30px_rgba(26,108,255,0.4)] active:scale-[0.98] transition-all duration-300"
          >
            {isSubmitting ? <Loader size="sm" /> : (isCreate ? "Create Schedule" : "Confirm & Save Changes")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-foreground hover:bg-transparent transition-all"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};