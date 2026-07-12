/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Trash2, 
  Droplet,
  Droplets, 
  School, 
  Lightbulb, 
  HelpCircle,
  AlertTriangle,
  Bus
} from 'lucide-react';

interface CategoryIconProps {
  category: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className = "w-5 h-5" }) => {
  switch (category) {
    case 'Road Damage':
      return <AlertTriangle className={`${className} text-amber-600`} />;
    case 'Garbage & Waste':
      return <Trash2 className={`${className} text-emerald-600`} />;
    case 'Drainage/Sewage':
      return <Droplet className={`${className} text-indigo-600`} />;
    case 'Water Supply':
      return <Droplets className={`${className} text-sky-600`} />;
    case 'School/Public Building':
      return <School className={`${className} text-emerald-600`} />;
    case 'Streetlight/Electricity':
      return <Lightbulb className={`${className} text-yellow-500`} />;
    case 'Transportation Request':
      return <Bus className={`${className} text-blue-600`} />;
    default:
      return <HelpCircle className={`${className} text-slate-500`} />;
  }
};

