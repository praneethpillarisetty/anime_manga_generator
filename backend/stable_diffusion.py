import requests
import base64
import io
from PIL import Image
from typing import Dict, Any, Optional
import logging
import os
from pathlib import Path

logger = logging.getLogger(__name__)

class StableDiffusionGenerator:
    """Interface for Stable Diffusion image generation"""
    
    def __init__(self, api_url: str = "http://127.0.0.1:7860"):
        self.api_url = api_url
        self.models = {
            "shounen": "anythingV5_PrtRE",
            "shoujo": "meinamix_meina-v11", 
            "seinen": "realisticVision_v60b1",
            "comedy": "toonyou_beta-6",
            "horror": "deliberate_v2"
        }
        
        # Create output directory
        self.output_dir = Path("./generated_images")
        self.output_dir.mkdir(exist_ok=True)
    
    def generate_panel(self, scene_data: Dict[str, Any], style: str = "shounen") -> Dict[str, Any]:
        """Generate a manga panel from scene data"""
        try:
            # Build prompt
            prompt = self._build_prompt(scene_data, style)
            negative_prompt = self._build_negative_prompt(style)
            
            # Check if API is available, otherwise use fallback
            if self._is_api_available():
                image_data = self._generate_with_api(prompt, negative_prompt, style)
            else:
                logger.warning("Stable Diffusion API not available, using fallback image")
                image_data = self._generate_fallback_image(scene_data)
            
            # Save image
            image_path = self._save_image(image_data, scene_data.get('id', 'unknown'))
            
            return {
                'image_url': f'/images/{Path(image_path).name}',
                'prompt_used': prompt,
                'negative_prompt': negative_prompt,
                'model': self.models.get(style, 'default'),
                'generation_metadata': {
                    'style': style,
                    'scene_type': scene_data.get('scene_type'),
                    'mood': scene_data.get('mood')
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating panel: {str(e)}")
            # Return fallback
            fallback_path = self._generate_fallback_image(scene_data)
            return {
                'image_url': f'/images/{Path(fallback_path).name}',
                'prompt_used': f"Fallback for: {scene_data.get('id')}",
                'error': str(e)
            }
    
    def _build_prompt(self, scene_data: Dict[str, Any], style: str) -> str:
        """Build Stable Diffusion prompt from scene data"""
        prompt_parts = []
        
        # Base style
        prompt_parts.append(f"manga panel, {style} style")
        
        # Characters
        if scene_data.get('characters'):
            for char in scene_data['characters']:
                if char.get('description'):
                    prompt_parts.append(f"character: {char['description']}")
        
        # Location
        if scene_data.get('location'):
            prompt_parts.append(f"location: {scene_data['location']}")
        
        # Actions
        if scene_data.get('actions'):
            prompt_parts.append(f"action: {', '.join(scene_data['actions'])}")
        
        # Mood
        mood_modifiers = {
            'intense': 'dramatic lighting, dynamic pose, action lines',
            'happy': 'bright lighting, cheerful expression, positive atmosphere',
            'sad': 'soft lighting, melancholic mood, emotional expression',
            'romantic': 'soft lighting, gentle expression, romantic atmosphere',
            'determined': 'strong pose, confident expression, focused eyes'
        }
        
        mood = scene_data.get('mood', 'neutral')
        if mood in mood_modifiers:
            prompt_parts.append(mood_modifiers[mood])
        
        # Quality tags
        prompt_parts.extend([
            "high quality",
            "detailed",
            "black and white manga art" if style != "color" else "manga art",
            "professional illustration"
        ])
        
        return ", ".join(prompt_parts)
    
    def _build_negative_prompt(self, style: str) -> str:
        """Build negative prompt to avoid unwanted elements"""
        negative_elements = [
            "blurry",
            "low quality", 
            "bad anatomy",
            "extra limbs",
            "malformed",
            "text",
            "watermark",
            "signature",
            "multiple panels" if style != "multi_panel" else ""
        ]
        return ", ".join([elem for elem in negative_elements if elem])
    
    def _is_api_available(self) -> bool:
        """Check if Stable Diffusion API is available"""
        try:
            response = requests.get(f"{self.api_url}/internal/ping", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def _generate_with_api(self, prompt: str, negative_prompt: str, style: str) -> bytes:
        """Generate image using Stable Diffusion API"""
        payload = {
            "prompt": prompt,
            "negative_prompt": negative_prompt,
            "steps": 20,
            "cfg_scale": 7,
            "width": 512,
            "height": 768,  # Manga panel aspect ratio
            "sampler_name": "DPM++ 2M Karras",
            "seed": -1,
            "batch_size": 1,
            "n_iter": 1
        }
        
        response = requests.post(f"{self.api_url}/sdapi/v1/txt2img", json=payload, timeout=60)
        response.raise_for_status()
        
        result = response.json()
        if 'images' in result and len(result['images']) > 0:
            image_data = base64.b64decode(result['images'][0])
            return image_data
        else:
            raise Exception("No images returned from API")
    
    def _generate_fallback_image(self, scene_data: Dict[str, Any]) -> str:
        """Generate a fallback placeholder image"""
        # Create a simple placeholder image
        width, height = 512, 768
        
        # Create image with scene info
        img = Image.new('RGB', (width, height), color='white')
        
        # For now, just save the placeholder
        filename = f"fallback_{scene_data.get('id', 'unknown')}.png"
        filepath = self.output_dir / filename
        img.save(filepath)
        
        return str(filepath)
    
    def _save_image(self, image_data: bytes, scene_id: str) -> str:
        """Save generated image to disk"""
        filename = f"panel_{scene_id}_{hash(image_data) % 10000}.png"
        filepath = self.output_dir / filename
        
        if isinstance(image_data, bytes):
            with open(filepath, 'wb') as f:
                f.write(image_data)
        else:
            # If it's already a file path string
            return image_data
            
        return str(filepath)