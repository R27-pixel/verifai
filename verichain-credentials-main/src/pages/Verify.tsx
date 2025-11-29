import { useState } from 'react';
import { Shield, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { hashJSON } from '@/lib/crypto';
import { supabase } from '@/integrations/supabase/client';

export default function Verify() {
  const { toast } = useToast();
  const [jsonInput, setJsonInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    credential?: any;
    message: string;
  } | null>(null);

  const handleVerify = async () => {
    if (!jsonInput.trim()) {
      toast({
        title: 'Empty Input',
        description: 'Please paste credential JSON to verify.',
        variant: 'destructive',
      });
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // Parse JSON
      const credentialData = JSON.parse(jsonInput);
      
      // Calculate hash
      const hash = await hashJSON(credentialData);
      
      // Query database
      const { data, error } = await supabase
        .from('credentials')
        .select('*')
        .eq('credential_hash', hash)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setVerificationResult({
          isValid: false,
          message: 'This credential could not be found in the blockchain registry.',
        });
      } else if (data.is_revoked) {
        setVerificationResult({
          isValid: false,
          credential: data,
          message: 'This credential has been revoked and is no longer valid.',
        });
      } else {
        setVerificationResult({
          isValid: true,
          credential: data,
          message: 'This credential is valid and verified on the blockchain!',
        });
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: 'Verification Failed',
        description: error.message || 'Invalid JSON format',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClear = () => {
    setJsonInput('');
    setVerificationResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Verify Credentials</h1>
            <p className="text-lg text-muted-foreground">
              Paste credential JSON to instantly verify its authenticity on the blockchain
            </p>
          </div>

          {/* Verification Card */}
          <Card>
            <CardHeader>
              <CardTitle>Credential JSON</CardTitle>
              <CardDescription>
                Paste the complete credential JSON data to verify
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"student_name": "Alex Chen", "university_name": "Stanford University", ...}'
                className="font-mono text-sm min-h-[200px]"
              />

              <div className="flex gap-4">
                <Button
                  onClick={handleVerify}
                  disabled={isVerifying || !jsonInput.trim()}
                  className="flex-1"
                  size="lg"
                >
                  {isVerifying ? 'Verifying...' : 'Verify Credential'}
                </Button>

                <Button
                  onClick={handleClear}
                  variant="outline"
                  size="lg"
                  disabled={!jsonInput && !verificationResult}
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Verification Result */}
          {verificationResult && (
            <Card className={`border-2 ${
              verificationResult.isValid 
                ? 'border-success bg-success/5' 
                : 'border-destructive bg-destructive/5'
            }`}>
              <CardContent className="pt-6">
                <div className="text-center space-y-6">
                  {verificationResult.isValid ? (
                    <>
                      <CheckCircle2 className="h-20 w-20 text-success mx-auto" />
                      <div>
                        <h3 className="text-2xl font-bold text-success mb-2">Valid Credential</h3>
                        <p className="text-muted-foreground">{verificationResult.message}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-20 w-20 text-destructive mx-auto" />
                      <div>
                        <h3 className="text-2xl font-bold text-destructive mb-2">Invalid Credential</h3>
                        <p className="text-muted-foreground">{verificationResult.message}</p>
                      </div>
                    </>
                  )}

                  {verificationResult.credential && (
                    <div className="mt-6 p-4 bg-background rounded-lg text-left space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-3">
                        Credential Details
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Student:</span>
                          <p className="font-medium">{verificationResult.credential.student_name}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">University:</span>
                          <p className="font-medium">{verificationResult.credential.university_name}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Degree:</span>
                          <p className="font-medium">{verificationResult.credential.degree_type}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Major:</span>
                          <p className="font-medium">{verificationResult.credential.major}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">GPA:</span>
                          <p className="font-medium">{verificationResult.credential.gpa}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Graduation:</span>
                          <p className="font-medium">{verificationResult.credential.graduation_date}</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-border">
                        <span className="text-muted-foreground text-xs">Hash:</span>
                        <p className="font-mono text-xs break-all mt-1">
                          {verificationResult.credential.credential_hash}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Each credential is cryptographically hashed and anchored on the blockchain, 
              ensuring tamper-proof verification. Any modification to the credential data 
              will result in a different hash and fail verification.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
