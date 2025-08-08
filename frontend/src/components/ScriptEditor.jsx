import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Plus, Play, Save, FileText, Zap } from 'lucide-react';
import { mockScripts, mangaStyles } from '../mock';

export default function ScriptEditor({ script, onScriptChange }) {
  const [title, setTitle] = useState(script.title);
  const [content, setContent] = useState(script.content);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const handleSave = () => {
    onScriptChange({
      ...script,
      title,
      content
    });
  };

  const handleTemplateLoad = (templateId) => {
    const template = mockScripts.find(s => s.id === templateId);
    if (template) {
      setTitle(template.title);
      setContent(template.content);
      onScriptChange(template);
    }
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
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
            <Label>Template</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateLoad}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Load template..." />
              </SelectTrigger>
              <SelectContent>
                {mockScripts.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Save
          </Button>
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Play className="w-4 h-4" />
            Parse Script
          </Button>
        </div>
      </div>

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
                onClick={() => setContent(content + '\n[SCENE: Location - Time]\n[CHARACTER: Name - Description]\n[ACTION: Description]\n[DIALOGUE: Character] "Text"')}
              >
                <Plus className="w-4 h-4" />
                Add Scene Template
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start gap-2 border-emerald-200 hover:bg-emerald-100"
              >
                <FileText className="w-4 h-4" />
                Import from File
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}