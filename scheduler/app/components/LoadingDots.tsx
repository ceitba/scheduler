interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export default function LoadingDots({ size = 'md', color = 'text-foreground' }: LoadingDotsProps) {
  const dotSize = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  }[size];

  return (
    <div className="flex items-center gap-1">
      <div className={`${dotSize} rounded-full ${color} animate-[loading_0.8s_ease-in-out_infinite]`} />
      <div className={`${dotSize} rounded-full ${color} animate-[loading_0.8s_ease-in-out_0.2666s_infinite]`} />
      <div className={`${dotSize} rounded-full ${color} animate-[loading_0.8s_ease-in-out_0.5333s_infinite]`} />
    </div>
  );
} 