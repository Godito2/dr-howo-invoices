import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Upload, Loader2, Building2, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CompanyProfile() {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingWatermark, setUploadingWatermark] = useState(false);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['company-profile'],
    queryFn: () => base44.entities.CompanyProfile.list(),
  });

  const profile = profiles[0];

  const [formData, setFormData] = useState({
    company_name: "",
    logo_url: "",
    watermark_url: "",
    phone_numbers: "",
    physical_address: "",
    tin_number: "",
    registration_number: "",
    email: "",
    website: "",
    bank_name: "",
    bank_account_number: "",
    bank_branch: "",
    bank_address: ""
  });

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (profile) {
        return base44.entities.CompanyProfile.update(profile.id, data);
      } else {
        return base44.entities.CompanyProfile.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-profile'] });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleInputChange('logo_url', file_url);
    } catch (error) {
      console.error("Error uploading logo:", error);
    }
    setUploading(false);
  };

  const handleWatermarkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingWatermark(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleInputChange('watermark_url', file_url);
    } catch (error) {
      console.error("Error uploading watermark:", error);
    }
    setUploadingWatermark(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Company Profile</h1>
          </div>
          <p className="text-slate-600">Manage your company information and branding</p>
        </div>

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              Company profile saved successfully!
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Section */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Company Logo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                {formData.logo_url ? (
                  <div className="relative">
                    <img
                      src={formData.logo_url}
                      alt="Company Logo"
                      className="w-32 h-32 object-contain border-2 border-slate-200 rounded-lg bg-white p-2"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2"
                      onClick={() => handleInputChange('logo_url', '')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-slate-400" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="logo-upload">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading}
                      onClick={() => document.getElementById('logo-upload').click()}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Logo
                        </>
                      )}
                    </Button>
                  </label>
                  <p className="text-sm text-slate-500 mt-2">
                    Upload your company logo (PNG, JPG recommended). Max size: 5MB. Best dimensions: 500x500px for square logo.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Watermark Section */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Watermark Logo (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                {formData.watermark_url ? (
                  <div className="relative">
                    <img
                      src={formData.watermark_url}
                      alt="Watermark Logo"
                      className="w-32 h-32 object-contain border-2 border-slate-200 rounded-lg bg-white p-2"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2"
                      onClick={() => handleInputChange('watermark_url', '')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center bg-slate-50">
                    <span className="text-xs text-slate-400 text-center px-2">No Watermark</span>
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleWatermarkUpload}
                    className="hidden"
                    id="watermark-upload"
                    disabled={uploadingWatermark}
                  />
                  <label htmlFor="watermark-upload">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploadingWatermark}
                      onClick={() => document.getElementById('watermark-upload').click()}
                    >
                      {uploadingWatermark ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Watermark
                        </>
                      )}
                    </Button>
                  </label>
                  <p className="text-sm text-slate-500 mt-2">
                    Upload a watermark logo that will appear as a subtle background on invoices. PNG with transparency recommended. Best dimensions: 500x500px.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  placeholder="Dr Howo, EMENS GROUP LIMITED"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone_numbers">Phone Numbers *</Label>
                <Input
                  id="phone_numbers"
                  value={formData.phone_numbers}
                  onChange={(e) => handleInputChange('phone_numbers', e.target.value)}
                  placeholder="0747566166, 0780969536, 0757740743"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="info@drhowo.com"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="physical_address">Physical Address</Label>
                <Textarea
                  id="physical_address"
                  value={formData.physical_address}
                  onChange={(e) => handleInputChange('physical_address', e.target.value)}
                  placeholder="TABATA - Aroma, Dar es Salaam, Tanzania"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="www.drhowo.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Registration Details */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Registration Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tin_number">TIN Number</Label>
                <Input
                  id="tin_number"
                  value={formData.tin_number}
                  onChange={(e) => handleInputChange('tin_number', e.target.value)}
                  placeholder="173141513"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registration_number">Registration Number</Label>
                <Input
                  id="registration_number"
                  value={formData.registration_number}
                  onChange={(e) => handleInputChange('registration_number', e.target.value)}
                  placeholder="000"
                />
              </div>
            </CardContent>
          </Card>

          {/* Bank Information */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Bank Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(e) => handleInputChange('bank_name', e.target.value)}
                  placeholder="NMB Bank Plc"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_account_number">Account Number</Label>
                <Input
                  id="bank_account_number"
                  value={formData.bank_account_number}
                  onChange={(e) => handleInputChange('bank_account_number', e.target.value)}
                  placeholder="0123456789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_branch">Branch Name</Label>
                <Input
                  id="bank_branch"
                  value={formData.bank_branch}
                  onChange={(e) => handleInputChange('bank_branch', e.target.value)}
                  placeholder="Dar es Salaam Main Branch"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_address">Bank Address</Label>
                <Input
                  id="bank_address"
                  value={formData.bank_address}
                  onChange={(e) => handleInputChange('bank_address', e.target.value)}
                  placeholder="Ohio Street, Dar es Salaam"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}