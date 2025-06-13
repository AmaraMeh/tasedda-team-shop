
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface ContactButtonProps {
  className?: string;
}

const ContactButton = ({ className }: ContactButtonProps) => {
  const handleContact = () => {
    // Open WhatsApp with predefined message
    const message = encodeURIComponent("Bonjour, j'aimerais avoir plus d'informations sur vos services.");
    const whatsappUrl = `https://wa.me/213123456789?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button 
      onClick={handleContact}
      className={`btn-gold ${className}`}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      Nous contacter
    </Button>
  );
};

export default ContactButton;
