import WidgetKit
import SwiftUI

struct FlozeaEntry: TimelineEntry {
    let date: Date
    let snapshot: WidgetSnapshot?
    /// Vrai si l'instantané date d'un autre jour que `date` : les compteurs « du jour » ne sont plus fiables.
    let stale: Bool
}

/// Un seul fournisseur pour tous les widgets : lit l'instantané partagé, prépare une entrée maintenant
/// et une entrée à minuit (pour signaler un instantané périmé). iOS limite la fréquence réelle des
/// rafraîchissements : la date `after` n'est qu'une demande, l'app force aussi un rechargement à chaque synchro.
struct FlozeaProvider: TimelineProvider {
    func placeholder(in context: Context) -> FlozeaEntry {
        FlozeaEntry(date: Date(), snapshot: nil, stale: false)
    }

    func getSnapshot(in context: Context, completion: @escaping (FlozeaEntry) -> Void) {
        completion(makeEntry(at: Date()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<FlozeaEntry>) -> Void) {
        let now = Date()
        var entries = [makeEntry(at: now)]
        if let midnight = Calendar.current.nextDate(after: now, matching: DateComponents(hour: 0, minute: 1), matchingPolicy: .nextTime) {
            entries.append(makeEntry(at: midnight, forcedToday: nil))
        }
        let refresh = now.addingTimeInterval(30 * 60)
        completion(Timeline(entries: entries, policy: .after(refresh)))
    }

    private func makeEntry(at date: Date, forcedToday: String? = SnapshotStore.todayString()) -> FlozeaEntry {
        let snap = SnapshotStore.load()
        let f = DateFormatter()
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "yyyy-MM-dd"
        let day = forcedToday ?? f.string(from: date)
        let stale = snap != nil && snap!.today != day
        return FlozeaEntry(date: date, snapshot: snap, stale: stale)
    }
}
