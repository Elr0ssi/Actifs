import Foundation

/// Instantané écrit par l'app (mobile/src/core/snapshot.ts) dans le UserDefaults de l'App Group.
/// Il ne contient ni jeton, ni clé, ni identifiant de foyer. Si l'utilisateur masque les montants,
/// les champs financiers sont absents (nil) : le widget n'a aucun chiffre à afficher.
struct WidgetSnapshot: Codable {
    struct Routines: Codable {
        var total: Int
        var done: Int
        var next: [Item]
        struct Item: Codable, Identifiable { var id: String; var title: String }
    }
    struct Tasks: Codable {
        var total: Int
        var remaining: Int
        var items: [Item]
        struct Item: Codable, Identifiable { var id: String; var title: String; var priority: String; var time: String? }
    }
    struct Finance: Codable {
        var hidden: Bool
        var resteAVivre: Double?
        var monthSpent: Double?
        var balance: Double?
        var daysRemaining: Int?
    }
    struct Shopping: Codable {
        var listId: String?
        var name: String?
        var remaining: Int
        var items: [String]
    }
    struct Planning: Codable {
        struct Event: Codable, Identifiable { var id: String; var title: String; var day: String; var time: String? }
        struct Meal: Codable { var day: String; var slot: String?; var name: String }
        var events: [Event]
        var meals: [Meal]
    }

    var v: Int
    var generatedAt: String
    var today: String
    var signedIn: Bool
    var hideAmounts: Bool
    var routines: Routines
    var tasks: Tasks
    var finance: Finance?
    var shopping: Shopping
    var planning: Planning
}

enum SnapshotStore {
    static let key = "flozea.widgets.v1"

    /// L'App Group est `group.<bundle id de l'app>` ; le bundle de l'extension est `<bundle id de l'app>.<nom>`.
    static var appGroup: String {
        if let custom = Bundle.main.object(forInfoDictionaryKey: "FlozeaAppGroup") as? String, !custom.isEmpty { return custom }
        let id = Bundle.main.bundleIdentifier ?? ""
        let parts = id.split(separator: ".")
        let appId = parts.count > 1 ? parts.dropLast().joined(separator: ".") : id
        return "group." + appId
    }

    static func load() -> WidgetSnapshot? {
        guard let defaults = UserDefaults(suiteName: appGroup),
              let json = defaults.string(forKey: key),
              let data = json.data(using: .utf8) else { return nil }
        return try? JSONDecoder().decode(WidgetSnapshot.self, from: data)
    }

    /// AAAA-MM-JJ dans le fuseau actuel de l'appareil.
    static func todayString() -> String {
        let f = DateFormatter()
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "yyyy-MM-dd"
        return f.string(from: Date())
    }
}
