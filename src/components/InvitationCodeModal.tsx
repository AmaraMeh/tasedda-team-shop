
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InvitationCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'team' | 'seller';
  onSuccess: () => void;
}

const InvitationCodeModal: React.FC<InvitationCodeModalProps> = ({
  isOpen,
  onClose,
  type,
  onSuccess
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Vérifier d'abord si le code est un code promo de team member
      if (type === 'team') {
        const { data: teamMember } = await supabase
          .from('team_members')
          .select('*')
          .eq('promo_code', code.toUpperCase())
          .eq('is_active', true)
          .single();

        if (teamMember) {
          // Code promo valide trouvé
          onSuccess();
          onClose();
          setCode('');
          setLoading(false);
          return;
        }
      }

      // Sinon, vérifier les codes d'invitation classiques
      const { data: invitation, error } = await supabase
        .from('invitation_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('type', type)
        .eq('is_used', false)
        .single();

      if (error || !invitation) {
        toast({
          title: "Code invalide",
          description: "Ce code d'invitation n'existe pas ou a déjà été utilisé",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Marquer le code comme utilisé
      await supabase
        .from('invitation_codes')
        .update({ is_used: true, used_at: new Date().toISOString() })
        .eq('id', invitation.id);

      onSuccess();
      onClose();
      setCode('');
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-gold/20">
        <DialogHeader>
          <DialogTitle className="text-white">
            Code d'invitation requis
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">
              Code d'invitation {type === 'team' ? 'pour rejoindre la team (ou code promo d\'un membre)' : 'pour devenir vendeur'}
            </Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Entrez votre code d'invitation"
              required
              className="bg-black/50 border-gold/20"
            />
            {type === 'team' && (
              <p className="text-xs text-muted-foreground">
                Vous pouvez utiliser un code d'invitation classique ou le code promo d'un membre actif de l'équipe.
              </p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={loading || !code.trim()}
              className="flex-1 btn-gold"
            >
              {loading ? 'Vérification...' : 'Vérifier le code'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gold/20 text-white hover:bg-gold/10"
            >
              Annuler
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InvitationCodeModal;
