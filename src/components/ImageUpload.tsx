import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Upload, Link, X, Image as ImageIcon } from 'lucide-react';
import { uploadProductImage } from '@/lib/imageUpload';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

const ImageUpload = ({ value, onChange, label = "Image", placeholder = "https://example.com/image.jpg" }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadProductImage(file);
      
      if (result.success && result.url) {
        onChange(result.url);
        setPreviewUrl(result.url);
        
        toast({
          title: "Image téléchargée !",
          description: "L'image a été téléchargée avec succès.",
        });
      } else {
        toast({
          title: "Erreur de téléchargement",
          description: result.error || "Impossible de télécharger l'image.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erreur de téléchargement",
        description: error.message || "Impossible de télécharger l'image.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleUrlChange = (url: string) => {
    onChange(url);
    setPreviewUrl(url);
  };

  const handleRemoveImage = () => {
    onChange('');
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-4">
      <Label>{label}</Label>
      
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Télécharger
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card 
            className={`border-2 border-dashed transition-colors ${
              isUploading ? 'border-gold/50 bg-gold/5' : 'border-gold/20 hover:border-gold/40'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-gold" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Glissez-déposez une image ici ou cliquez pour sélectionner
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPEG jusqu'à 5MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="btn-gold"
                >
                  {isUploading ? "Téléchargement..." : "Sélectionner une image"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <div className="space-y-2">
            <Input
              value={value}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder={placeholder}
              className="bg-black/50 border-gold/20"
            />
            <p className="text-xs text-muted-foreground">
              Entrez l'URL complète de l'image (https://...)
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview */}
      {previewUrl && (
        <div className="space-y-2">
          <Label className="text-sm">Aperçu</Label>
          <div className="relative inline-block">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-lg border border-gold/20"
              onError={() => setPreviewUrl('/placeholder.svg')}
            />
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 