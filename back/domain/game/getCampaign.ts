import { campaigns } from "@/data/campaigns";

export function getCampaign(id: string) {
  return campaigns.find((campaign) => campaign.id === id);
}