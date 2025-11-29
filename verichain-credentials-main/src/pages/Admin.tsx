import { useState, useRef } from 'react';
import { Upload, Sparkles, Hash, Wallet, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { hashJSON, canonicalizeJSON } from '@/lib/crypto';
import { connectWallet, simulateTransaction, isMetaMaskInstalled } from '@/lib/wallet';
import { supabase } from '@/integrations/supabase/client';

interface CredentialData {
  student_name: string;
  university_name: string;
  degree_type: string;
  major: string;
  gpa: string;
  graduation_date: string;
}

export default function Admin() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [credentialData, setCredentialData] = useState<CredentialData>({
    student_name: '',
    university_name: '',
    degree_type: '',
    major: '',
    gpa: '',
    graduation_date: '',
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload an image file (JPG, PNG)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsExtracting(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setUploadedImage(base64);

        try {
          // Call edge function
          const { data, error } = await supabase.functions.invoke('extract-credential', {
            body: { imageBase64: base64 }
          });

          if (error) throw error;

          if (data.error) {
            throw new Error(data.error);
          }

          // Set extracted data
          setCredentialData(data.data);
          setShowForm(true);

          toast({
            title: 'Extraction Complete',
            description: 'Credential data has been extracted. Review and edit if needed.',
          });
        } catch (err: any) {
          console.error('Extraction error:', err);
          toast({
            title: 'Extraction Failed',
            description: err.message || 'Failed to extract credential data',
            variant: 'destructive',
          });
        } finally {
          setIsExtracting(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('File read error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to read file',
        variant: 'destructive',
      });
      setIsExtracting(false);
    }
  };

  const handleSimulateExtraction = () => {
    setIsExtracting(true);
    
    // Simulate AI extraction delay
    setTimeout(() => {
      setCredentialData({
        student_name: 'Alex Chen',
        university_name: 'Stanford University',
        degree_type: 'Bachelor of Science',
        major: 'Computer Science',
        gpa: '3.9',
        graduation_date: '2023',
      });
      setShowForm(true);
      setIsExtracting(false);
      
      toast({
        title: 'Simulation Complete',
        description: 'Demo credential data loaded. You can now edit and issue.',
      });
    }, 1500);
  };

  const handleInputChange = (field: keyof CredentialData, value: string) => {
    setCredentialData(prev => ({ ...prev, [field]: value }));
  };

  const handleIssue = async () => {
    // Validate all fields are filled
    const emptyFields = Object.entries(credentialData).filter(([_, value]) => !value);
    if (emptyFields.length > 0) {
      toast({
        title: 'Incomplete Data',
        description: 'Please fill in all credential fields.',
        variant: 'destructive',
      });
      return;
    }

    // Check MetaMask
    if (!isMetaMaskInstalled()) {
      toast({
        title: 'MetaMask Not Found',
        description: 'Please install MetaMask to issue credentials.',
        variant: 'destructive',
      });
      return;
    }

    setIsIssuing(true);

    try {
      // Step 1: Connect wallet
      const walletAddress = await connectWallet();
      
      // Step 2: Canonicalize and hash the credential
      const canonical = canonicalizeJSON(credentialData);
      const hash = await hashJSON(credentialData);
      
      // Step 3: Simulate blockchain transaction
      const transactionId = await simulateTransaction(hash);
      
      // Step 4: Save to database
      const { error } = await supabase.from('credentials').insert({
        student_name: credentialData.student_name,
        university_name: credentialData.university_name,
        degree_type: credentialData.degree_type,
        major: credentialData.major,
        gpa: credentialData.gpa,
        graduation_date: credentialData.graduation_date,
        credential_hash: hash,
        wallet_address: walletAddress,
        transaction_id: transactionId,
        raw_json: canonical,
      });

      if (error) throw error;

      toast({
        title: 'Credential Issued Successfully',
        description: `Hash: ${hash.slice(0, 16)}...`,
      });

      // Reset form
      setCredentialData({
        student_name: '',
        university_name: '',
        degree_type: '',
        major: '',
        gpa: '',
        graduation_date: '',
      });
      setShowForm(false);
      setUploadedImage(null);
      
    } catch (error: any) {
      console.error('Error issuing credential:', error);
      toast({
        title: 'Issuance Failed',
        description: error.message || 'Failed to issue credential',
        variant: 'destructive',
      });
    } finally {
      setIsIssuing(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setUploadedImage(null);
    setCredentialData({
      student_name: '',
      university_name: '',
      degree_type: '',
      major: '',
      gpa: '',
      graduation_date: '',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Issue Credentials</h1>
            <p className="text-lg text-muted-foreground">
              Upload a degree certificate to extract and issue blockchain-anchored credentials
            </p>
          </div>

          {/* Upload Section */}
          {!showForm && (
            <Card className="border-2 border-dashed hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Certificate
                </CardTitle>
                <CardDescription>
                  Upload a degree certificate image for AI-powered extraction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-muted rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/5"
                >
                  {isExtracting ? (
                    <>
                      <Sparkles className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
                      <p className="text-sm text-foreground font-medium mb-2">
                        Extracting credential data...
                      </p>
                      <p className="text-xs text-muted-foreground">
                        AI is analyzing the certificate
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Click to upload or drag & drop certificate image
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supports: JPG, PNG (Max 5MB)
                      </p>
                    </>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or use demo mode</span>
                  </div>
                </div>

                <Button
                  onClick={handleSimulateExtraction}
                  disabled={isExtracting}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Load Demo Data
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Credential Form */}
          {showForm && (
            <div className="space-y-6">
              {uploadedImage && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Uploaded Certificate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded certificate" 
                      className="w-full rounded-lg border border-border"
                    />
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Credential Details
                  </CardTitle>
                  <CardDescription>
                    Review and edit the extracted credential information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="student_name">Student Name</Label>
                      <Input
                        id="student_name"
                        value={credentialData.student_name}
                        onChange={(e) => handleInputChange('student_name', e.target.value)}
                        placeholder="Enter student name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="university_name">University</Label>
                      <Input
                        id="university_name"
                        value={credentialData.university_name}
                        onChange={(e) => handleInputChange('university_name', e.target.value)}
                        placeholder="Enter university name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="degree_type">Degree Type</Label>
                      <Input
                        id="degree_type"
                        value={credentialData.degree_type}
                        onChange={(e) => handleInputChange('degree_type', e.target.value)}
                        placeholder="e.g., Bachelor of Science"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="major">Major</Label>
                      <Input
                        id="major"
                        value={credentialData.major}
                        onChange={(e) => handleInputChange('major', e.target.value)}
                        placeholder="e.g., Computer Science"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gpa">GPA</Label>
                      <Input
                        id="gpa"
                        value={credentialData.gpa}
                        onChange={(e) => handleInputChange('gpa', e.target.value)}
                        placeholder="e.g., 3.9"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="graduation_date">Graduation Year</Label>
                      <Input
                        id="graduation_date"
                        value={credentialData.graduation_date}
                        onChange={(e) => handleInputChange('graduation_date', e.target.value)}
                        placeholder="e.g., 2023"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={handleIssue}
                      disabled={isIssuing}
                      className="flex-1"
                      size="lg"
                    >
                      {isIssuing ? (
                        <>
                          <Wallet className="mr-2 h-5 w-5 animate-pulse" />
                          Issuing...
                        </>
                      ) : (
                        <>
                          <Wallet className="mr-2 h-5 w-5" />
                          Issue Credential
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      size="lg"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
