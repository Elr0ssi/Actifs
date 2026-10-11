import WidgetKit
import SwiftUI

struct FinanceView: View {
    @Environment(\.widgetFamily) var family
    let entry: FlozeaEntry

    var body: some View {
        Group {
            if let s = entry.snapshot, s.signedIn, let f = s.finance {
                content(f)
            } else {
                EmptyStateView(title: "Finances", signedIn: entry.snapshot?.signedIn ?? false)
            }
        }
        .widgetURL(URL(string: "flozea://finance"))
    }

    @ViewBuilder
    private func content(_ f: WidgetSnapshot.Finance) -> some View {
        if f.hidden {
            // Option « masquer les montants » : aucun chiffre n'existe dans l'instantané.
            VStack(alignment: .leading, spacing: 6) {
                Label("Finances", systemImage: "eurosign.circle").font(.caption.bold()).foregroundColor(FZ.money)
                Image(systemName: "lock.fill").font(.title2).foregroundColor(.secondary)
                Text("Montants masqués").font(.subheadline)
                Text("Réglages › Widgets").font(.caption2).foregroundColor(.secondary)
                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        } else if family == .systemSmall {
            VStack(alignment: .leading, spacing: 4) {
                Label("Reste à vivre", systemImage: "eurosign.circle").font(.caption.bold()).foregroundColor(FZ.money)
                Text(FZ.euros(f.resteAVivre))
                    .font(.system(size: 30, weight: .bold, design: .rounded))
                    .minimumScaleFactor(0.6)
                    .lineLimit(1)
                    .foregroundColor((f.resteAVivre ?? 0) >= 0 ? .primary : FZ.bad)
                Text("fin de mois").font(.caption2).foregroundColor(.secondary)
                Spacer(minLength: 0)
                StaleNote(stale: entry.stale)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        } else {
            HStack(alignment: .top, spacing: 16) {
                VStack(alignment: .leading, spacing: 4) {
                    Label("Reste à vivre", systemImage: "eurosign.circle").font(.caption.bold()).foregroundColor(FZ.money)
                    Text(FZ.euros(f.resteAVivre))
                        .font(.system(size: 34, weight: .bold, design: .rounded))
                        .minimumScaleFactor(0.6)
                        .lineLimit(1)
                        .foregroundColor((f.resteAVivre ?? 0) >= 0 ? .primary : FZ.bad)
                    Text("prévu en fin de mois").font(.caption2).foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                VStack(alignment: .leading, spacing: 8) {
                    stat("Solde", FZ.euros(f.balance))
                    stat("Dépensé ce mois", FZ.euros(f.monthSpent))
                    StaleNote(stale: entry.stale)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
    }

    private func stat(_ label: String, _ value: String) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            Text(label).font(.caption2).foregroundColor(.secondary)
            Text(value).font(.subheadline.bold()).lineLimit(1).minimumScaleFactor(0.7)
        }
    }
}

struct FinanceWidget: Widget {
    let kind = "FlozeaFinance"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: FlozeaProvider()) { entry in
            FinanceView(entry: entry).containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Finances")
        .description("Reste à vivre, solde et dépenses du mois (montants masquables dans l'app).")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
