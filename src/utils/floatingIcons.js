import { Cloud, Server, BarChart3, Bell, Shield } from 'lucide-react';

const floatIcons = [Cloud, Server, BarChart3, Bell, Shield];

export const floatingIcons = Array.from({ length: 100 }, (_, i) => {
  const Icon = floatIcons[i % floatIcons.length];
  const left = (i * 37 + 13) % 100;
  const top = (i * 53 + 7) % 100;
  const size = 14 + ((i * 29) % 16);
  const delay = ((i * 17) % 60) / 10;
  return { Icon, left, top, size, delay };
});
