import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Slider } from './ui/slider';
import { Check, Palette, Image, Settings } from 'lucide-react';
import { mangaStyles } from '../mock';

export default function StyleSelector({ selectedStyle, onStyleChange }) {
  const [colorMode, setColorMode] = React.useState('bw');
  const [detailLevel, setDetailLevel] = React.useState([3]);
  const [panelDensity, setPanelDensity] = React.useState([4]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Palette className="w-6 h-6 text-indigo-600" />
        <h2 className="text-2xl font-bold text-slate-900">Choose Your Manga Style</h2>
      </div>

      {/* Style Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mangaStyles.map(style => (
          <Card 
            key={style.id}
            className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
              selectedStyle === style.id 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-slate-200 hover:border-slate-300'
            }`}
            onClick={() => onStyleChange(style.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: style.color }}
                />
                <h3 className="font-semibold text-lg">{style.name}</h3>
              </div>
              {selectedStyle === style.id && (
                <Check className="w-5 h-5 text-indigo-600" />
              )}
            </div>
            
            <p className="text-sm text-slate-600 mb-3">{style.description}</p>
            
            <div className="flex flex-wrap gap-1">
              {style.features.map((feature, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs"
                >
                  {feature}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Advanced Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-slate-50 border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Image className="w-5 h-5 text-slate-700" />
            <h3 className="font-semibold">Visual Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="color-mode">Color Mode</Label>
                <p className="text-sm text-slate-600">Choose between classic B&W or full color</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">B&W</span>
                <Switch 
                  id="color-mode"
                  checked={colorMode === 'color'}
                  onCheckedChange={(checked) => setColorMode(checked ? 'color' : 'bw')}
                />
                <span className="text-sm text-slate-600">Color</span>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <Label>Detail Level</Label>
              <p className="text-sm text-slate-600 mb-2">Control artwork complexity and detail</p>
              <Slider
                value={detailLevel}
                onValueChange={setDetailLevel}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Simple</span>
                <span>Detailed</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-slate-50 border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-slate-700" />
            <h3 className="font-semibold">Layout Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label>Panel Density</Label>
              <p className="text-sm text-slate-600 mb-2">Panels per page (affects pacing)</p>
              <Slider
                value={panelDensity}
                onValueChange={setPanelDensity}
                max={8}
                min={2}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>2-3 panels</span>
                <span>7-8 panels</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Additional Options</Label>
              <div className="flex items-center justify-between">
                <span className="text-sm">Speech bubble style</span>
                <Button variant="outline" size="sm">Classic</Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Panel borders</span>
                <Button variant="outline" size="sm">Traditional</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Style Preview */}
      <Card className="p-6 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded"/>
          <h3 className="font-semibold">Style Preview</h3>
        </div>
        <p className="text-slate-600 mb-4">
          Selected: <strong>{mangaStyles.find(s => s.id === selectedStyle)?.name}</strong> 
          {' • '} 
          {colorMode === 'color' ? 'Full Color' : 'Black & White'}
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <div className="w-full h-32 bg-slate-200 rounded mb-2 flex items-center justify-center">
              <span className="text-xs text-slate-500">Panel 1</span>
            </div>
            <div className="h-2 bg-slate-100 rounded"></div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <div className="w-full h-32 bg-slate-200 rounded mb-2 flex items-center justify-center">
              <span className="text-xs text-slate-500">Panel 2</span>
            </div>
            <div className="h-2 bg-slate-100 rounded"></div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <div className="w-full h-32 bg-slate-200 rounded mb-2 flex items-center justify-center">
              <span className="text-xs text-slate-500">Panel 3</span>
            </div>
            <div className="h-2 bg-slate-100 rounded"></div>
          </div>
        </div>
      </Card>
    </div>
  );
}