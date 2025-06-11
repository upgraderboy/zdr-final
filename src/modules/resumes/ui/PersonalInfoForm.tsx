import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { personalInfoSchema, PersonalInfoValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { EditorFormProps } from "../../../../types/globals";
import { LocationPicker } from "./LocationPicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/image-upload";

export default function PersonalInfoForm({
    resumeData,
    setResumeData,
}: EditorFormProps) {
    const form = useForm<PersonalInfoValues>({
        resolver: zodResolver(personalInfoSchema),
        defaultValues: {
            photoUrl: resumeData.photoUrl || "",
            firstName: resumeData.firstName || "",
            lastName: resumeData.lastName || "",
            jobTitle: resumeData.jobTitle || "",
            city: resumeData.city || "",
            country: resumeData.country || "",
            summary: resumeData.summary || "",
            phone: resumeData.phone || "",
            email: resumeData.email || "",
            lat: resumeData.lat || 0,
            lng: resumeData.lng || 0,
            experienceLevel: resumeData.experienceLevel || undefined,
            contractType: resumeData.contractType || undefined,
            gender: resumeData.gender || undefined,
            disability: resumeData.disability || undefined,
            age: resumeData.age || undefined,
            skillType: resumeData.skillType || undefined,
        },
    });
    console.log(form.getValues())
    useEffect(() => {
        const subscription = form.watch((values) => {
            setResumeData((prev) => {
                const newData = { ...prev, ...values };
                if (JSON.stringify(prev) !== JSON.stringify(newData)) {
                    return newData;
                }
                return prev;
            });
        });
        return () => subscription.unsubscribe?.();
    }, [form, setResumeData]);


    return (
        <div className="mx-auto max-w-xl space-y-6">
            <div className="space-y-1.5 text-center">
                <h2 className="text-2xl font-semibold">Personal info</h2>
                <p className="text-sm text-muted-foreground">Tell us about yourself.</p>
            </div>

            <Form {...form}>
                <form className="space-y-3">

                <FormField control={form.control} name="photoUrl" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Photo</FormLabel>
                                <ImageUpload value={field.value ? [field.value] : []} onChange={(url) => {
                                    setResumeData((prev) => {
                                        return {
                                            ...prev,
                                            photoUrl: url,
                                        }
                                    });
                                    field.onChange(url);
                                }} onRemove={() => {
                                    setResumeData((prev) => {
                                        return {
                                            ...prev,
                                            photoUrl: '',
                                        }
                                    });
                                    field.onChange('');
                                }} />
                                <FormMessage />
                            </FormItem>
                        )} />
                    <div className="grid grid-cols-2 gap-3">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <FormField
                            control={form.control}
                            name="jobTitle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Job title</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="age"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Age</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="number" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Controller
                        name="lat"
                        control={form.control}
                        render={({ field: latField }) => (
                            <Controller
                                name="lng"
                                control={form.control}
                                render={({ field: lngField }) => (
                                    <LocationPicker
                                        className="w-full"
                                        apiKey={process.env.GOOGLE_MAPS_API_KEY! || "AIzaSyCRh0XosbCfHfG6-VJMpnbfE7gy2VYE91o"}
                                        value={
                                            latField.value != null && lngField.value != null &&
                                                !isNaN(Number(latField.value)) && !isNaN(Number(lngField.value))
                                                ? { lat: Number(latField.value), lng: Number(lngField.value) }
                                                : undefined
                                        }
                                        defaultValue={resumeData.lat && resumeData.lng ? { lat: resumeData.lat, lng: resumeData.lng } : undefined}
                                        onValueChange={(value) => {
                                            latField.onChange(Number(value?.lat));
                                            lngField.onChange(Number(value?.lng));
                                        }}
                                    />
                                )}
                            />
                        )}
                    />
                    {/* Add a Textarea for summary */}

                    <FormField
                        control={form.control}
                        name="summary"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Summary</FormLabel>
                                <FormControl>
                                    <Textarea {...field} />
                                </FormControl>
                                <FormDescription>
                                    Write a short summary about yourself.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem className="flex flex-col items-start">
                                    <FormLabel>Phone number</FormLabel>
                                    <FormControl className="w-full">
                                        <PhoneInput
                                            placeholder="Enter your phone number"
                                            {...field}
                                            defaultCountry="TR"
                                        />
                                    </FormControl>
                                    <FormDescription>Enter your phone number.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="email" />
                                    </FormControl>
                                    <FormDescription>Enter your email address.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    {/* Show these fields in 2 cols of a row */}
                    {/* Disability - ["Yes", "No"] */}
                    {/* Skill Type - ["TECH", "NON-TECH"] */}
                    <FormField
                        control={form.control}
                        name="skillType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Skill Type</FormLabel>
                                <FormControl>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select skill type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="TECH">TECH</SelectItem>
                                            <SelectItem value="NON-TECH">NON-TECH</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <FormField
                            control={form.control}
                            name="disability"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Disability</FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select disability" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Yes">Yes</SelectItem>
                                                <SelectItem value="No">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Gender - ["Male", "Female", "Other"] */}
                        <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gender</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Male">Male</SelectItem>
                                                <SelectItem value="Female">Female</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Experience Level - ["Entry Level", "Mid Level", "Senior Level"] */}
                        <FormField
                            control={form.control}
                            name="experienceLevel"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Experience Level</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select experience level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Entry Level">Entry Level</SelectItem>
                                                <SelectItem value="Mid Level">Mid Level</SelectItem>
                                                <SelectItem value="Senior Level">Senior Level</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Job Type - ["Full-Time", "Part-Time", "Internship"] */}
                        <FormField
                            control={form.control}
                            name="contractType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contract Type</FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select contract type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Internship">Internship</SelectItem>
                                                <SelectItem value="Apprenticeship">Apprenticeship</SelectItem>
                                                <SelectItem value="Volunteer">Volunteer</SelectItem>
                                                <SelectItem value="Freelance">Freelance</SelectItem>
                                                <SelectItem value="Employee permanent contract">Employee permanent contract</SelectItem>
                                                <SelectItem value="Employee short-term contract">Employee short-term contract</SelectItem>
                                                <SelectItem value="External Consultant">External Consultant</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </form>
            </Form>
        </div>
    );
}