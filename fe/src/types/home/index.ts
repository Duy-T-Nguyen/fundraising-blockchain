export interface Campaign {
  id: number;
  title: string;
  description: string;
  progressing: number; // 0-100
  amountRaised: string;
  status: string;
}
