import { useState, useEffect } from 'react';

export default function useBoot(reduceMotion) {
  const [booting, setBooting] = useState(true);

  const skipBoot = () => setBooting(false);

  useEffect(() => {
    if (reduceMotion) {
      setBooting(false);
      return;
    }
    const timer = setTimeout(() => setBooting(false), 3000);
    return () => clearTimeout(timer);
  }, [reduceMotion]);

  return { booting, skipBoot };
}
