import { Button } from './Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface PricingCardProps {
  title: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  badge?: string;
  badgeColor?: 'green' | 'yellow' | 'coral';
  buttonText: string;
  buttonVariant?: 'green' | 'yellow' | 'coral';
  popular?: boolean;
}

export function PricingCard({
  title,
  price,
  period,
  description,
  features,
  badge,
  badgeColor = 'green',
  buttonText,
  buttonVariant = 'green',
  popular = false,
}: PricingCardProps) {
  const badgeColors = {
    green: 'bg-green text-white',
    yellow: 'bg-yellow text-dark',
    coral: 'bg-coral text-white',
  };

  const buttonColors = {
    green: 'bg-green text-white hover:bg-green/90',
    yellow: 'bg-yellow text-dark hover:bg-yellow/90',
    coral: 'bg-coral text-white hover:bg-coral/90',
  };

  return (
    <Card className={`border-2 border-dark/10 shadow-[4px_4px_0_0_#1F2937] transition-transform hover:translate-y-1 relative flex flex-col ${popular ? 'border-yellow shadow-[6px_6px_0_0_#1F2937] scale-105' : ''}`}>
      {badge && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className={`${badgeColors[badgeColor]} px-4 py-1 rounded-full text-sm font-bold`}>
            {badge}
          </div>
        </div>
      )}
      <CardHeader className="text-center pt-8 flex-shrink-0">
        <CardTitle className="text-2xl font-bold text-dark mb-2">{title}</CardTitle>
        <div className="text-4xl font-bold text-dark mb-2">
          {price}
          {period && <span className="text-lg font-normal text-dark/60">/{period}</span>}
        </div>
        <p className="text-dark/70">{description}</p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <ul className="space-y-3 mb-8 flex-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-dark">
              <svg className="w-5 h-5 text-green mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              {feature}
            </li>
          ))}
        </ul>
        <Button 
          className={`w-full ${buttonColors[buttonVariant]} transition-colors shadow-[2px_2px_0_0_#1F2937] active:translate-y-0.5 mt-auto`}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
