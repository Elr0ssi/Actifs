import WidgetKit
import SwiftUI

struct ShoppingView: View {
    @Environment(\.widgetFamily) var family
    let entry: FlozeaEntry

    var body: some View {
        Group {
            if let s = entry.snapshot, s.signedIn {
                content(s.shopping)
            } else {
                EmptyStateView(title: "Courses", signedIn: entry.snapshot?.signedIn ?? false)
            }
        }
        .widgetURL(URL(string: link))
    }

    private var link: String {
        if let id = entry.snapshot?.shopping.listId { return "flozea://lists/\(id)" }
        return "flozea://courses"
    }

    @ViewBuilder
    private func content(_ sh: WidgetSnapshot.Shopping) -> some View {
        if sh.listId == nil {
            VStack(alignment: .leading, spacing: 4) {
                Label("Courses", systemImage: "cart").font(.caption.bold()).foregroundColor(FZ.meal)
                Text("Rien à acheter 🎉").font(.subheadline)
                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        } else if family == .systemSmall {
            VStack(alignment: .leading, spacing: 4) {
                Label(sh.name ?? "Courses", systemImage: "cart").font(.caption.bold()).foregroundColor(FZ.meal).lineLimit(1)
                Text("\(sh.remaining)").font(.system(size: 40, weight: .bold, design: .rounded))
                Text("à acheter").font(.caption2).foregroundColor(.secondary)
                Text(sh.items.prefix(2).joined(separator: " · ")).font(.caption).lineLimit(2)
                Spacer(minLength: 0)
                StaleNote(stale: entry.stale)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        } else {
            VStack(alignment: .leading, spacing: 5) {
                HStack {
                    Label(sh.name ?? "Courses", systemImage: "cart").font(.caption.bold()).foregroundColor(FZ.meal).lineLimit(1)
                    Spacer()
                    Text("\(sh.remaining) à acheter").font(.caption).foregroundColor(.secondary)
                }
                ForEach(Array(sh.items.prefix(family == .systemLarge ? 9 : 4).enumerated()), id: \.offset) { _, label in
                    HStack(spacing: 8) {
                        Image(systemName: "circle").font(.caption).foregroundColor(FZ.meal)
                        Text(label).font(.subheadline).lineLimit(1)
                    }
                }
                if sh.remaining > sh.items.count {
                    Text("+ \(sh.remaining - sh.items.count) autres").font(.caption).foregroundColor(.secondary)
                }
                Spacer(minLength: 0)
                StaleNote(stale: entry.stale)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

struct ShoppingWidget: Widget {
    let kind = "FlozeaShopping"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: FlozeaProvider()) { entry in
            ShoppingView(entry: entry).containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Courses")
        .description("Les articles restant à acheter, avec accès direct à la liste.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}
