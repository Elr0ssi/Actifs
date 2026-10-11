import WidgetKit
import SwiftUI

struct RoutinesView: View {
    @Environment(\.widgetFamily) var family
    let entry: FlozeaEntry

    var body: some View {
        Group {
            if let s = entry.snapshot, s.signedIn {
                content(s)
            } else {
                EmptyStateView(title: "Routines", signedIn: entry.snapshot?.signedIn ?? false)
            }
        }
        .widgetURL(URL(string: "flozea://routines"))
    }

    @ViewBuilder
    private func content(_ s: WidgetSnapshot) -> some View {
        let total = s.routines.total
        let done = s.routines.done
        let progress = total == 0 ? 0 : Double(done) / Double(total)
        switch family {
        case .accessoryCircular:
            ZStack {
                AccessoryWidgetBackground()
                Gauge(value: progress) { Image(systemName: "repeat") } currentValueLabel: { Text("\(done)") }
                    .gaugeStyle(.accessoryCircularCapacity)
            }
        case .systemSmall:
            VStack(alignment: .leading, spacing: 6) {
                Label("Routines", systemImage: "repeat").font(.caption.bold()).foregroundColor(FZ.brand)
                ZStack {
                    RingView(progress: progress)
                    VStack(spacing: 0) {
                        Text("\(done)/\(total)").font(.title3.bold())
                        Text(total == 0 ? "aucune" : "faites").font(.caption2).foregroundColor(.secondary)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 2)
                StaleNote(stale: entry.stale)
            }
        default:
            HStack(spacing: 14) {
                ZStack {
                    RingView(progress: progress, lineWidth: 10)
                    VStack(spacing: 0) {
                        Text("\(done)/\(total)").font(.title2.bold())
                        Text("faites").font(.caption2).foregroundColor(.secondary)
                    }
                }
                .frame(width: 92, height: 92)
                VStack(alignment: .leading, spacing: 5) {
                    Label("À faire", systemImage: "repeat").font(.caption.bold()).foregroundColor(FZ.brand)
                    if s.routines.next.isEmpty {
                        Text(total == 0 ? "Aucune routine aujourd'hui" : "Tout est fait 🎉").font(.subheadline)
                    } else {
                        ForEach(s.routines.next.prefix(family == .systemLarge ? 6 : 3)) { r in
                            HStack(spacing: 6) {
                                Image(systemName: "circle").font(.caption).foregroundColor(FZ.brand)
                                Text(r.title).font(.subheadline).lineLimit(1)
                            }
                        }
                    }
                    Spacer(minLength: 0)
                    StaleNote(stale: entry.stale)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
    }
}

struct RoutinesWidget: Widget {
    let kind = "FlozeaRoutines"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: FlozeaProvider()) { entry in
            RoutinesView(entry: entry).containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Routines du jour")
        .description("Ta progression et la prochaine routine à faire.")
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryCircular])
    }
}
