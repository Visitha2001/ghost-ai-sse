import { SignUp } from "@clerk/nextjs";
import { Workflow, MousePointer2, FileText } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-stretch bg-base">
      <div className="hidden md:flex flex-col w-1/2 p-12 lg:p-24 bg-surface border-r border-surface-border relative">
        <div className="flex items-center gap-3 mb-16">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
          </div>
          <span className="text-xl font-bold text-copy-primary">Ghost AI</span>
        </div>
        
        <div className="max-w-md w-full">
          <h1 className="text-4xl lg:text-5xl font-bold text-copy-primary mb-6 leading-tight tracking-tight">
            Design systems at the speed of thought.
          </h1>
          <p className="text-copy-secondary text-lg mb-12 leading-relaxed">
            Create an account to start mapping architecture in plain English. Collaborate with your team in real time.
          </p>
          
          <ul className="space-y-8">
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent-dim flex items-center justify-center text-brand">
                <Workflow className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-copy-primary font-medium mb-1">AI Architecture Generation</h3>
                <p className="text-copy-muted text-sm leading-relaxed">
                  Describe your system, AI maps it to nodes and edges on a live canvas.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent-dim flex items-center justify-center text-brand">
                <MousePointer2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-copy-primary font-medium mb-1">Real-time Collaboration</h3>
                <p className="text-copy-muted text-sm leading-relaxed">
                  Live cursors, presence indicators, and shared node editing across your team.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent-dim flex items-center justify-center text-brand">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-copy-primary font-medium mb-1">Instant Spec Generation</h3>
                <p className="text-copy-muted text-sm leading-relaxed">
                  Export a complete Markdown technical spec directly from the canvas graph.
                </p>
              </div>
            </li>
          </ul>
        </div>
        
        <div className="absolute bottom-12 left-12 lg:left-24">
          <p className="text-copy-faint text-sm">© 2026 Ghost AI. All rights reserved.</p>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-8 bg-base">
        <SignUp />
      </div>
    </div>
  );
}
