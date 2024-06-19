import { PiggyBank } from 'lucide-react';
import React from 'react';

const Logo = () => {
  return (
    <a href="/" className="flex items-center gap-2">
      <PiggyBank className="stroke h-11 w-11 stroke-amber-500 stroke-[1.5]" />
      <p className="bg-gradient-to-r from-amber-400 to-amber-50 bg-clip-text text-3xl font-bold loading-tight tracking-tighter text-transparent">Budget Tracker</p>
    </a>
  );
};

export const LogoMobile = () => {
  return (
    <a href="/" className="flex items-center gap-2">
      <PiggyBank className="stroke h-11 w-11 stroke-amber-500 stroke-[1.5]" />
      <p className="bg-gradient-to-r from-amber-400 to-amber-50 bg-clip-text text-3xl font-bold loading-tight tracking-tighter text-transparent">Budget Tracker</p>
    </a>
  );
};

export default Logo;
