import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Registration {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hearAbout?: string[];
  interests?: string[];
  prayerTopic?: string;
  submittedAt: string;
}

const ADMIN_PIN = "1234";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Registration>("submittedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (isAuthenticated) {
      loadRegistrations();
    }
  }, [isAuthenticated]);

  const loadRegistrations = () => {
    const data = JSON.parse(localStorage.getItem("healthExpoRegistrations") || "[]");
    setRegistrations(data);
  };

  const handleLogin = () => {
    if (pin === ADMIN_PIN) {
      setIsAuthenticated(true);
      toast({
        title: "Access Granted",
        description: "Welcome to the admin dashboard",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect PIN",
        variant: "destructive",
      });
    }
  };

  const handleSort = (field: keyof Registration) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSorted = useMemo(() => {
    let filtered = registrations.filter((reg) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        reg.firstName.toLowerCase().includes(searchLower) ||
        reg.lastName.toLowerCase().includes(searchLower) ||
        reg.email.toLowerCase().includes(searchLower) ||
        reg.phone.toLowerCase().includes(searchLower) ||
        reg.interests?.some(i => i.toLowerCase().includes(searchLower)) ||
        reg.hearAbout?.some(h => h.toLowerCase().includes(searchLower))
      );
    });

    filtered.sort((a, b) => {
      const aValue = a[sortField] || "";
      const bValue = b[sortField] || "";
      
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [registrations, searchTerm, sortField, sortDirection]);

  const exportToCSV = () => {
    const headers = ["First Name", "Last Name", "Email", "Phone", "Hear About", "Interests", "Prayer Topic", "Submitted At"];
    const rows = filteredAndSorted.map(reg => [
      reg.firstName,
      reg.lastName,
      reg.email,
      reg.phone,
      (reg.hearAbout || []).join("; "),
      (reg.interests || []).join("; "),
      reg.prayerTopic || "",
      new Date(reg.submittedAt).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `health-expo-registrations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Registration data has been exported to CSV",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Enter PIN to access the management dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pin">PIN</Label>
              <Input
                id="pin"
                type="password"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleLogin} className="flex-1">
                Login
              </Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Registration Management</h1>
              <p className="text-muted-foreground">Austin Community Health Expo</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportToCSV} variant="outline">
                Export to CSV
              </Button>
              <Button onClick={() => navigate("/")} variant="outline">
                Back to Registration
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search by name, email, phone, or interests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registrations ({filteredAndSorted.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("firstName")}>
                      First Name {sortField === "firstName" && (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("lastName")}>
                      Last Name {sortField === "lastName" && (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("email")}>
                      Email {sortField === "email" && (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("phone")}>
                      Phone {sortField === "phone" && (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead>Hear About</TableHead>
                    <TableHead>Interests</TableHead>
                    <TableHead>Prayer</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("submittedAt")}>
                      Submitted {sortField === "submittedAt" && (sortDirection === "asc" ? "↑" : "↓")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSorted.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No registrations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSorted.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell>{reg.firstName}</TableCell>
                        <TableCell>{reg.lastName}</TableCell>
                        <TableCell>{reg.email}</TableCell>
                        <TableCell>{reg.phone}</TableCell>
                        <TableCell>{reg.hearAbout?.join(", ") || "-"}</TableCell>
                        <TableCell>{reg.interests?.join(", ") || "-"}</TableCell>
                        <TableCell className="max-w-xs truncate">{reg.prayerTopic || "-"}</TableCell>
                        <TableCell>{new Date(reg.submittedAt).toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
