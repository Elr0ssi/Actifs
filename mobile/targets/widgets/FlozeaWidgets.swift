import WidgetKit
import SwiftUI

@main
struct FlozeaWidgetBundle: WidgetBundle {
    var body: some Widget {
        RoutinesWidget()
        TasksWidget()
        FinanceWidget()
        ShoppingWidget()
        PlanningWidget()
    }
}
