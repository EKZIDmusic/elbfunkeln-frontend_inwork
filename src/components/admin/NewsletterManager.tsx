// Erweiteter Newsletter-Manager mit Campaign-Management für Elbfunkeln
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Mail, Search, Plus, Download, Trash2, 
  RefreshCw, Users, TrendingUp, Send, Edit,
  Calendar, BarChart, Eye, FileText, Settings,
  Sparkles, Gift, Package, Star, Heart, Palette
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAuth } from '../AuthContext';
import { 
  getNewsletterSubscribers, 
  addNewsletterSubscriber, 
  deleteNewsletterSubscriber,
  getNewsletterCampaigns,
  createNewsletterCampaign,
  sendNewsletterCampaign,
  deleteNewsletterCampaign,
  getNewsletterStats,
  type NewsletterSubscriber,
  type NewsletterCampaign
} from '../../services/newsletterService';
import { toast } from 'sonner@2.0.3';

interface NewsletterManagerProps {
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

// Newsletter Template Types
interface NewsletterTemplate {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  subject: string;
  content: string;
  dynamicFields: {
    key: string;
    label: string;
    placeholder: string;
    required: boolean;
  }[];
}

// Predefined Templates
const NEWSLETTER_TEMPLATES: NewsletterTemplate[] = [
  {
    id: 'new-collection',
    category: 'Produktankündigung',
    title: 'Neue Kollektion',
    description: 'Stelle eine neue Schmuckkollektion vor',
    icon: Sparkles,
    subject: '{{collection_name}} - Unsere neue Kollektion ist da! ✨',
    content: `Liebe {{customer_name}},

wir freuen uns, Ihnen unsere brandneue Kollektion "{{collection_name}}" vorstellen zu dürfen! 

{{collection_description}}

🌟 Highlights der Kollektion:
{{highlight_1}}
{{highlight_2}}
{{highlight_3}}

{{special_offer}}

Entdecken Sie jetzt alle Stücke in unserem Online-Shop und lassen Sie sich von der Schönheit handgefertigten Drahtschmucks verzaubern.

{{closing_message}}

Mit funkelnden Grüßen,
Ihr Elbfunkeln-Team ✨

[Jetzt entdecken - Button]
[Zur Kollektion - Link]`,
    dynamicFields: [
      { key: 'collection_name', label: 'Name der Kollektion', placeholder: 'z.B. Herbstzauber', required: true },
      { key: 'collection_description', label: 'Beschreibung der Kollektion', placeholder: 'Kurze Beschreibung der neuen Kollektion...', required: true },
      { key: 'highlight_1', label: '1. Highlight', placeholder: 'z.B. ✨ Einzigartige Drahtkunst in Gold und Silber', required: true },
      { key: 'highlight_2', label: '2. Highlight', placeholder: 'z.B. 💎 Limitierte Edition mit nur 50 Stücken', required: true },
      { key: 'highlight_3', label: '3. Highlight', placeholder: 'z.B. 🎁 Kostenloses Schmuckkästchen bei Bestellung', required: false },
      { key: 'special_offer', label: 'Sonderangebot (optional)', placeholder: 'z.B. Nur diese Woche: 15% Rabatt auf alle Stücke!', required: false },
      { key: 'closing_message', label: 'Abschlussnachricht', placeholder: 'z.B. Besuchen Sie uns auch in unserem Atelier in Hamburg!', required: false }
    ]
  },
  {
    id: 'sale-promotion',
    category: 'Verkaufsförderung',
    title: 'Sale / Rabattaktion',
    description: 'Bewirb einen Sale oder eine Rabattaktion',
    icon: Gift,
    subject: '{{discount_percent}}% Rabatt - {{sale_name}} bei Elbfunkeln! 🎁',
    content: `Liebe {{customer_name}},

{{sale_reason}}

🎁 {{sale_name}}
{{discount_percent}}% Rabatt auf {{discount_items}}

{{sale_description}}

⏰ Aktionszeitraum: {{sale_duration}}
🛍️ Rabattcode: {{discount_code}}

{{additional_benefits}}

Verpassen Sie nicht diese einmalige Gelegenheit und sichern Sie sich Ihre Lieblingsstücke zu unschlagbaren Preisen!

{{urgency_message}}

Mit funkelnden Grüßen,
Ihr Elbfunkeln-Team 💎

[Jetzt shoppen - Button]
[Rabatt sichern - Link]`,
    dynamicFields: [
      { key: 'sale_name', label: 'Name der Aktion', placeholder: 'z.B. Frühlings-Sale', required: true },
      { key: 'discount_percent', label: 'Rabatt in %', placeholder: 'z.B. 20', required: true },
      { key: 'discount_items', label: 'Was ist rabattiert?', placeholder: 'z.B. ausgewählte Ohrringe', required: true },
      { key: 'sale_reason', label: 'Grund für die Aktion', placeholder: 'z.B. Wir feiern unseren 2. Geburtstag und möchten uns bei Ihnen bedanken!', required: true },
      { key: 'sale_description', label: 'Aktionsbeschreibung', placeholder: 'Beschreibung der Rabattaktion...', required: true },
      { key: 'sale_duration', label: 'Aktionsdauer', placeholder: 'z.B. 15.03. - 22.03.2024', required: true },
      { key: 'discount_code', label: 'Rabattcode', placeholder: 'z.B. FRÜHLING20', required: true },
      { key: 'additional_benefits', label: 'Zusätzliche Vorteile (optional)', placeholder: 'z.B. + Kostenloser Versand ab 50€', required: false },
      { key: 'urgency_message', label: 'Dringlichkeitsnachricht (optional)', placeholder: 'z.B. Nur solange der Vorrat reicht!', required: false }
    ]
  },
  {
    id: 'care-tips',
    category: 'Kundenservice',
    title: 'Pflege-Tipps',
    description: 'Teile Pflegetipps für Drahtschmuck',
    icon: Heart,
    subject: '{{tip_theme}} - Pflegetipps für Ihren Elbfunkeln Schmuck 💎',
    content: `Liebe {{customer_name}},

{{introduction_message}}

✨ {{tip_theme}}

{{main_tip}}

🔧 Schritt-für-Schritt Anleitung:
1. {{step_1}}
2. {{step_2}}
3. {{step_3}}

💡 Zusätzliche Tipps:
• {{extra_tip_1}}
• {{extra_tip_2}}
• {{extra_tip_3}}

{{warning_message}}

{{closing_tip}}

Falls Sie Fragen zur Pflege Ihres Schmucks haben, kontaktieren Sie uns gerne - wir helfen Ihnen gerne weiter!

Mit funkelnden Grüßen,
Ihr Elbfunkeln-Team 💫

[Mehr Pflegetipps - Link]
[Kontakt aufnehmen - Button]`,
    dynamicFields: [
      { key: 'tip_theme', label: 'Thema der Pflegetipps', placeholder: 'z.B. Frühjahrsputz für Ihren Schmuck', required: true },
      { key: 'introduction_message', label: 'Einleitungstext', placeholder: 'z.B. der Frühling ist da und es ist Zeit, auch Ihrem Schmuck eine Frischekur zu gönnen!', required: true },
      { key: 'main_tip', label: 'Haupttipp', placeholder: 'Der wichtigste Pflegetipp...', required: true },
      { key: 'step_1', label: '1. Schritt', placeholder: 'z.B. Schmuck vorsichtig mit warmem Wasser abspülen', required: true },
      { key: 'step_2', label: '2. Schritt', placeholder: 'z.B. Mit einem weichen Tuch trocken tupfen', required: true },
      { key: 'step_3', label: '3. Schritt', placeholder: 'z.B. An der Luft vollständig trocknen lassen', required: true },
      { key: 'extra_tip_1', label: '1. Zusatztipp', placeholder: 'z.B. Niemals aggressive Reinigungsmittel verwenden', required: true },
      { key: 'extra_tip_2', label: '2. Zusatztipp', placeholder: 'z.B. Schmuck einzeln in weichen Tüchern aufbewahren', required: true },
      { key: 'extra_tip_3', label: '3. Zusatztipp', placeholder: 'z.B. Direktes Sonnenlicht vermeiden', required: false },
      { key: 'warning_message', label: 'Warnung/Vorsicht (optional)', placeholder: 'z.B. Achtung: Drahtschmuck niemals in Ultraschallgeräten reinigen!', required: false },
      { key: 'closing_tip', label: 'Abschlusstipp', placeholder: 'z.B. Bei regelmäßiger Pflege haben Sie jahrelang Freude an Ihrem Schmuck!', required: true }
    ]
  },
  {
    id: 'behind-scenes',
    category: 'Storytelling',
    title: 'Hinter den Kulissen',
    description: 'Gewähre Einblicke in die Schmuckherstellung',
    icon: Eye,
    subject: 'Hinter den Kulissen: {{story_title}} bei Elbfunkeln 🎨',
    content: `Liebe {{customer_name}},

{{story_intro}}

🎨 {{story_title}}

{{main_story}}

{{personal_touch}}

📸 In unserem Atelier:
{{workspace_description}}

⚒️ Der Entstehungsprozess:
{{process_step_1}}
{{process_step_2}}
{{process_step_3}}

{{inspiration_source}}

✨ Das Besondere an Handarbeit:
{{handcraft_benefit}}

{{story_conclusion}}

Vielen Dank, dass Sie handgefertigten Schmuck schätzen und unterstützen!

Mit kreativen Grüßen,
{{artist_name}} und das Elbfunkeln-Team 🌟

[Atelier besuchen - Link]
[Entstehungsprozess ansehen - Button]`,
    dynamicFields: [
      { key: 'story_title', label: 'Titel der Geschichte', placeholder: 'z.B. Wie ein Ring entsteht', required: true },
      { key: 'story_intro', label: 'Geschichte Einleitung', placeholder: 'Haben Sie sich schon einmal gefragt, wie...', required: true },
      { key: 'main_story', label: 'Hauptgeschichte', placeholder: 'Die Hauptgeschichte über den Entstehungsprozess...', required: true },
      { key: 'personal_touch', label: 'Persönliche Note', placeholder: 'z.B. Jedes Stück erzählt seine eigene Geschichte...', required: true },
      { key: 'workspace_description', label: 'Arbeitsplatz-Beschreibung', placeholder: 'z.B. In unserem lichtdurchfluteten Atelier in Hamburg...', required: true },
      { key: 'process_step_1', label: '1. Arbeitsschritt', placeholder: 'z.B. Zunächst wird der Draht sorgfältig ausgewählt...', required: true },
      { key: 'process_step_2', label: '2. Arbeitsschritt', placeholder: 'z.B. Dann beginnt die kunstvolle Formgebung...', required: true },
      { key: 'process_step_3', label: '3. Arbeitsschritt', placeholder: 'z.B. Abschließend wird jedes Detail perfektioniert...', required: true },
      { key: 'inspiration_source', label: 'Inspirationsquelle', placeholder: 'z.B. Die Inspiration für dieses Design kam von...', required: false },
      { key: 'handcraft_benefit', label: 'Vorteil der Handarbeit', placeholder: 'z.B. Jedes Stück ist einzigartig und trägt die Seele der Künstlerin...', required: true },
      { key: 'story_conclusion', label: 'Geschichte Abschluss', placeholder: 'Abschließende Gedanken zur Geschichte...', required: true },
      { key: 'artist_name', label: 'Name der Künstlerin', placeholder: 'z.B. Anna Schmidt', required: true }
    ]
  },
  {
    id: 'seasonal-greeting',
    category: 'Saisonales',
    title: 'Saisonale Grüße',
    description: 'Versende saisonale Grüße und Angebote',
    icon: Calendar,
    subject: '{{season_greeting}} von Ihrem Elbfunkeln-Team {{season_emoji}}',
    content: `Liebe {{customer_name}},

{{season_greeting}} von Ihrem Elbfunkeln-Team!

{{season_message}}

{{season_emoji}} {{seasonal_collection}}:
{{collection_description}}

🎁 Besondere {{season_name}} Highlights:
• {{highlight_1}}
• {{highlight_2}}
• {{highlight_3}}

{{seasonal_offer}}

{{season_activity}}

{{personal_season_wish}}

{{season_closing}}

Mit {{season_adjective}} Grüßen,
Ihr Elbfunkeln-Team {{season_emoji}}

[{{season_name}} Kollektion entdecken - Button]
[Geschenkgutschein kaufen - Link]`,
    dynamicFields: [
      { key: 'season_name', label: 'Saison/Anlass', placeholder: 'z.B. Weihnachten, Frühling, Muttertag', required: true },
      { key: 'season_greeting', label: 'Saisonaler Gruß', placeholder: 'z.B. Frohe Weihnachten, Frohe Ostern', required: true },
      { key: 'season_emoji', label: 'Saison Emoji', placeholder: 'z.B. 🎄, 🌸, 💐', required: true },
      { key: 'season_message', label: 'Saisonale Nachricht', placeholder: 'z.B. die besinnliche Weihnachtszeit steht vor der Tür...', required: true },
      { key: 'seasonal_collection', label: 'Saisonale Kollektion', placeholder: 'z.B. Unsere Weihnachtskollektion', required: true },
      { key: 'collection_description', label: 'Kollektionsbeschreibung', placeholder: 'Beschreibung der saisonalen Kollektion...', required: true },
      { key: 'highlight_1', label: '1. Highlight', placeholder: 'z.B. Schneeflocken-Ohrringe in Silber', required: true },
      { key: 'highlight_2', label: '2. Highlight', placeholder: 'z.B. Weihnachtsstern-Anhänger', required: true },
      { key: 'highlight_3', label: '3. Highlight', placeholder: 'z.B. Adventskranz-Ringe im Set', required: false },
      { key: 'seasonal_offer', label: 'Saisonales Angebot', placeholder: 'z.B. Bis 24.12.: Kostenlose Geschenkverpackung!', required: false },
      { key: 'season_activity', label: 'Saisonale Aktivität', placeholder: 'z.B. Besuchen Sie uns auf dem Weihnachtsmarkt...', required: false },
      { key: 'personal_season_wish', label: 'Persönlicher Wunsch', placeholder: 'z.B. Wir wünschen Ihnen besinnliche Feiertage...', required: true },
      { key: 'season_closing', label: 'Saisonaler Abschluss', placeholder: 'z.B. Lassen Sie es funkeln in der Weihnachtszeit!', required: true },
      { key: 'season_adjective', label: 'Saisonales Adjektiv', placeholder: 'z.B. weihnachtlichen, frühlingshaften', required: true }
    ]
  },
  {
    id: 'thank-you',
    category: 'Kundenbindung',
    title: 'Dankeschön',
    description: 'Bedanke dich bei treuen Kunden',
    icon: Star,
    subject: 'Danke für {{loyalty_period}} Treue - {{customer_name}}! 💖',
    content: `Liebe {{customer_name}},

{{personal_greeting}}

💖 Danke für {{loyalty_period}} Treue!

{{gratitude_message}}

🌟 Ihre Unterstützung bedeutet uns so viel:
{{support_meaning}}

{{customer_journey}}

🎁 Als kleines Dankeschön:
{{thank_you_gift}}

{{special_recognition}}

✨ Exklusiv für Sie:
{{exclusive_offer}}

{{future_message}}

{{personal_note}}

Von Herzen Danke für Ihre Treue und Ihr Vertrauen!

Mit dankbaren Grüßen,
{{team_signature}} 💫

[Dankeschön einlösen - Button]
[Ihre Lieblingsprodukte - Link]`,
    dynamicFields: [
      { key: 'loyalty_period', label: 'Treue-Zeitraum', placeholder: 'z.B. 2 Jahre, seit Beginn', required: true },
      { key: 'personal_greeting', label: 'Persönliche Begrüßung', placeholder: 'z.B. es ist uns eine große Freude, Ihnen zu schreiben...', required: true },
      { key: 'gratitude_message', label: 'Dankbarkeitsnachricht', placeholder: 'Hauptdankesnachricht...', required: true },
      { key: 'support_meaning', label: 'Bedeutung der Unterstützung', placeholder: 'z.B. Sie ermöglichen es uns, unsere Leidenschaft zu leben...', required: true },
      { key: 'customer_journey', label: 'Kundenreise', placeholder: 'z.B. Von Ihrem ersten Besuch bis heute haben Sie...', required: false },
      { key: 'thank_you_gift', label: 'Dankeschön-Geschenk', placeholder: 'z.B. 10% Rabatt auf Ihre nächste Bestellung', required: true },
      { key: 'special_recognition', label: 'Besondere Anerkennung', placeholder: 'z.B. Sie gehören zu unseren geschätztesten Stammkunden...', required: false },
      { key: 'exclusive_offer', label: 'Exklusives Angebot', placeholder: 'z.B. Vorab-Zugang zu neuen Kollektionen', required: false },
      { key: 'future_message', label: 'Zukunftsnachricht', placeholder: 'z.B. Wir freuen uns auf viele weitere gemeinsame Jahre...', required: true },
      { key: 'personal_note', label: 'Persönliche Notiz', placeholder: 'z.B. Falls Sie Wünsche oder Anregungen haben, schreiben Sie uns gerne!', required: false },
      { key: 'team_signature', label: 'Team-Unterschrift', placeholder: 'z.B. Anna und das gesamte Elbfunkeln-Team', required: true }
    ]
  }
];

export function NewsletterManager({ onError, onSuccess }: NewsletterManagerProps) {
  const { accessToken } = useAuth();
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showTemplatePreviewDialog, setShowTemplatePreviewDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NewsletterTemplate | null>(null);
  const [templateValues, setTemplateValues] = useState<Record<string, string>>({});
  const [previewContent, setPreviewContent] = useState({ subject: '', content: '' });
  
  // Add subscriber form
  const [newSubscriber, setNewSubscriber] = useState({
    email: '',
    name: '',
    source: 'manual'
  });

  // Campaign form
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    subject: '',
    content: ''
  });

  // Format content for preview
  const formatPreviewContent = (subject: string, content: string, isTemplate = false, templateData?: NewsletterTemplate) => {
    let formattedSubject = subject;
    let formattedContent = content;

    if (isTemplate && templateData) {
      // Replace template placeholders with sample data or field names
      templateData.dynamicFields.forEach(field => {
        const placeholder = `{{${field.key}}}`;
        const sampleValue = templateValues[field.key] || `[${field.label}]`;
        formattedSubject = formattedSubject.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), sampleValue);
        formattedContent = formattedContent.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), sampleValue);
      });
    }

    // Default customer name replacement
    if (!templateValues['customer_name']) {
      formattedSubject = formattedSubject.replace(/{{customer_name}}/g, '[Kundenname]');
      formattedContent = formattedContent.replace(/{{customer_name}}/g, '[Kundenname]');
    }

    // Convert line breaks to proper paragraph formatting
    const paragraphs = formattedContent.split('\n\n');
    const formattedParagraphs = paragraphs.map(paragraph => {
      if (paragraph.trim() === '') return '';
      
      // Handle lists
      if (paragraph.includes('•') || paragraph.includes('1.')) {
        const lines = paragraph.split('\n').map(line => line.trim()).filter(line => line);
        return `<ul class="list-disc list-inside space-y-1">${lines.map(line => `<li>${line.replace(/^[•\-\*]\s*/, '').replace(/^\d+\.\s*/, '')}</li>`).join('')}</ul>`;
      }
      
      // Handle numbered lists
      if (/^\d+\./.test(paragraph.trim())) {
        const lines = paragraph.split('\n').map(line => line.trim()).filter(line => line);
        return `<ol class="list-decimal list-inside space-y-1">${lines.map(line => `<li>${line.replace(/^\d+\.\s*/, '')}</li>`).join('')}</ol>`;
      }
      
      // Regular paragraphs
      return `<p class="mb-4">${paragraph.replace(/\n/g, '<br>')}</p>`;
    });

    return {
      subject: formattedSubject,
      content: formattedParagraphs.join('')
    };
  };

  // Show campaign preview
  const showCampaignPreview = () => {
    const formatted = formatPreviewContent(campaignForm.subject, campaignForm.content);
    setPreviewContent(formatted);
    setShowPreviewDialog(true);
  };

  // Show template preview
  const showTemplatePreview = (template: NewsletterTemplate) => {
    const formatted = formatPreviewContent(template.subject, template.content, true, template);
    setPreviewContent(formatted);
    setShowTemplatePreviewDialog(true);
  };

  // Apply template to campaign form
  const applyTemplate = (template: NewsletterTemplate) => {
    let subject = template.subject;
    let content = template.content;
    
    // Replace placeholders with values
    template.dynamicFields.forEach(field => {
      const value = templateValues[field.key] || '';
      const placeholder = `{{${field.key}}}`;
      subject = subject.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
      content = content.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    });

    // Set default customer name placeholder if not filled
    if (!templateValues['customer_name']) {
      subject = subject.replace(/{{customer_name}}/g, '[Kundenname]');
      content = content.replace(/{{customer_name}}/g, '[Kundenname]');
    }

    setCampaignForm({
      title: `${template.title} - ${templateValues['collection_name'] || templateValues['sale_name'] || templateValues['story_title'] || templateValues['season_name'] || 'Kampagne'}`,
      subject: subject,
      content: content
    });

    setShowTemplateDialog(false);
    setShowCampaignDialog(true);
    setSelectedTemplate(null);
    setTemplateValues({});
  };

  // Helper functions for optional callbacks
  const handleError = (error: string) => {
    if (onError) {
      onError(error);
    } else {
      console.error(error);
    }
  };

  const handleSuccess = (message: string) => {
    if (onSuccess) {
      onSuccess(message);
    } else {
      console.log(message);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      const [subscribersData, campaignsData, statsData] = await Promise.all([
        getNewsletterSubscribers(),
        getNewsletterCampaigns(),
        getNewsletterStats()
      ]);
      
      setSubscribers(subscribersData || []);
      setCampaigns(campaignsData || []);
      setStats(statsData || {});
      
      handleSuccess('Newsletter-Daten erfolgreich geladen');
    } catch (error) {
      console.error('Error loading newsletter data:', error);
      handleError(`Fehler beim Laden der Newsletter-Daten: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter subscribers
  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = searchQuery === '' || 
      (subscriber.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (subscriber.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSource = selectedSource === 'all' || subscriber.source === selectedSource;
    
    return matchesSearch && matchesSource;
  });

  // Add subscriber
  const handleAddSubscriber = async () => {
    if (!newSubscriber.email) {
      handleError('Bitte geben Sie eine E-Mail-Adresse ein');
      return;
    }

    try {
      setLoading(true);
      
      const addedSubscriber = await addNewsletterSubscriber(
        newSubscriber.email,
        newSubscriber.name || undefined,
        newSubscriber.source
      );
      
      setSubscribers([addedSubscriber, ...subscribers]);
      
      // Reset form
      setNewSubscriber({ email: '', name: '', source: 'manual' });
      setShowAddDialog(false);
      
      handleSuccess(`Abonnent ${addedSubscriber.email} erfolgreich hinzugefügt`);
      toast.success('Abonnent erfolgreich hinzugefügt! 🎉');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Fehler beim Hinzufügen des Abonnenten';
      handleError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Remove subscriber
  const handleRemoveSubscriber = async (subscriberId: string, email: string) => {
    if (!window.confirm(`Abonnent ${email} wirklich entfernen?`)) return;

    try {
      setLoading(true);
      
      await deleteNewsletterSubscriber(subscriberId);
      setSubscribers(subscribers.filter(s => s.id !== subscriberId));
      handleSuccess(`Abonnent ${email} erfolgreich entfernt`);
      toast.success('Abonnent erfolgreich entfernt');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Fehler beim Entfernen des Abonnenten';
      handleError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Create campaign
  const handleCreateCampaign = async () => {
    if (!campaignForm.title || !campaignForm.subject || !campaignForm.content) {
      toast.error('Bitte füllen Sie alle Felder aus');
      return;
    }

    try {
      setLoading(true);
      
      const newCampaign = await createNewsletterCampaign({
        title: campaignForm.title,
        subject: campaignForm.subject,
        content: campaignForm.content,
        status: 'draft'
      });
      
      setCampaigns([newCampaign, ...campaigns]);
      setCampaignForm({ title: '', subject: '', content: '' });
      setShowCampaignDialog(false);
      
      toast.success('Newsletter-Kampagne erfolgreich erstellt! 🎉');
      handleSuccess('Kampagne erfolgreich erstellt');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Fehler beim Erstellen der Kampagne';
      toast.error(errorMessage);
      handleError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Send campaign
  const handleSendCampaign = async (campaignId: string, campaignTitle: string) => {
    if (!window.confirm(`Newsletter-Kampagne "${campaignTitle}" wirklich an alle Abonnenten senden?`)) return;

    try {
      setLoading(true);
      
      const sentCampaign = await sendNewsletterCampaign(campaignId);
      setCampaigns(prev => prev.map(c => c.id === campaignId ? sentCampaign : c));
      
      toast.success(`Newsletter "${campaignTitle}" erfolgreich gesendet! 📧`);
      handleSuccess(`Kampagne an ${sentCampaign.recipients_count} Abonnenten gesendet`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Fehler beim Senden der Kampagne';
      toast.error(errorMessage);
      handleError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Export subscribers
  const handleExportSubscribers = () => {
    try {
      const csvData = [
        ['E-Mail', 'Name', 'Status', 'Quelle', 'Abonniert am'],
        ...filteredSubscribers.map(sub => [
          sub.email,
          sub.name || '',
          sub.status,
          sub.source,
          new Date(sub.subscribed_at).toLocaleDateString('de-DE')
        ])
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `elbfunkeln-newsletter-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      handleSuccess('Newsletter-Liste erfolgreich exportiert');
      toast.success('Newsletter-Liste exportiert! 📥');
    } catch (error) {
      handleError('Fehler beim Exportieren der Liste');
      toast.error('Fehler beim Export');
    }
  };

  const getSourceBadge = (source: string) => {
    const sourceColors: Record<string, string> = {
      website: 'bg-blue-100 text-blue-800 border-blue-200',
      facebook: 'bg-purple-100 text-purple-800 border-purple-200',
      instagram: 'bg-pink-100 text-pink-800 border-pink-200',
      manual: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return (
      <Badge className={sourceColors[source] || sourceColors.manual}>
        {source.charAt(0).toUpperCase() + source.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'subscribed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Abonniert</Badge>;
      case 'unsubscribed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Abgemeldet</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Ausstehend</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCampaignStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Entwurf</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Geplant</Badge>;
      case 'sent':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Gesendet</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading && subscribers.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin text-elbfunkeln-green" />
          <span className="text-elbfunkeln-green">Lade Newsletter-Daten...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Newsletter Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-elbfunkeln-green/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gesamt Abonnenten</p>
              <p className="text-2xl font-semibold text-elbfunkeln-green">{subscribers.length}</p>
            </div>
            <Users className="h-8 w-8 text-elbfunkeln-green" />
          </div>
        </Card>
        
        <Card className="p-4 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aktive Abonnenten</p>
              <p className="text-2xl font-semibold text-green-600">
                {subscribers.filter(s => s.status === 'subscribed').length}
              </p>
            </div>
            <Mail className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-4 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Neue (Monat)</p>
              <p className="text-2xl font-semibold text-blue-600">
                {subscribers.filter(s => {
                  const subDate = new Date(s.subscribed_at);
                  const now = new Date();
                  return subDate.getMonth() === now.getMonth() && subDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Abonnenten suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedSource} onValueChange={setSelectedSource}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Quellen</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="manual">Manuell</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleExportSubscribers}
            variant="outline" 
            size="sm"
            disabled={filteredSubscribers.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportieren
          </Button>
          
          <Button 
            onClick={loadAllData} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-elbfunkeln-green hover:bg-elbfunkeln-green/90">
                <Plus className="h-4 w-4 mr-2" />
                Abonnent hinzufügen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Neuen Abonnenten hinzufügen</DialogTitle>
                <DialogDescription>
                  Fügen Sie einen neuen Newsletter-Abonnenten hinzu.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">E-Mail-Adresse</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newSubscriber.email}
                    onChange={(e) => setNewSubscriber({ ...newSubscriber, email: e.target.value })}
                    placeholder="beispiel@email.de"
                  />
                </div>
                
                <div>
                  <Label htmlFor="name">Name (optional)</Label>
                  <Input
                    id="name"
                    value={newSubscriber.name}
                    onChange={(e) => setNewSubscriber({ ...newSubscriber, name: e.target.value })}
                    placeholder="Max Mustermann"
                  />
                </div>
                
                <div>
                  <Label htmlFor="source">Quelle</Label>
                  <Select value={newSubscriber.source} onValueChange={(value) => setNewSubscriber({ ...newSubscriber, source: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manuell</SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleAddSubscriber}
                    disabled={loading}
                    className="flex-1"
                  >
                    Hinzufügen
                  </Button>
                  <Button 
                    onClick={() => setShowAddDialog(false)}
                    variant="outline"
                    disabled={loading}
                  >
                    Abbrechen
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Template Selection Dialog */}
          <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-elbfunkeln-rose hover:bg-elbfunkeln-rose/90">
                <Palette className="h-4 w-4 mr-2" />
                Vorlage verwenden
              </Button>
            </DialogTrigger>
            <DialogContent className="!max-w-none !w-[98vw] max-h-[90vh] overflow-y-auto" style={{ width: '98vw', maxWidth: 'none' }}>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-3 text-2xl">
                  <Palette className="h-7 w-7 text-elbfunkeln-green" />
                  <span>Newsletter-Vorlage auswählen</span>
                </DialogTitle>
                <DialogDescription className="text-lg mt-2">
                  Wählen Sie eine vordefinierte Vorlage für Ihre Newsletter-Kampagne. Alle Vorlagen sind vollständig anpassbar.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-8 mt-6">
                {/* Group templates by category */}
                {Object.entries(
                  NEWSLETTER_TEMPLATES.reduce((acc, template) => {
                    if (!acc[template.category]) {
                      acc[template.category] = [];
                    }
                    acc[template.category].push(template);
                    return acc;
                  }, {} as Record<string, NewsletterTemplate[]>)
                ).map(([category, templates]) => (
                  <div key={category} className="space-y-6">
                    <div className="border-b-2 border-elbfunkeln-green/30 pb-4">
                      <h3 className="text-2xl font-semibold text-elbfunkeln-green font-cormorant">{category}</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6" style={{ 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'
                    }}>
                      {templates.map((template) => {
                        const IconComponent = template.icon;
                        return (
                          <Card 
                            key={template.id} 
                            className="p-5 hover:shadow-xl transition-all duration-300 border-2 hover:border-elbfunkeln-green/60 cursor-pointer group min-h-[380px]"
                          >
                            <div className="space-y-4 h-full flex flex-col">
                              {/* Header with icon and title */}
                              <div className="flex items-start space-x-3">
                                <div className="p-2.5 bg-elbfunkeln-green/15 rounded-lg group-hover:bg-elbfunkeln-green/25 transition-colors flex-shrink-0">
                                  <IconComponent className="h-5 w-5 text-elbfunkeln-green" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-semibold text-elbfunkeln-green group-hover:text-elbfunkeln-green/90 transition-colors font-cormorant leading-tight">
                                    {template.title}
                                  </h4>
                                  <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                                    {template.description}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Example content preview */}
                              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex-1">
                                <p className="text-xs text-gray-500 mb-2 font-semibold">Beispiel-Betreff:</p>
                                <p className="text-xs text-gray-700 font-medium leading-relaxed mb-3">
                                  {template.subject.replace(/{{[^}]+}}/g, '[...]')}
                                </p>
                                <div className="border-t border-gray-200 pt-2.5">
                                  <p className="text-xs text-gray-500 mb-2 font-semibold">Inhalt-Vorschau:</p>
                                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-4">
                                    {template.content.split('\n\n')[0].replace(/{{[^}]+}}/g, '[...]').substring(0, 85)}...
                                  </p>
                                </div>
                              </div>
                              
                              {/* Action buttons */}
                              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                <div className="flex gap-3">
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      showTemplatePreview(template);
                                    }}
                                    variant="outline"
                                    className="text-sm border-elbfunkeln-green/40 text-elbfunkeln-green hover:bg-elbfunkeln-green/10 px-6 h-10 min-w-[100px]"
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Vorschau
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTemplate(template);
                                    }}
                                    className="text-sm bg-elbfunkeln-green hover:bg-elbfunkeln-green/90 text-white px-6 h-10 min-w-[110px]"
                                  >
                                    Verwenden
                                  </Button>
                                </div>
                                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {template.dynamicFields.length} Felder
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end pt-8 border-t-2 border-gray-200 mt-10">
                <Button 
                  onClick={() => setShowTemplateDialog(false)}
                  variant="outline"
                  size="lg"
                  className="px-8"
                >
                  Schließen
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Template Configuration Dialog */}
          {selectedTemplate && (
            <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <selectedTemplate.icon className="h-5 w-5 text-elbfunkeln-green" />
                    <span>{selectedTemplate.title} konfigurieren</span>
                  </DialogTitle>
                  <DialogDescription>
                    Füllen Sie die dynamischen Felder aus, um Ihre personalisierte Newsletter-Vorlage zu erstellen.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {selectedTemplate.dynamicFields.map((field) => (
                    <div key={field.key}>
                      <Label htmlFor={field.key} className="flex items-center space-x-1">
                        <span>{field.label}</span>
                        {field.required && <span className="text-red-500">*</span>}
                      </Label>
                      {field.key.includes('description') || field.key.includes('message') || field.key.includes('story') ? (
                        <Textarea
                          id={field.key}
                          value={templateValues[field.key] || ''}
                          onChange={(e) => setTemplateValues({ ...templateValues, [field.key]: e.target.value })}
                          placeholder={field.placeholder}
                          rows={3}
                        />
                      ) : (
                        <Input
                          id={field.key}
                          value={templateValues[field.key] || ''}
                          onChange={(e) => setTemplateValues({ ...templateValues, [field.key]: e.target.value })}
                          placeholder={field.placeholder}
                        />
                      )}
                    </div>
                  ))}
                  
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={() => applyTemplate(selectedTemplate)}
                      className="flex-1 bg-elbfunkeln-green hover:bg-elbfunkeln-green/90"
                      disabled={selectedTemplate.dynamicFields.filter(f => f.required).some(f => !templateValues[f.key])}
                    >
                      Vorlage anwenden
                    </Button>
                    <Button 
                      onClick={() => setSelectedTemplate(null)}
                      variant="outline"
                    >
                      Abbrechen
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={showCampaignDialog} onOpenChange={setShowCampaignDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-elbfunkeln-green hover:bg-elbfunkeln-green/90">
                <Plus className="h-4 w-4 mr-2" />
                Kampagne erstellen
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Neue Newsletter-Kampagne erstellen</DialogTitle>
                <DialogDescription>
                  Erstellen Sie eine neue Newsletter-Kampagne für Ihre Abonnenten.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Titel</Label>
                  <Input
                    id="title"
                    value={campaignForm.title}
                    onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                    placeholder="Kampagne-Titel"
                  />
                </div>
                
                <div>
                  <Label htmlFor="subject">Betreff</Label>
                  <Input
                    id="subject"
                    value={campaignForm.subject}
                    onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                    placeholder="Betreff der Kampagne"
                  />
                </div>
                
                <div>
                  <Label htmlFor="content">Inhalt</Label>
                  <Textarea
                    id="content"
                    value={campaignForm.content}
                    onChange={(e) => setCampaignForm({ ...campaignForm, content: e.target.value })}
                    placeholder="Inhalt der Kampagne"
                    rows={12}
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={handleCreateCampaign}
                    disabled={loading}
                    className="flex-1"
                  >
                    Erstellen
                  </Button>
                  <Button 
                    onClick={showCampaignPreview}
                    variant="outline"
                    disabled={!campaignForm.subject && !campaignForm.content}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Vorschau
                  </Button>
                  <Button 
                    onClick={() => setShowCampaignDialog(false)}
                    variant="outline"
                    disabled={loading}
                  >
                    Abbrechen
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Subscribers Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Abonnent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Quelle</TableHead>
              <TableHead>Abonniert am</TableHead>
              <TableHead>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscribers.map((subscriber) => (
              <TableRow key={subscriber.id}>
                <TableCell>
                  <div>
                    <div className="font-semibold">{subscriber.email}</div>
                    {subscriber.name && (
                      <div className="text-sm text-gray-500">{subscriber.name}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(subscriber.status)}</TableCell>
                <TableCell>{getSourceBadge(subscriber.source)}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {new Date(subscriber.subscribed_at).toLocaleDateString('de-DE')}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemoveSubscriber(subscriber.id, subscriber.email)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredSubscribers.length === 0 && !loading && (
        <div className="text-center py-8">
          <Mail className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Keine Newsletter-Abonnenten gefunden</p>
        </div>
      )}

      {/* Campaigns Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kampagne</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Erstellt am</TableHead>
              <TableHead>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell>
                  <div>
                    <div className="font-semibold">{campaign.title}</div>
                    <div className="text-sm text-gray-500">{campaign.subject}</div>
                  </div>
                </TableCell>
                <TableCell>{getCampaignStatusBadge(campaign.status)}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {new Date(campaign.created_at).toLocaleDateString('de-DE')}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSendCampaign(campaign.id, campaign.title)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {campaigns.length === 0 && !loading && (
        <div className="text-center py-8">
          <Mail className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Keine Newsletter-Kampagnen gefunden</p>
        </div>
      )}

      {/* Campaign Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-elbfunkeln-green" />
              <span>Newsletter-Vorschau</span>
            </DialogTitle>
            <DialogDescription>
              So wird Ihr Newsletter aussehen.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Email mockup */}
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              {/* Email header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-elbfunkeln-green rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Elbfunkeln</p>
                    <p className="text-xs text-gray-500">info@elbfunkeln.de</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Heute, 14:30</p>
              </div>
              
              {/* Subject line */}
              <div className="mb-6">
                <p className="text-lg font-semibold text-gray-900">{previewContent.subject}</p>
              </div>
              
              {/* Email content */}
              <div 
                className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: previewContent.content }}
              />
              
              {/* Email footer */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="bg-elbfunkeln-green text-white px-6 py-2 rounded-lg inline-block mb-4 text-sm font-medium">
                    Jetzt entdecken
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    Elbfunkeln - Handgefertigter Drahtschmuck aus Hamburg
                  </p>
                  <p className="text-xs text-gray-400">
                    Sie erhalten diese E-Mail, weil Sie unseren Newsletter abonniert haben.
                    <br />
                    <a href="#" className="text-elbfunkeln-green hover:underline">Vom Newsletter abmelden</a>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setShowPreviewDialog(false)}>
                Schließen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      <Dialog open={showTemplatePreviewDialog} onOpenChange={setShowTemplatePreviewDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-elbfunkeln-green" />
              <span>Vorlagen-Vorschau</span>
            </DialogTitle>
            <DialogDescription>
              So sieht die Vorlage mit Beispieldaten aus.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Email mockup */}
            <div className="bg-white border rounded-lg p-6 shadow-sm">
              {/* Email header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-elbfunkeln-green rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Elbfunkeln</p>
                    <p className="text-xs text-gray-500">info@elbfunkeln.de</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Heute, 14:30</p>
              </div>
              
              {/* Subject line */}
              <div className="mb-6">
                <p className="text-lg font-semibold text-gray-900">{previewContent.subject}</p>
              </div>
              
              {/* Email content */}
              <div 
                className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: previewContent.content }}
              />
              
              {/* Email footer */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="bg-elbfunkeln-green text-white px-6 py-2 rounded-lg inline-block mb-4 text-sm font-medium">
                    Jetzt entdecken
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    Elbfunkeln - Handgefertigter Drahtschmuck aus Hamburg
                  </p>
                  <p className="text-xs text-gray-400">
                    Sie erhalten diese E-Mail, weil Sie unseren Newsletter abonniert haben.
                    <br />
                    <a href="#" className="text-elbfunkeln-green hover:underline">Vom Newsletter abmelden</a>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setShowTemplatePreviewDialog(false)}>
                Schließen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}