import WidgetKit
import SwiftUI

struct TasksView: View {
    @Environment(\.widgetFamily) var family
    let entry: FlozeaEntry

    var body: some View {
        Group {
            if let s = entry.snapshot, s.signedIn {
                content(s)
            } else {
                EmptyStateView(title: "Tâches", signedIn: entry.snapshot?.signedIn ?? false)
            }
        }
        .widgetURL(URL(string: "flozea://tasks"))
    }

    private func color(_ priority: String) -> Color {
        switch priority {
        case "high": return FZ.bad
        case "low": return FZ.good
        default: return FZ.brand
        }
    }

    @ViewBuilder
    private func content(_ s: WidgetSnapshot) -> some View {
        let t = s.tasks
        switch family {
        case .accessoryRectangular:
            VStack(alignment: .leading, spacing: 2) {
                Text("\(t.remaining) tâche\(t.remaining > 1 ? "s" : "") restante\(t.remaining > 1 ? "s" : "")").font(.headline)
                if let first = t.items.first { Text(first.title).font(.caption).lineLimit(1) }
            }
        case .systemSmall:
            VStack(alignment: .leading, spacing: 4) {
                Label("Tâches", systemImage: "checklist").font(.caption.bold()).foregroundColor(FZ.brand)
                Text("\(t.remaining)").font(.system(size: 40, weight: .bold, design: .rounded))
                Text(t.remaining == 0 ? "Tout est fait 🎉" : "restante\(t.remaining > 1 ? "s" : "") aujourd'hui").font(.caption2).foregroundColor(.secondary)
                if let first = t.items.first { Text(first.title).font(.caption).lineLimit(2) }
                Spacer(minLength: 0)
                StaleNote(stale: entry.stale)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        default:
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Label("Tâches du jour", systemImage: "checklist").font(.caption.bold()).foregroundColor(FZ.brand)
                    Spacer()
                    Text("\(t.remaining) restante\(t.remaining > 1 ? "s" : "")").font(.caption).foregroundColor(.secondary)
                }
                if t.items.isEmpty {
                    Text(t.total == 0 ? "Rien de prévu aujourd'hui" : "Tout est fait 🎉").font(.subheadline)
                } else {
                    ForEach(t.items.prefix(family == .systemLarge ? 8 : 3)) { item in
                        HStack(spacing: 8) {
                            Circle().fill(color(item.priority)).frame(width: 8, height: 8)
                            Text(item.title).font(.subheadline).lineLimit(1)
                            Spacer(minLength: 4)
                            if let time = item.time { Text(time).font(.caption).foregroundColor(.secondary) }
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

struct TasksWidget: Widget {
    let kind = "FlozeaTasks"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: FlozeaProvider()) { entry in
            TasksView(entry: entry).containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Tâches du jour")
        .description("Ce qu'il te reste à faire aujourd'hui, par priorité.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge, .accessoryRectangular])
    }
}
