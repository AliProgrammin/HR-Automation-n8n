"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Upload,
  Eye,
  Edit,
  Trash2,
  Moon,
  Sun,
  FileText,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { CVProfile, ParsedCVProfile } from "@/lib/supabase";
import UploadModal from "@/components/upload-modal";



interface SearchResult {
  document: {
    pageContent: string;
    metadata: {
      source: string;
      blobType: string;
      line: number;
      loc: {
        lines: {
          from: number;
          to: number;
        };
      };
      education: Array<{
        year: string;
        degree: string;
        institution: string;
      }>;
      experience: Array<{
        period: string;
        company: string;
        details: string[];
      }>;
      supabase_id?: string;
      supabase_record_id?: string;
    };
  };
  score: number;
}

export default function CandidateDashboard() {
  const [cvProfiles, setCvProfiles] = useState<ParsedCVProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  // Fetch CV profiles from API
  useEffect(() => {
    const fetchCvProfiles = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/candidates');
        if (!response.ok) {
          throw new Error('Failed to fetch CV profiles');
        }
        const data: ParsedCVProfile[] = await response.json();
         
         // Data is already parsed, no need to JSON.parse again
         setCvProfiles(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setCvProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCvProfiles();
  }, []);

  // Search function to call Qdrant webhook
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    setSearchResults([]); // Clear previous results
    try {
      const response = await fetch('https://conchobar.app.n8n.cloud/webhook/getresults', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: query }),
      });

      if (response.ok) {
        // Get the raw response text first to debug
        const responseText = await response.text();
        console.log('Raw webhook response:', responseText);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        // Check if response is empty
        if (!responseText || responseText.trim() === '') {
          console.error('Webhook returned empty response');
          console.error('This indicates the webhook is not configured properly or not returning data');
          setSearchError('Search service is not configured properly. Please contact support.');
          setSearchResults([]);
          return;
        }
        
        try {
          // Try to parse as JSON
          const results: SearchResult[] = JSON.parse(responseText);
          console.log('Parsed search results:', results);
          setSearchResults(results);
        } catch (parseError) {
          console.error('JSON parsing failed. Response was:', responseText);
          console.error('Parse error:', parseError);
          
          // Check if response looks like HTML/XML
          if (responseText.trim().startsWith('<')) {
            console.error('Webhook returned HTML/XML instead of JSON');
            setSearchError('Search service returned invalid data format. Please contact support.');
          } else {
            setSearchError('Search service returned malformed data. Please try again.');
          }
          
          setSearchResults([]);
        }
      } else {
        console.error('Search failed:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setSearchError(`Search service error (${response.status}). Please try again later.`);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Unable to connect to search service. Please check your internet connection.');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Manual search function
  const handleSearch = () => {
    performSearch(searchTerm);
  };

  // Clear search function
  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSearchError(null);
  };

  // Handle Enter key press in search input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Filter and reorder CV profiles based on search results
  const filteredProfiles = useMemo(() => {
    // If there's a search error, show all profiles
    if (searchError) {
      return cvProfiles;
    }
    
    if (!searchTerm || searchResults.length === 0) {
      return cvProfiles;
    }

    // Create a map of supabase_record_id to score for quick lookup
    const scoreMap = new Map<string, number>();
    searchResults.forEach(result => {
      const supabaseId = result.document.metadata.supabase_record_id || result.document.metadata.supabase_id;
      if (supabaseId) {
        scoreMap.set(supabaseId, result.score);
      }
    });

    // Filter profiles that have search results and add scores
    const profilesWithScores = cvProfiles
      .filter(profile => scoreMap.has(profile.id))
      .map(profile => ({
        ...profile,
        searchScore: scoreMap.get(profile.id) || 0
      }))
      .sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0)); // Sort by score descending

    return profilesWithScores;
  }, [cvProfiles, searchTerm, searchResults, searchError]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "Interviewed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-accent" />
              <h1 className="text-2xl font-bold text-foreground">
                Candidate Dashboard
              </h1>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Search and Upload Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2 flex-1 max-w-lg">
              <div className="relative flex-1">
                 {searchLoading ? (
                   <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground animate-spin" />
                 ) : (
                   <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                 )}
                 <Input
                   placeholder="Search candidates using AI-powered semantic search..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   onKeyPress={handleKeyPress}
                   className="pl-10 pr-10"
                 />
                 {searchTerm && (
                   <button
                     onClick={handleClearSearch}
                     className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                   >
                     <X className="h-4 w-4" />
                   </button>
                 )}
               </div>
              <Button 
                onClick={handleSearch}
                disabled={searchLoading || !searchTerm.trim()}
                className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {searchLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button 
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => setUploadModalOpen(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload CV
            </Button>
          </div>
        </div>

        {/* Search Error Alert */}
        {searchError && (
          <Card className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <div className="p-4">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-red-500 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-red-800 dark:text-red-400">Search Error</h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{searchError}</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {searchError ? (
              <>Search temporarily unavailable - showing all {cvProfiles.length} CV profiles</>
            ) : searchTerm && searchResults.length > 0 ? (
              <>Showing {filteredProfiles.length} AI-matched candidates from {searchResults.length} search results (sorted by relevance)</>
            ) : searchTerm && !searchLoading ? (
              <>No matches found for "{searchTerm}"</>
            ) : (
              <>Showing {filteredProfiles.length} of {cvProfiles.length} CV profiles</>
            )}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <Card className="p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading candidates...</span>
            </div>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-8">
            <div className="text-center">
              <p className="text-destructive">Error: {error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
                variant="outline"
              >
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Candidates Table */}
        {!loading && !error && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-muted/50 backdrop-blur">
                    <tr className="border-b border-border">
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Candidate
                      </th>
                      {searchTerm && searchResults.length > 0 && (
                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                          Relevance Score
                        </th>
                      )}
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Position
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Experience
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Skills
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Upload Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProfiles.map((profile: any, index: number) => (
                    <tr
                      key={profile.id}
                      className={`border-b border-border transition-colors hover:bg-muted/50 ${
                        index % 2 === 0 ? "bg-background" : "bg-muted/20"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-foreground">
                             CV Profile #{profile.id.slice(0, 8)}
                           </div>
                           <div className="text-sm text-muted-foreground">
                             {profile.file_url}
                           </div>
                        </div>
                      </td>
                      {searchTerm && searchResults.length > 0 && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                            >
                              {((profile.searchScore || 0) * 100).toFixed(1)}%
                            </Badge>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 text-sm text-foreground">
                         {profile.experience?.[0]?.position || 'N/A'}
                       </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {profile.experience?.length || 0} positions
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {profile.skills?.slice(0, 3).map((skill: string) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="text-xs bg-accent/20 text-accent-foreground dark:bg-accent/30 dark:text-foreground"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {(profile.skills?.length || 0) > 3 && (
                            <Badge
                              variant="outline"
                              className="text-xs border-accent/50 text-foreground dark:border-accent/50 dark:text-foreground"
                            >
                              +{(profile.skills?.length || 0) - 3}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {profile.experience?.[0]?.location || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusColor('Active')}>
                          Active
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                         {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                       </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View candidate</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit candidate</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete candidate</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        )}

        {filteredProfiles.length === 0 && !loading && !error && (
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              No CV profiles found matching your search.
            </p>
          </div>
        )}
      </main>
      
      {/* Upload Modal */}
       <UploadModal 
         open={uploadModalOpen} 
         onOpenChange={setUploadModalOpen}
         onUploadSuccess={() => {
           // Refresh the CV profiles list after successful upload
           window.location.reload();
         }}
       />
    </div>
  );
}
