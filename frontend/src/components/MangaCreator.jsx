import React, { useState } from 'react';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import ScriptEditor from './ScriptEditor';
import MangaPreview from './MangaPreview';
import StyleSelector from './StyleSelector';
import CharacterManager from './CharacterManager';
import { BookOpen, Palette, Users, Download } from 'lucide-react';
import { Button } from './ui/button';
import { mockScripts } from '../mock';

export default function MangaCreator() {
  const [currentScript, setCurrentScript] = useState(mockScripts[0]);
  const [selectedStyle, setSelectedStyle] = useState('shounen');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('script');

  const handleGenerate = () => {
    setIsGenerating(true);
    // Mock generation process
    setTimeout(() => {
      setIsGenerating(false);
      setActiveTab('preview');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Manga Creator</h1>
              <p className="text-sm text-slate-600">Transform scripts into visual manga</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              {isGenerating ? 'Generating...' : 'Generate Manga'}
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <Card className="bg-white shadow-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-slate-200 px-6 pt-6">
              <TabsList className="grid w-full max-w-md grid-cols-4">
                <TabsTrigger value="script" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  Script
                </TabsTrigger>
                <TabsTrigger value="style" className="gap-2">
                  <Palette className="w-4 h-4" />
                  Style
                </TabsTrigger>
                <TabsTrigger value="characters" className="gap-2">
                  <Users className="w-4 h-4" />
                  Characters
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  Preview
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="script" className="mt-0">
                <ScriptEditor 
                  script={currentScript}
                  onScriptChange={setCurrentScript}
                />
              </TabsContent>

              <TabsContent value="style" className="mt-0">
                <StyleSelector 
                  selectedStyle={selectedStyle}
                  onStyleChange={setSelectedStyle}
                />
              </TabsContent>

              <TabsContent value="characters" className="mt-0">
                <CharacterManager />
              </TabsContent>

              <TabsContent value="preview" className="mt-0">
                <MangaPreview 
                  script={currentScript}
                  style={selectedStyle}
                  isGenerating={isGenerating}
                />
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </main>
    </div>
  );
}