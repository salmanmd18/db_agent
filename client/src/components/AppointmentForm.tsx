import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, MapPin, Phone, Wrench } from "lucide-react";
import { useCreateAppointment } from "@/hooks/useCreateAppointment";
import type { Appointment, AppointmentCreate } from "@/types/api";
import { useToast } from "@/hooks/use-toast";

const appointmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(7, "Phone number is required"),
  email: z
    .string()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  location: z.string().min(1, "Location is required"),
  serviceType: z.string().min(1, "Service type is required"),
  preferredDate: z.string().min(1, "Preferred date is required"),
  preferredTime: z.string().optional(),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.string().optional(),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

const LOCATIONS = [
  "Ballwin",
  "Chesterfield",
  "Clayton",
  "Fenton",
  "Florissant",
  "Kirkwood",
  "Maryland Heights",
  "O'Fallon",
  "St. Charles",
  "St. Peters",
];

const SERVICE_TYPES = [
  "Oil Change",
  "Tire Purchase/Installation",
  "Brake Service",
  "Alignment",
  "Battery Replacement",
  "General Auto Repair",
  "Inspection",
  "Other",
];

interface AppointmentFormProps {
  onSuccess?: (appointment?: Appointment) => void;
  onCancel: () => void;
}

export default function AppointmentForm({ onSuccess, onCancel }: AppointmentFormProps) {
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      location: "",
      serviceType: "",
      preferredDate: "",
      preferredTime: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: "",
      notes: "",
    },
  });

  const { createAppointment, isLoading, error } = useCreateAppointment();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (values: AppointmentFormValues) => {
    const payload: AppointmentCreate = {
      name: values.name,
      phone: values.phone,
      email: values.email ? values.email : null,
      location: values.location,
      serviceType: values.serviceType,
      preferredDate: values.preferredDate,
      preferredTime: values.preferredTime || null,
      vehicleMake: values.vehicleMake || null,
      vehicleModel: values.vehicleModel || null,
      vehicleYear: values.vehicleYear || null,
      notes: values.notes || null,
    };

    setSuccessMessage(null);

    try {
      const appointment = await createAppointment(payload);
      setSuccessMessage("Request submitted! Our team will follow up shortly.");
      toast({
        title: "Appointment request sent",
        description: "We'll contact you soon to confirm the details.",
      });
      form.reset();
      onSuccess?.(appointment);
    } catch (err) {
      console.error("Appointment submission error:", err);
      toast({
        title: "Submission failed",
        description: "Please try again or call your nearest location.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-semibold text-lg" data-testid="text-form-title">
          Schedule an Appointment
        </h3>
        <p className="text-sm text-muted-foreground">
          Fill out the form below and our team will contact you to confirm your appointment.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your full name" {...field} data-testid="input-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </FormLabel>
                <FormControl>
                  <Input placeholder="(555) 123-4567" {...field} data-testid="input-phone" />
                </FormControl>
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
                  <Input type="email" placeholder="you@example.com" {...field} data-testid="input-email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-location">
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LOCATIONS.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serviceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Service Type
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-service">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SERVICE_TYPES.map((service) => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferredDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Preferred Date
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} data-testid="input-date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferredTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Time</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <FormControl>
                    <SelectTrigger data-testid="select-time">
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="morning">Morning (7AM-10AM)</SelectItem>
                    <SelectItem value="midday">Midday (10AM-2PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (2PM-6PM)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vehicleMake"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle Make</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Toyota" {...field} data-testid="input-vehicle-make" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vehicleModel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle Model</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Camry" {...field} data-testid="input-vehicle-model" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vehicleYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle Year</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 2021" {...field} data-testid="input-vehicle-year" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Anything else we should know?"
                    {...field}
                    data-testid="input-notes"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error.message}
            </p>
          )}
          {successMessage && (
            <p className="text-sm text-green-600" role="status">
              {successMessage}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              data-testid="button-submit"
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
