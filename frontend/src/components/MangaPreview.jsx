import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { BookOpen, Download, Share2, ZoomIn, RotateCcw, Play, Pause } from 'lucide-react';
import { mockGenerationProgress } from '../mock';

export default function MangaPreview({ script, style, isGenerating }) {
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 2;
          if (newProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return newProgress;
        });
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const totalPages = Math.ceil(script.panels?.length / 4) || 1;
  const currentPanels = script.panels?.slice(currentPage * 4, (currentPage + 1) * 4) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-slate-900">Manga Preview</h2>
          <Badge variant="outline" className="ml-2">
            {script.title} - {style.charAt(0).toUpperCase() + style.slice(1)}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Generation Status */}
      {isGenerating && (
        <Card className="p-6 border-amber-200 bg-amber-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
            <h3 className="font-semibold text-amber-800">Generating Your Manga...</h3>
          </div>
          
          <Progress value={progress} className="mb-3" />
          
          <div className="flex justify-between text-sm text-amber-700">
            <span>Panel {Math.floor(progress / 20) + 1} of 5</span>
            <span>{progress}% Complete</span>
          </div>
          
          <p className="text-sm text-amber-700 mt-2">
            {progress < 20 ? 'Analyzing script structure...' :
             progress < 40 ? 'Generating character artwork...' :
             progress < 60 ? 'Creating scene backgrounds...' :
             progress < 80 ? 'Adding dialogue bubbles...' :
             'Finalizing manga layout...'}
          </p>
        </Card>
      )}

      {/* Preview Controls */}
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

      {/* Manga Page Display */}
      <div className="flex justify-center">
        <div 
          className="bg-white rounded-lg shadow-xl border border-slate-200 p-6"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
        >
          <div className="grid grid-cols-2 gap-4" style={{ width: '600px', minHeight: '800px' }}>
            {currentPanels.map((panel, index) => (
              <div 
                key={panel.id} 
                className={`border-2 border-black rounded-lg overflow-hidden bg-white ${
                  index === 0 ? 'col-span-2' : ''
                }`}
                style={{ 
                  minHeight: index === 0 ? '350px' : '200px',
                  position: 'relative'
                }}
              >
                <div 
                  className="w-full h-full bg-cover bg-center"
                  style={{ 
                    backgroundImage: `url(${panel.imageUrl})`,
                    filter: 'grayscale(0.7) contrast(1.2)'
                  }}
                >
                  {/* Dialogue bubbles */}
                  {panel.dialogue.map((text, dialogIndex) => (
                    <div
                      key={dialogIndex}
                      className="absolute bg-white border-2 border-black rounded-full px-3 py-2 text-sm font-medium shadow-lg"
                      style={{
                        top: `${20 + dialogIndex * 60}%`,
                        left: `${10 + dialogIndex * 30}%`,
                        maxWidth: '80%',
                        transform: 'translate(-10%, -50%)',
                      }}
                    >
                      {text}
                      {/* Speech bubble tail */}
                      <div 
                        className="absolute w-0 h-0 border-l-[10px] border-r-[10px] border-t-[15px] border-l-transparent border-r-transparent border-t-white"
                        style={{
                          bottom: '-13px',
                          left: '20px',
                        }}
                      />
                      <div 
                        className="absolute w-0 h-0 border-l-[12px] border-r-[12px] border-t-[17px] border-l-transparent border-r-transparent border-t-black"
                        style={{
                          bottom: '-15px',
                          left: '18px',
                        }}
                      />
                    </div>
                  ))}
                  
                  {/* Panel mood indicator */}
                  <div className="absolute bottom-2 right-2">
                    <Badge 
                      variant="secondary" 
                      className="text-xs opacity-70"
                    >
                      {panel.mood}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Fill empty panels if needed */}
            {Array.from({ length: 4 - currentPanels.length }).map((_, index) => (
              <div 
                key={`empty-${index}`}
                className="border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"
                style={{ minHeight: '200px' }}
              >
                <span className="text-sm">Empty Panel</span>
              </div>
            ))}
          </div>
          
          {/* Page number */}
          <div className="text-center mt-4 text-sm text-slate-600">
            Page {currentPage + 1}
          </div>
        </div>
      </div>

      {/* Page Navigation */}
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

      {/* Generation Summary */}
      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Generation Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-indigo-600">{script.panels?.length || 0}</div>
            <div className="text-sm text-slate-600">Total Panels</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-purple-600">{totalPages}</div>
            <div className="text-sm text-slate-600">Pages</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-emerald-600">
              {script.content?.split('[CHARACTER').length - 1 || 0}
            </div>
            <div className="text-sm text-slate-600">Characters</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-amber-600">
              {script.content?.split('[SCENE').length - 1 || 0}
            </div>
            <div className="text-sm text-slate-600">Scenes</div>
          </div>
        </div>
      </Card>
    </div>
  );
}