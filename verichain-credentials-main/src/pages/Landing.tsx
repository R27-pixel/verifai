import { Shield, Award, Search, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Award,
      title: 'For Universities',
      description: 'Issue tamper-proof digital credentials anchored on the blockchain',
      action: 'Issue Credentials',
      path: '/admin',
      gradient: 'from-primary to-accent',
    },
    {
      icon: Shield,
      title: 'For Students',
      description: 'Verify the authenticity of your academic credentials instantly',
      action: 'Verify Credentials',
      path: '/verify',
      gradient: 'from-accent to-primary',
    },
    {
      icon: Search,
      title: 'For Recruiters',
      description: 'Search and discover verified candidates with confidence',
      action: 'Search Candidates',
      path: '/recruiter',
      gradient: 'from-primary/80 to-accent/80',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="text-center max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground">
            Tamper-Proof Academic Credentials
            <span className="block text-primary mt-2">Anchored on the Blockchain</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            VerifAI revolutionizes credential verification by leveraging blockchain technology 
            to ensure the authenticity and integrity of academic records.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                style={{ animationDelay: `${index * 150}ms` }}
                onClick={() => navigate(feature.path)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <CardHeader>
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Button 
                    className="w-full group/btn"
                    onClick={() => navigate(feature.path)}
                  >
                    {feature.action}
                    <ChevronRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <div className="text-sm text-muted-foreground">Tamper-Proof</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">Instant</div>
                <div className="text-sm text-muted-foreground">Verification</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">Secure</div>
                <div className="text-sm text-muted-foreground">Blockchain Storage</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
