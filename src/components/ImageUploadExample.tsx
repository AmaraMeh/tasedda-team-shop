import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ImageUpload from './ImageUpload';

const ImageUploadExample = () => {
  const [imageUrl, setImageUrl] = useState('');

  return (
    <Card className="glass-effect border-gold/20">
      <CardHeader>
        <CardTitle>Exemple d'upload d'image</CardTitle>
      </CardHeader>
      <CardContent>
        <ImageUpload
          value={imageUrl}
          onChange={setImageUrl}
          label="Image du produit"
          placeholder="https://example.com/product-image.jpg"
        />
        
        {imageUrl && (
          <div className="mt-4 p-4 bg-black/20 rounded-lg">
            <h4 className="text-sm font-medium mb-2">URL de l'image :</h4>
            <p className="text-xs text-muted-foreground break-all">{imageUrl}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageUploadExample; 