import re
from typing import List, Dict, Any
import json

class ScriptParser:
    """Parse structured manga script into scenes and panels"""
    
    def __init__(self):
        self.scene_pattern = r'\[SCENE:\s*([^\]]+)\]'
        self.character_pattern = r'\[CHARACTER:\s*([^\]]+)\]' 
        self.action_pattern = r'\[ACTION:\s*([^\]]+)\]'
        self.dialogue_pattern = r'\[DIALOGUE:\s*([^\]]+?)\]\s*"([^"]+)"'
    
    def parse_script(self, script_content: str) -> Dict[str, Any]:
        """Parse complete script into structured data"""
        scenes = []
        character_list = set()
        
        # Split script into scene blocks
        scene_blocks = re.split(self.scene_pattern, script_content)[1:]  # Skip first empty element
        
        scene_order = 0
        for i in range(0, len(scene_blocks), 2):
            if i + 1 < len(scene_blocks):
                scene_header = scene_blocks[i].strip()
                scene_content = scene_blocks[i + 1].strip()
                
                scene_data = self._parse_scene_block(scene_header, scene_content, scene_order)
                scenes.append(scene_data)
                
                # Collect characters
                for char in scene_data.get('characters', []):
                    character_list.add(char['name'])
                
                scene_order += 1
        
        return {
            'scenes': scenes,
            'character_list': list(character_list),
            'total_scenes': len(scenes)
        }
    
    def _parse_scene_block(self, scene_header: str, content: str, order: int) -> Dict[str, Any]:
        """Parse individual scene block"""
        # Extract location and time from scene header
        location_time = scene_header.split(' - ')
        location = location_time[0].strip() if location_time else "Unknown"
        time = location_time[1].strip() if len(location_time) > 1 else "Unknown"
        
        # Parse characters
        character_matches = re.findall(self.character_pattern, content)
        characters = []
        for char_desc in character_matches:
            char_parts = char_desc.split(' - ', 1)
            char_name = char_parts[0].strip()
            char_desc = char_parts[1].strip() if len(char_parts) > 1 else ""
            characters.append({
                'name': char_name,
                'description': char_desc
            })
        
        # Parse actions
        action_matches = re.findall(self.action_pattern, content)
        actions = [action.strip() for action in action_matches]
        
        # Parse dialogue
        dialogue_matches = re.findall(self.dialogue_pattern, content)
        dialogue = []
        for speaker, text in dialogue_matches:
            dialogue.append({
                'speaker': speaker.strip(),
                'text': text.strip()
            })
        
        # Determine scene type and mood
        scene_type = self._determine_scene_type(actions, dialogue)
        mood = self._determine_mood(content)
        
        return {
            'id': f"scene_{order}",
            'order': order,
            'location': location,
            'time': time,
            'characters': characters,
            'actions': actions,
            'dialogue': dialogue,
            'scene_type': scene_type,
            'mood': mood
        }
    
    def _determine_scene_type(self, actions: List[str], dialogue: List[Dict]) -> str:
        """Determine scene type based on content"""
        action_text = ' '.join(actions).lower()
        dialogue_text = ' '.join([d['text'] for d in dialogue]).lower()
        
        # Battle/action keywords
        if any(word in action_text for word in ['fight', 'battle', 'attack', 'sword', 'punch', 'kick']):
            return 'battle'
        
        # Social/dialogue keywords  
        if len(dialogue) > len(actions) or any(word in dialogue_text for word in ['hello', 'thank', 'sorry', 'please']):
            return 'social'
        
        # Romance keywords
        if any(word in dialogue_text for word in ['love', 'like', 'heart', 'beautiful', 'cute']):
            return 'romance'
        
        # Default to slice_of_life
        return 'slice_of_life'
    
    def _determine_mood(self, content: str) -> str:
        """Determine overall mood of scene"""
        content_lower = content.lower()
        
        if any(word in content_lower for word in ['battle', 'fight', 'attack', 'danger', 'intense']):
            return 'intense'
        elif any(word in content_lower for word in ['happy', 'smile', 'laugh', 'joy', 'excited']):
            return 'happy'
        elif any(word in content_lower for word in ['sad', 'cry', 'tears', 'worried', 'afraid']):
            return 'sad'
        elif any(word in content_lower for word in ['love', 'romantic', 'sweet', 'gentle', 'tender']):
            return 'romantic'
        elif any(word in content_lower for word in ['determined', 'strong', 'will', 'must']):
            return 'determined'
        else:
            return 'neutral'