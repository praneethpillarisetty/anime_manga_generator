import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { BookOpen, Download, Share2, ZoomIn, RotateCcw, Play, Pause, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { generationAPI, handleAPIError } from '../services/api';
import { useToast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function MangaPreview({ script, style, isGenerating: externalGenerating, onGenerationComplete }) {
  const [generationJob, setGenerationJob] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [panels, setPanels] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [pollInterval, setPollInterval] = useState(null);

  const { toast } = useToast();

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  // Handle external generation trigger
  useEffect(() => {
    if (externalGenerating && script && script.id) {
      startMangaGeneration();
    }
  }, [externalGenerating]);

  const startMangaGeneration = async () => {
    if (!script || !script.id) {
      toast({
        title: "Error",
        description: "Please save the script first before generating manga",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setError(null);
    setPanels([]);

    try {
      const jobResponse = await generationAPI.startMangaGeneration(script.id, style);
      setGenerationJob(jobResponse);
      
      // Start polling for progress
      startPollingProgress(jobResponse.job_id);
      
      toast({
        title: "Generation Started",
        description: "Your manga is being generated in the background",
      });
      
    } catch (error) {
      const errorInfo = handleAPIError(error);
      setError(errorInfo.message);
      setIsGenerating(false);
      toast({
        title: "Error",
        description: errorInfo.message,
        variant: "destructive",
      });
    }
  };

  const startPollingProgress = (jobId) => {
    const interval = setInterval(async () => {
      try {
        const status = await generationAPI.getGenerationStatus(jobId);
        setGenerationJob(status);
        
        if (status.status === 'completed') {
          setIsGenerating(false);
          clearInterval(interval);
          setPollInterval(null);
          
          // Extract panels from result
          if (status.result_data && status.result_data.panels) {
            setPanels(status.result_data.panels);
          }
          
          if (onGenerationComplete) {
            onGenerationComplete(status);
          }
          
          toast({
            title: "Generation Complete",
            description: "Your manga has been successfully generated!",
          });
          
        } else if (status.status === 'failed') {
          setIsGenerating(false);
          clearInterval(interval);
          setPollInterval(null);
          setError(status.error_message || 'Generation failed');
          
          toast({
            title: "Generation Failed",
            description: status.error_message || 'An error occurred during generation',
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error polling generation status:', error);
      }
    }, 2000);

    setPollInterval(interval);
  };

  const getProgressPercentage = () => {
    if (!generationJob) return 0;
    return Math.round(generationJob.progress * 100);
  };

  const getCurrentPagePanels = () => {
    if (panels.length === 0) return [];
    const panelsPerPage = 4;
    const startIndex = currentPage * panelsPerPage;
    return panels.slice(startIndex, startIndex + panelsPerPage);
  };

  const getTotalPages = () => {
    if (panels.length === 0) return 1;
    return Math.ceil(panels.length / 4);
  };

  const getStatusMessage = () => {
    if (!generationJob) return "Ready to generate";
    
    switch (generationJob.status) {
      case 'pending':
        return 'Preparing generation...';
      case 'processing':
        const progress = getProgressPercentage();
        if (progress < 20) return 'Analyzing script structure...';
        if (progress < 40) return 'Generating character artwork...';
        if (progress < 60) return 'Creating scene backgrounds...';
        if (progress < 80) return 'Adding dialogue elements...';
        return 'Finalizing manga layout...';
      case 'completed':
        return 'Generation completed successfully!';
      case 'failed':
        return 'Generation failed';
      default:
        return 'Unknown status';
    }
  };

  const currentPagePanels = getCurrentPagePanels();
  const totalPages = getTotalPages();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-slate-900">Manga Preview</h2>
          <Badge variant="outline" className="ml-2">
            {script?.title || 'Untitled'} - {style?.charAt(0).toUpperCase() + style?.slice(1)}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" disabled>
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button 
            size="sm" 
            className="gap-2 bg-indigo-600 hover:bg-indigo-700" 
            disabled={panels.length === 0}
          >
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Generation Status */}
      {(isGenerating || generationJob) && (
        <Card className={`p-6 ${
          generationJob?.status === 'completed' ? 'border-green-200 bg-green-50' :
          generationJob?.status === 'failed' ? 'border-red-200 bg-red-50' :
          'border-amber-200 bg-amber-50'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                <h3 className="font-semibold text-amber-800">Generating Your Manga...</h3>
              </>
            ) : generationJob?.status === 'completed' ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Manga Generated Successfully!</h3>
              </>
            ) : generationJob?.status === 'failed' ? (
              <>
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-800">Generation Failed</h3>
              </>
            ) : null}
          </div>
          
          {generationJob && (
            <>
              <Progress 
                value={getProgressPercentage()} 
                className="mb-3" 
              />
              
              <div className="flex justify-between text-sm mb-2">
                <span>
                  Panel {generationJob.completed_panels || 0} of {generationJob.total_panels || 0}
                </span>
                <span>{getProgressPercentage()}% Complete</span>
              </div>
              
              <p className={`text-sm ${
                generationJob.status === 'completed' ? 'text-green-700' :
                generationJob.status === 'failed' ? 'text-red-700' :
                'text-amber-700'
              }`}>
                {getStatusMessage()}
              </p>
            </>
          )}
        </Card>
      )}

      {/* Preview Controls */}
      {panels.length > 0 && (
        <Card className="p-4 bg-slate-50 border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Page:</span>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                  >
                    ←
                  </Button>
                  <span className="px-3 py-1 bg-white rounded border text-sm">
                    {currentPage + 1} / {totalPages}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                  >
                    →
                  </Button>
                </div>
              </div>
              
              <Separator orientation="vertical" className="h-6" />
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="gap-2"
                  disabled
                >
                  {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isAutoPlaying ? 'Pause' : 'Auto'}
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
              >
                -
              </Button>
              <span className="px-2 py-1 text-sm bg-white rounded border min-w-[60px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}
              >
                +
              </Button>
              <Button variant="outline" size="sm" onClick={() => setZoomLevel(1)}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Manga Page Display */}
      <div className="flex justify-center">
        <div 
          className="bg-white rounded-lg shadow-xl border border-slate-200 p-6"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
        >
          <div className="grid grid-cols-2 gap-4" style={{ width: '600px', minHeight: '800px' }}>
            {currentPagePanels.length > 0 ? (
              currentPagePanels.map((panel, index) => (
                <div 
                  key={panel.panel_id || index} 
                  className={`border-2 border-black rounded-lg overflow-hidden bg-white ${
                    index === 0 ? 'col-span-2' : ''
                  }`}
                  style={{ 
                    minHeight: index === 0 ? '350px' : '200px',
                    position: 'relative'
                  }}
                >
                  <div 
                    className="w-full h-full bg-cover bg-center flex items-center justify-center"
                    style={{ 
                      backgroundImage: panel.image_url ? `url(${BACKEND_URL}${panel.image_url})` : 'none',
                      backgroundColor: panel.image_url ? 'transparent' : '#f8fafc'
                    }}
                  >
                    {!panel.image_url && (
                      <div className="text-center text-slate-400">
                        <div className="w-8 h-8 bg-slate-300 rounded mb-2 mx-auto"></div>
                        <span className="text-sm">Panel {index + 1}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Panel metadata */}
                  <div className="absolute bottom-2 right-2">
                    <Badge variant="secondary" className="text-xs opacity-70">
                      Generated
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              // Empty state or loading placeholders
              Array.from({ length: 4 }).map((_, index) => (
                <div 
                  key={`empty-${index}`}
                  className="border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"
                  style={{ minHeight: index === 0 ? '350px' : '200px' }}
                >
                  {isGenerating ? (
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-2" />
                      <span className="text-sm">Generating...</span>
                    </div>
                  ) : (
                    <span className="text-sm">Empty Panel</span>
                  )}
                </div>
              ))
            )}
          </div>
          
          {/* Page number */}
          <div className="text-center mt-4 text-sm text-slate-600">
            Page {currentPage + 1}
          </div>
        </div>
      </div>

      {/* Page Navigation */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <Button
              key={index}
              variant={index === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(index)}
              className="w-10"
            >
              {index + 1}
            </Button>
          ))}
        </div>
      )}

      {/* Generation Summary */}
      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Generation Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-indigo-600">
              {panels.length || script?.parsed_data?.total_scenes || 0}
            </div>
            <div className="text-sm text-slate-600">Total Panels</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-purple-600">{totalPages}</div>
            <div className="text-sm text-slate-600">Pages</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-emerald-600">
              {script?.parsed_data?.character_list?.length || 0}
            </div>
            <div className="text-sm text-slate-600">Characters</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-amber-600">
              {script?.parsed_data?.total_scenes || 0}
            </div>
            <div className="text-sm text-slate-600">Scenes</div>
          </div>
        </div>
        
        {generationJob && generationJob.status === 'completed' && (
          <div className="mt-4 pt-4 border-t border-indigo-200 text-center">
            <p className="text-sm text-indigo-700">
              Generation completed in {generationJob.total_panels} panels
              {/* • Time: {Math.round((new Date(generationJob.updated_at) - new Date(generationJob.created_at)) / 1000)}s */}
            </p>
          </div>
        )}
      </Card>

      {/* No Script State */}
      {!script && (
        <Card className="p-12 text-center border-dashed">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 mb-2">No Script Available</h3>
          <p className="text-slate-500">Please create and parse a script in the Script tab first.</p>
        </Card>
      )}
    </div>
  );
}