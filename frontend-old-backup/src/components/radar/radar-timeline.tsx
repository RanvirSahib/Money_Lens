import { SectionPanel } from "@/components/common/finance-ui";
import { RadarCard } from "./radar-card";
import type { RadarEvent } from "@/types/finance";

export function RadarTimeline({ events }: { events: RadarEvent[] }) {
  return (
    <SectionPanel title="Radar Timeline" description="Upcoming expected income, recurring payments, and possible pressure points.">
      <div className="grid gap-4 lg:grid-cols-2">
        {events.map((event) => <RadarCard key={event.id} event={event} />)}
      </div>
    </SectionPanel>
  );
}
