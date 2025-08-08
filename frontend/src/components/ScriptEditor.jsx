import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { Plus, Play, Save, FileText, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { scriptAPI, handleAPIError } from '../services/api';
import { useToast } from '../hooks/use-toast';

export default function ScriptEditor({ script, onScriptChange }) {
  const [title, setTitle] = useState(script?.title || '');
  const [content, setContent] = useState(script?.content || '');
  const [style, setStyle] = useState(script?.style || 'shounen');
  const [scripts, setScripts] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [error, setError] = useState(null);
  
  const { toast } = useToast();

  // Fetch available scripts on component mount
  useEffect(() => {
    fetchScripts();
  }, []);

  const fetchScripts = async () => {
    try {
      const fetchedScripts = await scriptAPI.getScripts();
      setScripts(fetchedScripts);
    } catch (error) {
      const errorInfo = handleAPIError(error);
      toast({
        title: "Error",
        description: errorInfo.message,
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide both title and content",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const scriptData = {
        title: title.trim(),
        content: content.trim(),
        style
      };

      const parsedScript = await scriptAPI.parseScript(scriptData);
      setParseResult(parsedScript);
      
      // Update parent component
      onScriptChange(parsedScript);
      
      // Refresh scripts list
      fetchScripts();
      
      toast({
        title: "Success",
        description: "Script parsed and saved successfully!",
      });
      
    } catch (error) {
      const errorInfo = handleAPIError(error);
      setError(errorInfo.message);
      toast({
        title: "Error",
        description: errorInfo.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateLoad = async (scriptId) => {
    if (!scriptId) return;

    try {
      const selectedScript = await scriptAPI.getScript(scriptId);
      setTitle(selectedScript.title);
      setContent(selectedScript.content);
      setStyle(selectedScript.style);
      setParseResult(selectedScript);
      onScriptChange(selectedScript);
      
      toast({
        title: "Template Loaded",
        description: `Loaded "${selectedScript.title}"`,
      });
    } catch (error) {
      const errorInfo = handleAPIError(error);
      toast({
        title: "Error",
        description: errorInfo.message,
        variant: "destructive",
      });
    }
  };

  const addSceneTemplate = () => {
    const template = `
[SCENE: Location - Time]
[CHARACTER: Name - Description]
[ACTION: Description]
[DIALOGUE: Character] "Text"`;
    setContent(content + template);
  };

  const getTagColor = (tag) => {
    const colors = {
      'SCENE': 'bg-blue-100 text-blue-800',
      'CHARACTER': 'bg-green-100 text-green-800', 
      'ACTION': 'bg-orange-100 text-orange-800',
      'DIALOGUE': 'bg-purple-100 text-purple-800'
    };
    return colors[tag] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-64"
              placeholder="Enter manga title..."
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="style">Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shounen">Shounen</SelectItem>
                <SelectItem value="shoujo">Shoujo</SelectItem>
                <SelectItem value="seinen">Seinen</SelectItem>
                <SelectItem value="comedy">Comedy</SelectItem>
                <SelectItem value="horror">Horror</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Label>Template</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateLoad}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Load template..." />
              </SelectTrigger>
              <SelectContent>
                {scripts.map(script => (
                  <SelectItem key={script.id} value={script.id}>
                    {script.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Parsing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Parse & Save
              </>
            )}
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

      {/* Success Display */}
      {parseResult && !error && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Script parsed successfully! Found {parseResult.parsed_data?.total_scenes || 0} scenes and {parseResult.parsed_data?.character_list?.length || 0} characters.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Script Input */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-lg">Script Content</h3>
          </div>
          
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[500px] font-mono text-sm"
            placeholder="Enter your structured manga script here..."
          />
          
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>{content.length} characters</span>
            <span>{content.split('\n').length} lines</span>
          </div>
        </div>

        {/* Help Panel */}
        <div className="space-y-4">
          <Card className="p-4 bg-slate-50 border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-amber-600" />
              <h4 className="font-semibold">Script Format Guide</h4>
            </div>
            
            <div className="space-y-3 text-sm">
              <div>
                <Badge className={getTagColor('SCENE')}>SCENE</Badge>
                <p className="mt-1 text-slate-600">Define location and time</p>
                <code className="text-xs bg-white p-1 rounded mt-1 block">
                  [SCENE: Mountain Training Ground - Dawn]
                </code>
              </div>
              
              <Separator />
              
              <div>
                <Badge className={getTagColor('CHARACTER')}>CHARACTER</Badge>
                <p className="mt-1 text-slate-600">List characters in scene</p>
                <code className="text-xs bg-white p-1 rounded mt-1 block">
                  [CHARACTER: Akira - Young warrior...]
                </code>
              </div>
              
              <Separator />
              
              <div>
                <Badge className={getTagColor('ACTION')}>ACTION</Badge>
                <p className="mt-1 text-slate-600">Describe visual actions</p>
                <code className="text-xs bg-white p-1 rounded mt-1 block">
                  [ACTION: Akira practices sword swings]
                </code>
              </div>
              
              <Separator />
              
              <div>
                <Badge className={getTagColor('DIALOGUE')}>DIALOGUE</Badge>
                <p className="mt-1 text-slate-600">Character speech</p>
                <code className="text-xs bg-white p-1 rounded mt-1 block">
                  [DIALOGUE: Akira] "I must become stronger!"
                </code>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-4 border-emerald-200 bg-emerald-50">
            <h4 className="font-semibold mb-3 text-emerald-800">Quick Actions</h4>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start gap-2 border-emerald-200 hover:bg-emerald-100"
                onClick={addSceneTemplate}
              >
                <Plus className="w-4 h-4" />
                Add Scene Template
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start gap-2 border-emerald-200 hover:bg-emerald-100"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <FileText className="w-4 h-4" />
                Import from File
              </Button>
              <input
                id="file-input"
                type="file"
                accept=".txt,.md"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => setContent(e.target.result);
                    reader.readAsText(file);
                  }
                }}
              />
            </div>
          </Card>

          {/* Parse Results Preview */}
          {parseResult && parseResult.parsed_data && (
            <Card className="p-4 bg-indigo-50 border-indigo-200">
              <h4 className="font-semibold mb-3 text-indigo-800">Parse Results</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Scenes:</span>
                  <span className="font-medium">{parseResult.parsed_data.total_scenes}</span>
                </div>
                <div className="flex justify-between">
                  <span>Characters:</span>
                  <span className="font-medium">{parseResult.parsed_data.character_list?.length || 0}</span>
                </div>
                <div className="mt-2">
                  <span className="text-indigo-700">Characters found:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {parseResult.parsed_data.character_list?.slice(0, 5).map((char, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {char}
                      </Badge>
                    ))}
                    {parseResult.parsed_data.character_list?.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{parseResult.parsed_data.character_list.length - 5}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}