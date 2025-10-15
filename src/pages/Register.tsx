import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  lastName: z.string().trim().min(1, "Last name is required").max(100),
  firstName: z.string().trim().min(1, "First name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().min(1, "Phone is required").max(20),
  hearAbout: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  prayerTopic: z.string().trim().max(500).optional(),
});

type FormData = z.infer<typeof formSchema>;

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lastName: "",
      firstName: "",
      email: "",
      phone: "",
      hearAbout: [],
      interests: [],
      prayerTopic: "",
    },
  });

  const hearAboutOptions = [
    "Church/Friend",
    "Newspaper Ad",
    "Poster Ad",
    "Youtube/Online",
    "Other",
  ];

  const interestOptions = [
    "Healthy Fellowship",
    "Healthy Cooking",
    "Health Seminar",
    "Outdoor sports/games",
    "Korean class",
    "Bible studies",
    "Bible prophesy",
    "Signs Magazine",
  ];

  const onSubmit = (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      const registrations = JSON.parse(localStorage.getItem("healthExpoRegistrations") || "[]");
      
      const newRegistration = {
        id: crypto.randomUUID(),
        ...data,
        submittedAt: new Date().toISOString(),
      };
      
      registrations.push(newRegistration);
      localStorage.setItem("healthExpoRegistrations", JSON.stringify(registrations));
      
      toast({
        title: "Registration Successful!",
        description: "Thank you for registering for the Austin Community Health Expo.",
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Austin Community Health Expo</h1>
          <p className="text-lg text-muted-foreground">Registration Form</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Register for the Event</CardTitle>
            <CardDescription>Please fill out the form below to register</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
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
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.doe@example.com" {...field} />
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
                      <FormLabel>Phone *</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="(123) 456-7890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hearAbout"
                  render={() => (
                    <FormItem>
                      <FormLabel>How did you hear about the expo? (Optional)</FormLabel>
                      <div className="space-y-2 mt-2">
                        {hearAboutOptions.map((option) => (
                          <FormField
                            key={option}
                            control={form.control}
                            name="hearAbout"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(option)}
                                    onCheckedChange={(checked) => {
                                      const updatedValue = checked
                                        ? [...(field.value || []), option]
                                        : field.value?.filter((value) => value !== option) || [];
                                      field.onChange(updatedValue);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">{option}</FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="interests"
                  render={() => (
                    <FormItem>
                      <FormLabel>Contact me with more info about these items (Optional)</FormLabel>
                      <div className="space-y-2 mt-2">
                        {interestOptions.map((option) => (
                          <FormField
                            key={option}
                            control={form.control}
                            name="interests"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(option)}
                                    onCheckedChange={(checked) => {
                                      const updatedValue = checked
                                        ? [...(field.value || []), option]
                                        : field.value?.filter((value) => value !== option) || [];
                                      field.onChange(updatedValue);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">{option}</FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prayerTopic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>I would like prayer (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please share your prayer topic..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Registration"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/admin")}
                  >
                    Admin
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
