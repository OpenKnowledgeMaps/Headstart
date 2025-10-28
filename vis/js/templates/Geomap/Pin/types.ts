export interface PinProps {
  id: string;
  lon: number;
  lat: number;
  isActive: boolean;
  onClick: (id: string) => void;
}
