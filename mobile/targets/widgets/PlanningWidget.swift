import WidgetKit
import SwiftUI

struct PlanningView: View {
    @Environment(\.widgetFamily) var family
    let entry: FlozeaEntry

    var body: some View {
        Group {
            if let s = entry.snapshot, s.signedIn {
                content(s)
            } else {
                EmptyStateView(title: "Planning", signedIn: entry.snapshot?.signedIn ?? false)
            }
        }
        .widgetURL(URL(string: "flozea://agenda"))
    }

    @ViewBuilder
    private func content(_ s: WidgetSnapshot) -> some View {
        let events = s.planning.events
        let meals = s.planning.meals
        VStack(alignment: .leading, spacing: 6) {
            Label("Planning", systemImage: "calendar").font(.caption.bold()).foregroundColor(FZ.brand)
            if events.isEmpty && meals.isEmpty {
                Text("Rien de prévu aujourd'hui ni demain").font(.subheadline)
            }
            ForEach(events.prefix(family == .systemLarge ? 4 : 2)) { e in
                HStack(spacing: 8) {
                    Text(e.time ?? "").font(.caption.bold()).foregroundColor(FZ.brand).frame(width: 40, alignment: .leading)
                    VStack(alignment: .leading, spacing: 0) {
                        Text(e.title).font(.subheadline).lineLimit(1)
                        Text(FZ.dayLabel(e.day, today: s.today)).font(.caption2).foregroundColor(.secondary)
                    }
                }
            }
            if !meals.isEmpty {
                Divider()
                ForEach(Array(meals.prefix(family == .systemLarge ? 4 : 2).enumerated()), id: \.offset) { _, m in
                    HStack(spacing: 8) {
                        Image(systemName: "fork.knife").font(.caption).foregroundColor(FZ.meal).frame(width: 40, alignment: .leading)
                        VStack(alignment: .leading, spacing: 0) {
                            Text(m.name).font(.subheadline).lineLimit(1)
                            Text("\(FZ.dayLabel(m.day, today: s.today)) · \(m.slot == "soir" ? "soir" : "midi")").font(.caption2).foregroundColor(.secondary)
                        }
                    }
                }
            }
            Spacer(minLength: 0)
            StaleNote(stale: entry.stale)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct PlanningWidget: Widget {
    let kind = "FlozeaPlanning"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: FlozeaProvider()) { entry in
            PlanningView(entry: entry).containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Planning")
        .description("Tes prochains rendez-vous et les repas prévus.")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}
