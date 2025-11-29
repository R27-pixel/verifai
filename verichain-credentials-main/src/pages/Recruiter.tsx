import { useState } from 'react';
import { Search, GraduationCap, MapPin, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Recruiter() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Empty Query',
        description: 'Please enter a search query.',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);

    try {
      // Simple keyword-based search
      const query = searchQuery.toLowerCase();
      
      // Extract GPA filter if present
      const gpaMatch = query.match(/gpa\s*[><=]+\s*(\d+\.?\d*)/i);
      const minGpa = gpaMatch ? parseFloat(gpaMatch[1]) : null;
      
      // Build query
      let dbQuery = supabase
        .from('credentials')
        .select('*')
        .eq('is_revoked', false);

      // Apply filters based on keywords
      if (query.includes('cs') || query.includes('computer science')) {
        dbQuery = dbQuery.ilike('major', '%computer%');
      }
      
      if (query.includes('stanford')) {
        dbQuery = dbQuery.ilike('university_name', '%stanford%');
      }
      
      if (query.includes('berkeley')) {
        dbQuery = dbQuery.ilike('university_name', '%berkeley%');
      }
      
      if (query.includes('mit')) {
        dbQuery = dbQuery.ilike('university_name', '%mit%');
      }

      if (query.includes('bachelor')) {
        dbQuery = dbQuery.ilike('degree_type', '%bachelor%');
      }
      
      if (query.includes('master')) {
        dbQuery = dbQuery.ilike('degree_type', '%master%');
      }

      const { data, error } = await dbQuery;

      if (error) throw error;

      // Apply GPA filter in-memory
      let filteredData = data || [];
      if (minGpa !== null) {
        filteredData = filteredData.filter(c => parseFloat(c.gpa) >= minGpa);
      }

      setCandidates(filteredData);

      if (filteredData.length === 0) {
        toast({
          title: 'No Results',
          description: 'No candidates found matching your criteria.',
        });
      } else {
        toast({
          title: 'Search Complete',
          description: `Found ${filteredData.length} candidate${filteredData.length > 1 ? 's' : ''}`,
        });
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: 'Search Failed',
        description: error.message || 'Failed to search candidates',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setCandidates([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Recruiter Search</h1>
            <p className="text-lg text-muted-foreground">
              Search verified candidates using AI-powered natural language queries
            </p>
          </div>

          {/* Search Card */}
          <Card>
            <CardHeader>
              <CardTitle>Search Query</CardTitle>
              <CardDescription>
                Try: "Find CS grads with GPA &gt; 3.5" or "Stanford computer science graduates"
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter your search query..."
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  size="lg"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
                <Button
                  onClick={handleClear}
                  variant="outline"
                  size="lg"
                  disabled={!searchQuery && candidates.length === 0}
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {candidates.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {candidates.length} Candidate{candidates.length > 1 ? 's' : ''} Found
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {candidates.map((candidate) => (
                  <Card key={candidate.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-xl">{candidate.student_name}</CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <GraduationCap className="h-4 w-4" />
                            {candidate.university_name}
                          </CardDescription>
                        </div>
                        <Badge className="bg-primary text-primary-foreground">
                          GPA {candidate.gpa}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Award className="h-4 w-4" />
                            Degree
                          </span>
                          <p className="font-medium">{candidate.degree_type}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            Major
                          </span>
                          <p className="font-medium">{candidate.major}</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Graduated</span>
                          <span className="font-medium">{candidate.graduation_date}</span>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full">
                        View Full Profile
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {candidates.length === 0 && searchQuery && !isSearching && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search query or filters
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
