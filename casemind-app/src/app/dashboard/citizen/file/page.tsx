"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  UploadCloud, 
  Plus, 
  Trash2, 
  Save, 
  FileText,
  AlertCircle
} from "lucide-react";
import axiosClient from "@/lib/axiosClient";

// --- VALIDATION SCHEMAS ---
const petitionerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Valid phone required"),
  address: z.string().min(5, "Address is required"),
  state: z.string().min(2, "State is required"),
  district: z.string().min(2, "District is required"),
  pincode: z.string().min(6, "Valid PIN code required"),
});

const respondentSchema = z.object({
  name: z.string().min(2, "Respondent name is required"),
  type: z.enum(["Individual", "Organization"]),
  address: z.string().min(5, "Address is required"),
  state: z.string().min(2, "State is required"),
  district: z.string().min(2, "District is required"),
  email: z.string().optional(),
  phone: z.string().optional(),
});

const caseSchema = z.object({
  court: z.string().min(2, "Court name is required"),
  category: z.string().min(1, "Category is required"),
  priority: z.enum(["normal", "urgent", "very_urgent"]),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(200, "Description must be at least 200 characters").max(10000, "Max 10000 characters"),
});

const formSchema = z.object({
  petitioner: petitionerSchema,
  respondents: z.array(respondentSchema).min(1, "At least one respondent is required"),
  case_info: caseSchema,
  attachments: z.array(z.string()), // document IDs
  declaration: z.boolean().refine(val => val === true, "You must declare the information is true"),
});

type FormData = z.infer<typeof formSchema>;

// --- MAIN COMPONENT ---
export default function FilePetitionPage() {
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const [uploadFiles, setUploadFiles] = useState<{file: File, progress: number, id?: string, error?: string}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<{caseId: string} | null>(null);

  const { register, control, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      petitioner: {
        name: "", email: "", phone: "", address: "", state: "", district: "", pincode: ""
      },
      respondents: [
        { name: "", type: "Individual", address: "", state: "", district: "", email: "", phone: "" }
      ],
      case_info: {
        court: "", category: "", priority: "normal", title: "", description: ""
      },
      attachments: [],
      declaration: false
    }
  });

  const { fields: respondentFields, append: appendRespondent, remove: removeRespondent } = useFieldArray({
    control,
    name: "respondents"
  });

  const formData = watch();

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await axiosClient.get("/dashboard/citizen");
        if (res.data.user) {
          setValue("petitioner.name", res.data.user.name);
          setValue("petitioner.email", res.data.user.email);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    }
    loadProfile();
  }, [setValue]);

  // --- AUTO-SAVE DRAFT ---
  const saveDraft = useCallback(async (data: any) => {
    try {
      setIsSaving(true);
      const payload = {
        petitioner: data.petitioner,
        respondents: data.respondents,
        court: data.case_info?.court,
        category: data.case_info?.category,
        priority: data.case_info?.priority,
        title: data.case_info?.title,
        description: data.case_info?.description,
        attachments: data.attachments
      };

      if (!draftId) {
        const res = await axiosClient.post("/petitions/draft", payload);
        setDraftId(res.data.draft_id);
      } else {
        await axiosClient.put(`/petitions/draft/${draftId}`, payload);
      }
      setLastSaved(new Date());
    } catch (err) {
      console.error("Failed to save draft", err);
    } finally {
      setIsSaving(false);
    }
  }, [draftId]);

  useEffect(() => {
    // Autosave every 30 seconds if form has data
    const interval = setInterval(() => {
      if (formData.petitioner.name || formData.case_info.title) {
        saveDraft(formData);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [formData, saveDraft]);

  // --- NAVIGATION ---
  const steps = [
    { id: 1, title: "Petitioner" },
    { id: 2, title: "Respondent" },
    { id: 3, title: "Case Details" },
    { id: 4, title: "Facts" },
    { id: 5, title: "Documents" },
    { id: 6, title: "Review" }
  ];

  const handleNext = async () => {
    let isValid = false;
    if (currentStep === 1) isValid = await trigger("petitioner");
    if (currentStep === 2) isValid = await trigger("respondents");
    if (currentStep === 3) isValid = await trigger(["case_info.court", "case_info.category", "case_info.priority", "case_info.title"]);
    if (currentStep === 4) isValid = await trigger("case_info.description");
    if (currentStep === 5) isValid = true; // documents are optional initially, validation handled at end

    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
      saveDraft(formData);
    }
  };

  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // --- FILE UPLOAD (React Dropzone) ---
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newUploads = acceptedFiles.map(f => ({ file: f, progress: 0 }));
    setUploadFiles(prev => [...prev, ...newUploads]);

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      const form = new FormData();
      form.append("file", file);

      try {
        const res = await axiosClient.post("/documents/upload", form, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
            setUploadFiles(prev => prev.map(uf => uf.file.name === file.name ? { ...uf, progress: percentCompleted } : uf));
          }
        });
        
        // Add doc ID to form state
        const currentAttachments = watch("attachments") || [];
        setValue("attachments", [...currentAttachments, res.data.document_id]);
        
        setUploadFiles(prev => prev.map(uf => uf.file.name === file.name ? { ...uf, id: res.data.document_id, progress: 100 } : uf));
      } catch (err: any) {
        setUploadFiles(prev => prev.map(uf => uf.file.name === file.name ? { ...uf, error: err.message } : uf));
      }
    }
  }, [setValue, watch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    }
  });

  const removeFile = (fileName: string, docId?: string) => {
    setUploadFiles(prev => prev.filter(f => f.file.name !== fileName));
    if (docId) {
      const current = watch("attachments");
      setValue("attachments", current.filter(id => id !== docId));
    }
  };

  // --- SUBMIT FINAL ---
  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      const payload = {
        title: data.case_info.title,
        description: data.case_info.description,
        court: data.case_info.court,
        respondent_name: data.respondents.map(r => r.name).join(", "),
        category: data.case_info.category,
        priority: data.case_info.priority === "urgent" ? "Urgent" : data.case_info.priority === "very_urgent" ? "Very Urgent" : "Normal",
        attachments: data.attachments
      };

      const res = await axiosClient.post("/petitions", payload);
      setSubmitSuccess({ caseId: res.data.case_id });
    } catch (err: any) {
      alert("Failed to submit petition: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- SUCCESS VIEW ---
  if (submitSuccess) {
    return (
      <div className="max-w-3xl mx-auto mt-12 bg-white border border-[#E5E7EB] rounded-2xl p-12 text-center shadow-sm">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-[#111111] mb-2">Petition Submitted Successfully</h1>
        <p className="text-gray-500 mb-8">Your case has been registered and is pending registry review.</p>
        
        <div className="bg-gray-50 border border-[#E5E7EB] rounded-xl p-6 mb-8 inline-block text-left min-w-[300px]">
          <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-1">Case ID</p>
          <p className="text-2xl font-bold text-[#C9971A]">{submitSuccess.caseId}</p>
        </div>

        <div className="flex justify-center gap-4">
          <button onClick={() => router.push("/dashboard/citizen")} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
            Return to Dashboard
          </button>
          <button onClick={() => router.push(`/dashboard/citizen/cases/${submitSuccess.caseId}`)} className="px-6 py-2.5 bg-[#111111] text-white font-bold rounded-xl hover:bg-gray-800 transition-colors">
            View Case Details
          </button>
        </div>
      </div>
    );
  }

  // --- RENDERER ---
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-[#111111]">File a Petition</h1>
          <p className="text-gray-500 font-medium mt-1">Complete the multi-step wizard to register your case.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          {isSaving ? (
            <span className="flex items-center gap-1"><Save className="w-4 h-4 animate-pulse" /> Saving...</span>
          ) : lastSaved ? (
            <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="w-4 h-4" /> Draft saved {lastSaved.toLocaleTimeString()}</span>
          ) : null}
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="bg-white border border-[#E5E7EB] p-6 rounded-2xl shadow-sm">
        <div className="flex justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 -translate-y-1/2 rounded-full"></div>
          <div className="absolute top-1/2 left-0 h-1 bg-[#C9971A] -z-10 -translate-y-1/2 rounded-full transition-all duration-500" style={{ width: `${((currentStep - 1) / 5) * 100}%` }}></div>
          
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 ${
                currentStep >= step.id ? 'bg-[#C9971A] border-[#C9971A] text-white' : 'bg-white border-gray-200 text-gray-400'
              }`}>
                {currentStep > step.id ? <CheckCircle2 className="w-5 h-5" /> : step.id}
              </div>
              <span className={`text-xs font-bold ${currentStep >= step.id ? 'text-[#111111]' : 'text-gray-400'} hidden md:block`}>{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FORM AREA */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden min-h-[400px] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-8"
            >
              
              {/* STEP 1: PETITIONER */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-[#111111] mb-6">Petitioner Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">Full Name *</label>
                      <input {...register("petitioner.name")} className="w-full bg-gray-50 border border-[#E5E7EB] rounded-xl px-4 py-2.5 focus:border-[#C9971A] focus:outline-none" />
                      {errors.petitioner?.name && <p className="text-red-500 text-xs font-medium mt-1">{errors.petitioner.name.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">Email Address *</label>
                      <input type="email" {...register("petitioner.email")} className="w-full bg-gray-50 border border-[#E5E7EB] rounded-xl px-4 py-2.5 focus:border-[#C9971A] focus:outline-none" />
                      {errors.petitioner?.email && <p className="text-red-500 text-xs font-medium mt-1">{errors.petitioner.email.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">Phone Number *</label>
                      <input {...register("petitioner.phone")} className="w-full bg-gray-50 border border-[#E5E7EB] rounded-xl px-4 py-2.5 focus:border-[#C9971A] focus:outline-none" />
                      {errors.petitioner?.phone && <p className="text-red-500 text-xs font-medium mt-1">{errors.petitioner.phone.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">Address *</label>
                      <input {...register("petitioner.address")} className="w-full bg-gray-50 border border-[#E5E7EB] rounded-xl px-4 py-2.5 focus:border-[#C9971A] focus:outline-none" />
                      {errors.petitioner?.address && <p className="text-red-500 text-xs font-medium mt-1">{errors.petitioner.address.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">State *</label>
                      <input {...register("petitioner.state")} className="w-full bg-gray-50 border border-[#E5E7EB] rounded-xl px-4 py-2.5 focus:border-[#C9971A] focus:outline-none" />
                      {errors.petitioner?.state && <p className="text-red-500 text-xs font-medium mt-1">{errors.petitioner.state.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">District *</label>
                        <input {...register("petitioner.district")} className="w-full bg-gray-50 border border-[#E5E7EB] rounded-xl px-4 py-2.5 focus:border-[#C9971A] focus:outline-none" />
                        {errors.petitioner?.district && <p className="text-red-500 text-xs font-medium mt-1">{errors.petitioner.district.message}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">PIN Code *</label>
                        <input {...register("petitioner.pincode")} className="w-full bg-gray-50 border border-[#E5E7EB] rounded-xl px-4 py-2.5 focus:border-[#C9971A] focus:outline-none" />
                        {errors.petitioner?.pincode && <p className="text-red-500 text-xs font-medium mt-1">{errors.petitioner.pincode.message}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: RESPONDENTS */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold text-[#111111]">Respondent Details</h2>
                    <button type="button" onClick={() => appendRespondent({ name: "", type: "Individual", address: "", state: "", district: "", email: "", phone: "" })} className="text-sm font-bold text-[#C9971A] flex items-center gap-1 hover:text-[#b08517]">
                      <Plus className="w-4 h-4" /> Add Respondent
                    </button>
                  </div>
                  
                  {respondentFields.map((field, index) => (
                    <div key={field.id} className="p-6 bg-gray-50 border border-[#E5E7EB] rounded-xl relative">
                      {index > 0 && (
                        <button type="button" onClick={() => removeRespondent(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                      <h3 className="font-bold text-gray-700 mb-4">Respondent #{index + 1}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-gray-700">Respondent Name *</label>
                          <input {...register(`respondents.${index}.name`)} className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 focus:border-[#C9971A] focus:outline-none" />
                          {errors.respondents?.[index]?.name && <p className="text-red-500 text-xs font-medium mt-1">{errors.respondents[index]?.name?.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-gray-700">Type *</label>
                          <select {...register(`respondents.${index}.type`)} className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 focus:border-[#C9971A] focus:outline-none">
                            <option value="Individual">Individual</option>
                            <option value="Organization">Organization</option>
                          </select>
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-sm font-semibold text-gray-700">Address *</label>
                          <input {...register(`respondents.${index}.address`)} className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 focus:border-[#C9971A] focus:outline-none" />
                          {errors.respondents?.[index]?.address && <p className="text-red-500 text-xs font-medium mt-1">{errors.respondents[index]?.address?.message}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">State *</label>
                            <input {...register(`respondents.${index}.state`)} className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 focus:border-[#C9971A] focus:outline-none" />
                            {errors.respondents?.[index]?.state && <p className="text-red-500 text-xs font-medium mt-1">{errors.respondents[index]?.state?.message}</p>}
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">District *</label>
                            <input {...register(`respondents.${index}.district`)} className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 focus:border-[#C9971A] focus:outline-none" />
                            {errors.respondents?.[index]?.district && <p className="text-red-500 text-xs font-medium mt-1">{errors.respondents[index]?.district?.message}</p>}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Email (Optional)</label>
                            <input type="email" {...register(`respondents.${index}.email`)} className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 focus:border-[#C9971A] focus:outline-none" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Phone (Optional)</label>
                            <input {...register(`respondents.${index}.phone`)} className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-2.5 focus:border-[#C9971A] focus:outline-none" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 3: CASE DETAILS */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-[#111111] mb-6">Case Details</h2>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Petition Title *</label>
                    <input placeholder="e.g. Writ Petition regarding land dispute..." {...register("case_info.title")} className="w-full bg-gray-50 border border-[#E5E7EB] rounded-xl px-4 py-2.5 focus:border-[#C9971A] focus:outline-none" />
                    {errors.case_info?.title && <p className="text-red-500 text-xs font-medium mt-1">{errors.case_info.title.message}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">Court *</label>
                      <select {...register("case_info.court")} className="w-full bg-gray-50 border border-[#E5E7EB] rounded-xl px-4 py-2.5 focus:border-[#C9971A] focus:outline-none">
                        <option value="">Select Court</option>
                        <option value="Supreme Court">Supreme Court</option>
                        <option value="High Court">High Court</option>
                        <option value="District Court">District Court</option>
                        <option value="Family Court">Family Court</option>
                        <option value="Tribunal">Tribunal</option>
                      </select>
                      {errors.case_info?.court && <p className="text-red-500 text-xs font-medium mt-1">{errors.case_info.court.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">Category *</label>
                      <select {...register("case_info.category")} className="w-full bg-gray-50 border border-[#E5E7EB] rounded-xl px-4 py-2.5 focus:border-[#C9971A] focus:outline-none">
                        <option value="">Select Category</option>
                        <option value="Civil">Civil</option>
                        <option value="Criminal">Criminal</option>
                        <option value="Family">Family</option>
                        <option value="Consumer">Consumer</option>
                        <option value="Cyber">Cyber</option>
                        <option value="Property">Property</option>
                        <option value="Labour">Labour</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.case_info?.category && <p className="text-red-500 text-xs font-medium mt-1">{errors.case_info.category.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">Priority</label>
                      <select {...register("case_info.priority")} className="w-full bg-gray-50 border border-[#E5E7EB] rounded-xl px-4 py-2.5 focus:border-[#C9971A] focus:outline-none">
                        <option value="normal">Normal</option>
                        <option value="urgent">Urgent</option>
                        <option value="very_urgent">Very Urgent</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: FACTS OF THE CASE */}
              {currentStep === 4 && (
                <div className="space-y-4 flex flex-col h-full">
                  <div className="flex justify-between items-end mb-2">
                    <h2 className="text-xl font-bold text-[#111111]">Facts of the Case</h2>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                      (formData.case_info.description?.length || 0) < 200 || (formData.case_info.description?.length || 0) > 10000 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {formData.case_info.description?.length || 0} / 10000 characters
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Provide a detailed chronological sequence of events. Minimum 200 characters required.</p>
                  
                  <div className="flex-1 relative">
                    <textarea 
                      {...register("case_info.description")} 
                      placeholder="Describe the facts of your case in chronological order..."
                      className="w-full h-80 bg-gray-50 border border-[#E5E7EB] rounded-xl p-4 focus:border-[#C9971A] focus:outline-none resize-none leading-relaxed text-gray-700"
                    ></textarea>
                    {errors.case_info?.description && <p className="text-red-500 text-xs font-medium mt-2 absolute -bottom-6">{errors.case_info.description.message}</p>}
                  </div>
                </div>
              )}

              {/* STEP 5: DOCUMENT UPLOAD */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-[#111111] mb-2">Evidence & Documents</h2>
                  <p className="text-sm text-gray-500 mb-6">Upload PDFs, Word documents, or image evidence to support your petition.</p>
                  
                  <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-[#C9971A] bg-[#C9971A]/5' : 'border-gray-300 hover:border-[#C9971A] hover:bg-gray-50'
                  }`}>
                    <input {...getInputProps()} />
                    <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-[#111111] font-bold text-lg">Drag & drop files here</p>
                    <p className="text-gray-500 text-sm mt-1">or click to browse from your computer</p>
                    <p className="text-xs text-gray-400 mt-4">Supported: PDF, DOCX, PNG, JPEG</p>
                  </div>

                  {uploadFiles.length > 0 && (
                    <div className="space-y-3 mt-8">
                      <h3 className="font-bold text-[#111111] text-sm">Uploaded Files</h3>
                      {uploadFiles.map((fileObj, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 border border-[#E5E7EB] rounded-xl">
                          <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6 text-[#C9971A]" />
                            <div>
                              <p className="text-sm font-bold text-[#111111] line-clamp-1">{fileObj.file.name}</p>
                              <p className="text-xs text-gray-500">{(fileObj.file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            {fileObj.error ? (
                              <span className="text-xs font-bold text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4"/> Failed</span>
                            ) : fileObj.progress < 100 ? (
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-[#C9971A] transition-all" style={{width: `${fileObj.progress}%`}}></div>
                              </div>
                            ) : (
                              <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Uploaded</span>
                            )}
                            <button type="button" onClick={() => removeFile(fileObj.file.name, fileObj.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 6: REVIEW */}
              {currentStep === 6 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-[#111111] mb-2">Review & Submit</h2>
                    <p className="text-sm text-gray-500">Please review all details carefully before submitting to the registry.</p>
                  </div>

                  <div className="bg-gray-50 border border-[#E5E7EB] rounded-xl p-6 space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Case Information</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="text-gray-500 block mb-1">Title</span><span className="font-semibold text-[#111111]">{formData.case_info.title}</span></div>
                        <div><span className="text-gray-500 block mb-1">Court</span><span className="font-semibold text-[#111111]">{formData.case_info.court}</span></div>
                        <div><span className="text-gray-500 block mb-1">Category</span><span className="font-semibold text-[#111111]">{formData.case_info.category}</span></div>
                        <div><span className="text-gray-500 block mb-1">Priority</span><span className="font-semibold text-[#111111] capitalize">{formData.case_info.priority.replace("_", " ")}</span></div>
                      </div>
                    </div>
                    
                    <div className="h-px bg-[#E5E7EB] w-full"></div>

                    <div>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Petitioner</h3>
                      <div className="text-sm">
                        <span className="font-semibold text-[#111111] block">{formData.petitioner.name}</span>
                        <span className="text-gray-500 block">{formData.petitioner.address}, {formData.petitioner.district}, {formData.petitioner.state} - {formData.petitioner.pincode}</span>
                        <span className="text-gray-500 block">{formData.petitioner.email} • {formData.petitioner.phone}</span>
                      </div>
                    </div>

                    <div className="h-px bg-[#E5E7EB] w-full"></div>

                    <div>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Respondents ({formData.respondents.length})</h3>
                      <ul className="text-sm space-y-3">
                        {formData.respondents.map((r, i) => (
                          <li key={i}>
                            <span className="font-semibold text-[#111111] block">{r.name} ({r.type})</span>
                            <span className="text-gray-500 block">{r.address}, {r.district}, {r.state}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="h-px bg-[#E5E7EB] w-full"></div>

                    <div>
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Attached Evidence</h3>
                      <p className="text-sm font-semibold text-[#111111]">{formData.attachments.length} documents uploaded</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <input type="checkbox" id="declaration" {...register("declaration")} className="mt-1 w-4 h-4 text-[#C9971A] border-gray-300 rounded focus:ring-[#C9971A]" />
                    <div>
                      <label htmlFor="declaration" className="text-sm font-bold text-gray-800">I declare that the information provided is true and correct to the best of my knowledge.</label>
                      {errors.declaration && <p className="text-red-500 text-xs font-medium mt-1">{errors.declaration.message}</p>}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* BOTTOM NAVIGATION BAR */}
        <div className="fixed bottom-0 left-0 w-full md:left-64 md:w-[calc(100%-16rem)] bg-white border-t border-[#E5E7EB] p-4 flex justify-between items-center z-40">
          <button 
            type="button" 
            onClick={handleBack} 
            disabled={currentStep === 1 || isSubmitting}
            className="px-6 py-2.5 flex items-center gap-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
          
          {currentStep < 6 ? (
            <button 
              type="button" 
              onClick={handleNext}
              className="px-8 py-2.5 flex items-center gap-2 bg-[#111111] text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-md"
            >
              Next <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-10 py-2.5 flex items-center gap-2 bg-[#C9971A] text-white font-bold rounded-xl hover:bg-[#b08517] transition-colors shadow-md disabled:opacity-50"
            >
              {isSubmitting ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Submitting...</>
              ) : (
                <><CheckCircle2 className="w-5 h-5" /> File Petition</>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
