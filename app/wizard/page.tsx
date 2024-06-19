import { CurrencyComboBox } from '@/components/CurrencyComboBox/CurrencyComboBox';
import Logo from '@/components/Logo/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react';

const page = async () => {
  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }
  return (
    <div className="container flex max-w-2xl flex-col items-center justify-between gap-4">
      <div>
        <h1 className="text-center text-3xl">
          Welcome, <span className="ml-2 font-bold">{user.firstName}! 👋</span>
        </h1>
        <h1 className="mt-4 text-center text-base text-muted-foreground">Let&apos;s get started by setting up your currency.</h1>
        <h3 className="mt-3 text-center text-sm text-muted-foreground">You can change these settings at any time.</h3>
      </div>
      <Separator />
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Currency</CardTitle>
          <CardDescription>Set your default currency for transaction</CardDescription>
        </CardHeader>
        <CardContent>
          <CurrencyComboBox />
        </CardContent>
      </Card>
      <Separator />
      <Button className="w-full" asChild>
        <Link href={'/'}>I&apos;m done! Take me to the dashboard</Link>
      </Button>
      <div className="mt-8 ">
        <Logo />
      </div>
    </div>
  );
};

export default page;
