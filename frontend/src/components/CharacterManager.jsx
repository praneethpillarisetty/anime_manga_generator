import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Users, Plus, Edit2, Upload, Tag, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { characterAPI, handleAPIError } from '../services/api';
import { useToast } from '../hooks/use-toast';

export default function CharacterManager() {
  const [characters, setCharacters] = useState([]);
  const [isAddingCharacter, setIsAddingCharacter] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(new Set());
  const [error, setError] = useState(null);
  const [newCharacter, setNewCharacter] = useState({
    name: '',
    description: '',
    image_ref: '',
    tags: []
  });

  const { toast } = useToast();

  // Fetch characters on component mount
  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedCharacters = await characterAPI.getCharacters();
      setCharacters(fetchedCharacters);
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

  const handleAddCharacter = async () => {
    if (!newCharacter.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Character name is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const characterData = {
        name: newCharacter.name.trim(),
        description: newCharacter.description.trim(),
        tags: newCharacter.tags.filter(tag => tag.trim()),
        image_ref: newCharacter.image_ref.trim() || null
      };

      const createdCharacter = await characterAPI.createCharacter(characterData);
      
      setCharacters(prev => [createdCharacter, ...prev]);
      setNewCharacter({ name: '', description: '', image_ref: '', tags: [] });
      setIsAddingCharacter(false);
      
      toast({
        title: "Success",
        description: "Character created successfully!",
      });
      
    } catch (error) {
      const errorInfo = handleAPIError(error);
      toast({
        title: "Error",
        description: errorInfo.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCharacter = async (characterId, characterName) => {
    if (!confirm(`Are you sure you want to delete "${characterName}"?`)) {
      return;
    }

    setDeleteLoading(prev => new Set(prev).add(characterId));
    
    try {
      await characterAPI.deleteCharacter(characterId);
      setCharacters(prev => prev.filter(char => char.id !== characterId));
      
      toast({
        title: "Success",
        description: "Character deleted successfully!",
      });
      
    } catch (error) {
      const errorInfo = handleAPIError(error);
      toast({
        title: "Error",
        description: errorInfo.message,
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(characterId);
        return newSet;
      });
    }
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

  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      addTag(e.target.value);
      e.target.value = '';
    }
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
                    value={newCharacter.image_ref}
                    onChange={(e) => setNewCharacter({...newCharacter, image_ref: e.target.value})}
                    placeholder="https://..."
                  />
                  <Button variant="outline" size="icon" disabled>
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
                      className="cursor-pointer hover:bg-red-100"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag and press Enter..."
                    onKeyPress={handleTagKeyPress}
                  />
                  <Button variant="outline" size="sm" disabled>
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
                  disabled={!newCharacter.name.trim() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Add Character'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddingCharacter(false)}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && characters.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-slate-600">Loading characters...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && characters.length === 0 && !error && (
        <Card className="p-12 text-center border-dashed">
          <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 mb-2">No Characters Yet</h3>
          <p className="text-slate-500 mb-4">Create your first character to get started with manga generation.</p>
          <Button onClick={() => setIsAddingCharacter(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Your First Character
          </Button>
        </Card>
      )}

      {/* Character Grid */}
      {characters.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character) => (
            <Card key={character.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={character.image_ref} />
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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    disabled 
                    className="text-slate-400"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteCharacter(character.id, character.name)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={deleteLoading.has(character.id)}
                  >
                    {deleteLoading.has(character.id) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-slate-600 mb-3 line-clamp-3">
                {character.description || 'No description provided'}
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
      )}

      {/* Character Usage Stats */}
      {characters.length > 0 && (
        <Card className="p-6 bg-slate-50 border-slate-200">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Character Statistics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                {characters.filter(c => c.image_ref).length}
              </div>
              <div className="text-sm text-slate-600">With References</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(characters.flatMap(c => c.tags)).size}
              </div>
              <div className="text-sm text-slate-600">Unique Tags</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-200">
            <h4 className="font-medium mb-2">Most Common Tags</h4>
            <div className="flex flex-wrap gap-2">
              {['protagonist', 'student', 'warrior', 'support'].map(tag => {
                const count = characters.filter(c => c.tags.includes(tag)).length;
                return count > 0 ? (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag} ({count})
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}