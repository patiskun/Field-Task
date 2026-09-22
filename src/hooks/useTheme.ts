import { getTheme } from '../theme/theme';
import { useStore } from '../store/useStore';

export const useTheme = () => {
  const mode = useStore((s) => s.theme);
  return getTheme(mode);
};