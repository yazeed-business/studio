import { CodeXml } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="bg-card shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <CodeXml className="h-8 w-8 text-primary mr-2" />
        <h1 className="text-2xl font-headline font-semibold text-primary">
          CodeCrafter
        </h1>
      </div>
    </header>
  );
}
