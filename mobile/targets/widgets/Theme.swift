import SwiftUI

enum FZ {
    static let brand = Color("brand")
    static let brandSoft = Color("brandSoft")
    static let meal = Color("meal")
    static let money = Color("money")
    static let good = Color("good")
    static let bad = Color("bad")

    static func euros(_ value: Double?) -> String {
        guard let value = value else { return "—" }
        let f = NumberFormatter()
        f.numberStyle = .currency
        f.currencyCode = "EUR"
        f.maximumFractionDigits = 0
        f.locale = Locale(identifier: "fr_FR")
        return f.string(from: NSNumber(value: value)) ?? "—"
    }

    /// « 17:00 » -> « 17:00 » ; AAAA-MM-JJ -> « Aujourd'hui » / « Demain » / « 14 oct. »
    static func dayLabel(_ iso: String, today: String) -> String {
        if iso == today { return "Aujourd'hui" }
        let f = DateFormatter()
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "yyyy-MM-dd"
        guard let d = f.date(from: iso), let t = f.date(from: today) else { return iso }
        let diff = Calendar.current.dateComponents([.day], from: t, to: d).day ?? 0
        if diff == 1 { return "Demain" }
        let out = DateFormatter()
        out.locale = Locale(identifier: "fr_FR")
        out.dateFormat = "d MMM"
        return out.string(from: d)
    }
}

/// Anneau de progression (routines).
struct RingView: View {
    var progress: Double
    var lineWidth: CGFloat = 8
    var color: Color = FZ.brand

    var body: some View {
        ZStack {
            Circle().stroke(color.opacity(0.18), lineWidth: lineWidth)
            Circle()
                .trim(from: 0, to: CGFloat(max(0, min(1, progress))))
                .stroke(color, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
                .rotationEffect(.degrees(-90))
        }
    }
}

/// Message affiché quand l'app n'a encore rien écrit (déconnecté ou jamais ouverte).
struct EmptyStateView: View {
    var title: String
    var signedIn: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title).font(.headline)
            Text(signedIn ? "Rien à afficher pour le moment." : "Ouvre Flozea et connecte-toi pour voir tes données.")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
    }
}

struct StaleNote: View {
    var stale: Bool
    var body: some View {
        if stale {
            Text("Ouvre Flozea pour actualiser")
                .font(.system(size: 9))
                .foregroundColor(.secondary)
        }
    }
}
