import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Users, Plus, Edit2, Upload, Tag, Trash2 } from 'lucide-react';
import { mockCharacters } from '../mock';

export default function CharacterManager() {
  const [characters, setCharacters] = useState(mockCharacters);
  const [isAddingCharacter, setIsAddingCharacter] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [newCharacter, setNewCharacter] = useState({
    name: '',
    description: '',
    imageRef: '',
    tags: []
  });

  const handleAddCharacter = () => {
    const character = {
      id: Date.now().toString(),
      ...newCharacter,
      tags: newCharacter.tags.filter(tag => tag.trim())
    };
    setCharacters([...characters, character]);
    setNewCharacter({ name: '', description: '', imageRef: '', tags: [] });
    setIsAddingCharacter(false);
  };

  const handleDeleteCharacter = (id) => {
    setCharacters(characters.filter(char => char.id !== id));
  };

  const addTag = (tag) => {
    if (tag.trim() && !newCharacter.tags.includes(tag.trim())) {
      setNewCharacter({
        ...newCharacter,
        tags: [...newCharacter.tags, tag.trim()]
      });
    }
  };

  const removeTag = (tagToRemove) => {
    setNewCharacter({
      ...newCharacter,
      tags: newCharacter.tags.filter(tag => tag !== tagToRemove)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-slate-900">Character Management</h2>
        </div>
        
        <Dialog open={isAddingCharacter} onOpenChange={setIsAddingCharacter}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4" />
              Add Character
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Character</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="char-name">Character Name</Label>
                <Input
                  id="char-name"
                  value={newCharacter.name}
                  onChange={(e) => setNewCharacter({...newCharacter, name: e.target.value})}
                  placeholder="Enter character name..."
                />
              </div>
              
              <div>
                <Label htmlFor="char-desc">Description</Label>
                <Textarea
                  id="char-desc"
                  value={newCharacter.description}
                  onChange={(e) => setNewCharacter({...newCharacter, description: e.target.value})}
                  placeholder="Describe the character's appearance and personality..."
                  className="min-h-[80px]"
                />
              </div>
              
              <div>
                <Label htmlFor="char-image">Reference Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="char-image"
                    value={newCharacter.imageRef}
                    onChange={(e) => setNewCharacter({...newCharacter, imageRef: e.target.value})}
                    placeholder="https://..."
                  />
                  <Button variant="outline" size="icon">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <Label>Character Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newCharacter.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag and press Enter..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addTag(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <Button variant="outline" size="sm">
                    <Tag className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Common tags: protagonist, antagonist, support, comic-relief, mentor
                </p>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleAddCharacter} 
                  className="flex-1"
                  disabled={!newCharacter.name.trim()}
                >
                  Add Character
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddingCharacter(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Character Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((character) => (
          <Card key={character.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={character.imageRef} />
                  <AvatarFallback>{character.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{character.name}</h3>
                  <div className="flex flex-wrap gap-1">
                    {character.tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {character.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{character.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditingCharacter(character)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDeleteCharacter(character.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
              {character.description}
            </p>
            
            <div className="flex flex-wrap gap-1">
              {character.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Character Usage Stats */}
      <Card className="p-6 bg-slate-50 border-slate-200">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Character Usage Statistics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{characters.length}</div>
            <div className="text-sm text-slate-600">Total Characters</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">
              {characters.filter(c => c.tags.includes('protagonist')).length}
            </div>
            <div className="text-sm text-slate-600">Protagonists</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">
              {characters.filter(c => c.imageRef).length}
            </div>
            <div className="text-sm text-slate-600">With References</div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-200">
          <h4 className="font-medium mb-2">Most Common Tags</h4>
          <div className="flex flex-wrap gap-2">
            {['protagonist', 'student', 'warrior', 'support'].map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag} ({characters.filter(c => c.tags.includes(tag)).length})
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}