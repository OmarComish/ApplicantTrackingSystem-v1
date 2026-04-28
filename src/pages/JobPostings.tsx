import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, MoreHorizontal } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {useConfig} from "@/hooks/use-config";
import { toast } from "@/hooks/use-toast";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  status: "active" | "paused" | "closed";
  applicants: number;
  createdAt: string;
  minSalary: number,
  maxSalary: number,
  company: number,
  description:string,
  responsibilities: string,
  requirements: string,
  type: number,
}

/*const initialJobs: Job[] = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    department: "Engineering",
    location: "Remote",
    status: "active",
    applicants: 45,
    createdAt: "2024-01-15",
    minSalary: 1500.0,
    maxSalary: 3500.00,
  },
  {
    id: "2",
    title: "Backend Engineer",
    department: "Engineering",
    location: "New York",
    status: "active",
    applicants: 32,
    createdAt: "2024-01-10",
    minSalary: 1500.0,
    maxSalary: 3500.00,
  },
  {
    id: "3",
    title: "UI/UX Designer",
    department: "Design",
    location: "San Francisco",
    status: "paused",
    applicants: 28,
    createdAt: "2024-01-05",
    minSalary: 1500.0,
    maxSalary: 3500.00,
  },
  {
    id: "4",
    title: "Product Manager",
    department: "Product",
    location: "Remote",
    status: "active",
    applicants: 22,
    createdAt: "2024-01-01",
    minSalary: 1500.0,
    maxSalary: 3500.00,
  },
  {
    id: "5",
    title: "DevOps Engineer",
    department: "Engineering",
    location: "Austin",
    status: "closed",
    applicants: 18,
    createdAt: "2023-12-20",
    minSalary: 1500.0,
    maxSalary: 3500.00,
  },
];*/

export default function JobPostings() {
  //const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [jobs, setJobs] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const {config, loading} = useConfig();
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    description: "",
    responsibilities: "",
    requirements: "",
    type: 1,
    status: "active" as Job["status"],
    minSalary: 0,
    maxSalary:  0,
  });

  useEffect(()=>{
     try{
       if(!config) return;
       setIsLoadingJobs(true);
       fetch(`${config.apiBaseUrl}/api/jobpostings`)
       .then((response)=>{
          return response.json();
       })
       .then((data)=>{
          const formattedJobs = data.map((job: any)=>({...job, status:
             job.status === 1 ? "active": job.status===2? "paused": "closed"
          }));
           setJobs(formattedJobs);
       });
     } catch(error){
        toast({
             title: "Data fetch error",
             description:"Failed to fetch jobs data from the server",
             variant: "destructive"
        });
     } finally {
       setIsLoadingJobs(false);
     }

  },[config]);

  const handleOpenDialog = (job?: Job) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        title: job.title,
        department: job.department,
        location: job.location,
        description: "",
        status: job.status,
        minSalary: job.minSalary,
        maxSalary: job.maxSalary,
        responsibilities: job.responsibilities,
        requirements: job.requirements,
        type: job.type
      });
    } else {
      setEditingJob(null);
      setFormData({
        title: "",
        department: "",
        location: "",
        description: "",
        status: "active",
        minSalary: 0,
        maxSalary: 0,
        type: 0,
        responsibilities: "",
        requirements: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async() => {
    if (editingJob) {
      setJobs(
        jobs.map((job) =>
          job.id === editingJob.id
            ? { ...job, ...formData }
            : job
        )
      );
    } else {
      const newJob: Job = {
        id: Date.now().toString(),
        title: formData.title,
        department: formData.department,
        location: formData.location,
        status: formData.status,
        applicants: 0,
        createdAt: new Date().toISOString().split("T")[0],
        minSalary: formData.minSalary,
        maxSalary: formData.maxSalary,
        company: 1,
        description: formData.description,
        responsibilities: formData.responsibilities,
        type: 1,
        requirements: formData.requirements
      };
      
      setJobs([newJob, ...jobs]);
      const payload = {
        title: formData.title,
        requirements: formData.description,
        department: formData.department,
        location: formData.location,
        salaryMin: formData.minSalary,
        salaryMax: formData.maxSalary,
        description: formData.description,
        responsibilities: formData.responsibilities,
        type: 2,
        companyId: 3,
        featured: true,
        createdByUserId: "Don Self"
      };
      //console.log(payload);
      try {
        const response = await fetch(`${config.apiBaseUrl}/api/jobpostings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        if(!response.ok){
           throw new Error(`We failed to add new job posting ${response.status}`);
        }
        const result = await response.json();
        //console.log(result);

        toast({
          title: "Reservation Created",
          description: `Job posting for ${formData.title} has been successfully created.`,
        });

          setFormData({
            title: "",
            department: "",
            location: "",
            description: "",
            status: "active",
            minSalary: 0,
            maxSalary: 0,
            type: 0,
            responsibilities: "",
            requirements: ""
          });

         setIsDialogOpen(false);

      } catch (error) {
          toast({
            title: "Error",
            description: "We failed to create Job Posting. Please try again.",
            variant: "destructive",
          });
          console.error('Error creating job posting:', error);
      }
    }
   
  };

  const handleDelete = (id: string) => {
    setJobs(jobs.filter((job) => job.id !== id));
  };

  const getStatusBadge = (status: Job["status"]) => {
    const variants = {
      active: "bg-success/10 text-success border-success/20",
      paused: "bg-warning/10 text-warning border-warning/20",
      closed: "bg-muted text-muted-foreground border-border",
    };
    return (
      <Badge variant="outline" className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Job Postings</h1>
          <p className="text-muted-foreground">
            Manage your open positions and job listings
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Job
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingJob ? "Edit Job Posting" : "Create New Job Posting"}
              </DialogTitle>
              <DialogDescription>
                {editingJob
                  ? "Update the job posting details below."
                  : "Fill in the details for the new job posting."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Senior Frontend Developer"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label htmlFor="minSalary">Minimum Salary</Label>
                     <Input
                       id ="minSalary"
                       type="number"
                       min="0"
                       step ="0.01"
                       value ={formData.minSalary}
                       onChange={(e)=>
                        setFormData({...formData, minSalary: parseFloat(e.target.value)})
                       }
                       placeholder="0.00"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="maxSalary">Maximum Salary</Label>
                     <Input
                       id="maxSalary"
                       min="1"
                       type="number"
                       step="1"
                       value= {formData.maxSalary}
                       onChange={(e)=>
                         setFormData({...formData, maxSalary: parseFloat(e.target.value)})
                       } 
                       placeholder="0.00"
                     />
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) =>
                      setFormData({ ...formData, department: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g., Remote, New York"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: Job["status"]) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Job description..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                 <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) =>
                      setFormData({ ...formData, requirements: e.target.value })
                    }
                    placeholder="Job requirements..."
                    rows={4}
                  />
              </div>
               <div className="space-y-2">
                  <Label htmlFor="responsibilities">Responsibilities</Label>
                   <Textarea
                    id="responsibilities"
                    value={formData.responsibilities}
                    onChange={(e) =>
                      setFormData({ ...formData, responsibilities: e.target.value })
                    }
                    placeholder="Job responsibilities..."
                    rows={4}
                   />
               </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingJob ? "Save Changes" : "Create Job"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Job Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Applicants</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id} className="hover:bg-muted/30">
                <TableCell className="font-medium">{job.jobTitle}</TableCell>
                <TableCell>{job.department}</TableCell>
                <TableCell>{job.location}</TableCell>
                <TableCell>{job.applicants}</TableCell>
                <TableCell>{getStatusBadge(job.status)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenDialog(job)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(job.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
