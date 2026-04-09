import { useEffect, useState } from "react";
import { Eye, UserCheck, UserX, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { useConfig } from "@/hooks/use-config";
import { toast } from "@/hooks/use-toast";

interface Applicant {
  id: string;
  name: string;
  email: string;
  education: string;
  experience: number;
  score: number;
  status: "new" | "screening" | "interview" | "shortlisted" | "rejected";
  jobId: string;
  jobTitle: string;
  resumeSummary: string;
}

const jobs = [
  { id: "all", title: "All Jobs" },
  { id: "1", title: "Senior Frontend Developer" },
  { id: "2", title: "Backend Engineer" },
  { id: "3", title: "UI/UX Designer" },
  { id: "4", title: "Product Manager" },
];

const initialApplicants: Applicant[] = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex@email.com",
    education: "Bachelor's",
    experience: 5,
    score: 92,
    status: "shortlisted",
    jobId: "1",
    jobTitle: "Senior Frontend Developer",
    resumeSummary: "Experienced frontend developer with expertise in React, TypeScript, and modern CSS frameworks. Led multiple successful product launches.",
  },
  {
    id: "2",
    name: "Sarah Williams",
    email: "sarah@email.com",
    education: "Master's",
    experience: 3,
    score: 88,
    status: "interview",
    jobId: "1",
    jobTitle: "Senior Frontend Developer",
    resumeSummary: "Full-stack developer transitioning to frontend. Strong background in user experience and design systems.",
  },
  {
    id: "3",
    name: "Michael Chen",
    email: "michael@email.com",
    education: "PhD",
    experience: 7,
    score: 95,
    status: "shortlisted",
    jobId: "2",
    jobTitle: "Backend Engineer",
    resumeSummary: "Senior backend engineer specializing in distributed systems and microservices architecture.",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily@email.com",
    education: "Bachelor's",
    experience: 2,
    score: 75,
    status: "screening",
    jobId: "3",
    jobTitle: "UI/UX Designer",
    resumeSummary: "Creative designer with a portfolio of award-winning mobile and web applications.",
  },
  {
    id: "5",
    name: "James Wilson",
    email: "james@email.com",
    education: "Master's",
    experience: 4,
    score: 82,
    status: "new",
    jobId: "1",
    jobTitle: "Senior Frontend Developer",
    resumeSummary: "Frontend specialist focused on performance optimization and accessibility.",
  },
  {
    id: "6",
    name: "Lisa Anderson",
    email: "lisa@email.com",
    education: "Bachelor's",
    experience: 1,
    score: 65,
    status: "rejected",
    jobId: "4",
    jobTitle: "Product Manager",
    resumeSummary: "Entry-level product enthusiast with strong analytical skills.",
  },
];

export default function Applicants() {
  const [applicants, setApplicants] = useState([]); //<Applicant[]>(initialApplicants);
  const [selectedJob, setSelectedJob] = useState("all");
  const [educationFilter, setEducationFilter] = useState("all");
  const [experienceRange, setExperienceRange] = useState([0, 10]);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const {config, loading} = useConfig();
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(true);


  useEffect(()=>{
     try {
         if(!config) return;
         setIsLoadingApplicants(true);
        fetch(`${config.apiBaseUrl}/api/applicants/allapplicantlistings`)
       .then((response)=>{
          return response.json();
       })
       .then((data)=>{
          console.log(data)
          const formattedApplicants = data.map((applicant: any)=>({...applicant, status: applicant.status.toLowerCase() }));
           setApplicants(formattedApplicants);
       });
     } catch (error) {
          toast({
                title: "Data fetch error",
                description:"Failed to fetch applicant data from the server",
                variant: "destructive"
          });
     } finally {
        setIsLoadingApplicants(false);
     }

  },[config]);

  const filteredApplicants = applicants.filter((applicant) => {
    if (selectedJob !== "all" && applicant.jobId !== selectedJob) return false;
    if (educationFilter !== "all" && applicant.education !== educationFilter) return false;
    if (applicant.experience < experienceRange[0] || applicant.experience > experienceRange[1]) return false;
    return true;
  });

  const handleStatusChange = (id: string, newStatus: Applicant["status"]) => {
    setApplicants(
      applicants.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    setIsProfileOpen(false);
  };

  const getStatusBadge = (status: Applicant["status"]) => {
    const variants = {
      new: "bg-primary/10 text-primary border-primary/20",
      screening: "bg-accent/10 text-accent border-accent/20",
      interview: "bg-warning/10 text-warning border-warning/20",
      shortlisted: "bg-success/10 text-success border-success/20",
      rejected: "bg-destructive/10 text-destructive border-destructive/20",
    };
    const labels = {
      new: "New",
      screening: "Screening",
      interview: "Interview",
      shortlisted: "Shortlisted",
      rejected: "Rejected",
    };
    return (
      <Badge variant="outline" className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success font-semibold";
    if (score >= 75) return "text-primary font-medium";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Applicants</h1>
          <p className="text-muted-foreground">
            Review and manage candidate applications
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Panel */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Narrow down your applicant search
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <FilterContent
                selectedJob={selectedJob}
                setSelectedJob={setSelectedJob}
                educationFilter={educationFilter}
                setEducationFilter={setEducationFilter}
                experienceRange={experienceRange}
                setExperienceRange={setExperienceRange}
              />
            </div>
          </SheetContent>
        </Sheet>

        <div className="hidden lg:block w-64 shrink-0">
          <div className="bg-card rounded-xl border border-border p-4 space-y-6 sticky top-6">
            <h3 className="font-semibold flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </h3>
            <FilterContent
              selectedJob={selectedJob}
              setSelectedJob={setSelectedJob}
              educationFilter={educationFilter}
              setEducationFilter={setEducationFilter}
              experienceRange={experienceRange}
              setExperienceRange={setExperienceRange}
            />
          </div>
        </div>

        {/* Applicants Table */}
        <div className="flex-1 bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Education</TableHead>
                <TableHead className="hidden sm:table-cell">Experience</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplicants.map((applicant) => (
                <TableRow key={applicant.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div>
                      <p className="font-medium">{applicant.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {applicant.jobTitle}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {applicant.education}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {applicant.experience} years
                  </TableCell>
                  <TableCell>
                    <span className={getScoreColor(applicant.score)}>
                      {applicant.score}%
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(applicant.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedApplicant(applicant);
                          setIsProfileOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-success hover:text-success"
                        onClick={() => handleStatusChange(applicant.id, "shortlisted")}
                        disabled={applicant.status === "shortlisted"}
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleStatusChange(applicant.id, "rejected")}
                        disabled={applicant.status === "rejected"}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Applicant Profile Modal */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedApplicant && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedApplicant.name}</DialogTitle>
                <DialogDescription>
                  {selectedApplicant.jobTitle}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Score</span>
                  <span className={getScoreColor(selectedApplicant.score)}>
                    {selectedApplicant.score}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  {getStatusBadge(selectedApplicant.status)}
                </div>
                <div className="border-t border-border pt-4">
                  <h4 className="font-medium mb-2">Education</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplicant.education} Degree
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Experience</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplicant.experience} years
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Resume Summary</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedApplicant.resumeSummary}
                  </p>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  className="text-destructive border-destructive/50 hover:bg-destructive/10"
                  onClick={() => handleStatusChange(selectedApplicant.id, "rejected")}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  className="bg-success hover:bg-success/90"
                  onClick={() => handleStatusChange(selectedApplicant.id, "shortlisted")}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Shortlist
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FilterContent({
  selectedJob,
  setSelectedJob,
  educationFilter,
  setEducationFilter,
  experienceRange,
  setExperienceRange,
}: {
  selectedJob: string;
  setSelectedJob: (v: string) => void;
  educationFilter: string;
  setEducationFilter: (v: string) => void;
  experienceRange: number[];
  setExperienceRange: (v: number[]) => void;
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>Job Posting</Label>
        <Select value={selectedJob} onValueChange={setSelectedJob}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {jobs.map((job) => (
              <SelectItem key={job.id} value={job.id}>
                {job.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Education</Label>
        <Select value={educationFilter} onValueChange={setEducationFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="Bachelor's">Bachelor's</SelectItem>
            <SelectItem value="Master's">Master's</SelectItem>
            <SelectItem value="PhD">PhD</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-3">
        <Label>Experience (years)</Label>
        <Slider
          value={experienceRange}
          onValueChange={setExperienceRange}
          max={10}
          min={0}
          step={1}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{experienceRange[0]} yrs</span>
          <span>{experienceRange[1]} yrs</span>
        </div>
      </div>
    </>
  );
}
